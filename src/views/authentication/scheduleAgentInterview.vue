<script>
import 'v-calendar/dist/style.css';
import { DatePicker } from 'v-calendar';
import axios from "axios";
import Swal from "sweetalert2";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import moment from "moment";

// custom components

export default {
  name: "agentsInterviews",
  data() {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      postalCode: '',
      reference: '',
      language: 0,
      errors: [],
      validate: false,
      date: new Date(),
      minDate: new Date(new Date().getTime() + 86400000),
      maxDate: new Date(new Date().getTime() + 750000000),
      disabledDays: [],
      availableHours: [],
      availableMinutes: [0],
      hours: [],
      dates: [],
      timezone: [
        // 'America/Chicago',
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ],
      selectAttribute: {
        dot: true,
      },
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
    }
  },
  components: {
    // Calendar,
    DatePicker,
    flatPickr,
  },
  methods: {
    formatDate(date) {
      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var d = new Date(date),
          month = "" + monthNames[d.getMonth()],
          day = "" + d.getDate(),
          year = d.getFullYear();
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [day + " " + month, year].join(",");
    },
    formatDate2: function (date, format) {
      date = moment(date).format(format)
      return date;
    },
    async nextButton() {

      this.errors = []

      if (!this.email) {
        this.errors.push('Email is required.');
      } else if (!this.validEmail(this.email)) {
        this.errors.push('Valid email is required.');
      }

      if (!this.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.language && this.language !== 0) {
        this.errors.push('Language is required.');
      }

      if (!this.phoneNumber) {
        this.errors.push('Phone is required.');
      }

      if (this.validPhone(this.phoneNumber) === false && this.phoneNumber !== '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.postalCode) {
        this.errors.push('Postal Code is required.');
      }

      if (!this.reference) {
        this.errors.push('How did you hear about us? is required.');
      }

      if (!this.errors.length) {
        await this.getCalendarInfo()
      } else {
        let list = '';
        for (let i = 0; i < this.errors.length; i++)
          list += '\n' + '<b>' + this.errors[i] + '</b>';

        await Swal.fire({
          title: "Please, complete your personal info! " + list,
          icon: 'warning',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }

    },
    async getCalendarInfo() {

      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      let department = urlParams.get('department');
      let language = this.language;

      if(department === 'undefined' || department === null) {
        department = 1
      }

      if (language === '0') {
        await Swal.fire("Oops!", "Please, select a language.", "error")
      } else {
        const data = {
          department: department,
          language: language
        }

        await axios
            .post('/api/getCalendar', data)
            .then(response => {

              let dates = JSON.parse(response.data[0].dates);
              let daysNumbers = [0, 1, 2, 3, 4, 5, 6];
              let calendarDays = [1, 2, 3, 4, 5, 6, 7];
              let daysNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              let availableDays = []
              this.dates = dates;

              dates.forEach(function (element, i){
                let day = '';
                day = Object.keys(dates[i]);
                day = day[0];

                let result = '';
                result = daysNames.indexOf(day);
                result = daysNumbers[result];
                availableDays.push(parseInt(result)+1)
              }
            );

              let arr = calendarDays.filter(val => !availableDays.includes(val));
              this.disabledDays = arr;
            })
            .catch(error => {
              if (error.response) {

                if(error.response.data.detail === 'Your session is expired!'){
                  this.$router.push('logout')
                }

                Swal.fire("Oops!", "We couldn't retrive calendar info, sorry.", "error")
              }
            })
      }
    },
    getHours(){
      let date = this.date;
      let day = parseInt(date.getDay())
      let dates = this.dates;
      // let daysNumbers = [0, 1, 2, 3, 4, 5, 6];
      let daysNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      let daySelected = daysNames[parseInt(day)];
      let arrOfNum = []

      dates.forEach(function (element, i){
        let day = '';
        day = Object.keys(dates[i]);
        day = day[0];

        if(daySelected === day) {
          if (dates[i][day][0].includes(',')) {
            daySelected = dates[i][day][0].split(",")
            arrOfNum = daySelected.map(str => {
              console.log('1')
              console.log(Number(str))
              return Number(str);
            });
          } else {
            daySelected = [dates[i][day][0]]

            arrOfNum = daySelected.map(str => {
              console.log('2')
              console.log(daySelected)
              return Number(str);
            });
          }

        }
      })

      this.availableHours = arrOfNum;
    },
    async saveInterview() {

      this.errors = []

      if (!this.email) {
        this.errors.push('Email is required.');
      } else if (!this.validEmail(this.email)) {
        this.errors.push('Valid email is required.');
      }

      if (!this.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.language) {
        this.errors.push('Language is required.');
      }

      if (!this.phoneNumber) {
        this.errors.push('Phone is required.');
      }

      if(this.validPhone(this.phoneNumber) === false && this.phoneNumber !== ''){
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.postalCode) {
        this.errors.push('Postal Code is required.');
      }

      if (!this.reference) {
        this.errors.push('How did you hear about us? is required.');
      }

      if(this.availableHours.length === 0) {
        await Swal.fire({
          title: "Sorry, This department doesn't have available days for interviews.<br> Please, contact your recruiter.",
          icon: 'danger',
          confirmButtonClass: "btn btn-danger",
          buttonsStyling: false,
          showCloseButton: false,
        });
      }

      if(!this.errors.length && this.availableHours.length !== 0) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let department = urlParams.get('department')

        if(department === 'undefined' || department === null) {
          department = 1;
        }

        console.log(this.date);

        const data = {
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          language: this.language,
          phoneNumber: this.phoneNumber,
          postalCode: this.postalCode,
          didYourHear: this.reference,
          date: this.formatDate2(this.date, 'YYYY-MM-DDTHH:mm:SS.SSSZ'),
          department: department,
        }

        await axios
            .post('/api/saveAgentInterview', data)
            .then(async response => {

              if (response.status === 200) {

                await Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Your appoinment has been scheduled!",
                  showConfirmButton: false,
                  timer: 3000,
                });
                location.href = "/savedInterview"
              } else {
                await Swal.fire({
                  position: "bottom-end",
                  icon: 'error',
                  title: "Something wrong happens!",
                  showConfirmButton: false,
                  timer: 5000,
                });
              }

            }).catch(async error => {
              if (error.response) {

                if(error.response.data.detail === 'Your session is expired!'){
                  await this.$router.push('logout')
                }

                let list = '';
                for (const property in error.response.data) {
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                  list += '\n' + '<b>' + error.response.data[property] + '</b>';
                }

                await Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Please check the following: " + list,
                  showConfirmButton: false,
                  timer: 5000,
                });

              } else if (error.message) {
                this.errors.push('Something was wrong, please contact your SysAdmin.')
              }
            })
      } else {
        let list = '';
        for (let i = 0; i < this.errors.length; i++)
          list += '\n' + '<b>' + this.errors[i]+ '</b>';

        await Swal.fire({
          title: "Please, complete your personal info! " + list,
          icon: 'warning',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }

    },
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    validPhone: function (phone) {
      if(phone !== undefined && phone !== null){
        return /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
      }else{
        return false;
      }
    },
    printValue: function(){
      console.log(this.date)
      console.log(this.formatDate2(this.date, 'YYYY-MM-DDTHH:mm:SS.SSSZ'))
    },
  },
  mounted() {
    document.querySelectorAll(".checkout-tab").forEach(function (form) {
      // next tab
      form.querySelectorAll(".nexttab").forEach(function (nextButton) {
        var tabEl = form.querySelectorAll('button[data-bs-toggle="pill"]');
        tabEl.forEach(function (item) {
          item.addEventListener("show.bs.tab", function (event) {
            event.target.classList.add("done");
          });
        });
        nextButton.addEventListener("click", function () {
          var nextTab = nextButton.getAttribute("data-nexttab");
          document.getElementById(nextTab).click();
        });
      });

      //Pervies tab
      form.querySelectorAll(".previestab").forEach(function (prevButton) {
        prevButton.addEventListener("click", function () {
          var prevTab = prevButton.getAttribute("data-previous");
          var totalDone = prevButton
              .closest("form")
              .querySelectorAll(".custom-nav .done").length;
          for (var i = totalDone - 1; i < totalDone; i++) {
            prevButton.closest("form").querySelectorAll(".custom-nav .done")[i]
                ? prevButton
                    .closest("form")
                    .querySelectorAll(".custom-nav .done")[i].classList.remove("done")
                : "";
          }
          document.getElementById(prevTab).click();
        });
      });

      // Step number click
      var tabButtons = form.querySelectorAll('button[data-bs-toggle="pill"]');
      tabButtons.forEach(function (button, i) {
        button.setAttribute("data-position", i);
        button.addEventListener("click", function () {
          form.querySelectorAll(".custom-nav .done").length > 0
              ? form
                  .querySelectorAll(".custom-nav .done")
                  .forEach(function (doneTab) {
                    doneTab.classList.remove("done");
                  })
              : "";
          for (var j = 0; j <= i; j++) {
            tabButtons[j].classList.contains("active")
                ? tabButtons[j].classList.remove("done")
                : tabButtons[j].classList.add("done");
          }
        });
      });
    });
  },
}
</script>
<style>
.btnPrev{
  float: left;
  margin-top: 10px;
}

