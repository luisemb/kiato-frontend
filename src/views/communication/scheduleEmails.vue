<script>
import "@vueform/multiselect/themes/default.scss";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import moment from "moment";

export default {
  page: {
    title: "Agents List cards",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Agent List",
      items: [
        {
          text: "Agents",
          href: "/",
        },
        {
          text: "Agent List cards",
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
      list: [],
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          isActive: 1,
          noteSearch: '',
          keyword: '',
          licensed: 1,
          language: 3,
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
        }
      },
    };
  },
  methods: {
    formatDate: function (date, format) {
      date = moment(date).format(format)
      return date;
    },

  },
  async mounted() {

  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items"/>

  </Layout>
</template>
