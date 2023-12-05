<script>
import {
  SearchIcon,
  InfoIcon,
} from "@zhuowenli/vue-feather-icons";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import appConfig from "../../../app.config";
import { chatData, chatMessagesData } from "@/views/apps/data";
import axios from "axios";

export default {
  props:['dataList'],
  setup() {
    return { v$: useVuelidate() };
  },
  page: {
    title: "Chat",
    meta: [{ name: "description", content: appConfig.description }],
  },
  data() {
    return {
      chatData: chatData,
      chatMessagesData: chatMessagesData,
      title: "Chat",
      items: [
        {
          text: "",
          href: "/",
        },
        {
          text: "Chat",
          active: true,
        },
      ],
      submitted: false,
      form: {
        message: "",
      },
      username: "Steven Franklin",
      profile: require("@/assets/images/users/multi-user.jpg"),
    };
  },
  components: {
    SearchIcon,
    InfoIcon,
  },
  validations: {
    form: {
      message: {
        required: helpers.withMessage("Message is required", required),
      },
    },
  },
  methods: {
    /**
     * Get the name of user
     */
    chatUsername(name, image) {
      this.username = name;
      this.profile = image;
      this.usermessage = "Hello";
      this.chatMessagesData = [];
      const currentDate = new Date();

      this.chatMessagesData.push({
        name: this.username,
        message: this.usermessage,
        time: currentDate.getHours() + ":" + currentDate.getMinutes(),
      });
    },

    /**
     * Chat form Submit
     */
    async sendMessage() {
      this.submitted = true;

      // stop here if form is invalid
      this.v$.$touch();

      if (this.v$.$invalid) {
        return;
      } else {
        const message = this.form.message;
        const currentDate = new Date();
        let isAgent = 0;

        const pattern = '/client/';
        const pattern2 = '/prospects/';
        if(window.location.href.match(pattern) || window.location.href.match(pattern2)) {
          isAgent = 0
        } else {
          isAgent = 1
        }

        const data = {
          createdBy:  localStorage.getItem('email'),
          message: message,
          date: currentDate,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          selectedUser: localStorage.getItem('selectedUser'),
          isAgent: isAgent,
        }

        await axios
            .post('/api/comm/sendSMS', data)
            .then(async response => {

              if (response.status === 200) {
                let notesElement = document.getElementsByClassName("chat-conversation-list");
                let hour = currentDate.getHours() + ":" + currentDate.getMinutes()

                var row = '<li class="right chat-list"><div class="conversation-list"><!--v-if-->' +
                    '<div class="user-chat-content"><div class="ctext-wrap">' +
                    '<div class="ctext-wrap-content">' +
                    '<p class="mb-0 ctext-content">' + message + '</p></div>' +
                    '<div class="conversation-name">' +
                    '<small class="text-muted time" style="margin-left: 5px; margin-right: 5px;">' + hour + '</small>' +
                    '<span class="text-success check-message-icon"><i class="ri-check-double-line align-bottom"></i>' +
                    '</span></div></div></div></div></li>';

                notesElement[1].insertAdjacentHTML('beforeend', row)
                document.getElementById('userNote').value = ''
              }

              // this.dataList.push({
              //   id: 0,
              //   status:"queued",
              //   wasOpen: 0,
              //   align: "right",
              //   image: "require('@/assets/images/users/avatar-4.jpg')",
              //   time: currentDate.getHours() + ":" + currentDate.getMinutes(),
              //   message: message,
              // });
            })
            .catch(async error => {
              return error;
            })
      }
      // window.scrollTo(0, document.getElementById("chat-conversation").scrollHeight);

      this.submitted = false;
      this.form = {};
    },
  },
  mounted() {
    var userChatElement = document.querySelectorAll(".user-chat");
    document.querySelectorAll(".chat-user-list li a").forEach(function (item) {
      item.addEventListener("click", function () {
        userChatElement.forEach(function (elm) {
          elm.classList.add("user-chat-show");
        });

        // chat user list link active
        var chatUserList = document.querySelector(".chat-user-list li.active");
        if (chatUserList) chatUserList.classList.remove("active");
        this.parentNode.classList.add("active");
      });
    });

    // user-chat-remove
    document.querySelectorAll(".user-chat-remove").forEach(function (item) {
      item.addEventListener("click", function () {
        userChatElement.forEach(function (elm) {
          elm.classList.remove("user-chat-show");
        });
      });
    });

    this.username = localStorage.getItem('selectedUserName');

  },
};
</script>

