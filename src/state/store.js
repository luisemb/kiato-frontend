import { createStore } from 'vuex'

import modules from './modules'
import jwt_decode from "jwt-decode";

export const store = createStore({
  modules,
  state: {
    isLoading: false,
    isAuthenticated: false,
    token: '',
    user: {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      permissions: []
    }
  },
  mutations: {
    initializeStore(state) {
      if(localStorage.getItem('jwt')){
        const currentRole = jwt_decode(localStorage.getItem('jwt'))
        state.token = localStorage.getItem('jwt')
        state.isAuthenticated = true
        state.user.email = localStorage.getItem('email')
        state.user.id = localStorage.getItem('userID')
        state.user.firstName = localStorage.getItem('firstName')
        state.user.lastName = localStorage.getItem('lastName')
        state.user.vuePermissions = currentRole.vueViews
      } else {
        state.token = ''
        state.isAuthenticated = false
        state.user.email = ''
        state.user.id = 0
        state.user.firstName = ''
        state.user.lastName = ''
        state.user.vuePermissions = []
      }
    },
    setIsLoading(state, status) {
      state.isLoading = status
    },
    setToken(state, token) {
      state.token = token
      state.isAuthenticated = true
    },
    removeToken(state) {
      state.token = ''
      state.isAuthenticated = false
    },
    setUser(state, user) {
      state.user = user
    },
    addItem(state, item) {
      state.items.todo.push(Object.assign(item, { id: state.nextId }));
      state.nextId += 1;
    },
  },
  actions: {

  },
  // Enable strict mode in development to get a warning
  // when mutating state outside a mutation.
  // https://vuex.vuejs.org/guide/strict.html
  strict: process.env.NODE_ENV !== 'production',
})

export default store

