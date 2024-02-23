<script>
import Layout from "../../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../../app.config";

import clientsNumbers from "../../widgets/clientsNumbers";
import prospectNumbers from "../../widgets/prospectNumbers";
import jwt_decode from "jwt-decode";
import axios from "axios";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Swal from "sweetalert2";
import moment from "moment";


// import {
//   CountTo
// } from "vue3-count-to";
var echarts = require("echarts");
import SessionsCounties from "../../dashboard/analytics/sessions-countries.vue";
import usaJson from "../../../components/widgets/USA.json"
import worldJson from "../../../components/widgets/world.json";

function getChartColorsArray(colors) {
  colors = JSON.parse(colors);
  return colors.map(function (value) {
    var newValue = value.replace(" ", "");
    if (newValue.indexOf(",") === -1) {
      var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
      if (color) {
        color = color.replace(" ", "");
        return color;
      } else return newValue;
    } else {
      var val = value.split(',');
      if (val.length == 2) {
        var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
        rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
        return rgbaColor;
      } else {
        return newValue;
      }
    }
  });
}

function generateData(count, yrange) {
  var i = 0;
  var series = [];
  while (i < count) {
    var x = "w" + (i + 1).toString();
    var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

    series.push({
      x: x,
      y: y,
    });
    i++;
  }
  return series;
}

