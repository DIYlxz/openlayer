<template>
  <div id="route">
    <el-dialog
      title="历史轨迹"
      :visible="dialogVisible"
      custom-class="route"
      append-to-body
      @close="handleClose"
      width="1200px"
      destroy-on-close
    >
      <div id="route-map" class="map-box"></div>
      <div class="map-area">
        <el-card class="tool-window" style="width: 380px">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            start-placeholde="开始时间"
            end-placeholde="结束时间"
            style="width: 100%"
          ></el-date-picker>
          <div style="margin-top: 15px">
            <el-button type="primary" @click="getList">查询</el-button>
          </div>
          <div class="speed">
            速度：
            <div class="speed-input">
              <el-slider
                v-model="speed"
                :min="10"
                :max="1000"
                :step="10"
              ></el-slider>
            </div>
            <el-button type="primary" @click="changeAnimation">{{
              animationText
            }}</el-button>
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Feature, Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { getMap } from "../utils/webStorage.js";
import mapType from "../utils/maptype.js";
import * as olProj from "ol/proj";
import { LineString, Point } from "ol/geom";
import { Style, Fill, Stroke, Circle as sCircle, Icon } from "ol/style";
import { Vector as VectorSource } from "ol/source";
import { getRotation, getCenterPoint } from "../utils/carRun.js";
import { getVectorContext } from "ol/render";

export default {
  name: "route",
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    location: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      dialogVisible: false,
      locaMap: null,
      openMap: null,
      routeSource: null,
      routeLayer: null,
      dateRange: [],
      routes: [],
      routesAll: [],
      routeGeometry: null,
      carGeometry: null,
      carFeature: null,
      speed: 60,
      animationText: "开始",
      animating: false, // 动画是否进行中
      lastRouteIndex: 0,
      styles: Object.freeze({
        route: new Style({
          stroke: new Stroke({
            lineDash: [2, 6, 10],
            width: 4,
            color: [0, 255, 0, 1],
          }),
        }),
        marker: new Style({
          image: new sCircle({
            radius: 10,
            stroke: new Stroke({
              color: "#fff",
            }),
            fill: new Fill({
              color: "#3399CC",
            }),
          }),
        }),
        carMarker: new Style({
          image: new Icon({
            rotation: 0,
            src: require("../assets/images/car.png"),
            imgSize: [20, 36],
          }),
        }),
      }),
    };
  },
  watch: {
    visible: {
      handler: function (val) {
        if (val) {
          this.dialogVisible = true;
          this.locaMap = getMap();
          this.$nextTick(() => {
            this.initMap();
          });
        }
      },
      immediate: true,
    },
    speed() {
      this.getRoutesAll();
    },
  },
  methods: {
    mapFit() {
      let view = this.openMap.getView();
      view.fit(this.routeGeometry, {
        padding: [120, 120, 120, 120],
      });
    },
    //绘画轨迹
    drawRoute() {
      //清除以前轨迹
      if (this.routeGeometry) {
        this.routeSource.clear();
      }
      this.routeGeometry = new LineString(this.routes);
      let route = new Feature({
        type: "route",
        geometry: this.routeGeometry,
      });
      //绘制点
      let opints = this.drawPoint();
      //绘制车
      let car = this.drawCar();
      this.routeSource.addFeatures([route, ...opints, car]);
      this.mapFit();
    },
    //小车
    drawCar() {
      this.carGeometry = new Point(this.routeGeometry.getFirstCoordinate());
      const carMarker = new Feature({
        type: "carMarker",
        geometry: this.carGeometry,
      });
      this.carFeature = carMarker;
      return carMarker;
    },
    //画点
    drawPoint() {
      let iconFeatures = [];
      this.routes.forEach((item) => {
        let feature = new Feature({
          type: "marker",
          geometry: new Point(item),
        });
        iconFeatures.push(feature);
      });
      return iconFeatures;
    },
    //得到历史轨迹清单
    getList() {
      let data = [
        [106.550483, 29.563707],
        [107.731056, 29.863785],
        [104.066301, 30.572961],
        [118.796624, 32.059344],
        [114.304569, 30.593354],
      ];
      this.routes = data.map((item) => {
        return olProj.fromLonLat(item);
      });
      this.getRoutesAll();
      this.drawRoute();
    },
    //分割路径点
    getRoutesAll() {
      this.lastRouteIndex = 0;
      let routesAll = [
        {
          coordinate: this.routes[0],
        },
      ];
      for (let i = 0, len = this.routes.length; i < len - 1; i++) {
        const item = this.routes[i];
        const itemNext = this.routes[i + 1];
        const rotation = getRotation(...item, ...itemNext);
        let points = getCenterPoint(this.openMap, [item, itemNext], this.speed);
        points = points.map((item) => {
          return {
            rotation,
            coordinate: item,
          };
        });
        routesAll = [...routesAll, ...points];
      }
      this.routesAll = routesAll;
    },
    changeAnimation() {
      this.animating ? this.stopAnimation() : this.startAnimation();
    },
    // 开始动画
    startAnimation() {
      this.animating = true;
      this.lastTime = Date.now();
      this.animationText = "停止";
      this.routeLayer.on("postrender", this.moveFeature);
      this.carFeature.setGeometry(null);
    },
    // 停止动画
    stopAnimation() {
      this.animating = false;
      this.animationText = "开始";
      this.carFeature.setGeometry(this.carGeometry);
      this.routeLayer.un("postrender", this.moveFeature);
    },
    // 移动动画
    moveFeature(event) {
      const len = this.routesAll.length;
      if (this.lastRouteIndex < len - 1) {
        this.lastRouteIndex++;
      } else {
        this.lastRouteIndex = 0;
      }
      const current = this.routesAll[this.lastRouteIndex];
      this.carGeometry.setCoordinates(current.coordinate);
      const vectorContext = getVectorContext(event);
      let style = new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          rotation: current.rotation,
          src: require("../assets/images/car.png"),
          imgSize: [20, 36],
        }),
      });
      vectorContext.setStyle(style);
      vectorContext.drawGeometry(this.carGeometry);
      this.openMap.render();
    },
    //初始化地图
    initMap() {
      const maplist = mapType;
      const tileLayer = new TileLayer({
        source: maplist.find((item) => item.id === this.locaMap).value,
      });
      this.routeSource = new VectorSource({
        wrapX: false,
      });
      this.routeLayer = new VectorLayer({
        source: this.routeSource,
        style: (feature) => {
          return this.styles[feature.get("type")];
        },
      });
      this.openMap = new Map({
        target: "route-map",
        layers: [tileLayer, this.routeLayer],
        view: new View({
          center: this.location,
          zoom: 10,
        }),
        controls: [],
      });
      this.getList();
    },
    //关闭
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.route {
  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    .map-area {
      box-shadow: inset 5em 1em #000000;
      position: relative;
      .tool-window {
        width: 200px;
        position: absolute;
        bottom: 20px;
        right: 20px;
        .button {
          font-size: 20px;
        }
        .speed {
          margin-top: 15px;
          display: flex;
          align-items: center;
          .speed-input {
            flex: 1;
            margin: 0 10px;
          }
        }
      }
    }
  }
}
.map-box {
  width: 100%;
  height: 60vh;
}
</style>