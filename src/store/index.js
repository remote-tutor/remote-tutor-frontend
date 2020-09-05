import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    visible: false,
    text: '',
    color: '',
    userData: {
      admin: false,
      name: '',
      token: '',
    },
  },
  plugins: [createPersistedState({
    paths: ['userData']
  })],
  mutations: {
    VIEW_SNACKBAR(state, options) {
      state.color = options.color
      state.text = options.text
      state.visible = true
    },
    SET_USER_DATA(state, userData) {
      state.userData.admin = userData.admin
      state.userData.name = userData.name
      state.userData.token = userData.token
    }
  },
  actions: {
    viewSnackbar({ commit }, options) {
      commit('VIEW_SNACKBAR', options)
    },
    setUserData({commit}, options) {
      commit('SET_USER_DATA', options)
    }
  },
  modules: {
  }
})
