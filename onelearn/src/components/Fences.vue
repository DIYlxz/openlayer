<template>
  <el-dialog
    title="编辑围栏"
    :visible="dialogVisible"
    custom-class="fence"
    append-to-body
    @close="handleClose"
    width="1200px"
    destroy-on-close
  >
    <div id="fence-map" class="map-box"></div>
  </el-dialog>
</template>

<script>
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Circle as sCircle } from "ol/style";
import { getMap } from "@/utils/webStorage";
import mapType from "@/utils/openlayers/maptype";
export default {
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
      fenceSource: null
    };
  },
  watch: {
    visible: {
      handler: function (value) {
        if (value) {
          this.dialogVisible = true;
          this.locaMap = getMap() || "0";
          this.$nextTick(() => {
            this.initMap();
          });
        }
      },
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    initMap() {
      const _maplist = mapType;
      const _tileLayer = new TileLayer({
        source: _maplist.find((e) => e.id === this.locaMap).value,
      });
      this.fenceSource = new VectorSource({ wrapX: false });

      const _vector = new VectorLayer({
        source: this.fenceSource,
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
      this.openMap = new Map({
        target: "fence-map",
        layers: [_tileLayer, _vector],
        view: new View({
          center: this.location,
          zoom: 10,
        }),
        controls: [],
      });
    },
    handleClose() {
      this.$emit("close");
    }
  },
};
</script>

<style lang="scss" scoped>
.fence {
  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
  }
}
.map-box {
  width: 100%;
  height: 60vh;
}
</style>
