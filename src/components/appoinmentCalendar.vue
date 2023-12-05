<script>
import Swal from "sweetalert2";
import "@fullcalendar/core/vdom";
import { SimpleBar } from "simplebar-vue3";
import { CalendarIcon } from "@zhuowenli/vue-feather-icons";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";

import FullCalendar from "@fullcalendar/vue3";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

// import { INITIAL_EVENTS } from "./calendar";
import axios from "axios";
import moment from "moment/moment";
// import moment from "moment";

export default {
  setup() {
    return { v$: useVuelidate() };
  },
  validations: {
    event: {
      title: {
        required: helpers.withMessage("Title is required", required),
      },
      category: {
        required: helpers.withMessage("Category is required", required),
      },
    },
  },
  page: {
    title: "Calendar",
  },
  data() {
    return {
      title: "Calendar",
      items: [
        {
          text: "Apps",
          href: "/",
        },
        {
          text: "Calendar",
          active: true,
        },
      ],
      categories: [
        {
          name: 'Danger',
          value: 'bg-danger'
        },
        {
          name: 'Success',
          value: 'bg-success'
        },
        {
          name: 'Primary',
          value: 'bg-primary'
        },
        {
          name: 'Info',
          value: 'bg-info'
        },
        {
          name: 'Dark',
          value: 'bg-dark'
        },
        {
          name: 'Warning',
          value: 'bg-warning'
        },
      ],
      currentEvents: [],
      showModal: false,
      eventModal: false,
      submitted: false,
      submit: false,
      newEventData: {},
      edit: {},
      deleteId: {},
      errors: [],
      event: {
        id: "",
        title: "",
        description: "",
        category: "",
        start: null,
        end: null,
        location: "",
      },
      editevent: {
        editID: 0,
        editTitle: "",
        editcategory: "",
        editDescription: "",
        editStart: "",
        editEnd: "",
        editLocation: "",
      },
      description: "",
      dateTimeConfig: {
        enableTime: true,
        dateFormat: "F j, Y H:i K"
      },
      toDate:  null,
      fromDate: null,
      calendarOptions: {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        droppable: true,
        navLinks: true,
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          // interactionPlugin,
          bootstrapPlugin,
          listPlugin,
        ],
        themeSystem: "bootstrap",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        },
        windowResize: () => {
          this.getInitialView();
        },
        initialView: this.getInitialView(),
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        dateClick: this.dateClicked,
        eventClick: this.editEvent,
        eventsSet: this.handleEvents,
        eventDrop: async function (event) {
          this.submit = true;
          const editTitle = event.event.title;
          const editcategory = event.event.classNames[0];
          // console.log(editcategory)

          this.edit = event.event;
          this.edit.setProp("title", editTitle);
          this.edit.setProp("classNames", editcategory);

          var date = new Date();
          var d = date.getDate();
          var m = date.getMonth();
          var y = date.getFullYear();
          new Date(y, m, d + 24, 16, 0)

          const data = {
            token: localStorage.getItem('jwt'),
            userEmail: localStorage.getItem('email'),
            event: {
              editID: event.event.id,
              editTitle: editTitle,
              editcategory: event.event.classNames[0],
              editDescription: event.event.extendedProps.description,
              editStart: moment(event.event.startStr).format('MMMM D, YYYY h:mm A'),
              editEnd: moment(event.event.endStr).format('MMMM D, YYYY h:mm A'),
              editLocation: event.event.extendedProps.location,
            },
            edit: this.edit,
            test: new Date(y, m, d + 24, 16, 0),
            userID: localStorage.getItem('id')
          }

          // console.log(data)

          await axios
              .post('/api/updateEvent', data)
              .then(response => {

                if (response === 'True') {
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Event updated!",
                    showConfirmButton: false,
                    timer: 2000,
                  });
                  this.updateCalendarEvents()
                }
              })
              .catch(error => {
                if (error.response) {

                  if (error.response.data.detail === 'Your session is expired!') {
                    this.$router.push('logout')
                  }

                  Swal.fire("Oops!", "Calendar Events couldn't be updated, please contact your SysAdmin.", "error")
                }
              })
          await Swal.fire({
            position: "center",
            icon: "success",
            title: "Event has been updated!",
            showConfirmButton: false,
            timer: 1000,
          });
          this.eventModal = false;
        },
        eventResize: async function (event) {
          // console.log(event)
          this.submit = true;
          const editTitle = event.event.title;
          const editcategory = event.event.classNames[0];

          this.edit = event.event;
          this.edit.setProp("title", editTitle);
          this.edit.setProp("classNames", editcategory);

          var date = new Date();
          var d = date.getDate();
          var m = date.getMonth();
          var y = date.getFullYear();
          new Date(y, m, d + 24, 16, 0)

          const data = {
            token: localStorage.getItem('jwt'),
            userEmail: localStorage.getItem('email'),
            event: {
              editID: event.event.id,
              editTitle: editTitle,
              editcategory: event.event.classNames[0],
              editDescription: event.event.extendedProps.description,
              editStart: moment(event.event.startStr).format('MMMM D, YYYY h:mm A'),
              editEnd: moment(event.event.endStr).format('MMMM D, YYYY h:mm A'),
              editLocation: event.event.extendedProps.location
            },
            edit: this.edit,
            test: new Date(y, m, d + 24, 16, 0),
            userID: localStorage.getItem('id')
          }

          await axios
              .post('/api/updateEvent', data)
              .then(response => {

                if (response === 'True') {
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Event updated!",
                    showConfirmButton: false,
                    timer: 1000,
                  });
                  this.updateCalendarEvents()
                }
              })
              .catch(error => {
                if (error.response) {

                  if (error.response.data.detail === 'Your session is expired!') {
                    this.$router.push('logout')
                  }

                  Swal.fire("Oops!", "Calendar Events couldn't be updated, please contact your SysAdmin.", "error")
                }
              })
          await Swal.fire({
            position: "center",
            icon: "success",
            title: "Event has been updated!",
            showConfirmButton: false,
            timer: 1000,
          });
          this.eventModal = false;
        },
        drop: function(e){

          let start = moment(e.date).add(1, 'days').format('MMMM D, YYYY h:mm A');
          let end = moment(start).add(1, 'hours').format('MMMM D, YYYY h:mm A');
          let event = JSON.parse(localStorage.getItem('creatingEvent'))

          const editTitle = event.title;
          const editcategory = event.category;

          this.edit = event;
          this.edit["title"] = editTitle;
          this.edit["classNames"] = editcategory;

          var date = new Date();
          var d = date.getDate();
          var m = date.getMonth();
          var y = date.getFullYear();
          new Date(y, m, d + 24, 16, 0)

          const data = {
            token: localStorage.getItem('jwt'),
            userEmail: localStorage.getItem('email'),
            event: {
              editID: event.id,
              editTitle: editTitle,
              editcategory: event.category,
              editDescription: event.description,
              editStart: start,
              editEnd: end,
              editLocation: event.location,
            },
            edit: this.edit,
            test: new Date(y, m, d + 24, 16, 0),
            userID: localStorage.getItem('id')
          }

          axios
              .post('/api/updateEvent', data)
              .then(response => {

                if (response === 'True') {
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Event updated!",
                    showConfirmButton: false,
                    timer: 2000,
                  });
                }
              })
              .catch(error => {
                if (error.response) {

                  if (error.response.data.detail === 'Your session is expired!') {
                    this.$router.push('logout')
                  }

                  Swal.fire("Oops!", "Calendar Events couldn't be updated, please contact your SysAdmin.", "error")
                }
              })
          this.eventModal = false;

        },
      },
    };
  },
  components: {
    FullCalendar,
    SimpleBar,
    CalendarIcon,
    flatPickr,
  },
  methods: {

    async getData() {
      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
      }

      await axios
          .post('/api/getAgentAppointments', data)
          .then(response => {
            this.calendarOptions.events = response.data;
            console.log(response.data)
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Calendar Events couldn't be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
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
    formatDate22: function (date, format) {
      date = moment(date).format(format)
      return date;
    },
    getInitialView() {
      if (window.innerWidth >= 768 && window.innerWidth < 1200) {
        return "timeGridWeek";
      } else if (window.innerWidth <= 768) {
        return "listMonth";
      } else {
        return "dayGridMonth";
      }
    },
    /**
     * Modal form submit
     */
    // eslint-disable-next-line no-unused-vars
    async handleSubmit(e) {
      this.submitted = true;

      // stop here if form is invalid
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      } else {
        const title = this.event.title;
        const category = this.event.category;
        let calendarApi = this.$refs.fullCalendar.getApi();

        // console.log(calendarApi);

        // const data = {
        //   token: localStorage.getItem('jwt'),
        //   userEmail: localStorage.getItem('email'),
        //   userID: localStorage.getItem('id'),
        //   event: {
        //     title: eventEl.innerText,
        //     start: new Date(),
        //     className: eventEl.getAttribute("data-class"),
        //   }
        // }
        //
        // await axios
        //     .post('/api/createEvent', data)
        //     .then(response => {
        //       if (response){
        //         Swal.fire({
        //           position: "top-end",
        //           icon: "success",
        //           title: "Event created!",
        //           showConfirmButton: false,
        //           timer: 1000,
        //         });
        //         this.updateCalendarEvents()
        //       }
        //     })
        //     .catch(error => {
        //       if (error.response) {
        //
        //         if(error.response.data.detail === 'Your session is expired!'){
        //           this.$router.push('logout')
        //         }
        //
        //         Swal.fire("Oops!", "Calendar Events couldn't be saved, please contact your SysAdmin.", "error")
        //       }
        //     })

        // return {
        //   title: eventEl.innerText,
        //   start: new Date(),
        //   className: eventEl.getAttribute("data-class"),
        // };

        this.currentEvents = calendarApi.addEvent({
          id: this.newEventData.length + 1,
          title,
          start: this.toDate,
          end: this.fromDate,
          classNames: [category],
        });

        this.successmsg();
        this.showModal = false;
        this.newEventData = {};
      }
      this.submitted = false;
      this.event = {};
    },
    // eslint-disable-next-line no-unused-vars
    hideModal(e) {
      this.submitted = false;
      this.showModal = false;
      this.event = {};
    },
    /**
     * Edit event modal submit
     */  // eslint-disable-next-line no-unused-vars
    async editSubmit(e) {
      this.submit = true;
      const editTitle = this.editevent.editTitle;
      const editcategory = this.editevent.editcategory;

      this.edit.setProp("title", editTitle);
      this.edit.setProp("classNames", editcategory);

      var date = new Date();
      var d = date.getDate();
      var m = date.getMonth();
      var y = date.getFullYear();
      new Date(y, m, d + 24, 16, 0)

      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        event: this.editevent,
        edit: this.edit,
        test: new Date(y, m, d + 24, 16, 0),
        userID: localStorage.getItem('id')
      }

      await axios
          .post('/api/updateEvent', data)
          .then(response => {
            this.updateCalendarEvents()
            if(response === 'True'){
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Event updated!",
                showConfirmButton: false,
                timer: 1000,
              });
            }
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Calendar Events couldn't be updated, please contact your SysAdmin.", "error")
            }
          })
      this.successmsg();
      this.eventModal = false;
    },
    /**
     * Delete event
     */
    deleteEvent() {
      this.edit.remove();
      this.eventModal = false;
    },
    /**
     * Click any date to add event
     * Modal open for add event
     */
    dateClicked(info) {
      this.newEventData = info;
      this.showModal = true;
    },
    /**
     * Modal open for edit event
     */
    editEvent(info) {
      this.edit = info.event;
      this.editevent.editID = this.edit._def.publicId

      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        eventID: this.editevent.editID,
        userID: localStorage.getItem('id')
      }

      axios.post('/api/getEventByid', data)
          .then(response => {
            let data = response.data[0]
            this.editevent.editTitle = data.title;
            this.editevent.editDescription = data.description;
            this.editevent.editLocation = data.location;
            this.editevent.editcategory = data.className;
            this.editevent.editStart = moment(data.start).format('MMMM D, YYYY h:mm A');
            this.editevent.editEnd = moment(data.end).format('MMMM D, YYYY h:mm A');
            // console.log(this.editevent.editStart.toLocaleString('en-US', {
            //   timeZone: 'America/New_York',
            // }))
            // this.editevent.editStart = this.edit._instance.range.start;
            // this.editevent.editEnd = this.edit._instance.range.end;
            this.eventModal = true;
          })
          .catch(error => {
            if (error.response) {

              if (error.response.data.detail === 'Your session is expired!') {
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Calendar Events couldn't be updated, please contact your SysAdmin.", "error")
            }
          })
    },
    closeModal() {
      this.eventModal = false;
    },
    confirm() {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to delete this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#f46a6a",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.value) {
          this.deleteEvent();
          Swal.fire("Deleted!", "Event has been deleted.", "success");
        }
      });
    },
    async updateCalendarEvents(){
      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
      }

      await axios
          .post('/api/getAgentAppointments', data)
          .then(response => {
            this.calendarOptions.events = response.data;
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Calendar Events couldn't be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    /**
     * Show list of events
     */
    handleEvents(events) {
      this.currentEvents = events;
    },
    /**
     * Show successfull Save Dialog
     */
    successmsg() {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Event has been saved!",
        showConfirmButton: false,
        timer: 1000,
      });
    },
    sortEvents(events){
      events.sort((a, b) => {
        return new Date(a.start) - new Date(b.start); // descending
      })
    },

    createEvent(){

      this.errors = []

      if (!this.event.title) {
        this.errors.push('Event tittle is required.');
      }

      if (!this.event.description) {
        this.errors.push('Event Description is required.');
      }

      if (!this.event.description) {
        this.errors.push('Event Description is required.');
      }

      if (!document.getElementById('createCategory').value) {
        this.errors.push('Event Category is required.');
      }

      this.event.category = document.getElementById('createCategory').value

      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        event: {
          title:  this.event.title,
          start: this.event.start,
          description: this.event.description,
          end: this.event.end,
          className: this.event.category,
          createButton: 1
        }
      }

      axios.post('/api/createEvent', data).then(response => {
        if (response.status === 200){

          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Event created!",
            showConfirmButton: false,
            timer: 1000,
          });
          location.reload();
        }
      }).catch(error => {
        if (error.response) {
          if(error.response.data.detail === 'Your session is expired!'){
            this.$router.push('logout')
          }
          Swal.fire("Oops!", "Calendar Events couldn't be saved, please contact your SysAdmin.", "error")
        }
      })
    }
  },
  async mounted() {

    const data = {
      token: localStorage.getItem('jwt'),
      userEmail: localStorage.getItem('email'),
      userID: localStorage.getItem('id'),
    }

    await axios
        .post('/api/getAgentAppointments', data)
        .then(response => {
          this.calendarOptions.events = response.data;
        })
        .catch(error => {
          if (error.response) {

            if(error.response.data.detail === 'Your session is expired!'){
              this.$router.push('logout')
            }
            Swal.fire("Oops!", "Calendar Events couldn't be loaded, please contact your SysAdmin.", "error")
          }
        })
  },
};
</script>
<style>
.text-black{
  color: black;
}
</style>
<template>
  <div class="row">
    <div class="col-12">
      <div class="row">
        <div class="col-xl-3">
          <div>
            <h5 class="mb-1">{{ $t("t-upcoming-events") }}</h5>
            <p class="text-muted">Don't miss scheduled events</p>
            <SimpleBar
                class="upcoming-events pe-2 me-n1 mb-3"
                data-simplebar="init"
                style="height: 600px"
            >
              <div
                  class="card mb-3"
                  v-for="event in currentEvents"
                  :key="event.id"
              >
                <div class="card-body">
                  <div class="d-flex mb-3">
                    <div class="flex-grow-1">
                      <i
                          :class="`mdi mdi-checkbox-blank-circle me-2 ${event.classNames[0]} `"
                      ></i
                      ><span class="fw-medium">{{
                        this.formatDate(event.start)
                      }}</span>
                    </div>
                    <div class="flex-shrink-0">
                      <small class="badge badge-soft-primary ms-auto"></small>
                    </div>
                  </div>
                  <h6 class="card-title fs-16">{{ event.title }}</h6>
                  <p class="text-muted text-truncate-two-lines mb-0">
                    {{ event.description }}
                  </p>
                </div>
              </div>
            </SimpleBar>
          </div>
          <div class="card">
            <div class="card-body bg-soft-info">
              <div class="d-flex">
                <div class="flex-shrink-0">
                  <CalendarIcon
                      class="text-info icon-dual-info"
                  ></CalendarIcon>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h6 class="fs-15">Welcome to your Calendar!</h6>
                  <p class="text-muted mb-0">
                    Event that applications book will appear here. Click on an
                    event to see the details and manage applicants event.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!--end card-->
        </div>
        <div class="col-xl-9">
          <div class="card card-h-100">
            <div class="card-body">
              <FullCalendar ref="fullCalendar" :options="calendarOptions" />
            </div>
          </div>
        </div>
      </div>
      <div style="clear: both"></div>
    </div>
  </div>
  <b-modal
      v-model="showModal"
      title="Add New Event"
      title-class="text-black font-18"
      body-class="p-3"
      hide-footer>
    <form @submit.prevent="handleSubmit">
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label for="name">Title</label>
            <input
                id="name"
                v-model="event.title"
                type="text"
                class="form-control"
                placeholder="Insert Event name"
                :class="{ 'is-invalid': submitted && v$.event.title.$error }"
            />
            <div
                v-if="submitted && v$.event.title.$error"
                class="invalid-feedback">
              <span v-if="v$.event.title.required.$message">{{
                  v$.event.title.required.$message
                }}</span>
            </div>
          </div>
        </div>
        <div class="col-6">
          <label for="filterFromDate" class="form-label"> Start On </label>
          <flat-pickr
              v-model="event.start"
              :config="dateTimeConfig"
              class="form-control"
          ></flat-pickr>
        </div>
        <div class="col-6">
          <label for="filterToDate" class="form-label"> End On</label>
          <flat-pickr
              v-model="event.end"
              :config="dateTimeConfig"
              class="form-control"
          ></flat-pickr>
        </div>
        <div class="col-12" style="margin-top: 5px;">
          <label for="eventDescription" class="form-label">Description</label>
          <textarea class="form-control" id="eventDescription" rows="3" v-model="event.description"></textarea>
        </div>
        <div class="col-12" style="margin-top: 5px;">
          <div class="mb-3">
            <label class="control-label">Category</label>
            <select
                v-model="event.category"
                class="form-control"
                name="category"
                id="createCategory"
            >
              <option
                  v-for="option in categories"
                  :key="option.backgroundColor"
                  :value="`${option.value}`"
              >
                {{ option.name }}
              </option>
            </select>
            <div
                v-if="submitted && v$.event.category.$error"
                class="invalid-feedback"
            >
              <span v-if="v$.event.category.required.$message">{{
                  v$.event.category.required.$message
                }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="text-end pt-5 mt-3">
        <b-button variant="light" @click="hideModal">Close</b-button>
        <b-button type="submit" variant="success" class="ms-1" @click="createEvent">Create event</b-button>
      </div>
    </form>
  </b-modal>

<!-- Edit Modal -->
<!--  <b-modal-->
<!--      v-model="eventModal"-->
<!--      title="Edit Event"-->
<!--      title-class="text-black font-18"-->
<!--      hide-footer-->
<!--      body-class="p-3"-->
<!--  >-->
<!--    <form @submit.prevent="editSubmit">-->
<!--      <div class="row">-->
<!--        <div class="col-12">-->
<!--          <div class="mb-3">-->
<!--            <label for="name">Event Name</label>-->
<!--            <input-->
<!--                id="name1"-->
<!--                v-model="editevent.editTitle"-->
<!--                type="text"-->
<!--                class="form-control"-->
<!--                placeholder="Insert Event name"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="col-6">-->
<!--          <label for="filterFromDate" class="form-label"> Start On </label>-->
<!--          <flat-pickr-->
<!--              v-model="editevent.editStart"-->
<!--              :config="dateTimeConfig"-->
<!--              class="form-control"-->
<!--              data-provider="timepickr"-->
<!--              data-time-hrs="true"-->
<!--          ></flat-pickr>-->
<!--        </div>-->
<!--        <div class="col-6">-->
<!--          <label for="filterToDate" class="form-label"> End On</label>-->
<!--          <flat-pickr-->
<!--              v-model="editevent.editEnd"-->
<!--              :config="dateTimeConfig"-->
<!--              class="form-control"-->
<!--              data-provider="timepickr"-->
<!--              data-time-hrs="true"-->
<!--          ></flat-pickr>-->
<!--        </div>-->
<!--        <div class="col-12" style="margin-top: 5px;">-->
<!--          <label for="eventDescription" class="form-label">Description</label>-->
<!--          <textarea class="form-control" id="eventDescription" rows="3" v-model="editevent.editDescription"></textarea>-->
<!--        </div>-->
<!--        <div class="col-12" style="margin-top: 5px;">-->
<!--          <div class="mb-3">-->
<!--            <label class="control-label">Category</label>-->
<!--            <select-->
<!--                v-model="editevent.editcategory"-->
<!--                class="form-control"-->
<!--                name="category"-->
<!--            >-->
<!--              <option-->
<!--                  v-for="option in categories"-->
<!--                  :key="option.backgroundColor"-->
<!--                  :value="`${option.value}`"-->
<!--              >-->
<!--                {{ option.name }}-->
<!--              </option>-->
<!--            </select>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="text-end p-3">-->
<!--        <b-button variant="light" @click="closeModal">Close</b-button>-->
<!--        <b-button class="ms-1" variant="danger" @click="confirm"-->
<!--        >Delete</b-button-->
<!--        >-->
<!--        <b-button class="ms-1" variant="success" @click="editSubmit"-->
<!--        >Save</b-button-->
<!--        >-->
<!--      </div>-->
<!--    </form>-->
<!--  </b-modal>-->
</template>
