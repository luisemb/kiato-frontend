<script>

import {VueDraggableNext} from "vue-draggable-next";
import {AlignLeftIcon, EyeIcon} from "@zhuowenli/vue-feather-icons";
import moment from "moment";
import axios from "axios";
import Swal from "sweetalert2";
import { ref } from "vue";
// import { store } from '@/state/store'
import { mapState } from 'vuex';

export default {
  name: 'kanbanBoard',
  props:['list'],
  data() {
    return {
      notes: [],
      chatMessages: [],
      perPage: 100,
      listToUpdate: '',
    };
  },
  components: {
    draggable: VueDraggableNext,
    EyeIcon,
    AlignLeftIcon,
  },
  methods: {
    log (oldList, event) {
      const { removed } = event

      if(removed) {
        const userID = removed.element.ID;

        let newList = document.getElementById('statusCard-' + userID).value;
        let cardID = document.getElementById('card-' + userID);

        if (oldList !== newList) {

          const pattern = '/client/';
          if(window.location.href.match(pattern)) {
            this.updateClientStatus(cardID, newList, oldList, userID)
            document.getElementById('statusCard-' + userID).value = oldList;
          } else {
            this.updateAgentStatus(cardID, newList, oldList, userID)
            document.getElementById('statusCard-' + userID).value = oldList;
          }
        }
      }
    },
    formatDate: function (date, format) {
      date = moment(date).format(format)
      return date;
    },
    daysFromDate: function (date) {
      let days = ''
      days = moment(date).fromNow();
      return days;
    },
    // printEnd (number, status) {
    //   // var oldList = document.getElementById('statusCard-' + number).value;
    //   // setTimeout(() => {
    //   //   var cardID = document.getElementById('card-' + number);
    //   //   var newList = document.getElementById('statusCard-' + number).value;
    //   //   if (oldList !== newList) {
    //   //     this.updateAgentStatus(cardID, newList, oldList, number)
    //   //     document.getElementById('statusCard-' + number).value = status;
    //   //   }
    //   // }, 300);
    // },
    async updateAgentStatus (item, newList, oldList, agentID) {

      const data = {
        item: item,
        newList: newList,
        oldList: oldList,
        agentID: agentID,
        userID: localStorage.getItem('id'),
        token: localStorage.getItem('jwt'),
      }

      await axios
          .put('/api/updateUserStatus', data)
          .then(async response => {

            if (response) {

              await Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved!",
                showConfirmButton: false,
                timer: 1000,
              });

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
    },
    async updateClientStatus (item, newList, oldList, clientID) {

      const data = {
        item: item,
        newList: newList,
        oldList: oldList,
        clientID: clientID,
        userID: localStorage.getItem('id'),
        token: localStorage.getItem('jwt'),
      }

      await axios
          .put('/api/workOrder/updateClientStatus', data)
          .then(async response => {

            if (response) {

              await Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved!",
                showConfirmButton: false,
                timer: 1000,
              });

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
    },
    async getUserInfo (id) {
      // document.getElementById('edit-btn').style.display='block';
      // document.getElementById('add-btn').style.display='none'
      // document.getElementById('agentModalLabel').innerHTML="Edit Agent"

      localStorage.setItem('selectedUser', id)
      const data = {
        token: localStorage.getItem('jwt'),
        ID: id
      }

      let agentInfo;

      await axios
          .post('/api/getUser', data)
          .then(response => {
            agentInfo = response.data
            this.$emit('userData', agentInfo);
            localStorage.setItem('selectedUser', agentInfo.ID)
            localStorage.setItem('selectedUserName', agentInfo.firstName + ' ' + agentInfo.lastName)
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
    async getClientInfo (id) {

      const data = {
        token: localStorage.getItem('jwt'),
        ID: id
      }

      let clientInfo;

      await axios
          .post('/api/workOrder/getClient', data)
          .then(response => {
            clientInfo = response.data
            this.$emit('userData', clientInfo);
            localStorage.setItem('selectedUser', clientInfo.ID)
            localStorage.setItem('selectedUserName', clientInfo.firstName + ' ' + clientInfo.lastName)
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Something was wrong, please contact your SysAdmin.", "error")
            }
          })
    },
    async getConversation() {

      const data = {
        token: localStorage.getItem('jwt'),
        email:  localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        selectedUser: localStorage.getItem('selectedUser')
      }

      await axios
          .post('/api/comm/getSMSConversation', data)
          .then(async response => {
            this.chatMessages = response.data;
            this.$emit('setMessages', response.data)

            // this.chatMessagesData.push({
            //   align: "right",
            //   name: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastname'),
            //   message,
            //   time: currentDate.getHours() + ":" + currentDate.getMinutes(),
            // });
          })
          .catch(async error => {
            return error;
          })
    },
    async getData(id){

      const pattern = '/client/';
      const pattern2 = '/prospects/';
      if(window.location.href.match(pattern)) {
        document.getElementById('modalTitle').innerHTML = 'Client Card'
        await this.getClientInfo(id);
        await this.getNotes(id);
      } else if(window.location.href.match(pattern2)){
        document.getElementById('modalTitle').innerHTML = 'Prospect Card'
        await this.getClientInfo(id);
        await this.getNotes(id);
      } else {
        await this.getUserInfo(id);
        await this.getNotes(id);
      }
      await this.getConversation()
    },
    async getNotes (id) {
      const data = {
        token: localStorage.getItem('jwt'),
        userID: localStorage.getItem('id'),
        agentID: id,
        clientID: id,
      }

      const pattern = '/client/';
      const pattern2 = '/prospects/';
      let url = '';
      if(window.location.href.match(pattern)) {
        url = '/api/client/getClientNotes';
      } else if(window.location.href.match(pattern2)){
        url = '/api/client/getClientNotes';
      } else {
        url = '/api/getUserNotes';
      }

      await axios
          .post(url, data)
          .then(response => {
            this.notes = response.data;
            this.$emit('onFire', response.data)
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    loadMore(listName) {
      this.listToUpdate = listName;
      const listFiltered = this.list.find(o => o.groupName.groupName === listName);
      if (this.perPage > listFiltered.perPage) return;
      listFiltered.groupName.perPage = listFiltered.groupName.perPage + this.perPage;
      listFiltered.groupName.showing = listFiltered.groupName.perPage;
    },
    agentsLoaded(listName) {
      this.listToUpdate = listName;
      const list = this.list.find(o => o.groupName.groupName === listName);
      return list.slice(0, list.groupName.perPage);
    },

  },
  emits: ["onFire", "userData", "setMessages"],
  setup( props, { emit }) {
    const notify = ref ("1")
    const notifyNotes = () => {
      emit('onFire', notify)
    }
    return {notify, notifyNotes}
  },
  computed:
    mapState({
    items: s => s.items.todo,
  }),
}
</script>
<style>
.simplebar-scrollbar:before {
  opacity: 0.5 !important;
}
</style>
<template>
  <div class="tasks-board mb-3" id="kanbanboard">
    <div v-for="data in list" :key="data.groupName.groupID">
      <div class="col tasks-list">
        <div class="card">
          <a class="card-header bg-soft-primary" data-bs-toggle="collapse" v-bind:href="'#'+data.groupName.groupName"
             role="button"
             aria-expanded="false" v-bind:aria-controls="data.groupName.groupName">
            <div class="row">
              <div class="col-md-10">
                <h5 class="card-title text-uppercase fw-semibold mb-1 fs-15"> {{ data.groupName.statusName }}</h5>
              </div>
              <div class="col-md-2">
                <small class="badge bg-success align-bottom ms-1" style="float: right;">{{
                    data.groupName.showing +'/'+ data.groupName.quantity
                  }}</small>
              </div>
            </div>
<!--            <p class="text-muted mb-0">$708,200 <span class="fw-medium">7 Deals</span></p>-->
          </a>
        </div><!--end card-->
        <div data-simplebar class="tasks-wrapper collapse show" v-bind:id="data.groupName.groupName" v-bind:class="[data.groupName.quantity > 0 ? '': 'tasks']">
          <!-- @drop="printEnd(d.ID, data.groupName.groupID)" -->
          <draggable
              :list="data"
              class="dragArea"
              :group="{ name: 'todo' }"
              @change="log(data.groupName.groupID, $event)"
              animation="100">
            <div class="card mb-1"
                 v-for="d in agentsLoaded(data.groupName.groupName)"
                 :key="d.ID"
                 v-bind:id="'card-'+d.ID" >
              <input type="text" v-bind:value="data.groupName.groupID" v-bind:id="'statusCard-'+d.ID"
                     style="display: none">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="flex-shrink-0">
                    <img src="@/assets/images/users/user-dummy-img.jpg" alt="" class="avatar-xs rounded-circle"/>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6 class="fs-14 mb-1">{{ d.firstName + ' ' + d.lastName }}</h6>
                    <p class="text-muted mb-0">{{ d.departmentName }} - {{
                        formatDate(d.date_joined, 'MMMM Do YYYY')
                      }}</p>
                  </div>
                </div>
                <table id="tab">
                  <tr>
                    <td>
                      <a data-bs-toggle="collapse" v-bind:href="'#leadDiscovered'+d.ID" role="button"
                         aria-expanded="false" aria-controls="leadDiscovered1" v-bind:id="d.ID"
                         style="max-width: 20px;">
                        <EyeIcon class="grayIcon eyeIcon"></EyeIcon>
                      </a>
                    </td>
                    <td>
                      <a data-bs-toggle="collapse" style="max-width: 20px;">
                        <AlignLeftIcon class="grayIcon eyeIcon"></AlignLeftIcon>
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              <div class="collapse border-top border-top-dashed" v-bind:id="'leadDiscovered'+d.ID">
                <div class="card-body">
                  <h6 class="fs-14 mb-1">{{ d.departmentName }} <small
                      class="badge badge-soft-primary">{{ daysFromDate(d.createdOn) }}</small></h6>
                  <p class="text-muted"></p>
                  <ul class="list-unstyled vstack gap-2 mb-0">
                    <li>
                      <div class="d-flex">
                        <div class="flex-shrink-0 avatar-xxs text-muted">
                          <i class="ri-calendar-2-fill"></i>
                        </div>
                        <div class="flex-grow-1">
                          <h6 class="mb-0">Interview</h6>
                          <small class="text-muted">{{
                              formatDate(d.interviewDate, 'MMMM Do YYYY, h:mmA')
                            }}</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="d-flex">
                        <div class="flex-shrink-0 avatar-xxs text-muted">
                          <i class="ri-phone-fill"></i>
                        </div>
                        <div class="flex-grow-1">
                          <h6 class="mb-0">Phone</h6>
                          <small class="text-muted">{{ d.phoneNumber }}</small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div class="d-flex">
                        <div class="flex-shrink-0 avatar-xxs text-muted">
                          <i class="ri-earth-line"></i>
                        </div>
                        <div class="flex-grow-1">
                          <h6 class="mb-0">Email</h6>
                          <small class="text-muted">{{ d.email }}</small>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="card-footer hstack gap-2">
                  <button class="btn btn-success btn-sm w-100" data-bs-toggle="modal" href="#agentModal"
                          data-bs-trigger="hover" data-bs-placement="top" @click="getData(d.ID), notifyNotes"><i
                      class="ri-door-open-line align-bottom me-1"></i> Open
                  </button>
                  <button class="btn btn-primary btn-sm w-100" data-bs-toggle="collapse" v-bind:href="'#leadDiscovered'+d.ID">
                    <i class="ri-close-circle-line align-bottom me-1"></i>
                    Close
                  </button>
                </div>
              </div>
            </div><!--end card-->
            <div
                class="btn-group list-group-item"
                role="group"
                aria-label="Basic example"
                key="footer"
                v-if="data.groupName.quantity > data.groupName.showing"
            >
              <div class="d-grid gap-2">
                <b-button variant="outline-secondary" class="waves-effect waves-light" @click="loadMore(data.groupName.groupName)">Load More</b-button>
              </div>
            </div>
          </draggable>
        </div>
      </div><!--end col-->
    </div>
  </div>
</template>