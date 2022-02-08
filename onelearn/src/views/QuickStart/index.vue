<template>
  <div id="quickStart">
    <div id="myMap"></div>
  </div>
</template>

<script>
//空间样式
import "ol/ol.css";
//引入地图Map,View为2D的视图
import { Map, View } from "ol";
//引入图层,瓦片
import TileLayer from "ol/layer/Tile";
//URL里带有XYZ格式的瓦片
import XYZ from "ol/source/XYZ";
//坐标进行转换的函数
import * as olProj from "ol/proj";
//控件,拉扯旋转控件
import { DragRotateAndZoom, defaults as defaultInteractions} from "ol/interaction"

export default {
  name: "QuickStart",
  data() {
    return {
      myMap: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    //初始化地图
    initMap() {
      this.myMap = new Map({
        //目标渲染元素
        target: "myMap",
        //层
        layers: [
          new TileLayer({
            source: new XYZ({
              url: "https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
              attributions: "@ <a href='https://juejin.cn/user/528198909049053'>CQUPT</a>" + "  学习使用",
            }),
          }),
        ],
        view: new View({
          center: olProj.fromLonLat([107.731056, 29.863785]),
          zoom: 16,
        }),
        interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#quickStart {
    position: relative;
  #myMap {
    width: 100vw;
    height: 100vh;
  }
}
</style>