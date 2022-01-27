import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fences: localStorage.getItem("fences") ? JSON.parse(localStorage.getItem("fences")) : [],
  },
  getters: {
    fences: (state) => {
      return state.fences;
    }
  },
  mutations: {
    addFences(state, val) {
      state.fences.push(val);
      localStorage.setItem("fences", JSON.stringify(state.fences));
    }
  },
  actions: {
  },
  modules: {
  }
})
