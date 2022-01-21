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
OSM需要外网

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
