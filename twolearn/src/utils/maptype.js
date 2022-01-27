import { XYZ, BingMaps } from "ol/source"

let list = [{
    name: "高德地图",
    value: new XYZ({
        url: "https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}"
    }),
    id: "0",
},{
    name: "必应地图",
    //BingMaps必应地图的平铺图层
    value: new BingMaps({
        key: "AsawOhOGXsj58Z-3E-MduscOHAjDwm4BhDmBEdkTRplDUORtXzrXwpcmjXN1vvvL",
        imagerySet: "RoadOnDemand"
    }),
    id: "1"
}];

export default list;