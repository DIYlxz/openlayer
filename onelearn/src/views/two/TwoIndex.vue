<template>
    <div id="TwoIndex"></div>
</template>

<script>
import mapType from "@/utils/openlayers/maptype"
export default {
    name: "TowIndex",
    data() {
        return {
            tileLayer: null,
            mapList: null,
            locaMap: "1",
        }
    },
    mounted() {

    },
    methods() {
    }
}
</script>

<style lang="scss" scoped>
#TwoIndex {
    width: 100%;
    height: 100%;
}
</style>