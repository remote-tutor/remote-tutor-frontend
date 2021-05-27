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
    isLoggedIn: false,
    classes: {
      values: [],
      selectedClass: 0,
    }
  },
  plugins: [createPersistedState({
    paths: ['userData', 'classes', 'isLoggedIn']
  })],
  mutations: {
    VIEW_SUCCESS_SNACKBAR(state, text) {
      state.color = "success"
      state.text = text
      state.visible = true
    },
    VIEW_ERROR_SNACKBAR(state, text) {
      state.color = "error"
      state.text = text
      state.visible = true
    },
    SET_USER_DATA(state, userData) {
      state.userData.name = userData.name
      state.userData.token = userData.token
    },
    SET_USER_CLASS(state, userClass) {
      state.classes.selectedClass = userClass
        if (state.classes.values.length > 0)
          state.userData.admin = state.classes.values[state.classes.selectedClass].admin
    },
    SET_USER_CLASSES(state, classes) {
      state.classes.values = classes
    },
    SET_IS_LOGGED_IN(state, value) {
      state.isLoggedIn = value
    },
  },
  actions: {
    viewSuccessSnackbar({ commit }, options) {
      commit('VIEW_SUCCESS_SNACKBAR', options)
    },
    viewErrorSnackbar({ commit }, options) {
      commit('VIEW_ERROR_SNACKBAR', options)
    },
    setUserData({commit}, options) {
      commit('SET_USER_DATA', options)
    },
    setUserClass({commit}, options) {
      commit('SET_USER_CLASS', options)
    },
    setUserClasses({commit}, options) {
      commit('SET_USER_CLASSES', options)
    },
    setIsLoggedIn({commit}, options) {
      commit('SET_IS_LOGGED_IN', options)
    }
  },
  modules: {
  }
})
