<script>

import moment from "moment";
import {
  SearchIcon,
  InfoIcon,
} from "@zhuowenli/vue-feather-icons";
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: 'notes',
  props:['dataList', 'agentID', 'idNumber'],
  methods: {
    formatDate: function (date, format) {
      date = moment(date).format(format)
      return date;
    },
    async saveNote () {

      const data = {
        note: document.getElementById('userNote'+this.idNumber).value,
        agentID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
        userEmail: localStorage.getItem('email'),
        token: localStorage.getItem('jwt'),
      }

      const pattern = '/taskList/';
      const pattern2 = '/techs/';
      if(window.location.href.match(pattern) || window.location.href.match(pattern2)) {

        await axios
            .post('/api/workOrder/saveWoNote', data)
            .then(async response => {

              if (response.status === 200) {
                document.getElementById('userNote'+this.idNumber).value = ''
                this.$emit('onFire', response.data)
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
      } else {
        await axios
            .post('/api/saveUserNote', data)
            .then(async response => {

              if (response.status === 200) {
                document.getElementById('userNote'+this.idNumber).value = ''
                this.$emit('onFire', response.data)
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
      }
    },
  },
  data () {
    return {
      profile: require("@/assets/images/users/user-dummy-img.jpg"),
      submitted: false,
      userName: '',
    };
  },
  components: {
    SearchIcon,
    InfoIcon,
  },
  mounted() {
  }
}

</script>
<template>
<div class="chat-wrapper">
  <!-- Start User chat -->
  <div class="w-100 overflow-hidden">
    <div class="chat-content d-lg-flex">
      <!-- start chat conversation section -->
      <div class="w-100 overflow-hidden position-relative">
        <!-- conversation user -->
        <div class="position-relative">
          <div class="p-3 user-chat-topbar" style="position: inherit;">
            <div class="row align-items-center">
              <div class="col-sm-4 col-8">
                <div class="d-flex align-items-center">
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex align-items-center">
                      <div
                          class="
                                            flex-shrink-0
                                            chat-user-img
                                            online
                                            user-own-img
                                            align-self-center
                                            me-3
                                            ms-0">
                        <img :src="profile ? profile :
                                          require('@/assets/images/users/user-dummy-img.jpg')"
                             class="rounded-circle avatar-xs"
                             alt=""/>
                        <span class="user-status"></span>
                      </div>
                      <div class="flex-grow-1 overflow-hidden">
                        <h5 class="text-truncate mb-0 fs-16">
                          <a
                              class="text-reset username"
                              data-bs-toggle="offcanvas"
                              href="#userProfileCanvasExample"
                              aria-controls="userProfileCanvasExample"
                          >{{ this.dataList[1] }}</a>
                        </h5>
                        <p class="
                                text-truncate text-muted
                                fs-14
                                mb-0
                                userStatus">
                          <small>Notes</small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-8 col-4">
                <ul class="list-inline user-chat-nav text-end mb-0">
                  <li class="list-inline-item m-0">
                    <div class="dropdown">
                      <button
                          class="btn btn-ghost-secondary btn-icon"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                      >
                        <search-icon class="icon-sm"></search-icon>
                      </button>
                      <div
                          class="
                            dropdown-menu
                            p-0
                            dropdown-menu-end dropdown-menu-lg
                          "
                      >
                        <div class="p-2">
                          <div class="search-box">
                            <input
                                type="text"
                                class="form-control bg-light border-light"
                                placeholder="Search here..."
                                onkeyup="searchMessages()"
                                id="searchMessage"
                            />
                            <i class="ri-search-2-line search-icon"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li class="list-inline-item d-none d-lg-inline-block m-0">
                    <button
                        type="button"
                        class="btn btn-ghost-secondary btn-icon"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#userProfileCanvasExample"
                        aria-controls="userProfileCanvasExample"
                    >
                      <info-icon class="icon-sm"></info-icon>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- end chat user head -->
          <div class="position-relative" id="users-chat">
            <div
                class="chat-conversation p-3 p-lg-4"
                id="chat-conversation"
                data-simplebar
                ref="current">
              <ul class="list-unstyled chat-conversation-list" id="list-unstyled-notes">
                <li v-for="messageData in dataList[0]"
                    :key="messageData.noteID" class="chat-list right">
                  <div class="conversation-list">
                    <div class="chat-avatar" v-if="messageData.align !== 'right'">
                      <img :src=" profile ? profile : require('@/assets/images/users/user-dummy-img.jpg')"
                          alt=""/>
                    </div>
                    <div class="user-chat-content">
                      <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                          <p class="mb-0 ctext-content">
                            {{ messageData.note }}
                          </p>
                          <div>
                            <small class="text-muted" style="font-size: 0.7em;">{{ messageData.createdBy }}</small>
                          </div>
                        </div>
                        <div
                            class="dropdown align-self-start message-box-drop"
                        >
                          <a
                              class="dropdown-toggle"
                              href="#"
                              role="button"
                              data-bs-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                          >
                            <i class="ri-more-2-fill"></i>
                          </a>
                          <div class="dropdown-menu">
                            <a class="dropdown-item reply-message" href="#">
                              <i class="
                                                    ri-reply-line
                                                    me-2
                                                    text-muted
                                                    align-bottom"></i>Reply</a>
                            <a class="dropdown-item" href="#">
                              <i class="
                                                  ri-share-line
                                                  me-2
                                                  text-muted
                                                  align-bottom"></i>Forward</a>
                            <a class="dropdown-item copy-message" href="#">
                              <i class="
                                                  ri-file-copy-line
                                                  me-2
                                                  text-muted
                                                  align-bottom"></i>Copy</a>
                            <a class="dropdown-item" href="#">
                              <i class="
                                                ri-bookmark-line
                                                me-2
                                                text-muted
                                                align-bottom"></i >Bookmark</a
                            >
                            <a class="dropdown-item delete-item" href="#">
                              <i class="
                                                    ri-delete-bin-5-line
                                                    me-2
                                                    text-muted
                                                    align-bottom"></i>Delete</a>
                          </div>
                        </div>
                        <div class="conversation-name">
                          <div>
                            <small class="text-muted time">{{
                                this.formatDate(messageData.createdOn, 'MM/D/YYYY H:mm')
                              }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <!-- end chat-conversation-list -->
            </div>
          </div>
          <!-- end chat-conversation -->
          <div class="chat-input-section p-3 p-lg-4">
            <form @submit.prevent="formSubmit">
              <div class="row g-0 align-items-center">
                <div class="col-auto">
                  <div class="chat-input-links me-2">
                    <div class="links-list-item">
                      <button
                          type="button"
                          class="btn btn-link text-decoration-none emoji-btn"
                          id="emoji-btn">
                        <i class="bx bx-smile align-middle"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col">
                  <div class="chat-input-feedback">
                    Please Enter a Note
                  </div>

                  <input
                      type="text"
                      class="form-control chat-input bg-light border-light"
                      placeholder="Enter Note"
                      :id="'userNote'+this.idNumber"
                      :class="{'is-invalid': submitted && v$.form.message.$error,}"/>
                  <div
                      v-if="submitted && v$.form.message.$error"
                      class="invalid-feedback">
                                    <span v-if="v$.form.message.required.$message">{{
                                        v$.form.message.required.$message
                                      }}</span>
                  </div>
                </div>
                <div class="col-auto">
                  <div class="chat-input-links ms-2">
                    <div class="links-list-item">
                      <button @click="saveNote"
                          type="submit"
                          class="
                                            btn btn-success
                                            chat-send
                                            waves-effect waves-light">
                        <i class="ri-send-plane-2-fill align-bottom"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="replyCard">
            <div class="card mb-0">
              <div class="card-body py-3">
                <div
                    class="replymessage-block mb-0 d-flex align-items-start"
                >
                  <div class="flex-grow-1">
                    <h5 class="conversation-name"></h5>
                    <p class="mb-0"></p>
                  </div>
                  <div class="flex-shrink-0">
                    <button
                        type="button"
                        id="close_toggle"
                        class="btn btn-sm btn-link mt-n2 me-n3 fs-18"
                    >
                      <i class="bx bx-x align-middle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>