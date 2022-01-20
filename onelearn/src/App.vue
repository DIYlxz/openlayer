<template>
  <my-map></my-map>
</template>

<script>
import MyMap from './views/MyMap.vue'

export default {
  name: 'App',
  components: {
    MyMap,
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
* {
  margin: 0;
  padding: 0;
} 
</style>