export default {
  page: {
    title: "Kiato",
    meta: [{ name: "description", content: appConfig.description }],
  },
  data() {
    return {
      title: "Kiato",
      items: [
        {
          text: "Kiato",
          href: "/",
        },
        {
          text: "Dashboard",
          active: true,
        },
      ],
      agentsList: [],
      clientsList: [],
      prospectsList: [],
      data: {
        token: localStorage.getItem('jwt'),
      },
      date: null,
      userFullName: localStorage.getItem('firstName') +' '+ localStorage.getItem('lastname'),
      value1: 1,
      firstnameInput: '',
      lastnameInput: '',
      phonenumberInput: '',
      dateOfBirth: '',
      Address: '',
      timeGroup: '',
      language: '',
      state: '',
      cityInput: '',
      postalCode: '',
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
      completeForm: localStorage.getItem('completeForm'),
      audienceChartOptions: {
        series: [{
          name: "Last Year",
          data: [
            25.3, 12.5, 20.2, 18.5, 40.4, 25.4, 15.8, 22.3, 19.2, 25.3, 12.5,
            20.2,
          ],
        },
          {
            name: "Current Year",
            data: [
              36.2, 22.4, 38.2, 30.5, 26.4, 30.4, 20.2, 29.6, 10.9, 36.2, 22.4,
              38.2,
            ],
          },
        ],
        chartOptions: {
          chart: {
            type: "bar",
            height: 306,
            stacked: true,
            toolbar: {
              show: false,
            },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "30%",
              borderRadius: 6,
            },
          },
          dataLabels: {
            enabled: false,
          },
          legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            fontWeight: 400,
            fontSize: "8px",
            offsetX: 0,
            offsetY: 0,
            markers: {
              width: 9,
              height: 9,
              radius: 4,
            },
          },
          stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
          },
          grid: {
            show: false,
          },
          colors: getChartColorsArray('["--vz-primary","--vz-light"]'),
          xaxis: {
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: true,
              strokeDashArray: 1,
              height: 1,
              width: "100%",
              offsetX: 0,
              offsetY: 0,
            },
          },
          yaxis: {
            show: false,
          },
          fill: {
            opacity: 1,
          },
        },
      },
      portfolioChart: {
        series: [19405, 40552, 15824, 30635],
        chartOptions: {
          labels: ["Bitcoin", "Ethereum", "Litecoin", "Dash"],
          chart: {
            type: "donut",
            height: 210,
          },
          plotOptions: {
            pie: {
              size: 100,
              offsetX: 0,
              offsetY: 0,
              donut: {
                size: "70%",
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontSize: "18px",
                    offsetY: -5,
                  },
                  value: {
                    show: true,
                    fontSize: "20px",
                    color: "#343a40",
                    fontWeight: 500,
                    offsetY: 5,
                    formatter: function (val) {
                      return "$" + val;
                    },
                  },
                  total: {
                    show: true,
                    fontSize: "13px",
                    label: "Total value",
                    color: "#9599ad",
                    fontWeight: 500,
                    formatter: function (w) {
                      return (
                          "$" +
                          w.globals.seriesTotals.reduce(function (a, b) {
                            return a + b;
                          }, 0)
                      );
                    },
                  },
                },
              },
            },
          },
          dataLabels: {
            enabled: false,
          },
          legend: {
            show: false,
          },
          yaxis: {
            labels: {
              formatter: function (value) {
                return "$" + value;
              },
            },
          },
          stroke: {
            lineCap: "round",
            width: 2,
          },
          colors: getChartColorsArray(
              '["--vz-primary", "--vz-primary-rgb, 0.85", "--vz-primary-rgb, 0.65", "--vz-primary-rgb, 0.50"]'),
        },
      },
      topReferralsChart: {
        series: [{
          name: "Jan",
          data: generateData(20, {
            min: -30,
            max: 55,
          }),
        },
          {
            name: "Feb",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "Mar",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "Apr",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "May",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "Jun",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "Jul",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "Aug",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
          {
            name: "Sep",
            data: generateData(20, {
              min: -30,
              max: 55,
            }),
          },
        ],
        chartOptions: {
          chart: {
            height: 310,
            type: "heatmap",
            toolbar: {
              show: false,
            },
          },
          legend: {
            show: false,
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 1,
          },
          title: {
            style: {
              fontWeight: 500,
            },
          },
          colors: ["#405189", "#299CDB", "#F7B84B", "#0AB39C", "#3577F1"],
        },
      },
    };
  },
  components: {
    Layout,
    PageHeader,
    clientsNumbers,
    prospectNumbers,
    flatPickr,
    // CountTo,
    SessionsCounties
  },
  methods:{
    formatDate: function (date, format) {
      date = moment(date).format(format);
      return date;
    },
    viewPermission(request) {
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.vueViews.includes(request)
    },
    validPhone: function (phone) {
      return /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
    },
    async updateProfile() {

      this.errors = []
      if (!this.firstnameInput) {
        this.errors.push('First Name is required.');
      }

      if (!this.lastnameInput) {
        this.errors.push('Last Name is required.');
      }

      if (!this.phonenumberInput) {
        this.errors.push('Phone is required.');
      }

      if(this.validPhone(this.phonenumberInput) === false &&
          this.phonenumberInput !== ''){
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.dateOfBirth) {
        this.errors.push('Birth date is required.');
      }

      if (!this.Address) {
        this.errors.push('Address is required.');
      }

      if (!this.errors.length) {
        const data = {
          username: '',
          firstName: this.firstnameInput,
          lastName: this.lastnameInput,
          phoneNumber: this.phonenumberInput,
          state: this.state,
          city: this.cityInput,
          birthDate: (this.dateOfBirth.length > 8 ? this.formatDate(this.dateOfBirth, 'DD MMM, YYYY') : this.dateOfBirth),
          address: this.Address,
          postalCode: this.postalCode,
          timeGroup: this.timeGroup,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
        }

        await axios
            .put('/api/updateUserProfile', data)
            .then(async response => {
              if (response.status === 200) {
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Profile updated!'
                });
              }

              localStorage.setItem('completeForm', 'false');
              document.getElementById("btn-close").click();
            })
            .catch(async error => {
              if (error.response) {

                if(error.response.data.detail === 'Your session is expired!'){
                  this.$router.push('logout')
                }

                let list = '';
                for (const property in error.response.data) {
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                  list += '\n' + '<b>' + error.response.data[property] + '</b>';
                }

                await Swal.fire({
                  title: "Please check the following: " + list,
                  icon: 'warning',
                  confirmButtonClass: "btn btn-info",
                  buttonsStyling: false,
                  showCloseButton: true,
                });

              } else if (error.message) {
                this.errors.push('Something was wrong, please contact your SysAdmin.')
              }
            })
      } else {
        let list = '';
        for (let i = 0; i < this.errors.length; i++)
          list += '\n' + '<b>' + this.errors[i] + '</b>';

        await Swal.fire({
          title: "Please complete the form! " + list,
          icon: 'warning',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }
    },
    closeUpdateModal(){
      const modal = document.querySelector('#completeInfoForm');
      const backStage = document.querySelector('#backStage');
      modal.style.display = 'none';
      backStage.style.display = 'none';
    },
    async getUser() {
      await axios
          .get('/api/user', {params: {token: localStorage.getItem('jwt')}})
          .then(response => {
            this.firstnameInput =response.data.firstName;
            this.lastnameInput=response.data.lastName;
            this.phonenumberInput= response.data.phoneNumber;
            this.dateOfBirth= (response.data.dateOfBirth.length > 8 ? this.formatDate(response.data.dateOfBirth, 'DD MMM, YYYY') : response.data.dateOfBirth);
            this.Address=response.data.address;
            this.timeGroup=response.data.timeGroup;
            this.language=response.data.language;
            this.state=response.data.state;
            this.cityInput=response.data.city;
            this.postalCode=response.data.postalCode;
          })
          .catch(error => {
            if (error.response) {
              for (const property in error.response.data) {
                this.errors.push(`${property}: ${error.response.data[property]}`)
              }
            } else if (error.message) {
              this.errors.push('Something was wrong, please contact your SysAdmin.')
            }
          })
    },
  },
  async mounted() {
    this.errors = []
    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: this.data.searchValues,
    }

    // await axios
    //     .post('/api/agentsWidgetNumbers', data)
    //     .then(response => {
    //       this.agentsList = response.data
    //       this.clientsList = response.data
    //     })
    //     .catch(error => {
    //       if (error.response) {
    //
    //         if(error.response.data.detail === 'Your session is expired!'){
    //           this.$router.push('logout')
    //         }
    //         // for (const property in error.response.data) {
    //         // this.errors.push(`${property}: ${error.response.data[property]}`)
    //         // }
    //       } else if (error.message) {
    //         this.errors.push('Something was wrong, please contact your SysAdmin.')
    //       }
    //     })

    await axios
        .post('/api/workOrder/clientsWidgetNumbers', data)
        .then(response => {
          this.clientsList = response.data.client
          this.prospectsList = response.data.prospect
        })
        .catch(error => {
          if (error.response) {

            if(error.response.data.detail === 'Your session is expired!'){
              this.$router.push('logout')
            }
            // for (const property in error.response.data) {
            // this.errors.push(`${property}: ${error.response.data[property]}`)
            // }
          } else if (error.message) {
            this.errors.push('Something was wrong, please contact your SysAdmin.')
          }
        })

    if(this.completeForm === 'true'){
      await this.getUser()
    }

    let chartuser = document.getElementById("users-by-country");
    let chartDom = document.getElementById("sales-by-locations");

    let userChart = echarts.init(chartuser);
    let myChart = echarts.init(chartDom);
    let option;
    let useroption;

    echarts.registerMap("USA", usaJson, {
      Alaska: {
        left: -131,
        top: 25,
        width: 15,
      },
      Hawaii: {
        left: -110,
        top: 28,
        width: 5,
      },
      "Puerto Rico": {
        left: -76,
        top: 26,
        width: 2,
      },
    });
    option = {
      tooltip: {
        trigger: "item",
        showDelay: 0,
        transitionDuration: 0.2,
      },
      series: [{
        name: "USA PopEstimates",
        type: "map",
        roam: true,
        map: "USA",
        emphasis: {
          label: {
            show: true,
          },
        },
        data: [{
          name: "Alabama",
          value: 4822023
        },
          {
            name: "Alaska",
            value: 731449
          },
          {
            name: "Arizona",
            value: 6553255
          },
          {
            name: "Arkansas",
            value: 2949131
          },
          {
            name: "California",
            value: 38041430
          },
          {
            name: "Colorado",
            value: 5187582
          },
          {
            name: "Connecticut",
            value: 3590347
          },
          {
            name: "Delaware",
            value: 917092
          },
          {
            name: "District of Columbia",
            value: 632323
          },
          {
            name: "Florida",
            value: 19317568
          },
          {
            name: "Georgia",
            value: 9919945
          },
          {
            name: "Hawaii",
            value: 1392313
          },
          {
            name: "Idaho",
            value: 1595728
          },
          {
            name: "Illinois",
            value: 12875255
          },
          {
            name: "Indiana",
            value: 6537334
          },
          {
            name: "Iowa",
            value: 3074186
          },
          {
            name: "Kansas",
            value: 2885905
          },
          {
            name: "Kentucky",
            value: 4380415
          },
          {
            name: "Louisiana",
            value: 4601893
          },
          {
            name: "Maine",
            value: 1329192
          },
          {
            name: "Maryland",
            value: 5884563
          },
          {
            name: "Massachusetts",
            value: 6646144
          },
          {
            name: "Michigan",
            value: 9883360
          },
          {
            name: "Minnesota",
            value: 5379139
          },
          {
            name: "Mississippi",
            value: 2984926
          },
          {
            name: "Missouri",
            value: 6021988
          },
          {
            name: "Montana",
            value: 1005141
          },
          {
            name: "Nebraska",
            value: 1855525
          },
          {
            name: "Nevada",
            value: 2758931
          },
          {
            name: "New Hampshire",
            value: 1320718
          },
          {
            name: "New Jersey",
            value: 8864590
          },
          {
            name: "New Mexico",
            value: 2085538
          },
          {
            name: "New York",
            value: 19570261
          },
          {
            name: "North Carolina",
            value: 9752073
          },
          {
            name: "North Dakota",
            value: 699628
          },
          {
            name: "Ohio",
            value: 11544225
          },
          {
            name: "Oklahoma",
            value: 3814820
          },
          {
            name: "Oregon",
            value: 3899353
          },
          {
            name: "Pennsylvania",
            value: 12763536
          },
          {
            name: "Rhode Island",
            value: 1050292
          },
          {
            name: "South Carolina",
            value: 4723723
          },
          {
            name: "South Dakota",
            value: 833354
          },
          {
            name: "Tennessee",
            value: 6456243
          },
          {
            name: "Texas",
            value: 26059203
          },
          {
            name: "Utah",
            value: 2855287
          },
          {
            name: "Vermont",
            value: 626011
          },
          {
            name: "Virginia",
            value: 8185867
          },
          {
            name: "Washington",
            value: 6897012
          },
          {
            name: "West Virginia",
            value: 1855413
          },
          {
            name: "Wisconsin",
            value: 5726398
          },
          {
            name: "Wyoming",
            value: 576412
          },
          {
            name: "Puerto Rico",
            value: 3667084
          },
        ],
      }, ],
    };
    myChart.setOption(option);
    option && myChart.setOption(option);

    echarts.registerMap("world", worldJson, {
      Alaska: {
        left: -131,
        top: 25,
        width: 15,
      },
      Hawaii: {
        left: -110,
        top: 28,
        width: 5,
      },
      "Puerto Rico": {
        left: -76,
        top: 26,
        width: 2,
      },
    });
    useroption = {
      tooltip: {
        trigger: "item",
        showDelay: 0,
        transitionDuration: 0.2,
      },
      series: [{
        name: "World",
        type: "map",
        map: "world",
        label: {
          show: false,
        },
      }, ],
    };

    userChart.setOption(useroption);
    useroption && userChart.setOption(useroption);

  },
  computed:{
  }
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <div class="row" >
      <div class="col-xl-6" v-if="viewPermission('CLIENTLIST')">
        <clientsNumbers :clientsList="clientsList"/>
      </div>
      <div class="col-xl-6" v-if="viewPermission('PROSPECTLIST')">
        <prospectNumbers :prospectsList="prospectsList"/>
      </div>
      <div class="col-md-6">
        <div class="card-body">
          <div id="sales-by-locations" data-colors='["--vz-light"]' style="height: 269px"></div>

          <div class="px-2 py-2 mt-1">
            <p class="mb-1">New Maxico <span class="float-end">75%</span></p>
            <div class="progress mt-2" style="height: 6px">
              <div class="progress-bar progress-bar-striped bg-primary" role="progressbar" style="width: 75%"
                   aria-valuenow="75" aria-valuemin="0" aria-valuemax="75"></div>
            </div>

            <p class="mt-3 mb-1">
              California <span class="float-end">47%</span>
            </p>
            <div class="progress mt-2" style="height: 6px">
              <div class="progress-bar progress-bar-striped bg-primary" role="progressbar" style="width: 47%"
                   aria-valuenow="47" aria-valuemin="0" aria-valuemax="47"></div>
            </div>

            <p class="mt-3 mb-1">Texas <span class="float-end">82%</span></p>
            <div class="progress mt-2" style="height: 6px">
              <div class="progress-bar progress-bar-striped bg-primary" role="progressbar" style="width: 82%"
                   aria-valuenow="82" aria-valuemin="0" aria-valuemax="82"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="col-xxl-4 col-xl-6">
          <SessionsCounties />
          <!-- end card -->
        </div>
      </div>
    </div>
    <!-- end widget workOrders/ prospects -->

    <div id="completeInfoForm" class="modal fade show" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true"
         style="display: block;" v-if="completeForm === 'true'" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content ">
          <div class="modal-header">
            {{ completeForm }}
            <h5 class="modal-title" id="completeInfoForm">Update Profile</h5>
            <button type="button" id="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="closeUpdateModal"> </button>
          </div>
          <div class="modal-body">
            <form action="javascript:void(0);">
              <div class="row">
                <div class="col-lg-6">
                  <div class="mb-3">
                    <label for="firstnameInput" class="form-label"
                    >First Name</label
                    >
                    <input
                        type="text"
                        class="form-control"
                        id="firstnameInput"
                        placeholder="Enter your firstname"
                        v-model="firstnameInput"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <div class="mb-3">
                    <label for="lastnameInput" class="form-label"
                    >Last Name</label>
                    <input
                        type="text"
                        class="form-control"
                        id="lastnameInput"
                        placeholder="Enter your lastname"
                        v-model="lastnameInput"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <div class="mb-3">
                    <label for="phonenumberInput" class="form-label"
                    >Phone Number</label>
                    <input type="text" v-maska="['+1 (###) ##-##-##', '+1 (###) ###-##-##']"
                           class="form-control"
                           id="phonenumberInput"
                           v-model="phonenumberInput">
                    <div class="text-muted">+1 (###) ###-####</div>
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <div class="mb-3">
                    <label for="dateOfBirth" class="form-label"
                    >Birthdate</label>
                    <flat-pickr
                        v-model="dateOfBirth"
                        class="form-control"
                        :config="timeConfig"
                    ></flat-pickr>
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-12">
                  <div class="mb-3">
                    <label for="Address" class="form-label"
                    >Address</label
                    >
                    <input
                        type="text"
                        class="form-control"
                        id="Address"
                        placeholder="Enter your Address"
                        v-model="Address"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <div class="mb-3">
                    <label for="timeGroup" class="form-label"
                    >Time Zone</label>
                    <input
                        type="text"
                        class="form-control"
                        id="timeGroup"
                        v-model="timeGroup"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                </div>
                <!--end col-->
                <div class="col-lg-4">
                  <div class="mb-3">
                    <label for="cityInput" class="form-label">City</label>
                    <input
                        type="text"
                        class="form-control"
                        id="cityInput"
                        placeholder="City"
                        v-model="cityInput"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-4">
                  <div class="mb-3">
                    <label for="state" class="form-label"
                    >State</label
                    >
                    <input
                        type="text"
                        class="form-control"
                        id="state"
                        placeholder="State"
                        v-model="state"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-4">
                  <div class="mb-3">
                    <label for="postalCode" class="form-label"
                    >Postal Code</label
                    >
                    <input
                        type="text"
                        class="form-control"
                        minlength="5"
                        maxlength="6"
                        id="postalCode"
                        placeholder="Enter Postal Code"
                        v-model="postalCode"
                    />
                  </div>
                </div>
                <!--end col-->
              </div>
              <!--end row-->
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" id="closeMove" data-bs-dismiss="modal" @click="closeUpdateModal">Close</button>
            <button type="button" class="btn btn-primary" @click="updateProfile">Update</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
    <div class="modal-backdrop fade show" v-show="completeForm === 'true'" id="backStage"></div>
  </Layout>
</template>
