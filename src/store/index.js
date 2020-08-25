import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    visible: false,
    text: '',
    color: '',
    userToken: '',
  },
  plugins: [createPersistedState({
    paths: ['userToken']
  })],
  mutations: {
    VIEW_SNACKBAR(state, options) {
      state.color = options.color
      state.text = options.text
      state.visible = true
    },
    SET_USER_TOKEN(state, token) {
      state.userToken = token
    }
  },
  actions: {
    viewSnackbar({ commit }, options) {
      commit('VIEW_SNACKBAR', options)
    },
    setUserToken({commit}, options) {
      commit('SET_USER_TOKEN', options)
    }
  },
  modules: {
  }
})
