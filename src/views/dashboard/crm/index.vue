<script>
import Layout from "../../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../../app.config";

import agentNumbers from "../../widgets/agentNumbers.vue";
import clientsNumbers from "../../widgets/clientsNumbers";
import prospectNumbers from "../../widgets/prospectNumbers";
import jwt_decode from "jwt-decode";
import axios from "axios";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Swal from "sweetalert2";
import moment from "moment";

export default {
  page: {
    title: "CRM",
    meta: [{ name: "description", content: appConfig.description }],
  },
  data() {
    return {
      title: "CRM",
      items: [
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "CRM",
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
      agentNumber: '',
      licenseNumber: '',
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
      completeForm: localStorage.getItem('completeForm'),
    };
  },
  components: {
    Layout,
    PageHeader,
    agentNumbers,
    clientsNumbers,
    prospectNumbers,
    flatPickr,
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

      if (!this.language) {
        this.errors.push('Language is required.');
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

      if (!this.agentNumber) {
        this.errors.push('Agent Number is required.');
      }

      if (!this.errors.length) {
        const data = {
          username: '',
          firstName: this.firstnameInput,
          lastName: this.lastnameInput,
          language: this.language,
          phoneNumber: this.phonenumberInput,
          state: this.state,
          city: this.cityInput,
          birthDate: (this.dateOfBirth.length > 8 ? this.formatDate(this.dateOfBirth, 'DD MMM, YYYY') : this.dateOfBirth),
          address: this.Address,
          postalCode: this.postalCode,
          agentNumber: this.agentNumber,
          licenseNumber: this.licenseNumber,
          isLicensed: this.value1,
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
            this.agentNumber=response.data.agentNumber;
            this.licenseNumber=response.data.licenseNumber;
            this.value1=response.data.isLicensed;
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

    await axios
        .post('/api/agentsWidgetNumbers', data)
        .then(response => {
          this.agentsList = response.data
          this.clientsList = response.data
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

    await axios
        .post('/api/client/clientsWidgetNumbers', data)
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
  },
  computed:{
  }
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <div class="row" v-if="viewPermission('AGENTLIST')">
      <div class="col-xl-12">
        <agentNumbers :agentsList="agentsList"/>
      </div>
    </div>
    <!-- end widget agents -->

    <div class="row" >
      <div class="col-xl-6" v-if="viewPermission('CLIENTLIST')">
        <clientsNumbers :clientsList="clientsList"/>
      </div>
      <div class="col-xl-6" v-if="viewPermission('PROSPECTLIST')">
        <prospectNumbers :prospectsList="prospectsList"/>
      </div>
    </div>
    <!-- end widget clients/ prospects -->

    <div class="row">
      <div class="col-xxl-5">
        <div class="card card-height-100">
          <div class="card-header align-items-center d-flex">
            <h4 class="card-title mb-0 flex-grow-1">Upcoming Activities</h4>
            <div class="flex-shrink-0">
              <div class="dropdown card-header-dropdown">
                <a class="text-reset dropdown-btn" href="#" data-bs-toggle="dropdown" aria-haspopup="true"
                   aria-expanded="false">
                  <span class="text-muted fs-18"><i class="mdi mdi-dots-vertical"></i></span>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                  <a class="dropdown-item" href="#">Edit</a>
                  <a class="dropdown-item" href="#">Remove</a>
                </div>
              </div>
            </div>
          </div>
          <!-- end card header -->
          <div class="card-body pt-0">
            <ul class="list-group list-group-flush border-dashed">
              <li class="list-group-item ps-0">
                <div class="row align-items-center g-3">
                  <div class="col-auto">
                    <div class="avatar-sm p-1 py-2 h-auto bg-light rounded-3">
                      <div class="text-center">
                        <h5 class="mb-0">25</h5>
                        <div class="text-muted">Tue</div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <h5 class="text-muted mt-0 mb-1 fs-13">
                      12:00am - 03:30pm
                    </h5>
                    <a href="#" class="text-reset fs-14 mb-0">Meeting for campaign with sales team</a>
                  </div>
                  <div class="col-sm-auto">
                    <div class="avatar-group">
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Stine Nielsen">
                          <img src="@/assets/images/users/avatar-1.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Jansh Brown">
                          <img src="@/assets/images/users/avatar-2.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Dan Gibson">
                          <img src="@/assets/images/users/avatar-3.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);">
                          <div class="avatar-xxs">
                            <span class="
                                avatar-title
                                rounded-circle
                                bg-info
                                text-white
                              ">
                              5
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- end row -->
              </li>
              <!-- end -->
              <li class="list-group-item ps-0">
                <div class="row align-items-center g-3">
                  <div class="col-auto">
                    <div class="avatar-sm p-1 py-2 h-auto bg-light rounded-3">
                      <div class="text-center">
                        <h5 class="mb-0">20</h5>
                        <div class="text-muted">Wed</div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <h5 class="text-muted mt-0 mb-1 fs-13">
                      02:00pm - 03:45pm
                    </h5>
                    <a href="#" class="text-reset fs-14 mb-0">Adding a new event with attachments</a>
                  </div>
                  <div class="col-sm-auto">
                    <div class="avatar-group">
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Frida Bang">
                          <img src="@/assets/images/users/avatar-4.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Malou Silva">
                          <img src="@/assets/images/users/avatar-5.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Simon Schmidt">
                          <img src="@/assets/images/users/avatar-6.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Tosh Jessen">
                          <img src="@/assets/images/users/avatar-7.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);">
                          <div class="avatar-xxs">
                            <span class="
                                avatar-title
                                rounded-circle
                                bg-success
                                text-white
                              ">
                              3
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- end row -->
              </li>
              <!-- end -->
              <li class="list-group-item ps-0">
                <div class="row align-items-center g-3">
                  <div class="col-auto">
                    <div class="avatar-sm p-1 py-2 h-auto bg-light rounded-3">
                      <div class="text-center">
                        <h5 class="mb-0">17</h5>
                        <div class="text-muted">Wed</div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <h5 class="text-muted mt-0 mb-1 fs-13">
                      04:30pm - 07:15pm
                    </h5>
                    <a href="#" class="text-reset fs-14 mb-0">Create new project Bundling Product</a>
                  </div>
                  <div class="col-sm-auto">
                    <div class="avatar-group">
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Nina Schmidt">
                          <img src="@/assets/images/users/avatar-8.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Stine Nielsen">
                          <img src="@/assets/images/users/avatar-1.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Jansh Brown">
                          <img src="@/assets/images/users/avatar-2.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);">
                          <div class="avatar-xxs">
                            <span class="
                                avatar-title
                                rounded-circle
                                bg-primary
                                text-white
                              ">
                              4
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- end row -->
              </li>
              <!-- end -->
              <li class="list-group-item ps-0">
                <div class="row align-items-center g-3">
                  <div class="col-auto">
                    <div class="avatar-sm p-1 py-2 h-auto bg-light rounded-3">
                      <div class="text-center">
                        <h5 class="mb-0">12</h5>
                        <div class="text-muted">Tue</div>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <h5 class="text-muted mt-0 mb-1 fs-13">
                      10:30am - 01:15pm
                    </h5>
                    <a href="#" class="text-reset fs-14 mb-0">Weekly closed sales won checking with sales team</a>
                  </div>
                  <div class="col-sm-auto">
                    <div class="avatar-group">
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Stine Nielsen">
                          <img src="@/assets/images/users/avatar-1.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Jansh Brown">
                          <img src="@/assets/images/users/avatar-5.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);" class="d-inline-block" data-bs-toggle="tooltip"
                           data-bs-placement="top" title="" data-bs-original-title="Dan Gibson">
                          <img src="@/assets/images/users/avatar-2.jpg" alt="" class="rounded-circle avatar-xxs" />
                        </a>
                      </div>
                      <div class="avatar-group-item">
                        <a href="javascript: void(0);">
                          <div class="avatar-xxs">
                            <span class="
                                avatar-title
                                rounded-circle
                                bg-warning
                                text-white
                              ">
                              9
                            </span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- end row -->
              </li>
              <!-- end -->
            </ul>
            <!-- end -->
            <div class="align-items-center mt-2 row text-center text-sm-start">
              <div class="col-sm">
                <div class="text-muted">
                  Showing<span class="fw-semibold">4</span> of
                  <span class="fw-semibold">125</span> Results
                </div>
              </div>
              <div class="col-sm-auto">
                <ul class="
                    pagination pagination-separated pagination-sm
                    justify-content-center justify-content-sm-start
                    mb-0
                  ">
                  <li class="page-item disabled">
                    <a href="#" class="page-link">←</a>
                  </li>
                  <li class="page-item">
                    <a href="#" class="page-link">1</a>
                  </li>
                  <li class="page-item active">
                    <a href="#" class="page-link">2</a>
                  </li>
                  <li class="page-item">
                    <a href="#" class="page-link">3</a>
                  </li>
                  <li class="page-item">
                    <a href="#" class="page-link">→</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
        <!-- end card -->
      </div>
      <!-- end col-->
      <div class="col-xxl-7">
        <div class="row">
          <!-- end col -->
          <div class="col-xl-12">
            <div class="card">
              <div class="
                  card-header
                  border-bottom-dashed
                  align-items-center
                  d-flex">
                <h4 class="card-title mb-0 flex-grow-1">Recent Activity</h4>
                <div class="flex-shrink-0">
                  <button type="button" class="btn btn-soft-primary btn-sm">
                    View All Activity
                  </button>
                </div>
              </div>
              <!-- end cardheader -->
              <div class="card-body p-0">
                <div data-simplebar style="max-height: 364px" class="p-3">
<!--                  <div class="acitivity-timeline acitivity-main">-->
<!--                    <div class="acitivity-item d-flex">-->
<!--                      <div class="flex-shrink-0 avatar-xs acitivity-avatar">-->
<!--                        <div class="-->
<!--                            avatar-title-->
<!--                            bg-soft-success-->
<!--                            text-success-->
<!--                            rounded-circle-->
<!--                          ">-->
<!--                          <i class="ri-shopping-cart-2-line"></i>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">Purchase by James Price</h6>-->
<!--                        <p class="text-muted mb-1">-->
<!--                          Product noise evolve smartwatch-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">02:14 PM Today</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item py-3 d-flex">-->
<!--                      <div class="flex-shrink-0 avatar-xs acitivity-avatar">-->
<!--                        <div class="-->
<!--                            avatar-title-->
<!--                            bg-soft-primary-->
<!--                            text-primary-->
<!--                            rounded-circle-->
<!--                          ">-->
<!--                          <i class="ri-stack-fill"></i>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">-->
<!--                          Added new-->
<!--                          <span class="fw-semibold">style collection</span>-->
<!--                        </h6>-->
<!--                        <p class="text-muted mb-1">By Nesta Technologies</p>-->
<!--                        <div class="-->
<!--                            d-inline-flex-->
<!--                            gap-2-->
<!--                            border border-dashed-->
<!--                            p-2-->
<!--                            mb-2-->
<!--                            w-75-->
<!--                          ">-->
<!--                          <router-link to="/ecommerce/product-details" class="bg-light rounded p-1">-->
<!--                            <img src="@/assets/images/products/img-8.png" alt="" class="img-fluid d-block" />-->
<!--                          </router-link>-->
<!--                          <router-link to="/ecommerce/product-details" class="bg-light rounded p-1">-->
<!--                            <img src="@/assets/images/products/img-2.png" alt="" class="img-fluid d-block" />-->
<!--                          </router-link>-->
<!--                          <router-link to="/ecommerce/product-details" class="bg-light rounded p-1">-->
<!--                            <img src="@/assets/images/products/img-10.png" alt="" class="img-fluid d-block" />-->
<!--                          </router-link>-->
<!--                        </div>-->
<!--                        <p class="mb-0 text-muted">-->
<!--                          <small>9:47 PM Yesterday</small>-->
<!--                        </p>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item py-3 d-flex">-->
<!--                      <div class="flex-shrink-0">-->
<!--                        <img src="@/assets/images/users/avatar-2.jpg" alt=""-->
<!--                             class="avatar-xs rounded-circle acitivity-avatar" />-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">-->
<!--                          Natasha Carey have liked the products-->
<!--                        </h6>-->
<!--                        <p class="text-muted mb-1">-->
<!--                          Allow users to like products in your WooCommerce-->
<!--                          store.-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">25 Dec, 2021</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item py-3 d-flex">-->
<!--                      <div class="flex-shrink-0">-->
<!--                        <div class="avatar-xs acitivity-avatar">-->
<!--                          <div class="avatar-title rounded-circle bg-secondary">-->
<!--                            <i class="mdi mdi-sale fs-14"></i>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">-->
<!--                          Today offers by-->
<!--                          <router-link to="/ecommerce/seller-details" class="link-secondary">Digitech Galaxy-->
<!--                          </router-link>-->
<!--                        </h6>-->
<!--                        <p class="text-muted mb-2">-->
<!--                          Offer is valid on orders of Rs.500 Or above for-->
<!--                          selected products only.-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">12 Dec, 2021</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item py-3 d-flex">-->
<!--                      <div class="flex-shrink-0">-->
<!--                        <div class="avatar-xs acitivity-avatar">-->
<!--                          <div class="-->
<!--                              avatar-title-->
<!--                              rounded-circle-->
<!--                              bg-soft-danger-->
<!--                              text-danger-->
<!--                            ">-->
<!--                            <i class="ri-bookmark-fill"></i>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">Favoried Product</h6>-->
<!--                        <p class="text-muted mb-2">-->
<!--                          Esther James have favorited product.-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">25 Nov, 2021</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item py-3 d-flex">-->
<!--                      <div class="flex-shrink-0">-->
<!--                        <div class="avatar-xs acitivity-avatar">-->
<!--                          <div class="avatar-title rounded-circle bg-secondary">-->
<!--                            <i class="mdi mdi-sale fs-14"></i>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">-->
<!--                          Flash sale starting-->
<!--                          <span class="text-primary">Tomorrow.</span>-->
<!--                        </h6>-->
<!--                        <p class="text-muted mb-0">-->
<!--                          Flash sale by-->
<!--                          <a href="javascript:void(0);" class="link-secondary fw-medium">Zoetic Fashion</a>-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">22 Oct, 2021</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item py-3 d-flex">-->
<!--                      <div class="flex-shrink-0">-->
<!--                        <div class="avatar-xs acitivity-avatar">-->
<!--                          <div class="-->
<!--                              avatar-title-->
<!--                              rounded-circle-->
<!--                              bg-soft-info-->
<!--                              text-info-->
<!--                            ">-->
<!--                            <i class="ri-line-chart-line"></i>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">Monthly sales report</h6>-->
<!--                        <p class="text-muted mb-2">-->
<!--                          <span class="text-danger">2 days left</span>-->
<!--                          notification to submit the monthly sales report.-->
<!--                          <a href="javascript:void(0);" class="link-warning text-decoration-underline">Reports-->
<!--                            Builder</a>-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">15 Oct</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <div class="acitivity-item d-flex">-->
<!--                      <div class="flex-shrink-0">-->
<!--                        <img src="@/assets/images/users/avatar-3.jpg" alt=""-->
<!--                             class="avatar-xs rounded-circle acitivity-avatar" />-->
<!--                      </div>-->
<!--                      <div class="flex-grow-1 ms-3">-->
<!--                        <h6 class="mb-1">Frank Hook Commented</h6>-->
<!--                        <p class="text-muted mb-2 fst-italic">-->
<!--                          " A product that has reviews is more likable to be-->
<!--                          sold than a product. "-->
<!--                        </p>-->
<!--                        <small class="mb-0 text-muted">26 Aug, 2021</small>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
                </div>
              </div>
              <!-- end card body -->
            </div>
            <!-- end card -->
          </div>
          <!-- end col -->
        </div>
        <!-- end row-->
      </div>
      <!-- end col-xl-7-->
    </div>
    <!-- end row-->

    <div id="completeInfoForm" class="modal fade show" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true"
         style="display: block;" v-if="completeForm === 'true'" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content ">
          <div class="modal-header">
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
                    >Time Group</label
                    >
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
                  <div class="mb-3">
                    <label for="editLanguage" class="form-label">Language</label>
                    <select class="form-select mb-2" aria-label="Language" id="editLanguage" v-model="language" required>
                      <option value="1" selected>English</option>
                      <option value="2">Spanish</option>
                    </select>
                  </div>
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
                <div class="col-lg-6">
                  <div class="mb-3">
                    <label for="agentNumber" class="form-label"
                    >Agent Number</label>
                    <input
                        type="text"
                        class="form-control"
                        id="agentNumber"
                        placeholder=""
                        v-model="agentNumber"
                    />
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                    <label for="editAgentNumber" class="form-label">License Number</label>
                    <input type="text" id="editLicenseNumber" class="form-control mb-2" placeholder="Enter Agent Number" required v-model="licenseNumber"/>
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
