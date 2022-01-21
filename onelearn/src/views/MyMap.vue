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
              url: "../countries.geojson",
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