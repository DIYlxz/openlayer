<template>
  <div id="fences">
    <el-dialog
      :visible="dialogVisible"
      custom-class="fence"
      append-to-body
      title="小范围查询"
      width="1200px"
      top="50px"
      destroy-on-close
      @close="handleClose"
    >
      <div id="fence-map" class="map-box"></div>
      <div class="map-area">
        <el-card class="tool-window" style="width: 380px">
          <el-form label-width="80px">
            <el-form-item label="区域名称">
              <el-input
                size="small"
                v-model="name"
                placeholder="请输入围栏名称"
              ></el-input>
            </el-form-item>
            <el-form-item label="区域样式">
              <el-radio-group v-model="tool" size="small" @change="setType">
                <el-radio-button label="Circle">圆形</el-radio-button>
                <el-radio-button label="Polygon">多边形</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="warning" size="small" @click="handleClear"
                >清除</el-button
              >
              <el-button type="primary" size="small" @click="handleSave"
                >保存</el-button
              >
              <el-button size="small" @click="handleClose">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
//引入地图资源
import mapType from "../utils/maptype.js";
//引入地图记忆
import { getMap } from "../utils/webStorage.js";
//引入矢量图层和预渲染图层
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
//矢量图层资源
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Circle as sCircle } from "ol/style";
//地图容器
import { Map, View } from "ol";
//绘制几何图形的交互
import Draw from "ol/interaction/Draw";
//数据处理函数
import * as olProj from "ol/proj";

export default {
  name: "fences",
  components: {},
  props: {
    //对话框默认不出现
    visible: {
      type: Boolean,
      default: false,
    },
    //位置
    location: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      //本身默认
      dialogVisible: false,
      locaMap: null,
      openMap: null,
      fenceSource: null,
      //围栏名称
      name: "",
      //默认样式
      tool: "Circle",
      fenceDraw: null,
      //历史圆形样式
      circleInfo: null,
      //历史多边形轨迹
      polygonPath: null,
    };
  },
  watch: {
    visible: {
      handler: function (value) {
        if (value) {
          this.dialogVisible = true;
          this.locaMap = getMap();
          this.$nextTick(() => {
            this.initMap();
          });
        }
      },
      immediate: true,
    },
  },
  created() {},
  mounted() {},
  updated() {},
  methods: {
    //数据处理
    formatFenceData() {
      const handle = {
        Circle: () => {
          if (!this.circleInfo) {
            this.$message.error(this.$t("lan_map.lan_map_fences.pdrwf"));
            return;
          }
          const center = this.circleInfo.center;
          const radius = this.circleInfo.radius;
          //将坐标转换为经度/纬度
          const p = olProj.toLonLat(center);
          return `Circle (${p[0]} ${p[1]}, ${radius})`;
        },
        Polygon: () => {
          if (this.polygonPath.length === 0) {
            this.$message.error(this.$t("lan_map.lan_map_fences.pdrwf"));
            return;
          }
          const path = this.polygonPath;
          const pathArr = [];
          path.forEach((item) => {
            const p = olProj.toLonLat(item);
            pathArr.push(`${p[0]} ${p[1]}`);
          });
          return `Polygon (${pathArr.join(", ")})`;
        },
      };
      const type = this.tool;
      if (handle[type]) {
        return handle[type]();
      }
    },
    //关闭弹窗回调函数
    handleClose() {
      this.$emit("close");
    },
    // 初始化地图
    initMap() {
      //资源列表
      const maplist = mapType;
      //资源预渲染图层
      const tileLayer = new TileLayer({
        source: maplist.find((item) => item.id === this.locaMap).value,
      });
      this.fenceSource = new VectorSource({
        //水平地包装世界
        wrapX: false,
      });
      //矢量图层
      const vector = new VectorLayer({
        source: this.fenceSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(49,173,252, 0.2)",
          }),
          stroke: new Stroke({
            color: "#0099FF",
            width: 3,
          }),
          image: new sCircle({
            radius: 7,
            fill: new Fill({
              color: "#0099FF",
            }),
          }),
        }),
      });
      //地图容器
      this.openMap = new Map({
        target: "fence-map",
        //层，如果没有直接渲染地图，顺序渲染
        layers: [tileLayer, vector],
        view: new View({
          center: this.location,
          zoom: 16,
        }),
        controls: [],
      });
      this.addInteraction();
    },
    //清除
    handleClear() {
      this.fenceSource.clear();
    },
    //开始绘画
    addInteraction() {
      this.fenceDraw = new Draw({
        source: this.fenceSource,
        type: this.tool,
      });
      this.openMap.addInteraction(this.fenceDraw);
      this.fenceDraw.on("drawend", (e) => {
        this.drawEnd(e);
      });
      this.mapOlny();
    },
    //最多绘画一个围栏
    mapOlny() {
      this.fenceDraw.on("drawstart", ()=>{
        if(this.tool === "Polygon") {
          if(this.polygonPath) {
            this.fenceSource.clear() && (this.polygonPath = []);
          }
        }else {
          if(this.circleInfo) {
            this.fenceSource.clear() && (this.circleInfo = null);
          }
        }
      });
    },
    //绘制完成解析结构
    drawEnd(evt) {
      //获取几何图形的矢量对象
      let geo = evt.feature.getGeometry();
      let type = geo.getType();
      const handle = {
        Circle: () => {
          //获取中心点
          let center = geo.getCenter();
          let radius = geo.getRadius();
          this.circleInfo = {
            center: center,
            radius: radius,
          };
        },
        Polygon: () => {
          //获取坐标点
          let points = geo.getCoordinates();
          this.polygonPath = points[0];
        },
      };
      if (handle[type]) handle[type]();
    },
    //切换类型
    setType() {
      this.fenceSource.clear();
      this.openMap.removeInteraction(this.fenceDraw);
      this.addInteraction();
    },
    //保存
    handleSave() {
      // 保存
      if (!this.name) {
        this.$message.error("请输入围栏名称");
        return;
      }
      const area = this.formatFenceData();
      if (area) {
        let data = {
          name: this.name,
          area: area,
        };
        //保存到本地vuex中了
        this.$store.commit("addFences", data);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.fence {
  position: relative;
  .map-box {
    width: 100%;
    height: 60vh;
    position: relative;
  }
  .map-area {
    position: absolute;
    color: red;
    right: 1.5rem;
    bottom: 2rem;
  }
}
</style>
