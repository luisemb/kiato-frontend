<script>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.scss";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

import Layout from "../../layouts/main.vue";
import appConfig from "../../../app.config";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment/moment";

export default {
  page: {
    title: "Setting",
    meta: [{ name: "description", content: appConfig.description }],
  },
  data() {
    return {
      title: "Profile",
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
      password: '',
      confirmPasword: '',
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
      file: '',
      profile: localStorage.getItem('profile')
    };
  },
  components: {
    Layout,
    Multiselect,
    flatPickr,
  },
  methods:{
    formatDate: function (date, format) {
      date = moment(date).format(format);
      return date;
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
          isLicensed: this.value1,
          licenseNumber: this.licenseNumber,
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
    async updateUserPassword(){

      this.errors = []
      if (!this.password) {
        this.errors.push('New password is required.');
      }

      if (!this.confirmPasword) {
        this.errors.push('Confirm Password is required.');
      }

      if((this.password !== this.confirmPasword) && (this.password.length <= 0 && this.confirmPasword.length <= 0) ){
        this.errors.push('Passwords don\'t match.');
      }

      if (!this.errors.length) {
        const data = {
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          password: this.password,
          confirmPassword: this.confirmPasword,
        }

        await axios
            .put('/api/updateUserPassword', data)
            .then(async response => {
              if (response.status === 200) {
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Password updated!'
                });
              }
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
    async handleFileUpload( event ){
      this.file = event.target.files[0];
      await this.submitFile();
    },
    /*
      Submits the file to the server
    */
    async submitFile(){
      /*
        Initialize the form data
      */
      let formData = new FormData();

      /*
        Add the form data we need to submit
      */
      formData.append('file', this.file);
      formData.append('userID', localStorage.getItem('id'));
      formData.append('email', localStorage.getItem('email'));

      /*
        Make the request to the POST /single-file URL
      */
      axios.post( '/api/comm/uploadProfilePict',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
      ).then(function(){
        location.reload();
      })
      .catch(function(){
        console.log('FAILURE!!');
      });
    },
    showPassword: function() {
      var x = document.getElementById("newpasswordInput");
      var y = document.getElementById("confirmpasswordInput");
      if (x.type === "password") {
        x.type = "text";
        y.type = "text";
      } else {
        x.type = "password";
        y.type = "password";
      }
    },
  },
  async mounted() {

    const data = {
      token: localStorage.getItem('jwt'),
      ID: localStorage.getItem('id')
    }

    await axios
        .post('/api/getUser', data)
        .then(response => {
          this.firstnameInput =response.data.firstName;
          this.lastnameInput=response.data.lastName;
          this.phonenumberInput= response.data.phoneNumber;
          this.dateOfBirth=(response.data.dateOfBirth.length > 8 ? this.formatDate(response.data.dateOfBirth, 'DD MMM, YYYY') : response.data.dateOfBirth);
          this.Address=response.data.address;
          this.timeGroup=response.data.timeGroup;
          this.language=response.data.language;
          this.state=response.data.state;
          this.cityInput=response.data.city;
          this.postalCode=response.data.postalCode;
          this.agentNumber=response.data.agentNumber;
          this.licenseNumber=response.data.licenseNumber;
          this.value1=response.data.isLicensed;
          localStorage.setItem('profile', response.data.profileIMG)
          this.profile = response.data.profileIMG;
        })
        .catch(error => {
          if (error.response) {

            if(error.response.data.detail === 'Your session is expired!'){
              this.$router.push('logout')
            }

            Swal.fire("Oops!", "Something was wrong, please contact your SysAdmin.", "error")
          }
        })
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
    <div class="position-relative mx-n4 mt-n4">
      <div class="profile-wid-bg profile-setting-img" style="">
        <img
            src="@/assets/images/agency-cover.jpg"
            class="profile-wid-img"
            alt=""
        />
        <div class="overlay-content">
          <div class="text-end p-3">
            <div class="p-0 ms-auto rounded-circle profile-photo-edit">
              <input
                  id="profile-foreground-img-file-input"
                  type="file"
                  class="profile-foreground-img-file-input"
              />
              <label
                  for="profile-foreground-img-file-input"
                  class="profile-photo-edit btn btn-light"
              >
                <i class="ri-image-edit-line align-bottom me-1"></i> Change
                Cover
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-xxl-3">
        <div class="card mt-n5">
          <div class="card-body p-4">
            <div class="text-center">
              <div
                  class="
                  profile-user
                  position-relative
                  d-inline-block
                  mx-auto
                  mb-4
                "
              >
                <img
                    v-bind:src="profile"
                    class="
                    rounded-circle
                    avatar-xl
                    img-thumbnail
                    user-profile-image
                  "
                    alt="user-profile-image"
                />
                <div class="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <input id="profile-img-file-input" type="file" class="profile-img-file-input" accept="image/png, image/jpeg, image/png" @change="handleFileUpload( $event )"/>
                  <label
                      for="profile-img-file-input"
                      class="profile-photo-edit avatar-xs"
                  >
                    <span
                        class="avatar-title rounded-circle bg-light text-body"
                    >
                      <i class="ri-camera-fill"></i>
                    </span>
                  </label>
                </div>
              </div>
              <h5 class="fs-16 mb-1">{{ userFullName }}</h5>
<!--              <p class="text-muted mb-0">Lead Designer / Developer</p>-->
            </div>
          </div>
        </div>
        <!--end card-->
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-5">
              <div class="flex-grow-1">
                <h5 class="card-title mb-0">Complete Your Profile</h5>
              </div>
            </div>
            <div
                class="progress animated-progess custom-progress progress-label"
            >
              <div
                  class="progress-bar bg-primary"
                  role="progressbar"
                  style="width: 30%"
                  aria-valuenow="30"
                  aria-valuemin="0"
                  aria-valuemax="100"
              >
                <div class="label">30%</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-4">
              <div class="flex-grow-1">
                <h5 class="card-title mb-0">Social Networks</h5>
              </div>
            </div>
            <div class="mb-3 d-flex">
              <div class="avatar-xs d-block flex-shrink-0 me-3">
                <span
                    class="avatar-title rounded-circle fs-16 bg-soft-dark text-dark"
                >
                  <i class="ri-github-fill"></i>
                </span>
              </div>
              <input
                  type="email"
                  class="form-control"
                  id="gitUsername"
                  placeholder="Username"
              />
            </div>
            <div class="mb-3 d-flex">
              <div class="avatar-xs d-block flex-shrink-0 me-3">
                <span class="avatar-title rounded-circle fs-16 bg-soft-primary text-primary">
                  <i class="ri-global-fill"></i>
                </span>
              </div>
              <input
                  type="text"
                  class="form-control"
                  id="websiteInput"
                  placeholder="www.example.com"
              />
            </div>
            <div class="mb-3 d-flex">
              <div class="avatar-xs d-block flex-shrink-0 me-3">
                <span class="avatar-title rounded-circle fs-16 bg-soft-success text-success">
                  <i class="ri-dribbble-fill"></i>
                </span>
              </div>
              <input
                  type="text"
                  class="form-control"
                  id="dribbleName"
                  placeholder="Username"
              />
            </div>
            <div class="d-flex">
              <div class="avatar-xs d-block flex-shrink-0 me-3">
                <span class="avatar-title rounded-circle fs-16 bg-soft-danger text-danger">
                  <i class="ri-pinterest-fill"></i>
                </span>
              </div>
              <input
                  type="text"
                  class="form-control"
                  id="pinterestName"
                  placeholder="Username"
              />
            </div>
          </div>
        </div>
        <!--end card-->
      </div>
      <!--end col-->
      <div class="col-xxl-9">
        <div class="card mt-xxl-n5">
          <div class="card-header">
            <ul
                class="
                nav nav-tabs-custom
                rounded
                card-header-tabs
                border-bottom-0
              "
                role="tablist"
            >
              <li class="nav-item">
                <a
                    class="nav-link active"
                    data-bs-toggle="tab"
                    href="#personalDetails"
                    role="tab"
                >
                  <i class="fas fa-home"></i>
                  Personal Details
                </a>
              </li>
              <li class="nav-item">
                <a
                    class="nav-link"
                    data-bs-toggle="tab"
                    href="#changePassword"
                    role="tab"
                >
                  <i class="far fa-user"></i>
                  Change Password
                </a>
              </li>
              <li class="nav-item">
                <a
                    class="nav-link disabled"
                    data-bs-toggle="tab"
                    href="#experience"
                    role="tab"
                >
                  <i class="far fa-envelope"></i>
                  Experience
                </a>
              </li>
              <li class="nav-item">
                <a
                    class="nav-link disabled"
                    data-bs-toggle="tab"
                    href="#privacy"
                    role="tab"
                >
                  <i class="far fa-envelope"></i>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div class="card-body p-4">
            <div class="tab-content">
              <div class="tab-pane active" id="personalDetails" role="tabpanel">
                <form action="javascript:void(0);">
                  <div class="row"  >
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
                    <div class="col-lg-12">
                      <div class="hstack gap-2 justify-content-end">
                        <button type="submit" class="btn btn-primary" @click="updateProfile">
                          Update
                        </button>
                        <button type="button" class="btn btn-soft-secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                    <!--end col-->
                  </div>
                  <!--end row-->
                </form>
              </div>
              <!--end tab-pane-->
              <div class="tab-pane" id="changePassword" role="tabpanel">
                <form action="javascript:void(0);">
                  <div class="row g-2">
                    <!--end col-->
                    <div class="col-lg-4">
                      <div>
                        <label for="newpasswordInput" class="form-label"
                        >New Password*</label
                        >
                        <div class="position-relative auth-pass-inputgroup mb-3">
                          <input v-model="password"
                                 type="password"
                                 class="form-control pe-5 password-input"
                                 placeholder="Enter new password"
                                 id="newpasswordInput"
                                 autocomplete="off">
                          <button class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon" @click="showPassword()"><i class="ri-eye-fill align-middle"></i></button>
                        </div>
                      </div>
                    </div>
                    <!--end col-->
                    <div class="col-lg-4">
                      <div>
                        <label for="confirmpasswordInput" class="form-label"
                        >Confirm Password*</label
                        >
                        <div class="position-relative auth-pass-inputgroup mb-3">
                          <input v-model="confirmPasword"
                                 type="password"
                                 class="form-control pe-5 password-input"
                                 placeholder="Confirm password"
                                 id="confirmpasswordInput"
                                 autocomplete="off">
                          <button class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon" @click="showPassword()"><i class="ri-eye-fill align-middle"></i></button>
                        </div>
                      </div>
                    </div>
                    <!--end col-->
                    <div class="col-lg-12">
                      <div class="mb-3">
                        <a
                            href="javascript:void(0);"
                            class="link-primary text-decoration-underline"
                        >Forgot Password ?</a
                        >
                      </div>
                    </div>
                    <!--end col-->
                    <div class="col-lg-12">
                      <div class="text-end">
                        <button type="submit" class="btn btn-primary" @click="updateUserPassword">
                          Change Password
                        </button>
                      </div>
                    </div>
                    <!--end col-->
                  </div>
                  <!--end row-->
                </form>
                <div class="mt-4 mb-3 border-bottom pb-2">
                  <div class="float-end">
                    <a href="javascript:void(0);" class="link-secondary"
                    >All Logout</a
                    >
                  </div>
                  <h5 class="card-title">Login History</h5>
                </div>
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-shrink-0 avatar-sm">
                    <div
                        class="avatar-title bg-light text-primary rounded-3 fs-18"
                    >
                      <i class="ri-smartphone-line"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6>iPhone 12 Pro</h6>
                    <p class="text-muted mb-0">
                      Los Angeles, United States - March 16 at 2:47PM
                    </p>
                  </div>
                  <div>
                    <a href="javascript:void(0);" class="link-secondary">Logout</a>
                  </div>
                </div>
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-shrink-0 avatar-sm">
                    <div
                        class="avatar-title bg-light text-primary rounded-3 fs-18"
                    >
                      <i class="ri-tablet-line"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6>Apple iPad Pro</h6>
                    <p class="text-muted mb-0">
                      Washington, United States - November 06 at 10:43AM
                    </p>
                  </div>
                  <div>
                    <a href="javascript:void(0);">Logout</a>
                  </div>
                </div>
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-shrink-0 avatar-sm">
                    <div
                        class="avatar-title bg-light text-primary rounded-3 fs-18"
                    >
                      <i class="ri-smartphone-line"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6>Galaxy S21 Ultra 5G</h6>
                    <p class="text-muted mb-0">
                      Conneticut, United States - June 12 at 3:24PM
                    </p>
                  </div>
                  <div>
                    <a href="javascript:void(0);" class="link-secondary">Logout</a>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  <div class="flex-shrink-0 avatar-sm">
                    <div
                        class="avatar-title bg-light text-primary rounded-3 fs-18"
                    >
                      <i class="ri-macbook-line"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6>Dell Inspiron 14</h6>
                    <p class="text-muted mb-0">
                      Phoenix, United States - July 26 at 8:10AM
                    </p>
                  </div>
                  <div>
                    <a href="javascript:void(0);">Logout</a>
                  </div>
                </div>
              </div>
              <!--end tab-pane-->
              <div class="tab-pane" id="experience" role="tabpanel">
                <form>
                  <div id="newlink">
                    <div id="1">
                      <div class="row">
                        <div class="col-lg-12">
                          <div class="mb-3">
                            <label for="jobTitle" class="form-label"
                            >Job Title</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                id="jobTitle"
                                placeholder="Job title"
                                value="Lead Designer / Developer"
                            />
                          </div>
                        </div>
                        <!--end col-->
                        <div class="col-lg-6">
                          <div class="mb-3">
                            <label for="companyName" class="form-label"
                            >Company Name</label
                            >
                            <input
                                type="text"
                                class="form-control"
                                id="companyName"
                                placeholder="Company name"
                                value="Themesbrand"
                            />
                          </div>
                        </div>
                        <!--end col-->
                        <div class="col-lg-6">
                          <div class="mb-3">
                            <label for="experienceYear" class="form-label"
                            >Experience Years</label
                            >
                            <div class="row">
                              <div class="col-lg-5">
                                <Multiselect
                                    class="form-control"
                                    v-model="value2"
                                    :close-on-select="true"
                                    :searchable="true"
                                    :create-option="true"
                                    :options="[
                                    { value: '', label: 'Select years' },
                                    { value: 'Choice 1', label: '2001' },
                                    { value: 'Choice 2', label: '2002' },
                                    { value: 'Choice 3', label: '2003' },
                                    { value: 'Choice 4', label: '2004' },
                                    { value: 'Choice 5', label: '2005' },
                                    { value: 'Choice 6', label: '2006' },
                                    { value: 'Choice 7', label: '2007' },
                                    { value: 'Choice 8', label: '2008' },
                                    { value: 'Choice 9', label: '2009' },
                                    { value: 'Choice 10', label: '2010' },
                                    { value: 'Choice 11', label: '2011' },
                                    { value: 'Choice 12', label: '2012' },
                                    { value: 'Choice 13', label: '2013' },
                                    { value: 'Choice 14', label: '2014' },
                                    { value: 'Choice 15', label: '2015' },
                                    { value: 'Choice 16', label: '2016' },
                                    { value: 'Choice 17', label: '2017' },
                                    { value: 'Choice 18', label: '2018' },
                                    { value: 'Choice 19', label: '2019' },
                                    { value: 'Choice 20', label: '2020' },
                                    { value: 'Choice 21', label: '2021' },
                                    { value: 'Choice 22', label: '2022' },
                                  ]"
                                />
                              </div>
                              <!--end col-->
                              <div class="col-auto align-self-center">to</div>
                              <!--end col-->
                              <div class="col-lg-5">
                                <Multiselect
                                    class="form-control"
                                    v-model="value1"
                                    :close-on-select="true"
                                    :searchable="true"
                                    :create-option="true"
                                    :options="[
                                    { value: '', label: 'Select years' },
                                    { value: 'Choice 1', label: '2001' },
                                    { value: 'Choice 2', label: '2002' },
                                    { value: 'Choice 3', label: '2003' },
                                    { value: 'Choice 4', label: '2004' },
                                    { value: 'Choice 5', label: '2005' },
                                    { value: 'Choice 6', label: '2006' },
                                    { value: 'Choice 7', label: '2007' },
                                    { value: 'Choice 8', label: '2008' },
                                    { value: 'Choice 9', label: '2009' },
                                    { value: 'Choice 10', label: '2010' },
                                    { value: 'Choice 11', label: '2011' },
                                    { value: 'Choice 12', label: '2012' },
                                    { value: 'Choice 13', label: '2013' },
                                    { value: 'Choice 14', label: '2014' },
                                    { value: 'Choice 15', label: '2015' },
                                    { value: 'Choice 16', label: '2016' },
                                    { value: 'Choice 17', label: '2017' },
                                    { value: 'Choice 18', label: '2018' },
                                    { value: 'Choice 19', label: '2019' },
                                    { value: 'Choice 20', label: '2020' },
                                    { value: 'Choice 21', label: '2021' },
                                    { value: 'Choice 22', label: '2022' },
                                  ]"
                                />
                              </div>
                              <!--end col-->
                            </div>
                            <!--end row-->
                          </div>
                        </div>
                        <!--end col-->
                        <div class="col-lg-12">
                          <div class="mb-3">
                            <label for="jobDescription" class="form-label"
                            >Job Description</label
                            >
                            <textarea
                                class="form-control"
                                id="jobDescription"
                                rows="3"
                                placeholder="Enter description"
                            >
You always want to make sure that your fonts work well together and try to limit the number of fonts you use to three or less. Experiment and play around with the fonts that you already have in the software you're working with reputable font websites. </textarea
                            >
                          </div>
                        </div>
                        <!--end col-->
                        <div class="hstack gap-2 justify-content-end">
                          <a
                              class="btn btn-success"
                              href="javascript:deleteEl(1)"
                          >Delete</a
                          >
                        </div>
                      </div>
                      <!--end row-->
                    </div>
                  </div>
                  <div id="newForm" style="display: none"></div>
                  <div class="col-lg-12">
                    <div class="hstack gap-2">
                      <button type="submit" class="btn btn-success">
                        Update
                      </button>
                      <a href="javascript:new_link()" class="btn btn-primary"
                      >Add New</a
                      >
                    </div>
                  </div>
                  <!--end col-->
                </form>
              </div>
              <!--end tab-pane-->
              <div class="tab-pane" id="privacy" role="tabpanel">
                <div class="mb-4 pb-2">
                  <h5 class="card-title text-decoration-underline mb-3">
                    Security:
                  </h5>
                  <div class="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
                    <div class="flex-grow-1">
                      <h6 class="fs-14 mb-1">Two-factor Authentication</h6>
                      <p class="text-muted">
                        Two-factor authentication is an enhanced security
                        meansur. Once enabled, you'll be required to give two
                        types of identification when you log into Google
                        Authentication and SMS are Supported.
                      </p>
                    </div>
                    <div class="flex-shrink-0 ms-sm-3">
                      <a
                          href="javascript:void(0);"
                          class="btn btn-sm btn-primary"
                      >Enable Two-facor Authentication</a
                      >
                    </div>
                  </div>
                  <div class="d-flex flex-column flex-sm-row mb-4 mb-sm-0 mt-2">
                    <div class="flex-grow-1">
                      <h6 class="fs-14 mb-1">Secondary Verification</h6>
                      <p class="text-muted">
                        The first factor is a password and the second commonly
                        includes a text with a code sent to your smartphone, or
                        biometrics using your fingerprint, face, or retina.
                      </p>
                    </div>
                    <div class="flex-shrink-0 ms-sm-3">
                      <a
                          href="javascript:void(0);"
                          class="btn btn-sm btn-primary"
                      >Set up secondary method</a
                      >
                    </div>
                  </div>
                  <div class="d-flex flex-column flex-sm-row mb-4 mb-sm-0 mt-2">
                    <div class="flex-grow-1">
                      <h6 class="fs-14 mb-1">Backup Codes</h6>
                      <p class="text-muted mb-sm-0">
                        A backup code is automatically generated for you when
                        you turn on two-factor authentication through your iOS
                        or Android Twitter app. You can also generate a backup
                        code on twitter.com.
                      </p>
                    </div>
                    <div class="flex-shrink-0 ms-sm-3">
                      <a
                          href="javascript:void(0);"
                          class="btn btn-sm btn-primary"
                      >Generate backup codes</a
                      >
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <h5 class="card-title text-decoration-underline mb-3">
                    Application Notifications:
                  </h5>
                  <ul class="list-unstyled mb-0">
                    <li class="d-flex">
                      <div class="flex-grow-1">
                        <label
                            for="directMessage"
                            class="form-check-label fs-14"
                        >Direct messages</label
                        >
                        <p class="text-muted">
                          Messages from people you follow
                        </p>
                      </div>
                      <div class="flex-shrink-0">
                        <div class="form-check form-switch">
                          <input
                              class="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="directMessage"
                              checked
                          />
                        </div>
                      </div>
                    </li>
                    <li class="d-flex mt-2">
                      <div class="flex-grow-1">
                        <label
                            class="form-check-label fs-14"
                            for="desktopNotification"
                        >
                          Show desktop notifications
                        </label>
                        <p class="text-muted">
                          Choose the option you want as your default setting.
                          Block a site: Next to "Not allowed to send
                          notifications," click Add.
                        </p>
                      </div>
                      <div class="flex-shrink-0">
                        <div class="form-check form-switch">
                          <input
                              class="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="desktopNotification"
                              checked
                          />
                        </div>
                      </div>
                    </li>
                    <li class="d-flex mt-2">
                      <div class="flex-grow-1">
                        <label
                            class="form-check-label fs-14"
                            for="emailNotification"
                        >
                          Show email notifications
                        </label>
                        <p class="text-muted">
                          Under Settings, choose Notifications. Under Select an
                          account, choose the account to enable notifications
                          for.
                        </p>
                      </div>
                      <div class="flex-shrink-0">
                        <div class="form-check form-switch">
                          <input
                              class="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="emailNotification"
                          />
                        </div>
                      </div>
                    </li>
                    <li class="d-flex mt-2">
                      <div class="flex-grow-1">
                        <label
                            class="form-check-label fs-14"
                            for="chatNotification"
                        >
                          Show chat notifications
                        </label>
                        <p class="text-muted">
                          To prevent duplicate mobile notifications from the
                          Gmail and Chat apps, in settings, turn off Chat
                          notifications.
                        </p>
                      </div>
                      <div class="flex-shrink-0">
                        <div class="form-check form-switch">
                          <input
                              class="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="chatNotification"
                          />
                        </div>
                      </div>
                    </li>
                    <li class="d-flex mt-2">
                      <div class="flex-grow-1">
                        <label
                            class="form-check-label fs-14"
                            for="purchaesNotification"
                        >
                          Show purchase notifications
                        </label>
                        <p class="text-muted">
                          Get real-time purchase alerts to protect yourself from
                          fraudulent charges.
                        </p>
                      </div>
                      <div class="flex-shrink-0">
                        <div class="form-check form-switch">
                          <input
                              class="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="purchaesNotification"
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 class="card-title text-decoration-underline mb-3">
                    Delete This Account:
                  </h5>
                  <p class="text-muted">
                    Go to the Data & Privacy section of your profile Account.
                    Scroll to "Your data & privacy options." Delete your Profile
                    Account. Follow the instructions to delete your account :
                  </p>
                  <div>
                    <input
                        type="password"
                        class="form-control"
                        id="passwordInput"
                        placeholder="Enter your password"
                        value="make@321654987"
                        style="max-width: 265px"
                    />
                  </div>
                  <div class="hstack gap-2 mt-3">
                    <a href="javascript:void(0);" class="btn btn-soft-primary"
                    >Close & Delete This Account</a
                    >
                    <a href="javascript:void(0);" class="btn btn-light"
                    >Cancel</a
                    >
                  </div>
                </div>
              </div>
              <!--end tab-pane-->
            </div>
          </div>
        </div>
      </div>
      <!--end col-->
    </div>
    <!--end row-->
  </Layout>
</template>
