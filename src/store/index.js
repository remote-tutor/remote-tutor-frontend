import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    visible: false,
    text: '',
    color: '',
  },
  mutations: {
    VIEW_SNACKBAR(state, options) {
      state.color = options.color
      state.text = options.text
      state.visible = true
    }
  },
  actions: {
    viewScnackbar({ commit }, options) {
      commit('VIEW_SNACKBAR', options)
    }
  },
  modules: {
  }
})
