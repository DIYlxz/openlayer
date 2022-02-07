/*
 * @Author: Shao Tao
 * @Date: 2021-11-19 13:38:44
 * @LastEditTime: 2021-11-19 15:53:14
 * @LastEditors: Shao Tao
 * @Description:
 * @FilePath: \vue-openlayers\src\utils\openlayers\route.js
 */
import { getDistance } from "ol/sphere";
import { transform } from "ol/proj";

/**
 * 根据坐标获取弧度
 */
export function getRotation(lng1, lat1, lng2, lat2) {
  let rotation = Math.atan2(lng2 - lng1, lat2 - lat1);
  return rotation;
}
/**
 * 计算坐标2点之间的距离
 */
export function formatLength(map, pointArray) {
  let length = 0;
  if (map.getView().getProjection().code_ == "EPSG:4326") {
    for (let i = 0, ii = pointArray.length - 1; i < ii; ++i) {
      let c1 = pointArray[i];
      let c2 = pointArray[i + 1];

      length += getDistance(c1, c2);
    }
  } else if (map.getView().getProjection().code_ == "EPSG:3857") {
    for (let i = 0, ii = pointArray.length - 1; i < ii; ++i) {
      let c1 = pointArray[i];
      let c2 = pointArray[i + 1];
      c1 = transform(c1, "EPSG:3857", "EPSG:4326");
      c2 = transform(c2, "EPSG:3857", "EPSG:4326");
      length += getDistance(c1, c2);
    }
  }
  return length;
}

/**
 * 计算两点之间的中间点
 * @param {*} map
 * @param {Array} pointDoubleArray 二维数组坐标
 * @param {num} speed 每个点之间的距离
 */
export function getCenterPoint(map, pointDoubleArray, speed) {
  speed = speed == undefined ? 10 : speed;
  let twolength = formatLength(map, pointDoubleArray);
  let rate = twolength / speed; //比例 默认10m/点
  let step = Math.ceil(rate); //步数（向上取整）
  let arr = new Array(); //定义存储中间点数组
  let c1 = pointDoubleArray[0]; //头部点
  let c2 = pointDoubleArray[1]; //尾部点
  let x1 = c1[0],
    y1 = c1[1];
  let x2 = c2[0],
    y2 = c2[1];
  for (let i = 1; i < step; i++) {
    let coor = new Array(2);
    coor[0] = ((x2 - x1) * i) / rate + x1;
    coor[1] = ((y2 - y1) * i) / rate + y1;
    arr.push(coor); //此时arr为中间点的坐标
  }
  arr.push(c2);
  return arr;
}
