<script>
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import moment from "moment";
import axios from "axios";
import Swal from "sweetalert2";
import Papa from "papaparse";
import jwt_decode from "jwt-decode";

export default {
  page: {
    title: "Agents List cards",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
    flatPickr,
  },
  data() {
    return {
      title: "Agents | Scheduled Messages",
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
      messageList: [],
      reciepientList: [],
      content: [],
      numberOfRecipents: 0,
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      scheduleMessageContent: '',
      scheduleHour: '14:00',
      page: 1,
      perPage: 50,
      pages: [],
      uploadLanguage: '0',
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          isActive: 1,
          noteSearch: '',
          keyword: '',
          licensed: 1,
          language: 3,
          orderBy: 'ASC',
          sortBy: 'name',
          department: '0',
          dateRange: 0,
          status: 0,
          type: 0,
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
        }
      },
      statusList: {},
      parsed: false,
      findAgents: "1",
      spectedColumns: [
        "Full name (optional)",
        "First Name",
        "Last Name",
        "Phone",
        "Email"
      ],
      date: '',
      totalCharacters: 0,
      availableMessages: 0
    };
  },
  watch: {
    contactsList() {
      this.setPages();
    },
  },
  created() {
    this.setPages();
  },
  computed: {
    displayedPosts() {
      return this.paginate(this.list);
    },
    resultQuery() {
      if (this.data.searchValues.keyword.length >= 3) {
        const search = this.data.searchValues.keyword.toLowerCase();
        return this.displayedPosts.filter((data) => {
          return (
              data.address.toLowerCase().includes(search) ||
              data.agentNumber.toLowerCase().includes(search) ||
              data.city.toLowerCase().includes(search) ||
              data.email.toLowerCase().includes(search) ||
              data.phoneNumber.toLowerCase().includes(search) ||
              data.firstName.toLowerCase().includes(search) ||
              data.lastName.toLowerCase().includes(search) ||
              data.fullname.toLowerCase().includes(search) ||
              data.statusName.toLowerCase().includes(search)
          );
        });
      } else {
        return this.displayedPosts;
      }
    },
  },
  methods: {
    formatDate: function (date, format) {
      date = moment(date).format(format)
      return date;
    },
    setPages() {

      let numberOfPages = Math.ceil(this.list.length / this.perPage);
      this.pages = []
      for (let index = 1; index <= numberOfPages; index++) {
        this.pages.push(index);
      }
    },
    paginate(contactsList) {
      let page = this.page;
      let perPage = this.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return contactsList.slice(from, to);
    },
    formatPhone: function(phone, flag=0) {

      // if flag == 1 put value in phone Edit
      if(phone !== undefined){
        const x = phone.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        phone = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
      }else{
        phone = ''
      }

      if(flag !== 1){
        return phone;
      }else{
        document.getElementById('editPhoneNumber').value = phone;
      }
    },
    async addRecipients() {
      let ids_array = [];
      let items = document.getElementsByName("chk_child");
      let url = '';
      items.forEach(function (ele) {
        if (ele.checked == true) {
          let trNode = ele.parentNode.parentNode.parentNode;
          let id = trNode.querySelector(".id a").innerHTML;

          if(!ids_array.includes(id)){
            ids_array.push(id);
          }
        }
      });

      if (typeof ids_array !== "undefined" && ids_array.length > 0) {
        const data = {
          token: localStorage.getItem('jwt'),
          recipientsList: ids_array.join(),
        }

        if(this.findAgents === "1"){
          url = '/api/getUserByids'
        }else{
          url = '/api/client/getClientsByiDS'
        }

        await axios
            .post(url, data)
            .then(response => {
              let array1 = JSON.parse(JSON.stringify(this.reciepientList))
              let array2 = JSON.parse(JSON.stringify(response.data))
              let array3 = array1.concat(array2);

              array3 = array3.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.ID === value.ID && t.phoneNumber === value.phoneNumber
                ))
              )

              this.reciepientList = JSON.parse(JSON.stringify(array3));
              this.numberOfRecipents = this.reciepientList.length

              items.forEach(function (ele) {
                if (ele.checked == true) {
                  ele.checked = false
                  ele.closest("tr").classList.remove("table-active");
                }
              });
            })
            .catch(error => {
              if (error.response) {
                Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
              }
              })
      } else {
        Swal.fire({
          title: "Please, select at least one recipient!",
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }
    },
    async addRecipientsFromFile() {
      let language = this.uploadLanguage;
      if (this.content.data.length > 0 && language !== '0') {
        let array1 = JSON.parse(JSON.stringify(this.reciepientList))
        let array2 = JSON.parse(JSON.stringify(this.content.data))
        let array3 = []

        array2.forEach(function (item) {
          let firstName = '';
          let lastName = '';

          if (item['First Name'].length > 1 && item['Last Name'].length > 1) {
            firstName = item['First Name']
            lastName = item['Last Name']
          } else {
            let splitFullName = item['Full name (optional)'].split('')
            firstName = splitFullName[0]
            lastName = splitFullName[1]
          }

          array3.push({
            'ID': 0,
            'departmentName': 'n/a',
            'email': item['Email'],
            'firstName': firstName,
            'language': language,
            'lastName': lastName,
            'phoneNumber': item['Phone'],
            'statusName': 'n/a'
          })
        });

        this.reciepientList = array1.concat(array3);
        console.log(this.reciepientList)
        this.numberOfRecipents = this.reciepientList.length

        document.getElementById('closeListModal').click()
        // this.openModal('createMessage')

      }else if(this.uploadLanguage === '0'){
        Swal.fire({
          title: "Please, select the language!",
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      } else {
        Swal.fire({
          title: "Please, upload almost one recipient in the list!",
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }
    },
    removeRecipient(index){
      Swal.fire({
        title: "Are you sure?",
        text: "This recipient will be removed!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#2ca219",
        confirmButtonColor: "#e12e2e",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.value) {
          this.reciepientList.splice(this.reciepientList.indexOf(index), 1);
          Swal.fire("Deleted!", "Recipient has been deleted.", "success");
          this.numberOfRecipents = this.reciepientList.length
        }
      });
    },
    async scheduleMessage() {

      let validate = true;
      let errors = [];

      if (this.scheduleMessageContent === '' && this.scheduleMessageContent.length < 10) {
        errors.push('Message should be longer than 10 characters!')
        validate = false;
      }

      if (this.scheduleHour === '' && this.scheduleHour.length < 3) {
        errors.push('Please, set the schedule hour for the message!')
        validate = false;
      }

      if (this.reciepientList.length === 0) {
        errors.push('Please, add almost one recipient to the list!')
        validate = false;
      }

      if (this.totalCharacters < 0) {
        errors.push('Your message is longer than 150 characters!')
        validate = false;
      }

      if(this.availableMessages <= 0){
        errors.push('You reached the limit of daily messages!')
        validate = false;
      }

      if(this.reciepientList.length > this.availableMessages ){
        errors.push('You can\'t add more recipients than you message limit!')
        validate = false;
      }

      const data = {
        token: localStorage.getItem('jwt'),
        recipients: this.reciepientList,
        hour: this.scheduleHour,
        date: this.date,
        message: this.scheduleMessageContent,
        userEmail: localStorage.getItem('email'),
      }

      if(validate){
        await axios
            .post('/api/comm/saveScheduleMessage', data)
            .then(response => {
              document.getElementById('closemodal').click();
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Message scheduled successfully!'
              });
              console.log(response)
            })
            .catch(error => {
              if (error.response) {
                Swal.fire("Oops!", "Please contact your SysAdmin.", "error")
              }
            })
      }else{
        let list = '';
        for (var i = 0; i < errors.length; i+=1) {
          list += errors[i] + ' \n';
        }

        await Swal.fire("" + list, '', 'info');

      }
    },
    resetForm(){
      // this.reciepientList = [];
      this.numberOfRecipents = 0;
      this.scheduleMessageContent = '';
      this.scheduleHour = '14:00'
      this.date = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"})

      this.getQuota()
    },
    async updateAgentList(status=0) {

      let validate = true;
      let errors = [];
      let filterKeyword = document.getElementById("filterKeyword").value;
      this.data.searchValues.status = status;
      let filterLanguage = this.data.searchValues.language;

      if (filterLanguage !== '' && (filterLanguage === '1' || filterLanguage === '2')){
        this.data.searchValues.language = filterLanguage;
      }

      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.data.searchValues.keyword = filterKeyword;
      } else if (filterKeyword !== '' && filterKeyword.length < 3) {
        errors.push('Keyword search should have 3 or more characters!')
        validate = false;
      }

      const data = {
        token: localStorage.getItem('jwt'),
        searchValues: this.data.searchValues,
        isAgent: this.data.searchValues.licensed,
        userEmail: localStorage.getItem('email'),
      }

      if(validate){
        axios
            .post('/api/listAgents', data)
            .then(response => {
              this.list=response.data
              this.page = 1
              this.setPages()
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
      }else{
        let list = '';
        for (var i = 0; i < errors.length; i+=1) {
          list += errors[i] + ' \n';
        }

        await Swal.fire("" + list, '', 'info');

      }

    },
    parseFile() {
      var allowedExtensions = /(\.csv)$/i;
      if (allowedExtensions.exec(this.file.name)) {
        Papa.parse( this.file, {
          header: true,
          skipEmptyLines: true,
          complete: function ( results ) {
            if( this.compare(this.spectedColumns, results.meta.fields)){
              this.content = results;
              this.parsed = true;
            } else {
              Swal.fire({
                title: "Oops, this file is not what we spected!",
                icon: 'warning',
                confirmButtonClass: "btn btn-info",
                buttonsStyling: false,
                showCloseButton: true,
              });
            }
          }.bind(this)
        } );
      } else {
        Swal.fire({
          title: "File extension not supported!",
          icon: 'warning',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }
    },
    handleFileUpload() {
      this.file = document.getElementById('listFile').files[0];
      this.parseFile();
    },
    compare (o1, o2){
      for(let p in o1){
        // eslint-disable-next-line no-prototype-builtins
        if(o1.hasOwnProperty(p)){
          if(o1[p] !== o2[p]){
            return false;
          }
        }
      }
      for(let p in o2){
        // eslint-disable-next-line no-prototype-builtins
        if(o2.hasOwnProperty(p)){
          if(o1[p] !== o2[p]){
            return false;
          }
        }
      }
      return true;
    },
    deleteRecord(ele){
      ele.target.parentElement.parentElement.remove();
    },
    async updateRecipientsList() {
      let data = {}

      if (this.findAgents === "1") {

        data = {
          token: localStorage.getItem('jwt'),
          searchValues: this.data.searchValues,
          isAgent: 1,
          userEmail: localStorage.getItem('email'),
        }

        await axios
            .post('/api/listDepartments', data)
            .then(response => {
              this.departmentList = response.data
            })
            .catch(error => {
              if (error.response) {
                Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
              }
            })

        await axios
            .post('/api/listStatus', data)
            .then(response => {
              this.statusList = response.data
            })
            .catch(error => {
              if (error.response) {
                Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
              }
            })

        await axios
            .post('/api/listAgents', data)
            .then(response => {
              this.list = response.data
              this.page = 1
              this.setPages()
            })
            .catch(error => {
              if (error.response) {
                // for (const property in error.response.data) {
                // this.errors.push(`${property}: ${error.response.data[property]}`)
                // }
              } else if (error.message) {
                this.errors.push('Something was wrong, please contact your SysAdmin.')
              }
            })

        await axios
            .post('/api/listSource', data)
            .then(response => {
              this.typeList = response.data
            })
            .catch(error => {
              if (error.response) {

                if (error.response.data.detail === 'Your session is expired!') {
                  this.$router.push('logout')
                }

                Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
              }
            })

      } else {
        data = {
          token: localStorage.getItem('jwt'),
          searchValues: this.data.searchValues,
          userEmail: localStorage.getItem('email'),
          userID: localStorage.getItem('id'),
          isProspect: 0,
          deleted: 0,
          agentSearch: []
        }

        if(this.findAgents === "3"){
          data.isProspect = 1
        }

        await axios
            .post('/api/client/listClients', data)
            .then(response => {
              this.list = response.data
              this.page = 1
              this.setPages()
            })
            .catch(error => {
              if (error.response) {

                if (error.response.data.detail === 'Your session is expired!') {
                  this.$router.push('logout')
                }

                Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
              }
            })

        await axios
            .post('/api/client/clientStatus', data)
            .then(response => {
              this.statusList = response.data
            })
            .catch(error => {
              if (error.response) {

                if (error.response.data.detail === 'Your session is expired!') {
                  this.$router.push('logout')
                }

                Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
              }
            })

        await axios
            .post('/api/client/clientTypes', data)
            .then(response => {
              this.typeList = response.data
            })
            .catch(error => {
              if (error.response) {

                if (error.response.data.detail === 'Your session is expired!') {
                  this.$router.push('logout')
                }

                Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
              }
            })
      }

      console.log(this.findAgents)
    },
    characterCounter(){
      let textArea = document.getElementById("exampleFormControlTextarea5");
      let characterCounter = document.getElementById("char_count");
      const maxNumOfChars = 150;

      let numOfEnteredChars = textArea.value.length;
      let counter = maxNumOfChars - numOfEnteredChars;
      characterCounter.textContent = counter + "/150";
      this.totalCharacters = counter;

      if (counter < 0) {
        characterCounter.style.color = "red";
      } else if (counter < 100) {
        characterCounter.style.color = "orange";
      } else {
        characterCounter.style.color = "black";
      }
    },
    async getQuota() {
      let url = "api/comm/getSMSQuota"

      const data = {
        token: localStorage.getItem('jwt'),
        message: this.scheduleMessageContent,
        userEmail: localStorage.getItem('email'),
      }

      await axios
          .post(url, data)
          .then(response => {

            this.availableMessages = parseInt(response.data.scheduleCount) + parseInt(response.data.totalSent)
            this.availableMessages = 100 - this.availableMessages

            if (this.viewUserGroup('SUPER_ADMIN_GROUP')){
              this.availableMessages = 10000
            }
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Please contact your SysAdmin.", "error")
            }
          })

    },
    viewUserGroup(request){
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.userGroup.includes(request)
    },
  },
  async mounted() {

    let data = {}

    if(this.findAgents === "1"){

      data = {
        token: localStorage.getItem('jwt'),
        searchValues: this.data.searchValues,
        isAgent: 1,
        userEmail: localStorage.getItem('email'),
      }

      await axios
          .post('/api/listDepartments', data)
          .then(response => {
            this.departmentList=response.data
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
            }
          })

      await axios
          .post('/api/listStatus', data)
          .then(response => {
            this.statusList=response.data
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })

      await axios
          .post('/api/listAgents', data)
          .then(response => {
            this.list=response.data
            this.page = 1
            this.setPages()
          })
          .catch(error => {
            if (error.response) {
              // for (const property in error.response.data) {
              // this.errors.push(`${property}: ${error.response.data[property]}`)
              // }
            } else if (error.message) {
              this.errors.push('Something was wrong, please contact your SysAdmin.')
            }
          })

      await axios
          .post('/api/listSource', data)
          .then(response => {
            this.typeList = response.data
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })

    } else {
      data = {
        token: localStorage.getItem('jwt'),
        searchValues: this.data.searchValues,
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        isProspect: 0,
        deleted: 0,
        agentSearch: []
      }

      await axios
          .post('/api/client/clientStatus', data)
          .then(response => {
            this.statusList=response.data
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })

      await axios
          .post('/api/client/clientTypes', data)
          .then(response => {
            this.typeList = response.data
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    }

    await axios
        .post('/api/comm/getScheduledMessages', data)
        .then(response => {
          this.messageList=response.data
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
    this.updateAgentList()
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
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
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>
              </div>
              <div class="col-sm-auto ms-auto">
                <div class="hstack gap-2">
                  <button type="button" class="btn btn-soft-success add-btn" href="#open-filters" data-bs-toggle="modal">
                    <i class="ri-filter-line align-bottom me-1"></i> Filters
                  </button>
                  <button type="button" class="btn btn-soft-success" href="#createMessage" data-bs-toggle="modal" @click="resetForm">
                    <i class="ri-message-2-line align-bottom me-1"></i> Create Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Head -->
          <div class="table-responsive">
            <table class="table align-middle table-nowrap mb-0">
              <thead class="table-light">
              <tr>
                <th scope="col" style="width: 50px">
                  <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        id="checkAll"
                        value="option"
                    />
                  </div>
                </th>
                <th scope="col">Message</th>
                <th scope="col">Is Active</th>
                <th scope="col">Sent</th>
                <th scope="col">Scheduled To</th>
                <th scope="col">Create Date</th>
                <th scope="col">Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(data, index) of messageList" :key="index">
                <td>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="cardtableCheck01">
                    <label class="form-check-label" for="cardtableCheck01"></label>
                  </div>
                </td>
                <td>{{ data.message }}</td>
                <td><a href="javascript:void(0);" :class=" data.active === 1 ? 'link-success' : 'link-danger'" >{{ data.active === 1 ? 'Yes' : 'No' }}</a></td>
                <td>{{ data.sent === 1 ? 'Yes' : 'No' }}</td>
                <td>{{formatDate(data.scheduledTo, 'MMMM Do YYYY, h:mmA') }}</td>
                <td>{{formatDate(data.createdOn, 'MMM Do YYYY, h:mmA') }}</td>
                <td>
                  <ul class="list-inline hstack gap-2 mb-0">
                    <li class="list-inline-item" data-bs-toggle="modal" href="#createMessage" data-bs-trigger="hover" data-bs-placement="top" title="Edit" @click="getMessage(data.ID)">
                      <a class="edit-item-btn" href="javascript:void(0);"><i class="ri-pencil-fill align-bottom text-muted"></i></a>
                    </li>
                    <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Delete">
                      <a class="remove-item-btn" data-bs-toggle="modal" href="javascript:void(0);">
                        <i class="ri-delete-bin-fill align-bottom text-muted"></i>
                      </a>
                    </li>
                  </ul>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!--end col-->
    </div>
    <!--end row-->

    <!-- Filters Modal -->
    <div id="open-filters" class="modal fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
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
                <input type="text" id="filterKeyword" name="filterKeyword" class="form-control mb-2" placeholder="Enter Keyword" v-model="this.data.searchValues.keyword">
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterLicensed" class="form-label">Licensed agents?</label>
                <select class="form-select mb-2" aria-label="Licensed Agents?" id="filterLicensed" name="filterLicensed" v-model="this.data.searchValues.licensed">
                  <option value="1" selected>Both</option>
                  <option value="2">Yes</option>
                  <option value="3">No</option>
                </select>
              </div>
              <div class="col-lg-6">
                <div class="form-check form-switch form-switch-lg" dir="ltr" style="margin: 0;position: absolute;top: 50%;-ms-transform: translateY(-50%);transform: translateY(-50%);">
                  <input type="checkbox" class="form-check-input" id="isActive" checked="">
                  <label class="form-check-label" for="isActive">Active</label>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="editLanguage" class="form-label">Language</label>
                <select class="form-select mb-2" aria-label="Language" id="filterLanguage" name="filterLanguage" v-model="this.data.searchValues.language">
                  <option value="3" selected>Both</option>
                  <option value="1" selected>English</option>
                  <option value="2">Spanish</option>
                </select>
              </div>
              <div class="col-lg-6">
                <label for="editStatus" class="form-label">Search by Notes</label>
                <input type="text" id="filterNotes" name="filterNotes" class="form-control mb-2" placeholder="Enter note" v-model="this.data.searchValues.noteSearch">
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterFromDate" class="form-label"> From date </label>
                <flat-pickr
                    v-model="this.data.searchValues.fromDate"
                    :config="humanfriendlyConfig"
                    class="form-control flatpickr-input"
                    id="filterFromDate"
                    name="filterFromDate"
                ></flat-pickr>
              </div>
              <div class="col-lg-6">
                <label for="filterToDate" class="form-label"> To Date </label>
                <flat-pickr
                    v-model="this.data.searchValues.toDate"
                    :config="humanfriendlyConfig"
                    class="form-control flatpickr-input"
                    id="filterToDate"
                    name="filterToDate"
                ></flat-pickr>
              </div>
            </div>
            <div class="row">

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="updateAgentList()">Search</button>
          </div>

        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!--  Create message Modal  -->
    <div id="createMessage" class="modal fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
      <div class="modal-dialog  modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="myModalLabel">Create Schedule Message</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"> </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-lg-5">
                <div class="row">
                  <div class="col-lg-6">
                    <label for="filterFromDate" class="form-label"> Date</label>
                    <flat-pickr
                        class="form-control flatpickr-input"
                        id="filterFromDate"
                        name="filterFromDate"
                    ></flat-pickr>
                  </div>
                  <div class="col-lg-6">
                    <div>
                      <label for="exampleInputtime" class="form-label">Hour</label>
                      <input type="time" class="form-control" id="exampleInputtime" v-model="scheduleHour">
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12" style="margin-top: 10px;">
                    <div>
                      <label for="exampleFormControlTextarea5" class="form-label">Message Content</label>
                      <textarea class="form-control" id="exampleFormControlTextarea5" rows="15" v-model="scheduleMessageContent" @keyup="characterCounter"></textarea>
                      <span id="char_count">150/150</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-7">
                  <div class="row" style="margin-top: 0px;">
                    <div class="col-sm-6">
                      <label for="filterKeyword" class="form-label">Keyword Search</label>
                      <input type="text" id="filterKeyword"
                             name="filterKeyword"
                             class="form-control search"
                             placeholder="Search for..."
                             v-model="this.data.searchValues.keyword"
                             @change="this.data.searchValues.keyword.length >= 3 ? updateAgentList(): ''"
                             v-on:keyup.enter="this.data.searchValues.keyword === '' ? updateAgentList() : ''">
                    </div>
                    <div class="col-sm-3">
                      <label for="filterLicensed" class="form-label">Licensed agents?</label>
                      <select class="form-select mb-2" aria-label="Licensed Agents?" id="filterLicensed" name="filterLicensed" v-model="this.data.searchValues.licensed" @change="updateRecipientsList">
                        <option value="1" selected>Both</option>
                        <option value="2">Yes</option>
                        <option value="3">No</option>
                      </select>
                    </div>
                    <div class="col-sm-3">
                      <label for="editLanguage" class="form-label">Language</label>
                      <select class="form-select mb-2" aria-label="Language" id="filterLanguage" name="filterLanguage" v-model="this.data.searchValues.language" @change="updateRecipientsList">
                        <option value="3" selected>Both</option>
                        <option value="1" selected>English</option>
                        <option value="2">Spanish</option>
                      </select>
                    </div>
                  </div>
                <div class="row" style="margin-bottom: 10px;">
                  <div class="col-sm-4">
                    <label for="editLanguage" class="form-label">Recipients List</label>
                    <select class="form-select mb-3" aria-label="Language" id="filterLanguage" name="filterLanguage" v-model="this.findAgents" @change="updateRecipientsList">
                      <option value="1" selected>Agents</option>
                      <option value="2">Clients</option>
                      <option value="3">Prospects</option>
                    </select>
                  </div>
                  <div class="col-sm-4">
                    <label for="filterStatus" class="form-label">Status</label>
                    <select class="form-select mb-2" aria-label="Status" id="filterStatus" v-model="this.data.searchValues.status" @change="updateRecipientsList">
                      <option value="0">All</option>
                      <option v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                    </select>
                  </div>
                  <div class="col-sm-4">
                    <label for="filterType" class="form-label">Type</label>
                    <select class="form-select mb-2" aria-label="Status" id="filterType" name="filterType" v-model="this.data.searchValues.type" @change="updateRecipientsList">
                      <option value="0">All</option>
                      <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="table-responsive" style="max-height: 500px;">
                  <table class="table align-middle table-nowrap mb-0">
                    <thead class="table-light">
                    <tr>
                      <th scope="col" style="width: 50px">
                        #
                      </th>
                      <th scope="col">Name</th>
                      <th scope="col">Status</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Department</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(data, index) of resultQuery" :key="index">
                      <td>
                        <div class="form-check">
                          <input class="form-check-input"
                                 type="checkbox"
                                 name="chk_child"
                                 value="option1">
                        </div>
                      </td>
                      <td class="id" style="display: none">
                        <a
                            href="javascript:void(0);"
                            class="fw-medium link-primary"
                        >{{ data.ID }}</a>
                      </td>
                      <td>{{ data.firstName }} {{ data.lastName }}</td>
                      <td><a href="javascript:void(0);" class="link-success">{{ data.statusName }}</a></td>
                      <td>{{ formatPhone(data.phoneNumber) }}</td>
                      <td>{{ data.departmentName }}</td>
                    </tr>
                    </tbody>
                  </table>
                  <div class="d-flex justify-content-end mt-3" v-if="resultQuery.length >= 0">
                    <button type="button" class="btn btn-soft-success custom-toggle active" data-bs-toggle="button" @click="addRecipients()" style="margin-right: 5px;">
                      <span class="icon-on">+ Recipient</span>
                    </button>
                    <div class="col-md-2" style="margin-top: 5px;">
                      <button
                          type="button"
                          id="dropdownMenuLink1"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          class="btn btn-soft-info"
                      >
                        <i class="ri-more-2-fill"></i>
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink1">
                        <li><a class="dropdown-item" href="#uploadRecipients" data-bs-toggle="modal">Upload Recipients</a></li>
                      </ul>
                    </div>
                    <div class="pagination-wrap hstack gap-2">
                      <a
                          class="page-item pagination-prev disabled"
                          href="#"
                          v-if="page !== 1"
                          @click="page--"
                      >
                        Previous
                      </a>
                      <ul class="pagination listjs-pagination mb-0">
                        <li
                            :class="{
                      active: pageNumber == page,
                      disabled: pageNumber == '...',
                    }"
                            v-for="(pageNumber, index) in pages.slice(
                      page - 1,
                      page + 5
                    )"
                            :key="index"
                            @click="page = pageNumber"
                        >
                          <a class="page" href="#">{{ pageNumber }}</a>
                        </li>
                      </ul>
                      <a
                          class="page-item pagination-next"
                          href="#"
                          @click="page++"
                          v-if="page < pages.length"
                      >
                        Next
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="align-middle ">
                <p><b style="font-size: 1.2em;">Remaining Messages: {{ availableMessages }}</b></p>
                <p><b style="font-size: 1.2em;">Number Of Recipients: {{ numberOfRecipents }}</b></p>
              </div>
              <div class="table-responsive" style="max-height: 500px;">
                <table class="table align-middle table-nowrap mb-0">
                  <thead class="table-light">
                  <tr>
                    <th scope="col" style="width: 50px">
                      #
                    </th>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Department</th>
                    <th scope="col">Remove</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(data, index) of reciepientList" :key="index">
                    <td>
                      <div class="form-check">
                        <input class="form-check-input"
                               type="checkbox"
                               name="chk_child"
                               value="option1">
                      </div>
                    </td>
                    <td class="id" style="display: none">
                      <a
                          href="javascript:void(0);"
                          class="fw-medium link-primary"
                      >{{ data.ID }}</a>
                    </td>
                    <td>{{ data.firstName }} {{ data.lastName }}</td>
                    <td><a href="javascript:void(0);" class="link-success">{{ data.statusName }}</a></td>
                    <td>{{ formatPhone(data.phoneNumber) }}</td>
                    <td>{{ data.departmentName }}</td>
                    <td>
                      <b-button variant="danger" class="btn-icon waves-effect waves-light" size="sm" @click="removeRecipient(index)">
                        <i class="ri-delete-bin-5-line"></i>
                      </b-button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" @click="scheduleMessage()">Scheduled</button>
          </div>

        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!-- Upload Prospects Modal -->
    <b-modal id="uploadRecipients" title="Fullscreen | Upload Clients" class="v-modal-custom" fullscreen>
      <div class="row">
        <div class="col-lg-12">
          <form>
            <!-- end card -->

            <div class="card">
              <div class="card-body">
                <div class="vstack gap-2">
                  <h5 class="fs-14 mb-1">Upload Your Recipients List</h5>
                  <h6> <span style="color:red; font-size: 0.7em;">Please, upload a .csv file or convert the .xls/.xlsx to .csv</span></h6>
                  <input class="form-control" id="listFile" type="file"
                         accept="text/csv" @change="selectedFile"/>
                  <div class="row">
                    <div class="col-lg-3">
                      <label for="editLanguage" class="form-label">Language</label>
                      <select class="form-select mb-2" aria-label="Language" id="uploadLanguage" name="uploadLanguage" v-model="uploadLanguage">
                        <option value="0">...</option>
                        <option value="1">English</option>
                        <option value="2">Spanish</option>
                      </select>
                    </div>
                  </div>
                  <div class="border rounded" v-for="(file, index) of files" :key="index">
                    <div class="d-flex align-items-center p-2">
                      <div class="flex-grow-1">
                        <div class="pt-1">
                          <h5 class="fs-14 mb-1" data-dz-name="">
                            {{ file.name }}
                          </h5>
                          <p class="fs-13 text-muted mb-0" data-dz-size="">
                            <strong>{{ file.size / 1024 }}</strong> KB
                          </p>
                          <strong class="error text-danger" data-dz-errormessage=""></strong>
                        </div>
                      </div>
                      <div class="flex-shrink-0 ms-3">
                        <button data-dz-remove="" class="btn btn-sm btn-danger" @click="deleteRecord">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="text-end mb-3">
                    <button type="button" class="btn btn-success w-sm" @click="handleFileUpload">Process File</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- end card -->
          </form>
        </div>
        <!-- end col -->

        <div class="card">
          <div class="card-body">

            <!-- Tables Border Colors -->
            <table class="table table-bordered border-secondary table-nowrap" v-if="parsed">
              <thead>
              <tr>
                <th scope="col">
                  ID
                </th>
                <th v-for="(header, key) in content.meta.fields"
                    v-bind:key="'header-'+key" scope="col">{{ header }}
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, rowKey) in content.data"
                  v-bind:key="'row-'+rowKey">
                <td>
                  <b>{{ (rowKey+1) }}</b>
                </td>
                <td v-for="(column, columnKey) in content.meta.fields"
                    v-bind:key="'row-'+rowKey+'-column-'+columnKey">
                  {{ content.data[rowKey][column] }}
                </td>
              </tr>
              </tbody>
            </table>

          </div>
        </div>
        <div class="text-end mb-3">
          <button type="button" class="btn btn-light" id="closeListModal" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-success w-sm" @click="addRecipientsFromFile">Add to recipients list</button>
        </div>
      </div>
    </b-modal>

  </Layout>
</template>
