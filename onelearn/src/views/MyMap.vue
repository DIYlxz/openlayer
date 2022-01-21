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
import { XYZ, Vector as VectorSource } from "ol/source";
//Point点
import { Point } from "ol/geom";
//Style为矢量特征呈现样式的容器,Fill设置矢量特征的填充样式,Stroke矢量图的描边样式,Circle矢量圆形
import { Style, Fill, Stroke, Circle as sCircle } from "ol/style";

export default {
  name: "Map",
  data() {
    return {
      map: null,
      popup: null,
      shopPopup: false,
    };
  },
  mounted() {
    this.initMap();
    this.setMarker();
    this.addOverlay();
    this.singleclick();
    this.pointermove();
  },
  methods: {
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
    //点击触发事件
    singleclick() {
      this.map.on("singleclick", (e) => {
        const feature = this.map.forEachFeatureAtPixel(
          e.pixel,
          (feature) => feature
        );
        console.log(feature);
        if (feature) {
          this.shopPopup = true;
          // 设置弹窗位置
          let coordinates = feature.getGeometry().getCoordinates();
          this.popup.setPosition(coordinates);
        } else {
          this.shopPopup = false;
        }
      });
    },
    setMarker() {
      //创建新的矢量样式容器
      const style = new Style({
        //画矢量圆
        image: new sCircle({
          radius: 10,
          stroke: new Stroke({
            color: "blue",
          }),
          fill: new Fill({
            color: "red",
          }),
        }),
      });
      //创建适量对象，设置点在中心点
      const feature = new Feature({
        geometry: new Point(olProj.fromLonLat([106.550483, 29.563707])),
      });
      //引入矢量样式
      feature.setStyle(style);
      //展现到图层
      const marker = new VectorLayer({
        source: new VectorSource({
          features: [feature],
        }),
      });
      //将给定的图层添加到此地图的顶部
      this.map.addLayer(marker);
    },
    initMap() {
      this.map = new Map({
        //目标元素id
        target: "myMap",
        //图层，一个地图容器有一个或者多个图层
        layers: [
          //预渲染图层
          new TileLayer({
            //数据来源，高德地图XYZ切片地图资源
            source: new XYZ({
              url: "https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
            }),
          }),
        ],
        //在可视区域内控制地图与人的交互
        view: new View({
          //地图初始中心，将坐标从经度/纬度转换为不同的投影。
          center: olProj.fromLonLat([106.550483, 29.563707]),
          //初始放大比例
          zoom: 10,
        }),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#Map {
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
}
</style>