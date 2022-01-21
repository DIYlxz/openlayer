#  openlayer学习第一天

**背景**：OpenLayers 使在任何网页中放置动态地图变得容易。它可以显示从任何来源加载的地图图块、矢量数据和标记。OpenLayers 的开发旨在进一步使用各种地理信息。它是完全免费的开源 JavaScript，在 2 条款 BSD 许可证（也称为 FreeBSD）下发布。



##  安装

下载

```
npm i ol
```



##  初应用

熟悉一下api



html,css片段

```html
<div id="myMap"></div>
#myMap {
    width: 100vw;
    height: 100vh;
}
```



js片段

```javascript
import "ol/ol.css";
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import {Map, View} from 'ol';

export default {
    name: "myMap",
    data() {
        return {
            map: null,
        }
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            this.map = new Map({
                target: "myMap",
                layers: [
                    new TileLayer({
                        source: new OSM()
                    })
                ],
                view: new View({
                    center: [104.06, 30.67],
                    projection: "EPSG:4326",
                    zoom: 2,
                    maxZoom: 18,
                    minZoom: 6
                }),
            });
        }
    },
}
```



##  GeoJSON



代码

```vue
<template>
  <div id="myMap"></div>
</template>

<script>

import 'ol/ol.css';
import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import View from "ol/View";

export default {
  name: "myMap",
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.map = new Map({
        target: "myMap",
        layers: [
          new VectorLayer({
            source: new VectorSource({
              format: new GeoJSON(),
              url: require("../assets/map/countries.json"),
            }),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#myMap {
  width: 100vw;
  height: 100vh;
}
</style>
```



报错：

<p style="color:red">VM9404:1 Uncaught SyntaxError: Unexpected token < in JSON at position 0
    at JSON.parse (<anonymous>)
    at getObject (JSONFeature.js?377d:193:1)
    at GeoJSON.JSONFeature.readFeatures (JSONFeature.js?377d:63:1)
    at XMLHttpRequest.xhr.onload (featureloader.js?6d8f:88:1)</p>



##  ol-hashed

```javascript
import sync from 'ol-hashed';
```

现在我们需要将映射分配给一个变量（名为`map`），以便我们可以将该变量传递给`sync`函数：

```javascript
const map = new Map({
```

现在我们可以`sync`使用我们的地图调用该函数：

```javascript
sync(map);
```
