<template>
  <div id="Map">
    <div id="myMap"></div>
    <div ref="popup" class="popup" v-show="shopPopup">
      <div class="info">
        <ul>
          <li>信息1：xxx</li>
          <li>信息2：xxx</li>
          <li>信息3：xxx</li>
        </ul>
      </div>
    </div>
    <div class="map-select">
      <el-select v-model="locaMap" style="width: 150px">
        <el-option
          v-for="item in mapList"
          :label="item.name"
          :value="item.id"
          :key="item.id"
          @click.native="setMapSource(item)"
        ></el-option>
      </el-select>
    </div>
    <div ref="menuPopup" class="menuPopup" v-show="showMenuPopup">新增围栏</div>
    <fences
      v-if="operateDialogVisible"
      :visible="operateDialogVisible"
      @close="handleOperateClose"
      :location="position"
    ></fences>
    <div class="fence-select">
      <el-select v-model="fence" style="width: 150px">
        <el-option
          label="不显示围栏"
          value="-1"
          key="-1"
          @click.native="handleSelectFence(null)"
        ></el-option>
        <el-option
          v-for="(item, index) in fences"
          :label="item.name"
          :value="item.name"
          :key="index"
          @click.native="handleSelectFence(item)"
        ></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
//Map为地图容器，View视图交互,Feature具有几何和其他属性的地理特征的矢量对象,Overlay要显示在映射上并附加到单个映射位置的元素,绑定在坐标
import { Map, View, Feature, Overlay } from "ol";
//olProj将坐标从经度/纬度转换为不同的投影
import * as olProj from "ol/proj";
//TileLayer预渲染图层，VectorLayer矢量层画布渲染器
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
//XYZ切片地图引用
import { Cluster, Vector as VectorSource } from "ol/source";
//Point点
import { Point, Polygon, Circle as gCircle } from "ol/geom";
//Style为矢量特征呈现样式的容器,Fill设置矢量特征的填充样式,Stroke矢量图的描边样式,Circle矢量圆形
import { Style, Fill, Stroke, Circle as sCircle, Text } from "ol/style";
//引入两地图
import mapType from "../utils/maptype.js";
//构建一个包含所有给定坐标的区域
import { boundingExtent } from "ol/extent";
//引入对话弹窗组件
import Fences from "../components/Fences.vue";
//地图资源记忆
import { getMap, setMap } from "../utils/webStorage.js";

import { mapGetters } from "vuex";

