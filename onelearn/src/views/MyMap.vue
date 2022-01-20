<template>
    <div id="myMap"></div>
</template>

<script>
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
</script>

<style lang="scss" scoped>
#myMap {
    width: 100vw;
    height: 100vh;
}
</style>