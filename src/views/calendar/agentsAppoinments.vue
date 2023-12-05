<script>
import "@vueform/multiselect/themes/default.scss";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import calendar from "../../components/appoinmentCalendar";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
// import axios from "axios";
// import Swal from "sweetalert2";
// import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";


export default {
  page: {
    title: "Agents Calendar",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
    calendar,
  },
  data() {
    return {
      title: "Agents calendar",
      items: [
        {
          text: "Calendar",
          href: "/",
        },
        {
          text: "Agents",
          active: true,
        },
      ],
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
      dateTimeConfig: {
        enableTime: true,
        dateFormat: "m-d-y H:i K"
      },
    };
  },
  setup() {
    return { v$: useVuelidate() }
  },
  methods: {
  },
  validations: {
  },
};
</script>
<style>
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items"/>

    <calendar></calendar>

  </Layout>
</template>
