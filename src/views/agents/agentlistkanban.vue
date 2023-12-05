<script>
import flatPickr from "vue-flatpickr-component";
import Multiselect from "@vueform/multiselect";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import "@vueform/multiselect/themes/default.scss";

// components
import notes from '../../components/users/notes';
import kanbanBoard from '../../components/users/kanbanBoard';
import messages from '../../components/users/messages';
import attachments from '../../components/users/attachements';
import jwt_decode from "jwt-decode";

export default {
  page: {
    title: "Agents List cards",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
    flatPickr,
    notes,
    kanbanBoard,
    messages,
    attachments
  },
  data() {
    return {
      title: "Agent List Cards",
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
        // dateFormat: "m-d-y H:i"
        dateFormat: "F j, Y H:i K"
      },
      list: [],
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          isActive: 1,
          noteSearch: '',
          status: 0,
          keyword: '',
          licensed: 1,
          language: 3,
          sortBy: 'name',
          orderBy: 'ASC',
          dateRange: 0,
          department: '0' ,
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
        }
      },
      agentData: [],
      date: null,
      departmentList: {},
      statusList: {},
      sourcesList: {},
      enabled: true,
      dragging: false,
      chatMessagesData: [],
      chatMessages: []
    };
  },
  setup() {
    return { v$: useVuelidate() }
  },
  methods: {
    async getAgentList() {
      await axios
          .post('/api/listUserByStatus', this.data)
          .then(response => {
            this.list = []
            this.list = response.data
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
    },
    filterList: function (list, search) {
      var result = '';
      result = list.filter(listSearch => listSearch.statusID === search);
      Object.keys(result).map(function (objectKey) {
        var value = result[objectKey];
        return value;
      });
    },
    formatDate: function (date, format) {
      date = moment(date).format(format);
      return date;
    },
    showTabs: function (id) {

      const tabs = ['mainTab', 'secondTab', 'thirdTab', 'quarterTab']
      let actualSelected = document.getElementsByClassName('active');
      actualSelected = actualSelected[2].id

      for (var index in tabs) {
        let attr = tabs[index];

        const faqToggle = document.getElementById(attr);
        if (faqToggle.classList.contains('active') && id !== actualSelected) {

          faqToggle.classList.remove('active');
          faqToggle.classList.remove('show');

          const updateButton = document.getElementById('updateButton');

          if (updateButton.classList.contains('hide') && id === tabs[0]) {
            updateButton.classList.remove('hide');
          }

        } else if (attr === id) {

          if (!faqToggle.classList.contains('active')) {
            faqToggle.classList.add('active');
            faqToggle.classList.add('show');
          }

          const updateButton = document.getElementById('updateButton');

          if (!updateButton.classList.contains('hide') && id !== tabs[0]) {
            updateButton.classList.add('hide');
          }
        }
      }
    },
    resetAgentData: function () {
      this.agentData =
          {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            language: '',
            status: '',
            phone: '',
            department: '',
            state: '',
            birthDate: '',
            address: '',
            country: '',
            zipCode: '',
            interview: '',
            agentNumber: '',
            createdBy: '',
            insuranceLicense: '',
            licenseNumber: ''
          }
    },
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    validPhone: function (phone) {
      var isphone = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
      return isphone;
    },
    async updateAgentStatus(item, newList, oldList, agentID) {

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
    },
    async updateAgent() {

      this.errors = []

      if (!document.getElementById('editEmail').value) {
        this.errors.push('Email is required.');
      } else if (!this.validEmail(document.getElementById('editEmail').value)) {
        this.errors.push('Valid email is required.');
      }

      if (!document.getElementById('editFirstName').value) {
        this.errors.push('First Name is required.');
      }

      if (!document.getElementById('editLastName').value) {
        this.errors.push('Last Name is required.');
      }

      if (!document.getElementById('editLanguage').value) {
        this.errors.push('Language is required.');
      }

      if (!document.getElementById('editStatus').value) {
        this.errors.push('Status is required.');
      }

      if (!document.getElementById('editPhoneNumber').value) {
        this.errors.push('Phone is required.');
      }

      if (this.validPhone(document.getElementById('editPhoneNumber').value) === false && document.getElementById('editPhoneNumber').value !== '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!document.getElementById('editDepartment').value) {
        this.errors.push('Department is required.');
      }

      if (!document.getElementById('editBirthDate').value) {
        this.errors.push('Birth date is required.');
      }

      if (!document.getElementById('editAddress').value) {
        this.errors.push('Address is required.');
      }

      if (!document.getElementById('editAgentNumber').value && document.getElementById('editStatus').value === 5) {
        this.errors.push('Agent Number is required.');
      }

      if ((!document.getElementById('editLicensed').value && document.getElementById('editStatus').value === 5) || !document.getElementById('editLicensed').value) {
        this.errors.push('Insurance Licensed? is required.');
      }

      if ((!document.getElementById('editLicensed').value && document.getElementById('editStatus').value === 5) || (!this.agentData.licenseNumber && document.getElementById('editLicensed').value === 1)) {
        this.errors.push('License number is required.');
      }

      if (!this.errors.length) {
        const data = {
          username: '',
          email: document.getElementById('editEmail').value.toLowerCase(),
          firstName: document.getElementById('editFirstName').value,
          lastName: document.getElementById('editLastName').value,
          language: document.getElementById('editLanguage').value,
          status: document.getElementById('editStatus').value,
          phoneNumber: document.getElementById('editPhoneNumber').value,
          departmentID: document.getElementById('editDepartment').value,
          state: document.getElementById('editState').value,
          city: document.getElementById('editCity').value,
          birthDate: document.getElementById('editBirthDate').value,
          address: document.getElementById('editAddress').value,
          country: document.getElementById('editCountry').value,
          postalCode: document.getElementById('editPostalCode').value,
          interviewDate: document.getElementById('editInterview').value,
          agentNumber: document.getElementById('editAgentNumber').value,
          createdBy: localStorage.getItem('email'),
          isLicensed: document.getElementById('editLicensed').value,
          licenseNumber: this.agentData.licenseNumber,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          agentID: localStorage.getItem('selectedUser')
        }

        await axios
            .put('/api/updateAgent', data)
            .then(async response => {
              if (response) {
                // document.getElementById('close-modal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Agent update successfully!'
                });
              }
            })
            .catch(async error => {
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
    async createAgent() {
      this.errors = []

      if (!this.agentData.email) {
        this.errors.push('Email is required.');
      } else if (!this.validEmail(this.agentData.email)) {
        this.errors.push('Valid email is required.');
      }

      if (!this.agentData.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.agentData.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.agentData.language) {
        this.errors.push('Language is required.');
      }

      if (!this.agentData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.agentData.phone) {
        this.errors.push('Phone is required.');
      }

      if(this.validPhone(this.agentData.phone) === false && this.agentData.phone !== ''){
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.agentData.department) {
        this.errors.push('Department is required.');
      }

      if (!this.agentData.birthDate) {
        this.errors.push('Birth date is required.');
      }

      if (!this.agentData.address) {
        this.errors.push('Address is required.');
      }

      if (!this.agentData.agentNumber && this.agentData.status === 5) {
        this.errors.push('Agent Number is required.');
      }

      if ((!this.agentData.insuranceLicense && this.agentData.status === 5) || !this.agentData.insuranceLicense) {
        this.errors.push('is Insurance Licensed? is required.');
      }

      if ((!this.agentData.licenseNumber && this.agentData.status === 5) || (!this.agentData.licenseNumber && this.agentData.insuranceLicense === 1)) {
        this.errors.push('License number is required.');
      }

      if(!this.errors.length) {
        const data = {
          username:  '',
          email:  this.agentData.email.toLowerCase(),
          firstName:  this.agentData.firstName,
          lastName:  this.agentData.lastName,
          language:  this.agentData.language,
          status:  this.agentData.status,
          phoneNumber:  this.agentData.phone,
          departmentID:  this.agentData.department,
          state:  this.agentData.state,
          city:  this.agentData.city,
          birthDate:  this.formatDate(this.agentData.birthDate, 'YYYY-MM-DD'),
          address:  this.agentData.address,
          country:  this.agentData.country,
          postalCode:  this.agentData.zipCode,
          interviewDate:  this.agentData.interview,
          agentNumber:  this.agentData.agentNumber,
          createdBy:  localStorage.getItem('email'),
          isLicensed:  this.agentData.insuranceLicense,
          licenseNumber: this.agentData.licenseNumber,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id')
        }

        await axios
            .post('/api/createAgent', data)
            .then(async response => {
              document.getElementById("addform").reset();
              if (response.data['ID'] !== null) {
                document.getElementById('closemodal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Agent created successfully!'
                });
              }
            })
            .catch(async error => {
              if (error.response) {
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
          list += '\n' + '<b>' + this.errors[i]+ '</b>';

        await Swal.fire({
          title: "Please complete the form! " + list,
          icon: 'warning',
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }
    },
    async deleteAgent() {

      const data = {
        token: localStorage.getItem('jwt'),
        userID: localStorage.getItem('id'),
        userName: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastname'),
        userEmail: localStorage.getItem('email'),
        agentID: localStorage.getItem('selectedUser')
      }

      Swal.fire({
        title: 'Do you want to <b>Delete</b> this agent?',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then(async (result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          await axios
              .put('/api/deleteUser', data)
              .then(async response => {
                if (response) {
                  // document.getElementById('close-modal').click();

                  await Swal.fire('Agent update successfully!', '', 'success');
                }
              })
              .catch(async error => {
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
        } else if (result.isDenied) {
          await Swal.fire('Agent wasn\'t updated!', '', 'info');
        }
      })
    },
    setAgentData(agentInfo){

      this.agentData.email=agentInfo.email;
      this.agentData.firstName=agentInfo.firstName;
      this.agentData.lastName=agentInfo.lastName;
      this.agentData.language=agentInfo.language;
      this.agentData.status=agentInfo.status
      this.agentData.phone=agentInfo.phoneNumber;
      this.agentData.department=agentInfo.departmentID
      this.agentData.birthDate= this.formatDate(agentInfo.dateOfBirth, 'DD MMM, YYYY');
      this.agentData.interview= this.formatDate(agentInfo.interviewDate, 'MMMM D, YYYY h:mm A');
      this.agentData.address=agentInfo.address;
      this.agentData.state=agentInfo.state;
      this.agentData.city=agentInfo.city;
      this.agentData.country=agentInfo.country;
      this.agentData.zipCode=agentInfo.postalCode;
      this.agentData.agentNumber=agentInfo.agentNumber;
      this.agentData.createdBy=agentInfo.createdBy;
      this.agentData.insuranceLicense=agentInfo.isLicensed;
      this.agentData.licenseNumber=agentInfo.licenseNumber;
      this.getMapsLink()
      localStorage.setItem('selectedUserName', agentInfo.firstName +' '+ agentInfo.lastName)
    },
    setMessagesInfo(messages){
      this.chatMessages= messages;
    },
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
     * Char form Submit
     */
    formSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      this.v$.$touch();

      if (this.v$.$invalid) {
        return;
      } else {
        const message = this.form.message;
        const currentDate = new Date();
        this.chatMessagesData.push({
          align: "right",
          name: "Henry Wells",
          message,
          time: currentDate.getHours() + ":" + currentDate.getMinutes(),
        });
      }
      this.submitted = false;
      this.form = {};
    },
    addNewAgentModal() {
      this.resetAgentData()
      document.getElementById("addform").reset();
      document.getElementById('agentModalLabelAdd').innerHTML="Add Agent";
    },
    printEmit(notify) {
      this.chatMessagesData = notify;
    },
    async updateAgentList() {

      let validate = true;
      let errors = [];
      let filterLanguage = document.getElementById("filterLanguage").value;
      let filterKeyword = document.getElementById("filterKeyword").value;
      let filterLicensed = document.getElementById("filterLicensed").value;
      let filterNotes = document.getElementById("filterNotes").value;
      let filterFromDate = document.getElementById("filterFromDate").value;
      let filterToDate = document.getElementById("filterToDate").value;
      let isActive = document.querySelector('#isActive').checked;

      if(isActive === true) {
        this.data.searchValues.isActive = 1
      } else {
        this.data.searchValues.isActive = 2
      }

      if (filterLanguage !== '' && (filterLanguage === '1' || filterLanguage === '2')){
        this.data.searchValues.language = filterLanguage;
      }

      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.data.searchValues.keyword = filterKeyword;
      } else if (filterKeyword !== '' && filterKeyword.length < 3) {
        errors.push('Keyword search should have 3 or more characters!')
        validate = false;
      }

      if(filterLicensed !== ''){
        this.data.searchValues.licensed = filterLicensed;
      }

      if (filterNotes !== '' && filterNotes.length >= 3) {
        this.data.searchValues.noteSearch = filterNotes;
      }else if(filterNotes !== '' && filterNotes.length < 3) {
        errors.push('Notes search should have 3 or more characters!')
        validate = false;
      }

      var start = moment(this.formatDate(filterFromDate, 'YYYY-MM-DD'));
      var end = moment(this.formatDate(filterToDate, 'YYYY-MM-DD'));
      var days = end.diff(start, "days");

      if(days <= 365){
        this.data.searchValues.fromDate = filterFromDate;
        this.data.searchValues.toDate = filterToDate;
      } else {
        errors.push("From Date and To Date (range) couldn't be larger than a year (365 days)!");
        validate = false;
      }

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        searchValues: this.data.searchValues,
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
      }

      if(validate){
        axios
            .post('/api/listUserByStatus', data)
            .then(response => {
              this.list = []

              for (let i = 0; i < 10; i++) {
                var varName = []
                varName = response.data[i].statusName.replace(/\s+/g, '-').toLowerCase();
                this.varName = response.data[i].content;
                this.varName['groupName'] = {
                  'groupName': varName,
                  'statusName': response.data[i].statusName,
                  'groupID': response.data[i].statusID,
                  'sequence': 1,
                  'quantity': response.data[i].content.length,
                  'perPage': 30,
                  'showing': (response.data[i].content.length < 30 ? response.data[i].content.length: 30),
                };
                this.list.push(this.varName);
              }
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
                console.log(error.message)
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
    handleFocus(e){
      e.target.setAttribute("autocomplete", "nope");
    },
    viewUserGroup(request) {
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.userGroup.includes(request)
    },
    getMapsLink(){
      let link = 'https://maps.google.com/?q='
      let agentData = this.agentData;
      if (agentData.address.length > 0){
        link += '+'+this.clientData.address
      }
      if (agentData.zipCode.length > 0){
        link += '+'+agentData.zipCode
      }
      if (agentData.city.length > 0){
        link += '+'+agentData.city
      }
      if (agentData.state.length > 0){
        link += '+'+agentData.state
      }

      if(link !== 'https://maps.google.com/?q=') {
        document.getElementById("gMapsLink").href = link;
      } else {
        document.getElementById("gMapsLink").href = '#';
      }

    },
    async getNotes (id = localStorage.getItem('selectedUser')) {
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
            this.chatMessagesData = response.data;
            // this.$emit('onFire', response.data)
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
  },
  validations: {
    form: {
      message: {
        required: helpers.withMessage("Message is required", required),
      },
    },
  },
  async mounted() {

    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: this.data.searchValues,
    }

    await axios
        .post('/api/listDepartments', data)
        .then(response => {
          this.departmentList = response.data
        })
        .catch(error => {
          if (error.response) {

            if(error.response.data.detail === 'Your session is expired!'){
              this.$router.push('logout')
            }

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

            if(error.response.data.detail === 'Your session is expired!'){
              this.$router.push('logout')
            }

            Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
          }
        })

    await axios
        .post('/api/listSource', data)
        .then(response => {
          this.sourcesList = response.data
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
        .post('/api/listUserByStatus', data)
        // .post('/api/listAgents', data)
        .then(response => {
          this.list = []

          for (let i = 0; i < 10; i++) {
            var varName = []
            varName = response.data[i].statusName.replace(/\s+/g, '-').toLowerCase();
            this.varName = response.data[i].content;
            this.varName['groupName'] = {
              'groupName': varName,
              'statusName': response.data[i].statusName,
              'groupID': response.data[i].statusID,
              'sequence': 1,
              'quantity': response.data[i].content.length,
              'perPage': 30,
              'showing': (response.data[i].content.length < 30 ? response.data[i].content.length: 30),
            };
            this.list.push(this.varName);
          }
          // console.log(this.list.find(o => o.groupName.groupName === 'prospect'))
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
  },
};
</script>
<style>
.listProperties {
  min-height: 30%;
}

.moveCard {
  cursor: default;
}

.grayIcon {
  color: #6b778c;
}

.eyeIcon {
  margin: 5px;
  max-width: 30px;
}

.hide {
  transition: 0.01s;
  transform: translateX(-9999px);
}

.card-body {
  flex: 1 1 auto;
  padding: 1rem 0.5rem;
}

#tab td {
  vertical-align: top;
}

.side-buttons {
  width: 100%;
  text-align: left !important;
}

.window-sidebar {
  float: right;
  overflow: hidden;
  padding: 0 16px 8px 8px;
  width: calc(100% - 600px);
  z-index: 10;
}

.window-module {
  clear: both;
  margin-bottom: 24px;
  position: relative;
}

.window-module {
  clear: both;
  margin-bottom: 24px;
  position: relative;
  padding-right: 5px;
}

.u-clearfix:after {
  clear: both;
  content: "";
  display: table
}

.window-sidebar h3.mod-no-top-margin {
  margin-top: 0;
}

.window-sidebar h3 {
  color: #5e6c84;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  margin-bottom: -4px;
  margin-top: 16px;
}

.button-link:hover {
  background-color: #091e4214;
  border: none;
  box-shadow: none;
}

.button-link {
  background-color: #091e420a;
  border: none;
  border-radius: 3px;
  box-shadow: none;
  box-sizing: border-box;
  cursor: pointer;
  display: block;
  height: 32px;
  margin-top: 8px;
  max-width: 300px;
  overflow: hidden;
  padding: 6px 12px !important;
  position: relative;
  text-decoration: none;
  text-overflow: ellipsis;
  transition-duration: 85ms;
  transition-property: background-color, border-color, box-shadow;
  transition-timing-function: ease;
  -webkit-user-select: none;
  user-select: none;
  white-space: nowrap;
}

.icon-lg, .icon-md, .icon-sm {
  color: #e30000;
}

.icon-sm {
  font-size: 16px;
  height: 20px;
  line-height: 20px;
  width: 20px;
}

.icon-lg, .icon-md, .icon-sm {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: inline-block;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  vertical-align: bottom;
}

.js-sidebar-action-text {
  color: #7c7979;
}

div.u-clearfix > a > i {
  color: #7c7979;
}

.tab-content {
  padding: 10px;
}

.chat-conversation {
  height: calc(100vh - 500px) !important;
}

</style>

<template>
  <Layout>
    <PageHeader :title="title" :items="items"/>
    <div class="card">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="search-box">
              <input type="text" class="form-control search"
                     placeholder="Search for agents..."
                     title="Search by (Phone number, City, Postal code, Name, Last name, Full Name, Address, State)"
                     v-model="this.data.searchValues.keyword"
                     @change="this.data.searchValues.keyword.length >= 3 ? updateAgentList(): ''"
                     v-on:keyup.enter="this.data.searchValues.keyword === '' ? updateAgentList(): ''">
              <i class="ri-search-line search-icon"></i>
            </div>
          </div><!--end col-->
          <div class="col-md-auto ms-auto">
            <div class="d-flex hastck gap-2 flex-wrap">
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted flex-shrink-0">Sort by: </span>

                <Multiselect class="form-control"
                             style="width:150px;padding: 0px;"
                             autocomplete="off"
                             @focus="handleFocus"
                             v-model="this.data.searchValues.sortBy"
                             :close-on-select="true"
                             :searchable="true"
                             :options="[
                            { value: 'name', label: 'Name' },
                            { value: 'lastName', label: 'Last Name' },
                            { value: 'postalCode', label: 'Postal Code' },
                            { value: 'modified', label: 'Modified On' },
                            { value: 'created', label: 'created On' },
                            ]"
                 @select="updateAgentList()"
                />

              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted flex-shrink-0">Order by: </span>

                <Multiselect class="form-control"
                             style="width:150px;padding: 0px;"
                             v-model="this.data.searchValues.orderBy"
                             autocomplete="off"
                             @focus="handleFocus"
                             :close-on-select="true"
                             :searchable="true"
                             :options="[
                            { value: 'ASC', label: 'Ascendance' },
                            { value: 'DESC', label: 'Descendant' },
                            ]"
                 @select="updateAgentList()"
                />

              </div>
              <button type="button" class="btn btn-soft-success add-btn" href="#open-filters" data-bs-toggle="modal">
                <i class="ri-filter-line align-bottom me-1"></i> Filters
              </button>
              <button type="button" class="btn btn-soft-success add-btn" id="create-btn" data-bs-toggle="modal" href="#agentModalAdd" @click="addNewAgentModal">
                <i class="ri-add-line align-bottom me-1"></i> Add Agent
              </button>
              <div class="dropdown">
                <button class="btn btn-soft-secondary btn-icon fs-14" type="button" id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="ri-settings-4-line"></i>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li><a class="dropdown-item" href="#">Copy</a></li>
                  <li><a class="dropdown-item" href="#">Move to pipline</a></li>
                  <li><a class="dropdown-item" href="#">Add to exceptions</a></li>
                  <li><a class="dropdown-item" href="#">Switch to common form view</a></li>
                  <li><a class="dropdown-item" href="#">Reset form view to default</a></li>
                </ul>
              </div>
            </div>
          </div><!--end col-->
        </div><!--end row-->
      </div>
    </div><!--end card-->

    <kanbanBoard :list="list" @onFire="printEmit" @userData="setAgentData" @setMessages="setMessagesInfo"/>

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
            <div class="row">
              <div class="col-lg-6">
                <label for="filterDateRange" class="form-label">Time Range</label>
                <select class="form-select mb-2" id="filterDateRange" name="filterDateRange" v-model="this.data.searchValues.dateRange">
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
                            v-model="this.data.searchValues.department">
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
            <button type="button" class="btn btn-primary" @click="updateAgentList()">Search</button>
          </div>

        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal fade zoomIn" id="agentModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0">
          <div class="modal-header p-3 bg-soft-info">
            <h5 class="modal-title" id="exampleModalLabel">Agent Card</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    id="close-modal"></button>
          </div>
          <div class="row">
            <div class="col-md-9">
              <div class="tab-content">
                <p class="text-muted mb-4">
                  is in List <a href="#"><span style="text-decoration: underline;"> NEW AGENT </span></a>
                </p>
                <div
                    class="tab-pane fade show active"
                    id="mainTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-info-tab"
                >

                  <div>
                    <form @submit.prevent="">
                      <div class="modal-body">
                        <input type="hidden" id="id"/>
                        <div class="row g-3">
                          <div class="col-lg-12">
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editEmail" class="form-label">Email</label>
                                <input type="text" id="editEmail" class="form-control mb-2" placeholder="Enter Email"
                                       v-model="agentData.email" required>
                              </div>
                              <div class="col-lg-6">
                                <label for="editCreatedBy" class="form-label">Created By</label>
                                <input type="text" id="editCreatedBy" class="form-control mb-2" disabled
                                       v-model="this.agentData.createdBy">
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editFirstName" class="form-label">First Name</label>
                                <input type="text" id="editFirstName" class="form-control mb-2"
                                       placeholder="Enter First Name" v-model="this.agentData.firstName" required>
                              </div>
                              <div class="col-lg-6">
                                <label for="editLastName" class="form-label">Last Name</label>
                                <input type="text" id="editLastName" class="form-control mb-2"
                                       placeholder="Enter Last Name" v-model="this.agentData.lastName" required>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editLanguage" class="form-label">Language</label>
                                <select class="form-select mb-2" aria-label="Language" id="editLanguage"
                                        v-model="this.agentData.language" required>
                                  <option value="1" selected>English</option>
                                  <option value="2">Spanish</option>
                                </select>
                              </div>
                              <div class="col-lg-6">
                                <label for="editStatus" class="form-label">Status</label>
                                <select class="form-select mb-2" aria-label="Status" id="editStatus"
                                        v-model="this.agentData.status">
                                  <option v-bind:style="(!viewUserGroup('SUPER_ADMIN_GROUP') && status.statusID === 9)? 'display: none;' : ''" v-for="(status, statusIndex) of statusList" :key="statusIndex"
                                          v-bind:value="status.statusID">{{ status.name }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editPhoneNumber" class="form-label">Phone</label>
                                <input type="text" id="editPhoneNumber" class="form-control mb-2"
                                       placeholder="Phone number" required v-model="this.agentData.phone"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editDepartment" class="form-label">Department</label>
                                <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                                        v-model="this.agentData.department" v-if="(departmentList.length > 1)">
                                  <option v-for="(department, index) of departmentList"  :key="index"
                                          v-bind:value="department.departmentID">{{ department.name }}
                                  </option>
                                </select>
                                <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                                        v-model="this.agentData.department" v-else>
                                  <option v-bind:value="departmentList.departmentID">{{ departmentList.name }}</option>
                                </select>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editAddress" class="form-label">Address</label>
                                <input type="text" id="editAddress" class="form-control mb-2"
                                       placeholder="Enter Address" required v-model="this.agentData.address"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editBirthDate" class="form-label mb-2">Birth Date</label>
                                <flat-pickr
                                    placeholder="Select Birth Date"
                                    v-model="this.agentData.birthDate"
                                    :config="timeConfig"
                                    class="form-control flatpickr-input"
                                    id="editBirthDate"></flat-pickr>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-3">
                                <label for="editCity" class="form-label">City</label>
                                <input type="text" id="editCity" class="form-control mb-2" placeholder="Enter City"
                                       required v-model="this.agentData.city"/>
                              </div>
                              <div class="col-lg-3">
                                <label for="editState" class="form-label">State</label>
                                <input type="text" id="editState" class="form-control mb-2" placeholder="Enter State"
                                       required v-model="this.agentData.state"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editCountry" class="form-label">Country</label>
                                <input type="text" id="editCountry" class="form-control mb-2"
                                       placeholder="Enter Country" required v-model="this.agentData.country"/>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editPostalCode" class="form-label">Postal code</label>
                                <input type="text" id="editPostalCode" class="form-control mb-2"
                                       placeholder="Enter Address" required v-model="this.agentData.zipCode"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editInterview" class="form-label mb-2">Interview</label>
                                <flat-pickr
                                    v-model="this.agentData.interview"
                                    :config="dateTimeConfig"
                                    id="editInterview"
                                    class="form-control"
                                    data-provider="timepickr"
                                    data-time-hrs="true"
                                ></flat-pickr>
<!--                                <flat-pickr-->
<!--                                    placeholder="Select Interview date/time"-->
<!--                                    v-model="this.agentData.interview"-->
<!--                                    :config="dateTimeConfig"-->
<!--                                    class="form-control flatpickr-input"-->
<!--                                    id="editInterview"-->
<!--                                    data-enable-time-->
<!--                                    data-provider="timepickr"-->
<!--                                    data-time-hrs="true"></flat-pickr>-->
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-4">
                                <label for="editLicensed" class="form-label">Insurance Licensed?</label>
                                <select class="form-select mb-2" aria-label="Department" id="editLicensed"
                                        v-model="this.agentData.insuranceLicense">
                                  <option value="0">No</option>
                                  <option value="1">Yes</option>
                                </select>
                              </div>
                              <div class="col-lg-4">
                                <label for="editAgentNumber" class="form-label">License Number</label>
                                <input type="text" id="editLicenseNumber" class="form-control mb-2" placeholder="Enter Agent Number" required v-model="this.agentData.licenseNumber"/>
                              </div>
                              <div class="col-lg-4">
                                <label for="editAgentNumber" class="form-label">Agent Number</label>
                                <input type="text" id="editAgentNumber" class="form-control mb-2"
                                       placeholder="Enter Agent Number" required v-model="this.agentData.agentNumber"/>
                              </div>
                            </div>
                          </div>
                          <!--end col-->
                        </div>
                        <!--end row-->
                      </div>
                    </form>
                  </div>
                </div>
                <!-- end tab pane -->
                <div
                    class="tab-pane fade"
                    id="secondTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-info-tab">

                    <notes :dataList="chatMessagesData" @onFire="getNotes()"> </notes>

                  <!-- end chat-wrapper -->
                </div>
                <!-- end tab pane -->

                <div
                    class="tab-pane fade"
                    id="thirdTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-info-tab"
                    style="max-height: 600px;"
                >
                  <!-- comm/getSMSConversation -->
                  <messages :dataList="chatMessages"></messages>

                </div>
                <!-- end tab pane -->

                <div
                    class="tab-pane fade"
                    id="quarterTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-address-tab"
                    style="height: 600px;"
                >
                  <attachments></attachments>
                </div>
                <!-- end tab pane -->

              </div>
              <!-- end tab content -->
            </div>
            <div class="col-md-3 window-sidebar ">
              <div class="window-module" style="margin-top: 10px;">
                <h3 class="mod-no-top-margin js-sidebar-add-heading">Options</h3>
                <div class="window-module">
                  <div class="u-clearfix">
                    <a class="button-link js-change-card-members" href="#" title="Information"
                       @click="showTabs('mainTab')">
                      <i class="ri-calendar-2-fill align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Information</span>
                    </a>
                    <a class="button-link js-edit-labels" href="#" title="Notes" @click="showTabs('secondTab')">
                      <i class="ri-sticky-note-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Notes</span>
                    </a>
                    <a class="button-link js-edit-labels" href="#" title="Messages" @click="showTabs('thirdTab')">
                      <i class="ri-message-2-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Messages</span>
                    </a>
                    <a class="button-link js-edit-labels" href="#" title="Attachements" @click="showTabs('quarterTab')">
                      <i class="ri-attachment-2 align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Attachements</span>
                    </a>
                    <a class="button-link js-add-checklist-menu" href="#" title="Checklist" @click="deleteAgent">
                      <i class="ri-delete-bin-2-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Delete</span>
                    </a>
                  </div>
                </div>
              </div>
              <br>
              <div class="window-module">
                <h3 class="mod-no-top-margin js-sidebar-add-heading">Actions</h3>
                <div class="window-module">
                  <div class="u-clearfix">
                    <a class="button-link js-change-card-members" href="#" title="Move">
                      <i class="ri-drag-move-2-fill align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Move</span>
                    </a>
                    <a class="button-link js-edit-labels" href="#" title="Share">
                      <i class="ri-share-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Share</span>
                    </a>
                    <a class="button-link js-edit-labels" href="#" title="Share">
                      <i class="ri-file-transfer-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Transfer</span>
                    </a>
                    <a class="button-link js-change-card-members" href="#" title="Update" id="updateButton"
                       @click="updateAgent" style="background-color: #2abb52;">
                      <i class="ri-save-3-line align-bottom me-1" style="color:white;"></i>
                      <span class="js-sidebar-action-text" style="color:white;">Save</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--  Add agent modal  -->
    <div class="modal zoomIn" id="agentModalAdd" tabindex="-1" aria-labelledby="agentModalLabel" aria-hidden="true" data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 1000px;">
        <div class="modal-content">
          <div class="modal-header bg-light p-3">
            <h5 class="modal-title" id="agentModalLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    id="close-modal"></button>
          </div>
          <form id="addform" @submit.prevent="">
            <div class="modal-body">
              <input type="hidden" id="id"/>
              <div class="row g-3">
                <div class="col-lg-12">
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editEmail" class="form-label">Email</label>
                      <input type="text" id="editEmail" class="form-control mb-2" placeholder="Enter Email" v-model="agentData.email" required>
                    </div>
                    <div class="col-lg-6">
                      <label for="editCreatedBy" class="form-label">Created By</label>
                      <input type="text" id="editCreatedBy" class="form-control mb-2" disabled v-model="this.agentData.createdBy">
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editFirstName" class="form-label">First Name</label>
                      <input type="text" id="editFirstName" class="form-control mb-2" placeholder="Enter First Name" v-model="this.agentData.firstName" required>
                    </div>
                    <div class="col-lg-6">
                      <label for="editLastName" class="form-label">Last Name</label>
                      <input type="text" id="editLastName" class="form-control mb-2" placeholder="Enter Last Name" v-model="this.agentData.lastName" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editLanguage" class="form-label">Language</label>
                      <select class="form-select mb-2" aria-label="Language" id="editLanguage" v-model="this.agentData.language" required>
                        <option value="1" selected>English</option>
                        <option value="2">Spanish</option>
                      </select>
                    </div>
                    <div class="col-lg-6">
                      <label for="editStatus" class="form-label">Status</label>
                      <select class="form-select mb-2" aria-label="Status" id="editStatus" v-model="this.agentData.status">
                        <option v-bind:style="(!viewUserGroup('SUPER_ADMIN_GROUP') && status.statusID === 9)? 'display: none;' : ''" v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editPhoneNumber" class="form-label">Phone</label>
                      <input type="text" id="editPhoneNumber" class="form-control mb-2" placeholder="Phone number" required v-model="this.agentData.phone"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editDepartment" class="form-label">Department</label>
                      <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                              v-model="this.agentData.department" v-if="(departmentList.length > 1)">
                        <option v-for="(department, index) of departmentList"  :key="index"
                                v-bind:value="department.departmentID">{{ department.name }}
                        </option>
                      </select>
                      <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                              v-model="this.agentData.department" v-else>
                        <option v-bind:value="departmentList.departmentID">{{ departmentList.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editAddress" class="form-label">Address</label>&nbsp;<code><a href="#" target="_blank" id="gMapsLink">Google Maps</a></code>
                      <input type="text" id="editAddress" class="form-control mb-2" placeholder="Enter Address" required v-model="this.agentData.address"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editBirthDate" class="form-label mb-2">Birth Date</label>
                      <flat-pickr
                          placeholder="Select Birth Date"
                          v-model="this.agentData.birthDate"
                          :config="timeConfig"
                          class="form-control flatpickr-input"
                          id="editBirthDate"></flat-pickr>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-3">
                      <label for="editCity" class="form-label">City</label>
                      <input type="text" id="editCity" class="form-control mb-2" placeholder="Enter City" required v-model="this.agentData.city"/>
                    </div>
                    <div class="col-lg-3">
                      <label for="editState" class="form-label">State</label>
                      <input type="text" id="editState" class="form-control mb-2" placeholder="Enter State" required v-model="this.agentData.state"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editCountry" class="form-label">Country</label>
                      <input type="text" id="editCountry" class="form-control mb-2" placeholder="Enter Country" required v-model="this.agentData.country"/>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editPostalCode" class="form-label">Postal code</label>
                      <input type="text" id="editPostalCode" class="form-control mb-2" placeholder="Enter Address" required v-model="this.agentData.zipCode"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editInterview" class="form-label mb-2">Interview</label>
<!--                      <flat-pickr-->
<!--                          placeholder="Select Interview date/time"-->
<!--                          v-model="this.agentData.interview"-->
<!--                          :config="dateTimeConfig"-->
<!--                          class="form-control flatpickr-input"-->
<!--                          id="editInterview" data-enable-time></flat-pickr>-->

                      <flat-pickr
                          v-model="this.agentData.interview"
                          :config="dateTimeConfig"
                          id="editInterview"
                          class="form-control"
                          data-provider="timepickr"
                          data-time-hrs="true"
                      ></flat-pickr>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-4">
                      <label for="editAgentNumber" class="form-label">Agent Number</label>
                      <input type="text" id="editAgentNumber" class="form-control mb-2" placeholder="Enter Agent Number" required v-model="this.agentData.agentNumber"/>
                    </div>
                    <div class="col-lg-4">
                      <label for="editLicensed" class="form-label">Insurance Licensed?</label>
                      <select class="form-select mb-2" aria-label="Department" id="editLicensed" v-model="this.agentData.insuranceLicense">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                    <div class="col-lg-4">
                      <label for="editAgentNumber" class="form-label">License Number</label>
                      <input type="text" id="editLicenseNumber" class="form-control mb-2" placeholder="Enter Agent Number" required v-model="this.agentData.licenseNumber"/>
                    </div>
                  </div>
                </div>
                <!--end col-->
              </div>
              <!--end row-->
            </div>

            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="createAgent">Save</button>
<!--                <button type="button" class="btn btn-success" id="edit-btn" @click="updateAgent">Update</button>-->
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>
