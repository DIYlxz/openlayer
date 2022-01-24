<template>
  <div id="app">
    <my-map></my-map>
  </div>
</template>

<script>
import MyMap from "./views/one/MyMap"
export default {
  name: 'App',
  components: {
    MyMap,
  }
}
</script>

<style>
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