export default {
  name: "Map",
  components: {
    Fences,
  },
  data() {
    return {
      map: null,
      popup: null,
      shopPopup: false,
      menuPopup: null,
      //地图层
      tileLayer: null,
      //地图列表
      mapList: null,
      //地图记忆id
      locaMap: getMap(),
      //地图选中样式
      isMap: getMap(),
      //坐标标记层
      markerLayer: null,
      //坐标数据源
      markerSource: null,
      //右键菜单
      showMenuPopup: false,
      //位置
      position: null,
      //展现对话弹窗
      operateDialogVisible: false,
      //单个fence围栏
      fence: null,
      //之前显示围栏
      fenceVector: null,
    };
  },
  computed: {
    ...mapGetters(["fences"]),
  },
  mounted() {
    this.mapList = mapType;
    this.tileLayer = new TileLayer({
      source: mapType.find((e) => e.id === this.locaMap).value,
    });
    this.initMap();
    this.resolutionChange();
    this.monitorRightBox();
  },
  methods: {
    // 展示围栏
    handleSelectFence(data) {
      // 切换时清除之前的围栏
      if (this.fenceVector) {
        this.map.removeLayer(this.fenceVector);
      }
      if (!data) {
        this.fence = null;
        return false;
      }
      // 数据转换
      const area = this.areaFomart(data.area);
      // 围栏绘制
      this.setFenceSource(area);
    },
    // 绘制围栏
    setFenceSource(area) {
      let feature;
      switch (area.type) {
        case "Circle": {
          feature = new Feature(new gCircle(area.center, area.radius));
          break;
        }
        case "Polygon": {
          feature = new Feature(new Polygon([area.path]));
          break;
        }
        default:
          break;
      }
      // 缩放到围栏区域
      this.mapFit(feature.getGeometry());
      //矢量图层
      let source = new VectorSource({
        features: [feature],
      });
      let vector = new VectorLayer({
        source,
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
      this.fenceVector = vector;
      this.map.addLayer(vector);
    },
    // 按边界缩放
    mapFit(extent) {
      this.map
        .getView()
        .fit(extent, { duration: 1000, padding: [200, 200, 200, 200] });
    },
    //围栏数据的展开
    areaFomart(area) {
      const point = area.match(/[^\\(\\)]+(?=\))/g)[0].split(", ");
      if (area.match("Circle")) {
        return {
          type: "Circle",
          center: olProj.fromLonLat(point[0].split(" ")),
          radius: Number(point[1]),
        };
      }
      if (area.match("Polygon")) {
        const path = [];
        point.forEach((item) => {
          path.push(olProj.fromLonLat(item.split(" ")));
        });
        return {
          type: "Polygon",
          path: path,
        };
      }
    },
    //添加弹窗组件
    addOverlay() {
      // 创建Overlay
      let elPopup = this.$refs.popup;
      this.popup = new Overlay({
        //绑定元素
        element: elPopup,
        //坐标在本组件的位置
        positioning: "bottom-center",
        //阻止捕获和冒泡
        stopEvent: false,
        //偏移量，防止覆盖坐标
        offset: [0, -20],
      });
      //将组件添加到地图顶部
      this.map.addOverlay(this.popup);
    },
    //移动鼠标样式变换
    pointermove() {
      this.map.on("pointermove", (e) => {
        if (this.map.hasFeatureAtPixel(e.pixel)) {
          this.map.getViewport().style.cursor = "pointer";
        } else {
          this.map.getViewport().style.cursor = "inherit";
        }
      });
    },
    //点击触发事件，弹窗出现后并没有消失
    singleclick() {
      this.map.on("singleclick", (e) => {
        //检测顶层是否被命中，返回promise
        //then传入命中时的坐标点
        this.markerLayer.getFeatures(e.pixel).then((clickedFeatures) => {
          //坐标是否被命中
          if (clickedFeatures.length) {
            const features = clickedFeatures[0].get("features");
            //该坐标有几个重叠
            if (features.length > 1) {
              const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
              );
              this.map
                .getView()
                .fit(extent, { duration: 1000, padding: [200, 200, 200, 200] });
            } else {
              this.shopPopup = true;
              //设置弹窗位置
              let coordinates = features[0].getGeometry().getCoordinates();
              this.popup.setPosition(coordinates);
            }
          } else {
            this.shopPopup = false;
          }
        });
      });
    },
    //监听缩放，让弹窗消失
    resolutionChange() {
      this.map.getView().on("change:resolution", () => {
        this.shopPopup = false;
        this.showMenuPopup = false;
      });
    },
    //监听右键设置围栏
    monitorRightBox() {
      //获取地图视口元素
      this.map.getViewport().oncontextmenu = (e) => {
        //取消右键默认事件
        e.preventDefault();
        this.showMenuPopup = true;
        //设置弹窗位置跟随鼠标
        let coordinates = this.map.getEventCoordinate(e);
        this.position = coordinates;
        this.menuPopup.setPosition(coordinates);
        this.handleOperate();
      };
    },
    //添加右键弹窗组件
    addRightOverlay() {
      // 创建Overlay
      let elPopup = this.$refs.menuPopup;
      this.menuPopup = new Overlay({
        //绑定元素
        element: elPopup,
      });
      //将组件添加到地图顶部
      this.map.addOverlay(this.menuPopup);
    },
    //增加矢量资源图
    setMarker() {
      this.setMarkerSource();
      let style = this.setClusterStyle();
      this.markerLayer = new VectorLayer({
        source: this.markerSource,
        style,
      });
      this.map.addLayer(this.markerLayer);
    },
    //初始化--------------------------
    initMap() {
      this.map = new Map({
        //目标元素id
        target: "myMap",
        //图层，一个地图容器有一个或者多个图层
        layers: [this.tileLayer],
        //在可视区域内控制地图与人的交互
        view: new View({
          //地图初始中心，将坐标从经度/纬度转换为不同的投影。
          center: olProj.fromLonLat([106.550483, 29.563707]),
          //初始放大比例
          zoom: 18,
        }),
        // controls: [],
      });
      this.setMarker();
      //监听左键弹窗
      this.addOverlay();
      //监听右键弹窗
      this.addRightOverlay();
      //监听点击
      this.singleclick();
      //监听右键点击
      this.monitorRightBox();
      this.pointermove();
    },
    setMapSource(e) {
      this.tileLayer.setSource(e.value);
      setMap(e.id);
    },
    //获取各个坐标点
    getPoints() {
      return [
        [106.550483, 29.563707],
        [107.731056, 29.863785],
        [104.066301, 30.572961],
        [118.796624, 32.059344],
        [114.304569, 30.593354],
      ];
    },
    //获取点数据并且绘画
    setMarkerSource() {
      //创建新容器
      let style = new Style({
        image: new sCircle({
          radius: 10,
          stroke: new Stroke({
            color: "#fff",
          }),
          fill: new Fill({
            color: "#3399CC",
          }),
        }),
      });
      //获取点坐标
      let points = this.getPoints();
      let features = points.reduce((list, item) => {
        let feature = new Feature({
          geometry: new Point(olProj.fromLonLat(item)),
        });
        feature.setStyle(style);
        list.push(feature);
        return list;
      }, []);
      this.markerSource = new VectorSource({
        features,
      });
      //对一群点进行集群，聚合，但是其他点会丢失
      this.markerSource = new Cluster({
        distance: 100,
        source: new VectorSource({
          features,
        }),
      });
    },
    //防止聚合后其他点丢失
    setClusterStyle() {
      const styleCache = {};
      const style = (feature) => {
        const size = feature.get("features").length;
        let style = styleCache[size];
        //当有点丢失时
        if (!style) {
          //且不止一个点的时候
          if (size > 1) {
            style = new Style({
              image: new sCircle({
                radius: 20,
                stroke: new Stroke({
                  color: "#fff",
                }),
                fill: new Fill({
                  color: "#3399CC",
                }),
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({
                  color: "#fff",
                }),
              }),
            });
          } else {
            style = new Style({
              image: new sCircle({
                radius: 15,
                stroke: new Stroke({
                  color: "#fff",
                }),
                fill: new Fill({
                  color: "#e9b626",
                }),
              }),
            });
          }
          styleCache[size] = style;
        }
        return style;
      };
      return style;
    },
    //关闭对话弹窗
    handleOperateClose() {
      this.operateDialogVisible = false;
    },
    // 打开弹窗
    handleOperate() {
      this.showMenuPopup = false;
      this.operateDialogVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
#Map {
  position: relative;
  #myMap {
    width: 100vw;
    height: 100vh;
  }
  .popup {
    width: 200px;
    background-color: white;
    padding: 18px;
    border-radius: 10px;
    box-shadow: 0 0 15px rgb(177, 177, 177);
    .info {
      font-size: 14px;
      text-align: left;
      ul {
        padding-left: 0;
      }
    }
  }
  .map-select {
    position: absolute;
    right: 5rem;
    bottom: 3rem;
    width: 5rem;
    height: 2rem;
    background: #fff;
    .map-select-box {
      display: flex;
      justify-content: space-around;
      .map-select-btn {
        width: 50%;
        line-height: 2rem;
        cursor: pointer;
      }
      .map-select-btn:hover {
        background: rgb(194, 194, 194);
      }
      .on {
        background: rgb(194, 194, 194);
      }
    }
  }
  .menuPopup {
    width: 8rem;
    height: 2rem;
    line-height: 2rem;
    background: #fff;
    cursor: pointer;
  }
  .fence-select {
    position: absolute;
    right: 12rem;
    height: 2rem;
    bottom: 3rem;
  }
}
</style>
