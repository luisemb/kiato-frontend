<template>
 <router-view></router-view>
</template>

<script>
import axios from "axios";
// axios.defaults.baseURL = 'https://a3j63o3n9.dmbgroup.online/'
axios.defaults.baseURL = 'http://127.0.0.1:8000'

export default {
  name: 'App',
  components: {},
  beforeCreate() {
    this.$store.commit('initializeStore')

    if (this.$store.state.token) {
      axios.defaults.headers.common['Authorization'] = "Token " + this.$store.state.token
    } else {
      axios.defaults.headers.common['Authorization'] = ""
    }
  }
}
</script>