.btnNext{
  float: right;
  margin-top: 10px;
}

.btnSave{
  float: right;
  margin-top: 10px;
}
</style>
<template>
  <!-- auth-page wrapper -->
  <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
    <div class="bg-overlay"></div>
    <!-- auth-page content -->
    <div class="auth-page-content overflow-hidden pt-lg-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="card overflow-hidden m-0">
              <div class="row justify-content-center g-0">
                <div class="col-lg-4">
                  <div class="p-lg-5 p-4 auth-one-bg h-100">
                    <div class="bg-overlay"></div>
                    <div class="position-relative h-100 d-flex flex-column">
                      <div class="mb-4">
                          <img src="@/assets/images/logo-light.png" alt="" height="100" style="  margin-left: auto;margin-right: auto;display: block;">
                      </div>
                      <div class="mt-auto">
                        <div class="mb-3">
                          <i class="ri-double-quotes-l display-4 text-success"></i>
                        </div>

                        <div id="qoutescarouselIndicators" class="carousel slide" data-bs-ride="carousel">
                          <div class="carousel-indicators">
                            <button type="button" data-bs-target="#qoutescarouselIndicators" data-bs-slide-to="0"
                                    class="active"
                                    aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#qoutescarouselIndicators" data-bs-slide-to="1"
                                    aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#qoutescarouselIndicators" data-bs-slide-to="2"
                                    aria-label="Slide 3"></button>
                          </div>
                          <div class="carousel-inner text-center text-white-50 pb-5">
                            <div class="carousel-item active">
                              <p class="fs-15 fst-italic">" START YOUR CAREER AS A LIFE INSURANCE AGENT WITH DMB
                                INSURANCE AGENCY "</p>
                            </div>
                            <div class="carousel-item">
                              <p class="fs-15 fst-italic">" Learn from Industry Experts. Life Insurance Agent Training
                                Center. "</p>
                            </div>
                            <div class="carousel-item">
                              <p class="fs-15 fst-italic">" We teach Life Insurance Agents the fundamentals of the life
                                insurance business. "</p>
                            </div>
                          </div>
                        </div>
                        <!-- end carousel -->

                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-xl-8">
                  <div class="card">
                    <div class="card-body checkout-tab">
                      <form action="#">
                        <div class="step-arrow-nav mt-n3 mx-n3 mb-3">
                          <ul class="nav nav-pills nav-justified custom-nav" role="tablist">
                            <li class="nav-item" role="presentation">
                              <button
                                  class="nav-link fs-15 p-3 active "
                                  id="pills-bill-info-tab"
                                  data-bs-toggle="pill"
                                  data-bs-target="#pills-bill-info"
                                  type="button"
                                  role="tab"
                                  aria-controls="pills-bill-info"
                                  aria-selected="true"
                              >
                                <i
                                    class="
                          ri-user-2-line
                          fs-16
                          p-2
                          bg-soft-primary
                          text-primary
                          rounded-circle
                          align-middle
                          me-2"></i>
                                Personal Info
                              </button>
                            </li>
                            <li class="nav-item" role="presentation">
                              <button
                                  class="nav-link fs-15 p-3" v-bind:class="(this.language === 0) ? 'disabled' : ''"
                                  id="pills-bill-address-tab"
                                  data-bs-toggle="pill"
                                  data-bs-target="#pills-bill-address"
                                  type="button"
                                  role="tab"
                                  aria-controls="pills-bill-address"
                                  aria-selected="false"
                                  @click="getCalendarInfo"
                              >
                                <i
                                    class="
                           ri-global-line
                          fs-16
                          p-2
                          bg-soft-primary
                          text-primary
                          rounded-circle
                          align-middle
                          me-2"
                                ></i>
                                Online Interview
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div class="tab-content">
                          <div
                              class="tab-pane fade show active"
                              id="pills-bill-info"
                              role="tabpanel"
                              aria-labelledby="pills-bill-info-tab"
                          >
                            <div>
                              <h5 class="mb-1">FORMULARY</h5>
                              <p class="text-muted mb-4">
                                Please fill all information below
                              </p>
                              <h5 class="text-primary">Schedule Interview</h5>
                            </div>

                            <div>
                              <div class="row">
                                <div class="col-md-6">
                                  <div>
                                    <label for="basiInput" class="form-label">First Name</label>
                                    <input type="text" class="form-control" id="firstName" autocomplete="off" v-model="firstName" tabindex="1">
                                  </div>
                                  <br>
                                  <div>
                                    <label for="iconrightInput" class="form-label">Email</label>
                                    <div class="form-icon right">
                                      <input type="email" class="form-control form-control-icon" id="email"
                                             placeholder="example@gmail.com" autocomplete="off"  v-model="email"  tabindex="3">
                                      <i class="ri-mail-unread-line"></i>
                                    </div>
                                  </div>
                                  <br>
                                  <div>
                                    <label for="basiInput" class="form-label">Postal Code</label>
                                    <input type="text" class="form-control" id="postalCode" autocomplete="off" v-model="postalCode" tabindex="5">
                                  </div>
                                  <br>
                                  <div>
                                    <label for="language" class="form-label">Language</label>
                                    <select class="form-select mb-3" aria-label="Language" id="language" v-model="language" tabindex="7">
                                      <option value="0" selected>...</option>
                                      <option value="1">English</option>
                                      <option value="2">Spanish</option>
                                    </select>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <div>
                                    <label for="basiInput" class="form-label">Last Name</label>
                                    <input type="text" class="form-control" id="lastName" autocomplete="off"  v-model="lastName"  tabindex="2">
                                  </div>
                                  <br>
                                  <div>
                                    <label for="phoneNumber" class="form-label">Phone Number</label>
                                    <div class="form-icon right">
                                      <input type="text" class="form-control form-control-icon" id="phoneNumber" autocomplete="off" v-model="phoneNumber"  tabindex="4">
                                      <i class="ri-phone-line"></i>
                                    </div>

                                  </div>
                                  <br>
                                  <div>
                                    <label for="editBirthdate" class="form-label"> Birthdate </label>
                                    <flat-pickr
                                        :config="timeConfig"
                                        class="form-control flatpickr-input"
                                        id="birthdate"
                                        name="birthdate"
                                        tabindex="6"
                                    ></flat-pickr>
                                  </div>
                                  <br>
                                  <div>
                                    <label for="formtextInput" class="form-label">How did you hear about us?</label>
                                    <input type="text" class="form-control" id="hearAbout" autocomplete="off" v-model="reference" tabindex="8">
                                    <div id="passwordHelpBlock" class="form-text">
                                      Must be 5-255 characters long.
                                    </div>
                                  </div>

                                </div>
                              </div>

                              <div class="d-flex align-items-start gap-3 mt-3">
                                <button
                                    type="button"
                                    class="btn btn-primary btn-label right ms-auto nexttab"
                                    data-nexttab="pills-bill-address-tab"
                                    @click="nextButton">
                                  <i class="
                                      ri-arrow-right-circle-line
                                      label-icon
                                      align-middle
                                      fs-16
                                      ms-2"></i
                                  >Next
                                </button>
                              </div>
                            </div>
                          </div>
                          <!-- end tab pane -->

                          <div
                              class="tab-pane fade"
                              id="pills-bill-address"
                              role="tabpanel"
                              aria-labelledby="pills-bill-address-tab"
                          >
                            <div>
                              <h5 class="mb-1">CALENDAR</h5>
                              <p class="text-muted mb-4">
                                Please select your interview date and hour below
                              </p>
                            </div>

                            <DatePicker v-model="date" mode="dateTime" :timezone="timezone"
                                        :valid-hours="availableHours" :select-attribute="selectAttribute"
                                        :disabled-dates='{weekdays: disabledDays}' :max-date="maxDate" :min-date="minDate"
                                        style="display: block;margin-left: auto;margin-right: auto;" :minute-increment="60" @click="getHours"
                                        @change="printValue"/>
                            <div style="text-align: center;">

                              <br>
                              <p style="color: mediumblue;">Change between AM and Pm to search more hours.</p>
                              <p style="color: mediumblue;">Cambia entre AM y PM para encontrar más horas.</p>
                            </div>

                            <div class="d-flex align-items-start gap-3 mt-4">
                              <button
                                  type="button"
                                  class="btn btn-light btn-label previestab"
                                  data-previous="pills-bill-info-tab"
                              >
                                <i
                                    class="
                          ri-arrow-left-line
                          label-icon
                          align-middle
                          fs-16
                          me-2
                        "
                                ></i
                                >Back to Personal Info
                              </button>
                              <button
                                  type="button"
                                  class="btn btn-primary btn-label right ms-auto nexttab"
                                  data-nexttab="pills-payment-tab"
                                  @click="saveInterview()"
                              >
                                <i
                                    class="
                          ri-save-2-line
                          label-icon
                          align-middle
                          fs-16
                          ms-2
                          disabled
                        "
                                ></i
                                >Scheduled
                              </button>
                            </div>
                          </div>
                          <!-- end tab pane -->
                        </div>
                        <!-- end tab content -->
                      </form>
                    </div>
                    <!-- end card body -->
                  </div>
                  <!-- end card -->
                </div>
              </div>
            </div>
            <!-- end card -->
          </div>
          <!-- end col -->
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </div>
    <!-- end auth page content -->
  </div>
  <!-- end auth-page-wrapper -->
</template>