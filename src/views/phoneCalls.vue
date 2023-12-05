<script>
import "@vueform/multiselect/themes/default.css";
import "flatpickr/dist/flatpickr.css";

import Layout from "../layouts/main.vue";
import appConfig from "../../app.config";
// import Plivo from 'plivo-browser-sdk'

export default {
  page: {
    title: "Setting",
    meta: [{ name: "description", content: appConfig.description }],
  },
  data() {
    return {
      title: "Setting",
      items: [
        {
          text: "Pages",
          href: "/",
        },
        {
          text: "Setting",
          active: true,
        },
      ],
      value: ["javascript"],
    };
  },
  components: {
    Layout,
    // Plivo,
  },
  methods:{
  },
  async mounted() {
  },
};
</script>
<style>
.profile-wid-bg{

}
.profile-wid-bg::before {
  background: #2ca219 !important;
  background: linear-gradient(to top, #55c241, #588d4f) !important;
}
</style>
<template>
  <Layout>

  </Layout>
</template>
