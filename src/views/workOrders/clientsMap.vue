<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";

/**
 * Leaflet-map component
 */
import "leaflet/dist/leaflet.css";
import { latLng } from "leaflet";
import {
  LMap, LTileLayer, LMarker, LIcon, LPopup
  // LTooltip
} from "@vue-leaflet/vue-leaflet";
import jwt_decode from "jwt-decode";
import moment from "moment/moment";
import axios from "axios";
import Swal from "sweetalert2";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

// import Basic from "../maps/leaflet/basic"

export default {
  page: {
    title: "Clients map",
    meta: [{name: "description", content: appConfig.description}]
  },
  components: {
    Layout,
    PageHeader,
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LPopup,
    // LTooltip,
    flatPickr
  },
  data() {
    return {
      token: localStorage.getItem('jwt'),
      errors: [],
      searchValues: {
        type: '0',
        noteSearch: '',
        keyword: '',
        language: '3',
        clients: 1,
        status: '0',
        sortBy: 'name',
        orderBy: 'ASC',
        dateRange: '0',
        department: '0' ,
        toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
        fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 4)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
      },
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      title: "Clients Map",
      items: [
        {
          text: "Maps",
          href: "/"
        },
        {
          text: "DMB Map",
          active: true
        }
      ],
      zoom: 14,
      maxZoom: 19,
      minZoom: 12,
      center: latLng(29.7272465, -95.3599523),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.anfisbena.com" target="_blank">Anfisbena</a>',
      withTooltip: latLng(29.77426711102793, -95.3723119265009),
      showParagraph: false,
      showMap: true,
      mapOptions: {
        zoomSnap: 0.5,
      },
      markerss: [
        [latLng(29.7272465, -95.359), '', '', '', '']
      ]
    };
  },
  methods: {
    getLocation() {
      if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(this.showPosition);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    },
    showPosition(position) {
      this.center = latLng(position.coords.latitude, position.coords.longitude);
      this.markerss.push(latLng(position.coords.latitude, position.coords.longitude));
    },
    viewUserGroup(request){
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.userGroup.includes(request)
    },
    async updateClientList(status=this.searchValues.status) {

      let validate = true;
      let errors = [];
      let filterLanguage = document.getElementById("filterLanguage").value;
      let filterKeyword = document.getElementById("filterKeyword").value;
      let filterType = document.getElementById("filterType").value;
      let filterNotes = document.getElementById("filterNotes").value;
      let filterFromDate = document.getElementById("filterFromDate").value;
      let filterToDate = document.getElementById("filterToDate").value;
      this.searchValues.status = status;

      if (filterLanguage !== '' && (filterLanguage === '1' || filterLanguage === '2')){
        this.searchValues.language = filterLanguage;
      }

      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.searchValues.keyword = filterKeyword;
      }else if(filterKeyword !== '' && filterKeyword.length < 3) {
        errors.push('Keyword search should have 3 or more characters!')
        validate = false;
      }

      if(filterType !== ''){
        this.searchValues.type = filterType;
      }

      if (filterNotes !== '' && filterNotes.length >= 3) {
        this.searchValues.noteSearch = filterNotes;
      }else if(filterNotes !== '' && filterNotes.length < 3) {
        errors.push('Notes search should have 3 or more characters!')
        validate = false;
      }

      var start = moment(this.formatDate(filterFromDate, 'YYYY-MM-DD'));
      var end = moment(this.formatDate(filterToDate, 'YYYY-MM-DD'));
      var days = end.diff(start, "days");

      if(days <= 365){
        this.searchValues.fromDate = filterFromDate;
        this.searchValues.toDate = filterToDate;
      } else {
        errors.push("From Date and To Date (range) couldn't be larger than a year (365 days)!");
        validate = false;
      }

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        searchValues: this.searchValues,
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        deleted: 0,
      }

      if(validate){
        await axios
            .post('/api/workOrder/listWorkOrders', data)
            .then(response => {
              this.list = response.data
              this.page = 1
              this.setPages()
            })
            .catch(error => {
              if (error.response) {

                if(error.response.data.detail === 'Your session is expired!'){
                  this.$router.push('logout')
                }

                for (const property in error.response.data) {
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                }
              }/* else if (error.message) {
              this.errors.push('Something was wrong, please contact your SysAdmin.')
            }*/
            })
      }else{
        let list = '';
        for (var i = 0; i < errors.length; i+=1) {
          list += errors[i] + ' \n';
        }

        await Swal.fire("" + list, '', 'info');

      }

    },
    handleFocus(e){
      e.target.setAttribute("autocomplete", "nope");
    },
    consolelog(){
      console.log('test')
    }
  },
  async mounted() {
    this.getLocation();
    // let test = latLng(29.7276548, -95.3599875)
    // this.markerss.push(test)
  },
  created() {

    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: this.searchValues,
      userEmail: localStorage.getItem('email'),
      userID: localStorage.getItem('id'),
      isProspect: 0,
      deleted: 0,
    }

    axios
    .post('/api/workOrder/listClientCoordinates', data)
    .then(response => {
      this.list = response.data
      let coordinates = []

      response.data.forEach(function (element, i) {
        coordinates.push([latLng(response.data[i].latitude, response.data[i].longitude),
          response.data[i].fullName, response.data[i].address, response.data[i].email, response.data[i].phoneNumber])
      })

      this.markerss = coordinates

    })
    .catch(error => {
      if (error.response) {

        if (error.response.data.detail === 'Your session is expired!') {
          this.$router.push('logout')
        }

        // for (const property in error.response.data) {
        // this.errors.push(`${property}: ${error.response.data[property]}`)
        // }
      } else if (error.message) {
        this.errors.push('Something was wrong, please contact your SysAdmin.')
      }
    })

    const success = (position) => {
      const latitude  = position.coords.latitude;
      const longitude = position.coords.longitude;

      this.center = latLng(latitude, longitude);
    };

    const error = (err) => {
      console.log(error)
      console.log(err)
    };

    // This will open permission popup
    navigator.geolocation.getCurrentPosition(success, error);
  }
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items"/>
    <div class="row" style="margin-top: 1%;">
      <div class="col-lg-12">
        <div class="card" id="leadsList">
          <div class="card-header border-0">
            <div class="row g-4 align-items-center">
              <div class="col-sm-3">
                <div class="search-box">
                  <input
                      type="text"
                      class="form-control search"
                      placeholder="Search for..."
                      v-model="this.searchValues.keyword"
                      @change="this.searchValues.keyword.length >= 3 ? updateClientList(): ''"
                      v-on:keyup.enter="this.searchValues.keyword === '' ? updateClientList() : ''"
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>
              </div>
              <div class="col-sm-auto ms-auto">
                <div class="hstack gap-2">
                  <div class="row">
                    <div class="col-md-12" style="margin-top: 5px;">
                      <button type="button" class="btn btn-soft-success float-end" href="#open-filters" data-bs-toggle="modal">
                        <i class="ri-filter-line align-bottom me-1"></i> Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--end col-->
    </div>
    <l-map
        :zoom="zoom"
        :maxZoom="maxZoom"
        :minZoom="minZoom"
        :center="center"
        :options="mapOptions"
        style="height: 800px; width: 100%"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-marker v-for="(marker, index) in this.markerss" :lat-lng="marker[0]" :key="index">
        <l-popup>
          <b>Name: </b> {{marker[1]}} <br>
          <b>Phone: </b> {{marker[4]}} <br>
          <b>Email: </b> {{marker[3]}} <br>

          <a :href="'https://maps.google.com/?q='+marker[2]" target="_blank">Go to Gmaps</a>
        </l-popup>
