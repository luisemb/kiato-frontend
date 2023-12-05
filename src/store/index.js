import { createStore } from 'vuex'

export const store = createStore({
    state: {
        isLoading: false,
        isAuthenticated: false,
        token: ''
    },
    mutations: {
        initializeStore(state) {
            if(localStorage.getItem('jwt')){
                state.token = localStorage.getItem('jwt')
                state.isAuthenticated = true
            } else {
                state.token = ''
                state.isAuthenticated = false
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
        }
    },
    actions: {

    },
    modules: {

    }
})