<template>
  <div class="chat-wrapper">
    <!-- end chat leftsidebar -->
    <!-- Start User chat -->
    <div class="w-100 overflow-hidden">
      <div class="chat-content d-lg-flex">
        <!-- start chat conversation section -->
        <div class="w-100 overflow-hidden position-relative">
          <!-- conversation user -->
          <div class="position-relative">
            <div class="p-3">
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
                            ms-0
                          "
                        >
                          <img
                              :src="
                              profile
                                ? profile
                                : require('@/assets/images/users/user-dummy-img.jpg')
                            "
                              class="rounded-circle avatar-xs"
                              alt=""
                          />
                          <span class="user-status"></span>
                        </div>
                        <div class="flex-grow-1 overflow-hidden">
                          <h5 class="text-truncate mb-0 fs-16">
                            <a
                                class="text-reset username"
                                data-bs-toggle="offcanvas"
                                href="#userProfileCanvasExample"
                                aria-controls="userProfileCanvasExample"
                            >{{ username }}</a
                            >
                          </h5>
                          <p
                              class="
                              text-truncate text-muted
                              fs-14
                              mb-0
                              userStatus"
                          >
                            <small>Messages</small>
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

            <div class="position-relative" id="users-chat" style="max-height: 45vh;">
              <div
                  class="chat-conversation p-3 p-lg-4"
                  id="chat-conversation"
                  data-simplebar
                  ref="current"
              >
                <ul class="list-unstyled chat-conversation-list">
                  <li
                      v-for="data of dataList"
                      :key="data.message"
                      :class="{
                      right: `${data.align}` === 'right',
                      left: `${data.align}` !== 'right',
                    }"
                      class="chat-list"
                  >
                    <div class="conversation-list">
                      <div class="chat-avatar" v-if="data.align !== 'right'">
                        <img
                            :src="
                            profile
                              ? profile
                              : require('@/assets/images/users/user-dummy-img.jpg')
                          "
                            alt=""
                        />
                      </div>
                      <div class="user-chat-content">
                        <div class="ctext-wrap">
                          <div class="ctext-wrap-content">
                            <p class="mb-0 ctext-content">
                              {{ data.message }}
                            </p>
                          </div>
                          <div class="conversation-name">
                            <small class="text-muted time" style="margin-left: 5px; margin-right: 5px;">{{
                                data.time
                              }}</small>
                            <span class="text-success check-message-icon"
                            ><i
                                class="ri-check-double-line align-bottom"
                            ></i
                            ></span>
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
              <form @submit.prevent="sendMessage">
                <div class="row g-0 align-items-center">
                  <div class="col-auto">
                    <div class="chat-input-links me-2">
                      <div class="links-list-item">
                        <button
                            type="button"
                            class="btn btn-link text-decoration-none emoji-btn"
                            id="emoji-btn"
                        >
                          <i class="bx bx-smile align-middle"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="chat-input-feedback">
                      Please Enter a Message
                    </div>
                    <input
                        type="text"
                        v-model="form.message"
                        class="form-control chat-input bg-light border-light"
                        placeholder="Enter Message..."
                        :class="{
                        'is-invalid': submitted && v$.form.message.$error,
                      }"
                    />
                    <div
                        v-if="submitted && v$.form.message.$error"
                        class="invalid-feedback"
                    >
                      <span v-if="v$.form.message.required.$message">{{
                          v$.form.message.required.$message
                        }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="chat-input-links ms-2">
                      <div class="links-list-item">
                        <button
                            type="submit"
                            class="
                            btn btn-success
                            chat-send
                            waves-effect waves-light
                          "
                        >
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
  <!-- end chat-wrapper -->
</template>