<!--        <l-tooltip :options="{ permanent: false }" @click="consolelog">-->
<!--        </l-tooltip>-->
        <l-icon>
          <img src="@/assets/images/leaflet/marker-icon22.png" />
        </l-icon>
      </l-marker>
    </l-map>

    <!-- Filters Modal -->
    <div id="open-filters" class="modal fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;" data-bs-focus="false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="myModalLabel">Filters</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"> </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-lg-12">
                <label for="filterKeyword" class="form-label">Keyword</label>
                <input type="text" id="filterKeyword" name="filterKeyword" class="form-control mb-2" placeholder="Enter Keyword" v-model="this.searchValues.keyword">
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterType" class="form-label">Type</label>
                <select class="form-select mb-2" aria-label="Status" id="filterType" name="filterType" v-model="this.searchValues.type">
                  <option value="0">All</option>
                  <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                </select>
              </div>
              <div class="col-lg-6">
                <label for="filterStatus" class="form-label">Status</label>
                <select class="form-select mb-2" aria-label="Status" id="filterStatus" v-model="this.searchValues.status">
                  <option value="0">All</option>
                  <option v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="editLanguage" class="form-label">Language</label>
                <select class="form-select mb-2" aria-label="Language" id="filterLanguage" name="filterLanguage" v-model="this.searchValues.language">
                  <option value="1">English</option>
                  <option value="2">Spanish</option>
                  <option value="3">Both</option>
                </select>
              </div>
              <div class="col-lg-6">
                <label for="editStatus" class="form-label">Search by Notes</label>
                <input type="text" id="filterNotes" name="filterNotes" class="form-control mb-2" placeholder="Enter note" v-model="this.searchValues.noteSearch">
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterFromDate" class="form-label"> From date </label>
                <flat-pickr
                    v-model="this.searchValues.fromDate"
                    :config="humanfriendlyConfig"
                    class="form-control flatpickr-input"
                    id="filterFromDate"
                    name="filterFromDate"
                ></flat-pickr>
              </div>
              <div class="col-lg-6">
                <label for="filterToDate" class="form-label"> To Date </label>
                <flat-pickr
                    v-model="this.searchValues.toDate"
                    :config="humanfriendlyConfig"
                    class="form-control flatpickr-input"
                    id="filterToDate"
                    name="filterToDate"
                ></flat-pickr>
              </div>
            </div>
            <div class="row">

            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterDateRange" class="form-label">Time Range</label>
                <select class="form-select mb-2" id="filterDateRange" name="filterDateRange" v-model="this.searchValues.dateRange">
                  <option value="0" selected>...</option>
                  <option value="1">Until 2 year Ago</option>
                  <option value="2">Until 4 year Ago</option>
                  <option value="3">Until 5 year Ago</option>
                  <option value="4">Begin of times</option>
                </select>
              </div>
              <div class="col-lg-6">
                <span v-if="viewUserGroup('SUPER_ADMIN_GROUP')">
                  <label for="filterDateRange" class="form-label">Department</label>
                    <select class="form-select mb-2" aria-label="Department" id="filterDepartment" name="filterDepartment"
                            v-model="this.searchValues.department">
                        <option value="0"> All</option>
                        <option v-for="(department, index) of departmentList"  :key="index"
                                v-bind:value="department.departmentID"> {{ department.name }}
                        </option>
                    </select>
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="updateClientList()">Search</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

  </Layout>
</template>