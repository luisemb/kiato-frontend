<script>
import flatPickr from "vue-flatpickr-component";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.scss";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

// components
import notes from '../../components/users/notes';
import kanbanBoard from '../../components/users/kanbanBoard';
import messages from '../../components/users/messages';
import uploadClients from '../../components/clients/uploadClients';
import econtacts from '../../components/clients/econtacts';
import benlist from '../../components/clients/benlist';
import additaments from '../../components/clients/additaments';
import chargeProspects from '../../components/uploadLists/chargeProspects';
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
    uploadClients,
    econtacts,
    benlist,
    additaments,
    chargeProspects
  },
  data() {
    return {
      title: "Client cards",
      items: [
        {
          text: "Clients",
          href: "/",
        },
        {
          text: "Client List cards",
          active: true,
        },
      ],
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
      dateTimeConfig: {
        enableTime: true,
        dateFormat: "F j, Y H:i K"
      },
      list: [],
      date1: null,
      date2: null,
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      eContactlist: [],
      benList: [],
      additamentsList: [],
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          type: '',
          noteSearch: '',
          keyword: '',
          language: '3',
          sortBy: 'name',
          orderBy: 'ASC',
          dateRange: '0',
          department: '0' ,
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
        },
      },
      beneficiaryQty: 0,
      eContactQty: 0,
      additamentsQty: 0,
      clientData: [],
      clientFormData: [],
      value: null,
      date: null,
      departmentList: {},
      statusList: {},
      typeList: {},
      isClientList: false,
      enabled: true,
      dragging: false,
      notesData: [],
      prospectsData: [],
      chatMessagesData: [],
      chatMessages: []
    };
  },
  setup() {
    return { v$: useVuelidate() }
  },
  methods: {
    validPhone: function (phone) {
      var isphone = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
      return isphone;
    },
    filterList: function (list, search) {
      var result = '';
      result = list.filter(listSearch => listSearch.statusID === search);
      Object.keys(result).map(function (objectKey) {
        var value = result[objectKey];
        return value;
      });
    },
    showTabs: function (id) {

      const tabs = ['mainTab', 'secondTab', 'thirdTab', 'quarterTab', 'fifthTab', 'sixthTab', 'seventhTab']
      let actualSelected = localStorage.getItem('selectedUser')

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
    resetClientData: function () {
      this.clientData =
          {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            language: '',
            status: '',
            type: '',
            gender: '',
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
          document.getElementById("addBeneficiary").innerHTML = "";
          document.getElementById("addEcontact").innerHTML = "";
          document.getElementById("addAdditaments").innerHTML = "";
    },
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    formatDate: function(date, format){
      date = moment(date).format(format)
      return date;
    },
    formatPhone: function(phone, flag=0) {

      // if flag == 1 put value in phone Edit
      phone = phone.replace(/\D/g, '')

      if(phone !== undefined) {
        if(phone.length > 10) {
          phone = phone.substring(1)
        }
        const x = phone.match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        phone = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');

      } else {
        phone = ''
      }

      if(flag !== 1){
        return phone;
      }else{
        document.getElementById('editPhoneNumber').value = phone;
      }
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
          .put('/api/client/updateClientStatus', data)
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
    async updateInformation() {
      const pattern = '/client/';
      if(window.location.href.match(pattern)) {
        await this.updateClient();
      } else {
        await this.updateAgent();
      }
    },
    async updateAgent() {

      this.errors = []

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

      if ((!document.getElementById('editLicensed').value && document.getElementById('editStatus').value === 5) /*|| (!this.clientData.licenseNumber && document.getElementById('editLicensed').value === 1)*/) {
        this.errors.push('License number is required.');
      }

      if (!this.errors.length) {
        const data = {
          username: '',
          email: document.getElementById('editEmail').value,
          firstName: document.getElementById('editFirstName').value,
          lastName: document.getElementById('editLastName').value,
          language: document.getElementById('editLanguage').value,
          status: document.getElementById('editStatus').value,
          type: document.getElementById('editType').value,
          gender: document.querySelector("input[type='radio'][name=editGender]:checked").value,
          phoneNumber: document.getElementById('editPhoneNumber').value,
          departmentID: document.getElementById('editDepartment').value,
          state: document.getElementById('editState').value,
          birthDate: document.getElementById('editBirthDate').value,
          address: document.getElementById('editAddress').value,
          country: document.getElementById('editCountry').value,
          postalCode: document.getElementById('editPostalCode').value,
          interviewDate: document.getElementById('editInterview').value,
          agentNumber: document.getElementById('editAgentNumber').value,
          createdBy: localStorage.getItem('email'),
          isLicensed: document.getElementById('editLicensed').value,
          licenseNumber: this.clientData.licenseNumber,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          agentID: localStorage.getItem('selectedUser')
        }

        await axios
            .put('/api/updateAgent', data)
            .then(async response => {
              if (response) {
                document.getElementById('close-modal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Agent update successfully!'
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
    async updateClient() {

      this.errors = []

      if (!document.getElementById('editFirstName').value) {
        this.errors.push('First Name is required.');
      }

      if (!document.getElementById('editLastName').value) {
        this.errors.push('Last Name is required.');
      }
      if (!document.querySelector("input[type='radio'][name=editGender1]:checked")) {
        this.errors.push('Gender is required.');
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

      if (document.getElementById('editType').value  === 'undefined') {
        this.errors.push('Lead/Client Source is required.');
        console.log(this.clientData)
      }

      if (document.querySelector("input[type='radio'][name=editGender1]:checked").value !== 'M' && document.querySelector("input[type='radio'][name=editGender1]:checked").value !== 'F') {
        this.errors.push('Gender is required.');
      }

      if (document.getElementById('editLanguage').value !== '1' && document.getElementById('editLanguage').value !== '2') {
        this.errors.push('Language is required.');
      }

      if (document.getElementById('editType').value === 'undefined') {
        this.errors.push('Lead/client Source is required.');
      }

      if (!this.errors.length) {
        const data = {
          username: '',
          email: document.getElementById('editEmail').value,
          city: document.getElementById('editCity1').value,
          firstName: document.getElementById('editFirstName').value,
          lastName: document.getElementById('editLastName').value,
          language: document.getElementById('editLanguage').value,
          status: document.getElementById('editStatus').value,
          leadType: document.getElementById('editType').value,
          gender: document.querySelector("input[type='radio'][name=editGender1]:checked").value,
          phoneNumber: document.getElementById('editPhoneNumber').value,
          departmentID: document.getElementById('editDepartment').value,
          state: document.getElementById('editState').value,
          birthDate: document.getElementById('editBirthDate').value,
          address: document.getElementById('editAddress').value,
          country: document.getElementById('editCountry').value,
          postalCode: document.getElementById('editPostalCode').value,
          interviewDate: document.getElementById('editInterview').value,
          createdBy: localStorage.getItem('email'),
          licenseNumber: this.clientData.licenseNumber,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          clientID: localStorage.getItem('selectedUser')
        }

        await axios
            .put('/api/client/updateClient', data)
            .then(async response => {
              if (response) {
                document.getElementById('close-modal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Client update successfully!'
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
    async createClient() {
      this.errors = []

      if (!this.clientData.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.clientData.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.clientData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.clientData.phone) {
        this.errors.push('Phone is required.');
      }

      if (this.validPhone(this.clientData.phone) === false && this.clientData.phone === '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.clientData.department) {
        this.errors.push('Department is required.');
      }

      if (this.clientData.type  === 'undefined') {
        this.errors.push('Lead/Client Source is required.');
        console.log(this.clientData)
      }

      if (this.clientData.gender !== 'M' && this.clientData.gender !== 'F') {
        this.errors.push('Gender is required.');
      }

      if (this.clientData.language !== '1' && this.clientData.language !== '2') {
        this.errors.push('Language is required.');
      }

      if (this.clientData.leadType === 'undefined') {
        this.errors.push('Lead/client Source is required.');
      }


      if (!this.errors.length) {

        await this.addAnotherClient();

        let data = {
          clientsInfo: JSON.parse(localStorage.getItem("clientFormData")),
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          selectedUser: localStorage.getItem('selectedUser'),
          userEmail: localStorage.getItem('email'),
          totalClients: JSON.parse(localStorage.getItem("clientFormData")).length,
          isProspect: 0,
        }

        await axios
            .post('/api/client/create', data)
            .then(async response => {
              if (response.data['ID'] !== null) {
                document.getElementById('closemodal').click();
                document.getElementById("addform").reset();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Client created successfully!'
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
    async updateClientList() {

      let validate = true;
      let errors = [];
      let filterLanguage = document.getElementById("filterLanguage").value;
      let filterKeyword = document.getElementById("filterKeyword").value;
      // let filterClients = document.getElementById("filterClients").value;
      let filterType = document.getElementById("filterType").value;
      let filterNotes = document.getElementById("filterNotes").value;
      let filterFromDate = document.getElementById("filterFromDate").value;
      let filterToDate = document.getElementById("filterToDate").value;

      if (filterLanguage !== '' && (filterLanguage === '1' || filterLanguage === '2')){
        this.data.searchValues.language = filterLanguage;
      }

      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.data.searchValues.language = filterLanguage;
      }else if(filterKeyword !== '' && filterKeyword.length < 3) {
        errors.push('Keyword search should have 3 or more characters!')
        validate = false;
      }

      if(filterType !== ''){
        this.data.searchValues.type = filterType;
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
        deleted: 0,
      }

      if(validate){
        await axios
            .post('/api/client/listClientsByStatus', data)
            .then(response => {
              this.isClientList = (window.location.href.match('/client/') !== null) ? true : false;
              let res = response.data
              var varName = []
              var spectedList = []

              for (let i = 0; i < res.length; i++) {
                varName = response.data[i].statusName.replace(/\s+/g, '-').toLowerCase();
                varName = response.data[i].content;
                varName['groupName'] = {
                  'groupName': varName,
                  'statusName': response.data[i].statusName,
                  'groupID': response.data[i].statusID,
                  'sequence': 1,
                  'quantity': response.data[i].content.length,
                  'perPage': 30,
                  'showing': (response.data[i].content.length < 30 ? response.data[i].content.length: 30),
                };
                spectedList.push(varName);
              }
              this.list = spectedList;
            })
            .catch(error => {
              if (error.response) {
                for (const property in error.response.data) {
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                }
              }/* else if (error.message) {
              this.errors.push('Something was wrong, please contact your SysAdmin.')
            }*/
            })
      }else{
        let list = '';
        for (var i = 0; i < errors.length; i+=1) {
          list += errors[i] + ' \n';
        }

        await Swal.fire("" + list, '', 'info');

      }

    },
    setClientData(clientInfo){

      this.clientData.email=clientInfo.email;
      this.clientData.firstName=clientInfo.firstName;
      this.clientData.lastName=clientInfo.lastName;
      this.clientData.language=clientInfo.language;
      this.clientData.status=clientInfo.status
      this.clientData.phone=clientInfo.phoneNumber;
      this.clientData.gender=clientInfo.gender;
      this.clientData.age=clientInfo.age;
      this.clientData.type= clientInfo.leadType;
      this.clientData.city=clientInfo.city;
      this.clientData.department=clientInfo.departmentID
      this.clientData.birthDate= this.formatDate(clientInfo.dateOfBirth, 'DD MMM, YYYY');
      this.clientData.interview= this.formatDate(clientInfo.interviewDate, 'MMMM D, YYYY h:mm A');
      this.clientData.address=clientInfo.address;
      this.clientData.state=clientInfo.state;
      this.clientData.country=clientInfo.country;
      this.clientData.zipCode=clientInfo.postalCode;
      this.clientData.agentNumber=clientInfo.agentNumber;
      this.clientData.createdBy=clientInfo.createdBy;
      this.clientData.insuranceLicense=clientInfo.isLicensed;
      this.getMapsLink()
    },
    /**
     * Get the name of user
     */
    chatUsername(name, image) {
      this.username = name;
      this.profile = image;
      this.usermessage = "Hello";
      this.notesData = [];
      const currentDate = new Date();

      this.notesData.push({
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
        this.notesData.push({
          align: "right",
          name: "Henry Wells",
          message,
          time: currentDate.getHours() + ":" + currentDate.getMinutes(),
        });
      }
      this.submitted = false;
      this.form = {};
    },
    addNewClientModal() {
      this.resetClientData()
      document.querySelector("#localAgentID").value = 0;
      let goBack = document.getElementById('goBack');
      let goNext = document.getElementById('goNext');
      goBack.style.display = 'none';
      goNext.style.display = 'none';


      let clientData = JSON.parse(localStorage.getItem('clientFormData'));
      if(clientData.length > 0) {

        Swal.fire({
          title: 'Do you want to continue the job you left?',
          showDenyButton: true,
          confirmButtonText: 'Yes',
          denyButtonText: `No`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            Swal.fire('Restored!', '', 'success');
            this.restoreForm();
            let goBack = document.getElementById('goBack');
            let goNext = document.getElementById('goNext');
            goBack.style.display = 'none';
            goNext.style.display = 'none';

            if(clientData.length > 1) {
              goBack.style.display = 'block';
              goNext.style.display = 'block';
            }

          } else if (result.isDenied) {
            this.resetClientData();
            Swal.fire('Saved data removed!', '', 'info');
          }
        })
      }
      document.getElementById('clientModalLabelAdd').innerHTML="Add Client";
    },
    printEmit(notify) {
      this.notesData = notify;
    },
    refreshContacts(notify) {
      this.getEcontacts();
      console.log('execute! '+ notify);
    },
    refreshBenList(notify){
      this.getBeneficiaries();
      console.log('execute! '+ notify);
    },
    refreshAdditaments(notify) {
      this.getAdditaments();
      console.log('execute! '+ notify);
    },
    keyExists(key, search) {

      if (!search || (search.constructor !== Array && search.constructor !== Object)) {
        return false;
      }

      for (let i = 0; i < search.length; i++) {
          const keys = Object.keys(search[i])
          if (keys[0] === key) {
            return true;
          }
      }
      return key in search;
    },
    addBeneficiary( benList = [] ) {
      this.beneficiaryQty = this.beneficiaryQty + 1;
      let i = this.beneficiaryQty;
      let div = document.getElementById('addBeneficiary');
      let separator = '';
      let checkIDExists = document.getElementById("benFirstName-1");
      var element = document.createElement('div');

      if(benList.length <= 0){
        benList.push(
        benList['firstName'] = '',
        benList['lastName'] = '',
        benList['address'] = '',
        benList['phoneNumber'] = '',
        benList['state'] = '',
        benList['postalCode'] = '',
        benList['relationship'] = '',
        benList['age']  = '');
      }

      if(checkIDExists) {
        separator = '<hr style="border-top: 1px solid #2c9a2a;">';
      }

      element.innerHTML += '<div class="row" id="rowBen'+i+'">\n' + separator  +
          '  <div class="col-lg-6">\n' +
          '    <label for="benFirstName-'+i+'" class="form-label">First Name</label>\n' +
          '    <input type="text" id="benFirstName-'+i+'" class="form-control mb-2" placeholder="Enter First Name" name="benFirstName[]" required value="'+benList['firstName']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benLastName-'+i+'" class="form-label">Last Name</label>\n' +
          '    <input type="text" id="benLastName-'+i+'" class="form-control mb-2" placeholder="Enter Last Name"  name="benLastName[]" required value="'+benList['lastName']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benAddress-'+i+'" class="form-label">Address</label>\n' +
          '    <input type="text" id="benAddress-'+i+'" class="form-control mb-2" placeholder="Enter Address"  name="benAddress[]" required value="'+benList['address']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benPhone-'+i+'" class="form-label">Phone</label>\n' +
          '    <input type="text" id="benPhone-'+i+'" class="form-control mb-2" placeholder="Enter Phone"  name="benPhone[]" required value="'+benList['phoneNumber']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benState-'+i+'" class="form-label">State</label>\n' +
          '    <input type="text" id="benState-'+i+'" class="form-control mb-2" placeholder="Enter State"  name="benState[]"  required value="'+benList['state']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benPostalCode-'+i+'" class="form-label">Postal Code</label>\n' +
          '    <input type="text" id="benPostalCode-'+i+'" class="form-control mb-2" placeholder="Enter Postal Code"  name="benPostalCode[]" required value="'+benList['postalCode']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benRelation-'+i+'" class="form-label">Relationship</label>\n' +
          '    <input type="text" id="benRelation-'+i+'" class="form-control mb-2" placeholder="Enter Relationship"  name="benRelation[]"  required value="'+benList['relationship']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="benAge-'+i+'" class="form-label">Age</label>\n' +
          '    <input type="text" id="benAge-'+i+'" class="form-control mb-2" placeholder="Enter Age"  name="benAge[]" required value="'+benList['age']+'">\n' +
          '  </div>\n' +
          ' <div class="col-md-6" style="display: flex; justify-content: flex-end;">\n' +
          ' </div>\n' +
          ' <div class="col-md-6" style="display: flex; justify-content: flex-end;">\n' +
          '    <button type="button" id="'+i+'" class="btn btn-danger removeItemBen" title="Delete"><i class="ri-close-circle-line"></i></button>\n' +
          ' </div>\n' +
          '</div>';

      div.appendChild(element);
    },
    addEcontact( eContact = [] ) {
      this.eContactQty = this.eContactQty + 1;
      let i = this.eContactQty;
      let div = document.getElementById('addEcontact');
      let separator = '';
      let checkIDExists = document.getElementById("eConFirstName-1");
      var element = document.createElement('div');

      if(eContact.length <= 0){
        eContact.push(
            eContact['firstName'] = '',
            eContact['lastName'] = '',
            eContact['address'] = '',
            eContact['phoneNumber'] = '',
            eContact['state'] = '',
            eContact['postalCode'] = '',
            eContact['relationship'] = '',
            eContact['age']  = '');
      }

      if(checkIDExists) {
        separator = '<hr style="border-top: 1px solid #2c9a2a;">';
      }
      element.innerHTML += separator +
          '<div class="row" id="rowEcon'+i+'">\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConFirstName-'+i+'" class="form-label">First Name</label>\n' +
          '    <input type="text" id="eConFirstName-'+i+'" class="form-control mb-2" placeholder="Enter First Name" name="eConFirstName[]" required value="'+eContact['firstName']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConLastName-'+i+'" class="form-label">Last Name</label>\n' +
          '    <input type="text" id="eConLastName-'+i+'" class="form-control mb-2" placeholder="Enter Last Name"  name="eConLastName[]" required  value="'+eContact['lastName']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConAddress-'+i+'" class="form-label">Address</label>\n' +
          '    <input type="text" id="eConAddress-'+i+'" class="form-control mb-2" placeholder="Enter Address"  name="eConAddress[]" required  value="'+eContact['address']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConPhone-'+i+'" class="form-label">Phone</label>\n' +
          '    <input type="text" id="eConPhone-'+i+'" class="form-control mb-2" placeholder="Enter Phone"  name="eConPhone[]" required  value="'+eContact['phoneNumber']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConState-'+i+'" class="form-label">State</label>\n' +
          '    <input type="text" id="eConState-'+i+'" class="form-control mb-2" placeholder="Enter State"  name="eConState[]"  required  value="'+eContact['state']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConPostalCode-'+i+'" class="form-label">Postal Code</label>\n' +
          '    <input type="text" id="eConPostalCode-'+i+'" class="form-control mb-2" placeholder="Enter Postal Code"  name="eConPostalCode[]" required  value="'+eContact['postalCode']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConRelation-'+i+'" class="form-label">Relationship</label>\n' +
          '    <input type="text" id="eConRelation-'+i+'" class="form-control mb-2" placeholder="Enter Relationship"  name="eConRelation[]"  required  value="'+eContact['relationship']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="eConAge-'+i+'" class="form-label">Age</label>\n' +
          '    <input type="text" id="eConAge-'+i+'" class="form-control mb-2" placeholder="Enter Age"  name="eConAge[]" required  value="'+eContact['age']+'">\n' +
          '  </div>\n' +
          ' <div class="col-md-6" style="display: flex; justify-content: flex-end;">\n' +
          ' </div>\n' +
          ' <div class="col-md-6" style="display: flex; justify-content: flex-end;">\n' +
          '    <button type="button" id="'+i+'" class="btn btn-danger removeItemEcon" title="Delete"><i class="ri-close-circle-line"></i></button>\n' +
          ' </div>\n' +
          '</div>';

      div.append(element);
    },
    addAdditaments( additaments = []) {
      this.additamentsQty = this.additamentsQty + 1;
      let i = this.additamentsQty;
      let div = document.getElementById('addAdditaments');
      let separator = '';
      let checkIDExists = document.getElementById("eConFirstName-1");
      var element = document.createElement('div');

      if(additaments.length <= 0){
        additaments.push(
            additaments['firstName'] = '',
            additaments['lastName'] = '',
            additaments['gender'] = 0,
            additaments['retalionship'] = 0,
            additaments['age']  = '');
      }

      if(checkIDExists) {
        separator = '<hr style="border-top: 1px solid #2c9a2a;">';
      }

      element.innerHTML += separator +
          '<div class="row" id="rowAdditaments'+i+'">\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="AddiFirstName-'+i+'" class="form-label">First Name</label>\n' +
          '    <input type="text" id="AddiFirstName-'+i+'" class="form-control mb-2" placeholder="Enter First Name" name="AddiFirstName[]" required value="'+additaments['firstName']+'">\n' +
          '  </div>\n' +
          '  <div class="col-lg-6">\n' +
          '    <label for="AddiLastName-'+i+'" class="form-label">Last Name</label>\n' +
          '    <input type="text" id="AddiLastName-'+i+'" class="form-control mb-2" placeholder="Enter Last Name"  name="AddiLastName[]" required value="'+additaments['lastName']+'">\n' +
          '  </div>\n' +
          '<div class="col-lg-6">'+
          '  <label for="AddiGender" class="form-label">Gender</label>'+
          '  <select class="form-select mb-2" aria-label="Gender" id="AddiGender-'+i+'" name="AddiGender[]">'+
          '    <option value="0" >Select...</option>'+
          '    <option value="F">Female</option>'+
          '    <option value="M">Male</option>'+
          '</select>'+
          '</div>\n'+
          '<div class="col-lg-6">\n' +
          '  <label for="AddiAge-'+i+'" class="form-label">Age</label>\n' +
          '  <input type="text" id="AddiAge-'+i+'" class="form-control mb-2" placeholder="Enter Age"  name="AddiAge[]" required  value="'+additaments['age']+'">\n' +
          '</div>\n' +
          ' <div class="col-md-6">\n' +
          '  <label for="AddiRelation-'+i+'" class="form-label">Relationship</label>'+
          '  <select class="form-select mb-2" aria-label="AddiRelation" id="AddiRelation-'+i+'" name="AddiRelation[]"  value="'+additaments['retalionship']+'">'+
          '    <option value="0">Relation</option>'+
          '    <option value="C">Children</option>'+
          '    <option value="S">Stepson</option>'+
          '    <option value="G">Grandson</option>'+
          '</select>'+
          ' </div>\n' +
          ' <div class="col-md-6" style="display: flex; justify-content: flex-end;">\n' +
          '    <button type="button" id="'+i+'" class="btn btn-danger removeItemAdditaments" title="Delete"><i class="ri-close-circle-line"></i></button>\n' +
          ' </div>\n' +
          '</div>';
      div.append(element);
      document.getElementById("AddiGender-"+i+"").value = additaments['gender'];
      document.getElementById("AddiRelation-"+i+"").value = additaments['retalionship'];
    },
    async addAnotherClient() {

      this.errors = []

      if (!this.clientData.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.clientData.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.clientData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.clientData.phone) {
        this.errors.push('Phone is required.');
      }

      if (this.validPhone(this.clientData.phone) === false && this.clientData.phone !== '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.clientData.department) {
        this.errors.push('Department is required.');
      }

      if (this.clientData.type  === 'undefined') {
        this.errors.push('Lead/Client Source is required.');
        console.log('add another')
      }

      if (this.clientData.gender !== 'M' && this.clientData.gender !== 'F') {
        this.errors.push('Gender is required.');
      }

      if (this.clientData.language !== '1' && this.clientData.language !== '2') {
        this.errors.push('Language is required.');
      }

      if (this.clientData.leadType === 'undefined') {
        this.errors.push('Lead/client Source is required.');
      }


      if (!this.errors.length) {

        // let clientData = JSON.parse(localStorage.getItem('clientFormData'));
        // let formNumber = Number(document.querySelector("#localAgentID").value);
        //
        // if(clientData.length > 0){
        //   document.querySelector("#localAgentID").value = formNumber + 1;
        // }

        let localAgentID = 'id'+document.querySelector("#localAgentID").value;
        let beneficiaries = this.getBenficiaries();
        let emergencyContacts = this.getEmergency();
        let addedChilds = this.getAddedChilds();
        let formValues = {};
        let values = {};

        let form = document.getElementById("addform");

        for (var i = 0; i < form.elements.length; i++) {
          let e = form.elements[i];

          if(e.name !== '') {
            formValues[e.name] = e.value;
          }
          formValues['editGender'] = document.querySelector("input[type='radio'][name=editGender]:checked").value;

          if(this.isClientList){
            formValues['editType'] = document.querySelector("#editType").value;
          }else{
            formValues['editType'] = document.querySelector("#editType1").value;
          }
        }

        // if array data already exist just update.
        if (this.keyExists(localAgentID, this.clientFormData)) {
          for (let i = 0; i < this.clientFormData.length; i++) {
              const keys = Object.keys(this.clientFormData[i])
              if (keys[0] === localAgentID) {
                console.log(this.clientFormData[i][keys])
                // this.clientFormData[i][keys] = {formValues, beneficiaries, emergencyContacts, addedChilds}
              }
          }
          localStorage.setItem('clientFormData', JSON.stringify(this.clientFormData));
          this.resetClientData()
          let formNumber = Number(document.querySelector("#localAgentID").value);
          document.querySelector("#localAgentID").value = formNumber + 1;

          let goBack = document.getElementById('goBack');
          let goNext = document.getElementById('goNext');
          goBack.style.display = '';
          goNext.style.display = '';
          goBack.style.display = 'block';
          goNext.style.display = 'block';

          // if array data do not exist create it.
        } else {
          values = {formValues, beneficiaries, emergencyContacts, addedChilds}
          this.clientFormData.push({[localAgentID]: values});
          localStorage.setItem('clientFormData', JSON.stringify(this.clientFormData));
          this.resetClientData()
          let formNumber = Number(document.querySelector("#localAgentID").value);
          document.querySelector("#localAgentID").value = formNumber + 1;

          let goBack = document.getElementById('goBack');
          let goNext = document.getElementById('goNext');
          goBack.style.display = '';
          goNext.style.display = '';
          goBack.style.display = 'block';
          goNext.style.display = 'block';
        }
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
    async getEcontacts(){

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        userEmail: localStorage.getItem('email'),
        clientID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
      }

      await axios
          .post('/api/client/getecontacts', data)
          .then(response => {
            // document.getElementById('eContactList').innerHTML = "";
            this.eContactlist = []
            this.eContactlist = response.data;
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    async getBeneficiaries(){

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        userEmail: localStorage.getItem('email'),
        clientID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
      }

      await axios
          .post('/api/client/getbeneficiaries', data)
          .then(response => {
            // document.getElementById('eContactList').innerHTML = "";
            this.benList = []
            this.benList = response.data;
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    async getAdditaments(){

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        userEmail: localStorage.getItem('email'),
        clientID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
      }

      await axios
          .post('/api/client/getAdditaments', data)
          .then(response => {
            // document.getElementById('eContactList').innerHTML = "";
            this.additamentsList = [];
            this.additamentsList = response.data;
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error");
            }
          })
    },
    async checkClientExists(){

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        userEmail: localStorage.getItem('email'),
        clientID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
        potentialClientEmail: this.clientData.email
      }

      if (this.validEmail(data.potentialClientEmail)) {
        await axios
            .post('/api/client/emailExists', data)
            .then(response => {
              let div = document.querySelector(".createEmail");

              if (response.data > 0) {
                div.classList.add("is-invalid");
              } else {
                div.classList.remove("is-invalid");
              }
            })
            .catch(error => {
              if (error.response) {
                Swal.fire("Oops!", "Please, contact your SysAdmin.", "error");
              }
            })
      }

    },
    getBenficiaries() {
      let nameValues = [];
      let lastValues = [];
      let phoneValues = [];
      let addressValues = [];
      let stateValues = [];
      let postalValues = [];
      let relationValues = [];
      let ageValues = [];
      let values = [];

      let benFirstName = document.querySelectorAll("input[name='benFirstName[]']");
      for (let i = 0; i < benFirstName.length; i++) {
        nameValues.push(benFirstName[i].value);
      }

      let benLastName = document.querySelectorAll("input[name='benLastName[]']");
      for (let i = 0; i < benLastName.length; i++) {
        lastValues.push(benLastName[i].value);
      }

      let benPhone = document.querySelectorAll("input[name='benPhone[]']");
      for (let i = 0; i < benPhone.length; i++) {
        phoneValues.push(benPhone[i].value);
      }

      let benAddress = document.querySelectorAll("input[name='benAddress[]']");
      for (let i = 0; i < benAddress.length; i++) {
        addressValues.push(benAddress[i].value);
      }

      let benState = document.querySelectorAll("input[name='benState[]']");
      for (let i = 0; i < benState.length; i++) {
        stateValues.push(benState[i].value);
      }

      let benPostalCode = document.querySelectorAll("input[name='benPostalCode[]']");
      for (let i = 0; i < benPostalCode.length; i++) {
        postalValues.push(benPostalCode[i].value);
      }

      let benRelation = document.querySelectorAll("input[name='benRelation[]']");
      for (let i = 0; i < benRelation.length; i++) {
        relationValues.push(benRelation[i].value);
      }

      let benAge = document.querySelectorAll("input[name='benAge[]']");
      for (let i = 0; i < benAge.length; i++) {
        ageValues.push(benAge[i].value);
      }

      let i;
      for (i = 0; i < nameValues.length; i++) {
        values.push({'firstName': nameValues[i], 'lastName': lastValues[i], 'phoneNumber': phoneValues[i],
          'address': addressValues[i], 'state': stateValues[i], 'postalCode': postalValues[i], 'relationship': relationValues[i],
          'age': ageValues[i]});
      }
      return values;
    },
    getEmergency() {
      let nameValues = [];
      let lastValues = [];
      let phoneValues = [];
      let addressValues = [];
      let stateValues = [];
      let postalValues = [];
      let relationValues = [];
      let ageValues = [];
      let values = [];

      let eConFirstName = document.querySelectorAll("input[name='eConFirstName[]']");
      for (let i = 0; i < eConFirstName.length; i++) {
        nameValues.push(eConFirstName[i].value);
      }

      let eConLastName = document.querySelectorAll("input[name='eConLastName[]']");
      for (let i = 0; i < eConLastName.length; i++) {
        lastValues.push(eConLastName[i].value);
      }

      let eConPhone = document.querySelectorAll("input[name='eConPhone[]']");
      for (let i = 0; i < eConPhone.length; i++) {
        phoneValues.push(eConPhone[i].value);
      }

      let eConAddress = document.querySelectorAll("input[name='eConAddress[]']");
      for (let i = 0; i < eConAddress.length; i++) {
        addressValues.push(eConAddress[i].value);
      }

      let eConState = document.querySelectorAll("input[name='eConState[]']");
      for (let i = 0; i < eConState.length; i++) {
        stateValues.push(eConState[i].value);
      }

      let eConPostalCode = document.querySelectorAll("input[name='eConPostalCode[]']");
      for (let i = 0; i < eConPostalCode.length; i++) {
        postalValues.push(eConPostalCode[i].value);
      }

      let eConRelation = document.querySelectorAll("input[name='eConRelation[]']");
      for (let i = 0; i < eConRelation.length; i++) {
        relationValues.push(eConRelation[i].value);
      }

      let eConAge = document.querySelectorAll("input[name='eConAge[]']");
      for (let i = 0; i < eConAge.length; i++) {
        ageValues.push(eConAge[i].value);
      }

      let i;
      for (i = 0; i < nameValues.length; i++) {
        values.push({'firstName':  nameValues[i], 'lastName':  lastValues[i], 'phoneNumber':  phoneValues[i], 'address':  addressValues[i],
          'state':  stateValues[i], 'postalCode':  postalValues[i], 'relationship':  relationValues[i], 'age':  ageValues[i]});
      }
      return values;
    },
    getAddedChilds() {

      let nameValues = [];
      let lastValues = [];
      let genderValues = [];
      let ageValues = [];
      let relationValues = [];
      let values = [];

      let eConFirstName = document.querySelectorAll("input[name='AddiFirstName[]']");
      for (let i = 0; i < eConFirstName.length; i++) {
        nameValues.push(eConFirstName[i].value);
      }

      let eConLastName = document.querySelectorAll("input[name='AddiLastName[]']");
      for (let i = 0; i < eConLastName.length; i++) {
        lastValues.push(eConLastName[i].value);
      }

      let AddiGender = document.querySelectorAll("select[name='AddiGender[]']");
      for (let i = 0; i < AddiGender.length; i++) {
        genderValues.push(AddiGender[i].value);
      }

      let AddiAge = document.querySelectorAll("input[name='AddiAge[]']");
      for (let i = 0; i < AddiAge.length; i++) {
        ageValues.push(AddiAge[i].value);
      }

      let AddiRelation = document.querySelectorAll("select[name='AddiRelation[]']");
      for (let i = 0; i < AddiRelation.length; i++) {
        relationValues.push(AddiRelation[i].value);
      }

      let i;
      for (i = 0; i < nameValues.length; i++) {
        values.push({'firstName':  nameValues[i], 'lastName':  lastValues[i], 'gender': genderValues[i], 'age': ageValues[i],
          'retalionship': relationValues[i]});
      }
      return values;
    },
    setMessagesInfo(messages){
      this.chatMessages= messages;
    },
    restoreForm( instruction = '' ) {
      let clientData = JSON.parse(localStorage.getItem('clientFormData'));
      let formNumber = Number(document.querySelector("#localAgentID").value);
      let localAgentID = '';

      if (instruction === 'next' && Number(formNumber) !== (Number(clientData.length) - 1)) {
        document.querySelector("#localAgentID").value = formNumber + 1;
        localAgentID = 'id'+document.querySelector("#localAgentID").value
        this.restore(clientData, localAgentID);
        Swal.fire('Agent information Restored!', '', 'success');

      } else if(instruction === 'back' && formNumber !== 0) {
        document.querySelector("#localAgentID").value = formNumber - 1;
        localAgentID = 'id'+document.querySelector("#localAgentID").value
        this.restore(clientData, localAgentID);
        Swal.fire('Agent information Restored!', '', 'success');

      } else if (instruction === '') {
        localAgentID = 'id0';
        this.restore(clientData, localAgentID);
      }

      let goBack = document.getElementById('goBack');
      let goNext = document.getElementById('goNext');
      goBack.style.display = 'none';
      goNext.style.display = 'none';

      if(clientData.length > 1) {
        goBack.style.display = 'block';
        goNext.style.display = 'block';
      }
    },
    resetForm(){
      document.getElementById("addform").reset();
    },
    restore(clientData, localAgentID) {
      this.resetClientData();

      for (let i = 0; i < clientData.length; i++) {

        const keys = Object.keys(clientData[i])

        if (keys[0] === localAgentID) {
          this.clientData.email = clientData[i][keys]['formValues']['editEmail'];
          this.clientData.status = clientData[i][keys]['formValues']['editStatus'];
          this.clientData.language = clientData[i][keys]['formValues']['editLanguage'];
          this.clientData.lastName = clientData[i][keys]['formValues']['editLastName'];
          this.clientData.firstName = clientData[i][keys]['formValues']['editFirstName'];
          this.clientData.firstName = clientData[i][keys]['formValues']['editFirstName'];
          this.clientData.gender = clientData[i][keys]['formValues']['editGender'];
          this.clientData.type = (clientData[i][keys]['formValues']['editType'] !== '') ? clientData[i][keys]['formValues']['editType']: clientData[i][keys]['formValues']['type'];
          this.clientData.phone = clientData[i][keys]['formValues']['editPhoneNumber'];
          this.clientData.department = clientData[i][keys]['formValues']['editDepartment'];
          this.clientData.interview = clientData[i][keys]['formValues']['editInterview'];
          this.clientData.department = clientData[i][keys]['formValues']['editDepartment'];
          this.clientData.address = clientData[i][keys]['formValues']['editAddress'];
          this.clientData.birthday = clientData[i][keys]['formValues']['editBirthdate'];
          this.clientData.note = clientData[i][keys]['formValues']['editNotes'];
          this.clientData.state = clientData[i][keys]['formValues']['editState'];
          this.clientData.country = clientData[i][keys]['formValues']['editCountry'];
          this.clientData.zipCode = clientData[i][keys]['formValues']['editPostalCode'];
          this.clientData.city = clientData[i][keys]['formValues']['editCity'];


          localStorage.setItem('testData', JSON.stringify(this.clientData));
          console.log(localStorage.getItem('testData'));
          // console.log(clientData[i][keys]['addedChilds'])
          // console.log(clientData[i][keys]['emergencyContacts'])

          if (clientData[i][keys]['beneficiaries'].length > 0) {
            let beneficiaries = clientData[i][keys]['beneficiaries'];
            for (let y = 0; y < beneficiaries.length; y++) {
              this.addBeneficiary(beneficiaries[y]);
            }
          }

          if (clientData[i][keys]['emergencyContacts'].length > 0) {
            let emergencyContacts = clientData[i][keys]['emergencyContacts'];
            for (let y = 0; y < emergencyContacts.length; y++) {
              this.addEcontact(emergencyContacts[y]);
            }
          }

          if (clientData[i][keys]['addedChilds'].length > 0) {
            let addedChilds = clientData[i][keys]['addedChilds'];
            for (let y = 0; y < addedChilds.length; y++) {
              this.addAdditaments(addedChilds[y]);
            }
          }
        }
      }
    },
    handleFocus(e){
      e.target.setAttribute("autocomplete", "nope");
    },
    deleteclient() {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-danger ml-2",
          cancelButton: "btn btn-success",
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons
          .fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            showCancelButton: true,
          })
          .then((result) => {
            if (result.value) {

              const data = {
                token: localStorage.getItem('jwt'),
                userID: localStorage.getItem('id'),
                userName: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastname'),
                userEmail: localStorage.getItem('email'),
                agentID: localStorage.getItem('selectedUser')
              }

              axios
                  .put('/api/client/delete', data)
                  .then(async response => {
                    if (response) {
                      await this.updateClientList()
                      document.getElementById('close-modal').click();
                      await swalWithBootstrapButtons.fire(
                          "Deleted!",
                          "Client has been deleted.",
                          "success"
                      );
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
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                  "Cancelled",
                  "Client is in a safe place :)",
                  "error"
              );
            }
          });
    },
    getMapsLink(){
      let link = 'https://maps.google.com/?q='
      let clientData = this.clientData;
      if (clientData.address.length > 0){
        link += '+'+this.clientData.address
      }
      if (clientData.zipCode.length > 0){
        link += '+'+clientData.zipCode
      }
      if (clientData.city.length > 0){
        link += '+'+clientData.city
      }
      if (clientData.state.length > 0){
        link += '+'+clientData.state
      }

      if(link !== 'https://maps.google.com/?q=') {
        document.getElementById("gMapsLink").href = link;
      } else {
        document.getElementById("gMapsLink").href = '#';
      }

    },
    viewUserGroup(request) {
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.userGroup.includes(request)
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
            this.notesData = response.data;
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
      isProspect: 0,
      searchValues: this.data.searchValues,
      userEmail: localStorage.getItem('email'),
      userID: localStorage.getItem('id'),
      deleted: 0,
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
        .post('/api/client/clientStatus', data)
        .then(response => {
          this.statusList = response.data
        })
        .catch(error => {
          if (error.response) {
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
            Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
          }
        })

    await axios
        .post('/api/client/listClientsByStatus', data)
        .then(response => {
          this.isClientList = (window.location.href.match('/client/') !== null) ? true : false;

          for (let i = 0; i < 10; i++) {
            let varName = [];
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
            for (const property in error.response.data) {
            this.errors.push(`${property}: ${error.response.data[property]}`)
            }
          } /*else if (error.message) {
            this.errors.push('Something was wrong, please contact your SysAdmin.')
          }*/
        })

    function addEvent(parent, evt, selector, handler) {
      parent.addEventListener(evt, function(event) {
        if (event.target.matches(selector + ', ' + selector + ' *')) {
          handler.apply(event.target.closest(selector), arguments);
        }
      }, false);
    }

    /* To be used as */
    addEvent(document, 'click', 'button.removeItemBen', function() {
      let button_id = this.id;
      document.getElementById('rowBen' + button_id).remove();
    });
    addEvent(document, 'click', 'button.removeItemEcon', function() {
      let button_id = this.id;
      document.getElementById('rowEcon' + button_id).remove()
    });
    addEvent(document, 'click', 'button.removeItemAdditaments', function() {
      let button_id = this.id;
      document.getElementById('rowAdditaments' + button_id).remove()
    });
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

.fieldset-style{
  display: block;margin-inline-start: 2px;
  margin-inline-end: 2px;
  padding-block-start: 0.35em;
  padding-inline-start: 0.75em;
  padding-inline-end: 0.75em;
  padding-block-end: 0.625em;
  min-inline-size: min-content;
  /*border-width: 2px;*/
  /*border-style: groove;*/
  border-color: threedface;
  border-image: initial;
  border-radius: 10px;
}

.legend-style{
  display: block;
  padding-inline-start: 2px;
  padding-inline-end: 2px;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
}

@media (min-width: 768px) and (max-width: 1024px) {
  .margin-left-menu{
    margin-left: 5vw;
  }
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
                     placeholder="Enter Keyword" v-model="this.data.searchValues.keyword"
                     title="Search by (Phone number, City, Postal code, Name, Last name, Full Name, Address, State)"
                     @change="this.data.searchValues.keyword.length >= 3 ? updateClientList(): ''"
                     v-on:keyup.enter="this.data.searchValues.keyword === '' ? updateClientList() : ''">
              <i class="ri-search-line search-icon"></i>
            </div>
          </div><!--end col-->
          <div class="col-md-auto ms-auto">
            <div class="d-flex hastck gap-2 flex-wrap">
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted flex-shrink-0">Sort by: </span>

                <Multiselect class="form-control"
                             style="width:150px;padding: 0px;"
                             v-model="this.data.searchValues.sortBy"
                             autocomplete="off"
                             @focus="handleFocus"
                             :close-on-select="true"
                             :searchable="true"
                             :options="[
                            { value: 'name', label: 'Name' },
                            { value: 'lastName', label: 'Last Name' },
                            { value: 'postalCode', label: 'Postal Code' },
                            { value: 'modified', label: 'Modified On' },
                            { value: 'created', label: 'created On' },
                            ]"
                             @select="updateClientList()"
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
                             @select="updateClientList()"
                />
              </div>
              <button type="button" class="btn btn-soft-success add-btn" id="filters-btn" data-bs-toggle="modal" data-bs-target="#open-filters">
                <i class="ri-add-line align-bottom me-1"></i> Filters
              </button>
              <button type="button" class="btn btn-soft-success add-btn" id="create-btn" data-bs-toggle="modal" href="#clientModalAdd" @click="addNewClientModal">
                <i class="ri-add-line align-bottom me-1"></i> Add Client
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

    <kanbanBoard :key="list" :list="list" @onFire="printEmit" @userData="setClientData" style="min-height: 600px;" @setMessages="setMessagesInfo"/>

    <div class="modal fade" id="importData" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
          <div class="modal-header bg-soft-primary p-3">
            <h5 class="modal-title" id="uploadClient">Upload Clients</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div style="padding: 1.25rem;">
            <p> <b>We spect the following column (12) in the .CSV file</b></p> <br>
            <p>Last Name, First Name, Address, City, State, Zip, Daytime phone, Evening Phone, Age, Media, Language, Assigned</p>
            <a href="\assets\images\spectedList.PNG" target="_blank"> Check the picture</a>
          </div>
          <chargeProspects> </chargeProspects>
        </div>
      </div>
    </div><!--end modal-->

  <!--  UPDATE CLIENTS  -->
    <div class="modal fade zoomIn" id="agentModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"  data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0">
          <div class="modal-header p-3 bg-soft-info">
            <h5 class="modal-title" id="modalTitle">Clients Card</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    id="close-modal"></button>
          </div>
          <div class="row">
            <div class="col-md-9">
              <div class="tab-content">
                <div
                    class="tab-pane fade show active"
                    id="mainTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-info-tab"
                >
                  <div>
                    <form @submit.prevent="">
                      <div class="modal-body">
                        <p class="text-muted mb-4">
                          is in <a href="#"><span style="text-decoration: underline;"> X </span></a>
                        </p>
                        <h6> <span style="color:red; font-size: 0.7em;">Required fields (*)</span></h6>
                        <input type="hidden" id="id"/>
                        <div class="row g-3" v-if="this.isClientList == true">
                          <div class="col-lg-12">
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editEmail" class="form-label">Email</label>
                                <input type="text" id="editEmail" class="form-control mb-2" placeholder="Enter Email"
                                       v-model="clientData.email">
                              </div>
                              <div class="col-lg-6">
                                <label for="editCreatedBy" class="form-label">Created By</label>
                                <input type="text" id="editCreatedBy" name="editCreatedBy" class="form-control mb-2" disabled
                                       v-model="this.clientData.createdBy">
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editFirstName" class="form-label">First Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <input type="text" id="editFirstName" class="form-control mb-2"
                                       placeholder="Enter First Name" v-model="this.clientData.firstName" required>
                              </div>
                              <div class="col-lg-6">
                                <label for="editLastName" class="form-label">Last Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <input type="text" id="editLastName" class="form-control mb-2"
                                       placeholder="Enter Last Name" v-model="this.clientData.lastName" required>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editType" class="form-label">Source <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <select class="form-select mb-2" aria-label="Status" id="editType1" name="editType" v-model="this.clientData.type">
                                  <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                                </select>
                              </div>
                              <div class="col-lg-6">
                                <label for="editGender" class="form-label"> Gender <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <br>
                                <div class="form-check-success form-check-inline" style="margin-top: 0.8em;">
                                  <input class="form-check-input" type="radio" name="editGender1" id="editGender1" value="M" v-model="this.clientData.gender">
                                  <label class="form-check-label" for="editGender1"> &nbsp; Male</label>
                                </div>
                                <div class="form-check-success form-check-inline" style="margin-top: 0.8em;">
                                  <input class="form-check-input" type="radio" name="editGender1" id="editGender3" value="F" v-model="this.clientData.gender">
                                  <label class="form-check-label" for="editGender3"> &nbsp; Female</label>
                                </div>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editLanguage" class="form-label">Language <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <select class="form-select mb-2" aria-label="Language" id="editLanguage"
                                        v-model="this.clientData.language" required>
                                  <option value="1" selected>English</option>
                                  <option value="2">Spanish</option>
                                </select>
                              </div>
                              <div class="col-lg-6">
                                <label for="editStatus" class="form-label">Status <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <select class="form-select mb-2" aria-label="Status" id="editStatus"
                                        v-model="this.clientData.status">
                                  <option v-for="(status, statusIndex) of statusList" :key="statusIndex"
                                          v-bind:value="status.statusID">{{ status.name }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editPhoneNumber" class="form-label">Phone <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <input type="text" id="editPhoneNumber" class="form-control mb-2"
                                       placeholder="Phone number" required v-model="this.clientData.phone"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editDepartment" class="form-label">Department <span style="color:red; font-size: 0.7em;">(*)</span></label>
                                <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                                        v-model="this.clientData.department" v-if="(departmentList.length > 1)">
                                    <option v-for="(department, index) of departmentList"  :key="index"
                                            v-bind:value="department.departmentID">{{ department.name }}
                                    </option>
                                </select>
                                <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                                        v-model="this.clientData.department" v-else>
                                  <option v-bind:value="departmentList.departmentID">{{ departmentList.name }}</option>
                                </select>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editAddress" class="form-label">Address</label>&nbsp;<code><a href="#" target="_blank" id="gMapsLink">Google Maps</a></code>
                                <input type="text" id="editAddress" class="form-control mb-2"
                                       placeholder="Enter Address" required v-model="this.clientData.address"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editBirthDate" class="form-label mb-2">Birth Date</label>
                                <flat-pickr
                                    placeholder="Select Birth Date"
                                    v-model="this.clientData.birthDate"
                                    :config="timeConfig"
                                    class="form-control flatpickr-input"
                                    id="editBirthDate"></flat-pickr>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editState" class="form-label">State</label>
                                <input type="text" id="editState" class="form-control mb-2" placeholder="Enter State"
                                       required v-model="this.clientData.state"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editCountry" class="form-label">Country</label>
                                <input type="text" id="editCountry" class="form-control mb-2"
                                       placeholder="Enter Country" required v-model="this.clientData.country"/>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editCity" class="form-label">City</label>
                                <input type="text" id="editCity1" name="editCity1" class="form-control mb-2" placeholder="Enter City" required v-model="this.clientData.city"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editPostalCode" class="form-label">Age</label>
                                <span><p><b style="vertical-align: sub;">{{ this.clientData.age }}</b></p></span>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editPostalCode" class="form-label">Postal code</label>
                                <input type="text" id="editPostalCode" class="form-control mb-2"
                                       placeholder="Enter Address" required v-model="this.clientData.zipCode"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editInterview" class="form-label mb-2">Interview Date</label>
                                <flat-pickr
                                    v-model="this.clientData.interview"
                                    :config="dateTimeConfig"
                                    id="editInterview"
                                    class="form-control"
                                    data-provider="timepickr"
                                    data-time-hrs="true"
                                ></flat-pickr>
                              </div>
                            </div>
                          </div>
                          <!--end col-->
                        </div>
                        <div class="row g-3" v-else>
                          <div class="col-lg-12">
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editEmail" class="form-label">Email</label>
                                <input type="text" id="editEmail" class="form-control mb-2" placeholder="Enter Email"
                                       v-model="clientData.email">
                              </div>
                              <div class="col-lg-6">
                                <label for="editCreatedBy" class="form-label">Created By</label>
                                <input type="text" id="editCreatedBy" name="editCreatedBy" class="form-control mb-2" disabled
                                       v-model="this.clientData.createdBy">
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editFirstName" class="form-label">First Name</label>
                                <input type="text" id="editFirstName" class="form-control mb-2"
                                       placeholder="Enter First Name" v-model="this.clientData.firstName" required>
                              </div>
                              <div class="col-lg-6">
                                <label for="editLastName" class="form-label">Last Name</label>
                                <input type="text" id="editLastName" class="form-control mb-2"
                                       placeholder="Enter Last Name" v-model="this.clientData.lastName" required>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editLanguage" class="form-label">Language</label>
                                <select class="form-select mb-2" aria-label="Language" id="editLanguage"
                                        v-model="this.clientData.language" required>
                                  <option value="1" selected>English</option>
                                  <option value="2">Spanish</option>
                                </select>
                              </div>
                              <div class="col-lg-6">
                                <label for="editStatus" class="form-label">Status</label>
                                <select class="form-select mb-2" aria-label="Status" id="editStatus"
                                        v-model="this.clientData.status">
                                  <option v-for="(status, statusIndex) of statusList" :key="statusIndex"
                                          v-bind:value="status.statusID">{{ status.name }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editPhoneNumber" class="form-label">Phone</label>
                                <input type="text" id="editPhoneNumber" class="form-control mb-2"
                                       placeholder="Phone number" required v-model="this.clientData.phone"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editDepartment" class="form-label">Department</label>
                                <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                                        v-model="this.clientData.department" v-if="(departmentList.length > 1)">
                                  <option v-for="(department, index) of departmentList"  :key="index"
                                          v-bind:value="department.departmentID">{{ department.name }}
                                  </option>
                                </select>
                                <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                                        v-model="this.clientData.department" v-else>
                                  <option v-bind:value="departmentList.departmentID">{{ departmentList.name }}</option>
                                </select>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editAddress" class="form-label">Address</label>
                                <input type="text" id="editAddress" class="form-control mb-2"
                                       placeholder="Enter Address" required v-model="this.clientData.address"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editBirthDate" class="form-label mb-2">Birth Date</label>
                                <flat-pickr
                                    placeholder="Select Birth Date"
                                    v-model="this.clientData.birthDate"
                                    :config="timeConfig"
                                    class="form-control flatpickr-input"
                                    id="editBirthDate"></flat-pickr>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editState" class="form-label">State</label>
                                <input type="text" id="editState" class="form-control mb-2" placeholder="Enter State"
                                       required v-model="this.clientData.state"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editCountry" class="form-label">Country</label>
                                <input type="text" id="editCountry" class="form-control mb-2"
                                       placeholder="Enter Country" required v-model="this.clientData.country"/>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editPostalCode" class="form-label">Postal code</label>
                                <input type="text" id="editPostalCode" class="form-control mb-2"
                                       placeholder="Enter Address" required v-model="this.clientData.zipCode"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editInterview" class="form-label mb-2">Interview</label>
                                <flat-pickr
                                    v-model="this.clientData.interview"
                                    :config="dateTimeConfig"
                                    id="editInterview"
                                    class="form-control"
                                    data-provider="timepickr"
                                    data-time-hrs="true"
                                ></flat-pickr>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-lg-6">
                                <label for="editAgentNumber" class="form-label">Agent Number</label>
                                <input type="text" id="editAgentNumber" class="form-control mb-2"
                                       placeholder="Enter Agent Number" required v-model="this.clientData.agentNumber"/>
                              </div>
                              <div class="col-lg-6">
                                <label for="editLicensed" class="form-label">Insurance Licensed?</label>
                                <select class="form-select mb-2" aria-label="Department" id="editLicensed"
                                        v-model="this.clientData.insuranceLicense">
                                  <option value="0">No</option>
                                  <option value="1">Yes</option>
                                </select>
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

                    <notes :dataList="notesData" @onFire="getNotes()"> </notes>

                  <!-- end chat-wrapper -->
                </div>
                <!-- end tab pane -->

                <div
                    class="tab-pane fade"
                    id="thirdTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-info-tab"
                    style="height: 600px;"
                >

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
                  <uploadClients></uploadClients>
                </div>
                <!-- end tab pane -->

                <div
                    class="tab-pane fade"
                    id="fifthTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-address-tab"
                    style="height: 600px;"
                >
                  <econtacts :eContactlist="eContactlist" @eContactData="refreshContacts"></econtacts>
                </div>
                <!-- end tab pane -->

                <div
                    class="tab-pane fade"
                    id="sixthTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-address-tab"
                    style="height: 600px;"
                >
                  <benlist :benList="benList" @benData="refreshBenList"></benlist>
                </div>
                <!-- end tab pane -->

                <div
                    class="tab-pane fade"
                    id="seventhTab"
                    role="tabpanel"
                    aria-labelledby="pills-bill-address-tab"
                    style="height: 600px;"
                >
                  <additaments :additamentsList="additamentsList" @additamentData="refreshAdditaments"></additaments>
                </div>
                <!-- end tab pane -->

              </div>
              <!-- end tab content -->
            </div>
            <div class="col-md-3 window-sidebar margin-left-menu">
              <div class="window-module" style="margin-top: 10px;">
                <h3 class="mod-no-top-margin js-sidebar-add-heading">Options</h3>
                <div class="window-module">
                  <div class="u-clearfix">
                    <a class="button-link js-change-card-members" href="#" title="Information"
                       @click="showTabs('mainTab')">
                      <i class="ri-calendar-2-fill align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Information</span>
                    </a>
                    <a class="button-link js-change-card-members" href="#" title="econtacts"
                       @click="showTabs('fifthTab'), getEcontacts()">
                      <i class="ri-contacts-book-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">E. Contacts</span>
                    </a>
                    <a class="button-link js-change-card-members" href="#" title="beneficiaries"
                       @click="showTabs('sixthTab'), getBeneficiaries()">
                      <i class="ri-add-box-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Beneficiaries</span>
                    </a>
                    <a class="button-link js-change-card-members" href="#" title="additaments"
                       @click="showTabs('seventhTab'), getAdditaments()">
                      <i class="ri-hand-heart-line align-bottom me-1"></i>
                      <span class="js-sidebar-action-text">Additaments</span>
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
                    <a class="button-link js-add-checklist-menu" href="#" title="Checklist" @click="deleteclient">
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
                       @click="updateInformation" style="background-color: #2abb52;">
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

    <!--  Add client modal  -->
    <div class="modal zoomIn" id="clientModalAdd" tabindex="-1" aria-labelledby="clientModalLabel" aria-hidden="true"  data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 1000px;">
        <div class="modal-content">
          <div class="modal-header bg-light p-3">
            <h5 class="modal-title" id="clientModalLabelAdd"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    id="close-modal"></button>
          </div>
          <form id="addform" @submit.prevent="">
            <input type="hidden" id="localAgentID" value="0">
            <div class="modal-body">
              <h6> <span style="color:red; font-size: 0.7em;">Required fields (*)</span></h6>
              <div class="row g-3">
                <div class="col-lg-12">
                  <div class="row">
                    <div class="col-lg-8">
                      <label for="editEmail" class="form-label">Email</label>
                      <input type="text" id="editEmail" name="editEmail" class="form-control mb-2 createEmail" placeholder="Enter Email"
                             v-model="clientData.email">
                      <div class="invalid-feedback">
                        This email is already in use.
                      </div>
                    </div>
                    <div class="col-lg-4">
                      <label for="editCreatedBy" class="form-label">Created By</label>
                      <input type="text" id="editCreatedBy" name="editCreatedBy" class="form-control mb-2" disabled v-model="this.clientData.createdBy">
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-4">
                      <label for="editFirstName" class="form-label">First Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editFirstName" name="editFirstName" class="form-control mb-2" placeholder="Enter First Name" v-model="this.clientData.firstName" required>
                    </div>
                    <div class="col-lg-4">
                      <label for="editLastName" class="form-label">Last Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editLastName" name="editLastName" class="form-control mb-2" placeholder="Enter Last Name" v-model="this.clientData.lastName" required>
                    </div>
                    <div class="col-lg-4">
                      <label for="editGender" class="form-label"> Gender <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <br>
                        <div class="form-check-success form-check-inline" style="margin-top: 0.8em;">
                          <input class="form-check-input" type="radio" name="editGender" id="editGender" value="M" v-model="this.clientData.gender">
                          <label class="form-check-label" for="editGender"> &nbsp; Male</label>
                        </div>
                        <div class="form-check-success form-check-inline" style="margin-top: 0.8em;">
                          <input class="form-check-input" type="radio" name="editGender" id="editGender2" value="F" v-model="this.clientData.gender">
                          <label class="form-check-label" for="editGender2"> &nbsp; Female</label>
                        </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-4">
                      <label for="editLanguage" class="form-label">Language <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <select class="form-select mb-2" aria-label="Language" id="editLanguage" name="editLanguage" v-model="this.clientData.language" required>
                        <option value="1" selected>English</option>
                        <option value="2">Spanish</option>
                      </select>
                    </div>
                    <div class="col-lg-4">
                      <label for="editStatus" class="form-label">Status <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <select class="form-select mb-2" aria-label="Status" id="editStatus" name="editStatus" v-model="this.clientData.status">
                        <option v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                      </select>
                    </div>
                    <div class="col-lg-4">
                      <label for="editType" class="form-label">Client Source <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <select class="form-select mb-2" aria-label="Status" id="editType" name="editType" v-model="this.clientData.type">
                        <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-4">
                      <label for="editPhoneNumber" class="form-label">Phone <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editPhoneNumber" name="editPhoneNumber" class="form-control mb-2" placeholder="Phone number" required v-model="this.clientData.phone"/>
                    </div>
                    <div class="col-lg-4">
                      <label for="editDepartment" class="form-label">Department <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                              v-model="this.clientData.department" v-if="(departmentList.length > 1)">
                        <option v-for="(department, index) of departmentList"  :key="index"
                                v-bind:value="department.departmentID">{{ department.name }}
                        </option>
                      </select>
                      <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                              v-model="this.clientData.department" v-else>
                        <option v-bind:value="departmentList.departmentID">{{ departmentList.name }}</option>
                      </select>
                    </div>
                    <div class="col-lg-4">
                      <label for="editInterview" class="form-label mb-2">Interview</label>
                      <flat-pickr
                          v-model="this.clientData.interview"
                          :config="dateTimeConfig"
                          id="editInterview"
                          name="editInterview"
                          class="form-control"
                          data-provider="timepickr"
                          data-time-hrs="true"
                      ></flat-pickr>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-8">
                      <label for="editAddress" class="form-label">Address</label>
                      <input type="text" id="editAddress" name="editAddress" class="form-control mb-2" placeholder="Enter Address" required v-model="this.clientData.address"/>
                    </div>
                    <div class="col-lg-4">
                      <label for="editBirthdate" class="form-label"> Birthdate </label>
                      <flat-pickr
                          v-model="this.clientData.birthday"
                          :config="humanfriendlyConfig"
                          class="form-control flatpickr-input"
                          id="editBirthdate"
                          name="editBirthdate"
                      ></flat-pickr>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-2">
                      <label for="editState" class="form-label">State</label>
                      <input type="text" id="editState" name="editState" class="form-control mb-2" placeholder="Enter State" required v-model="this.clientData.state"/>
                    </div>
                    <div class="col-lg-3">
                      <label for="editCountry" class="form-label">Country</label>
                      <input type="text" id="editCountry" name="editCountry" class="form-control mb-2" placeholder="Enter Country" required v-model="this.clientData.country"/>
                    </div>
                    <div class="col-lg-3">
                      <label for="editCity" class="form-label">City</label>
                      <input type="text" id="editCity" name="editCity" class="form-control mb-2" placeholder="Enter City" required v-model="this.clientData.city"/>
                    </div>
                    <div class="col-lg-4">
                      <label for="editPostalCode" class="form-label">Postal code</label>
                      <input type="text" id="editPostalCode" name="editPostalCode" class="form-control mb-2" placeholder="Enter Address" required v-model="this.clientData.zipCode"/>
                    </div>
                  </div>
                  <div class="row">
                    <div class="mt-4">
                      <label
                          for="editNotes"
                          class="form-label text-muted text-uppercase fw-semibold"
                      >Notes</label>
                      <textarea
                          class="form-control alert alert-primary"
                          v-model="this.clientData.note"
                          id="editNotes"
                          name="editNotes"
                          placeholder="Notes"
                          rows="2"
                      ></textarea>
                    </div>
                  </div>
                </div>
                <!--end col-->

                <!-- Add beneficiaries -->
                <fieldset class="fieldset-style">
                  <legend class="legend-style"><small style="font-size: 0.7em;">Add Beneficiary <b>+</b></small> <span class="btn btn-success" @click="addBeneficiary()" style="float: right;"><i class="ri-add-line"></i></span>
                    <hr></legend>
                  <div class="form-group">
                    <div id="addBeneficiary">
                    </div>
                  </div>
                </fieldset>

                <!-- Add Emergency contacts -->
                <fieldset class="fieldset-style">
                  <legend class="legend-style"><small style="font-size: 0.7em;">Emergency Contacts <b>+</b></small> <span class="btn btn-success" @click="addEcontact()" style="float: right;"><i class="ri-add-line"></i></span><hr></legend>
                  <div class="form-group">
                    <form id="addEcontact">
                    </form>
                  </div>
                </fieldset>

                <!-- Add Additaments -->
                <fieldset class="fieldset-style">
                  <legend class="legend-style"><small style="font-size: 0.7em;">Add Additaments <b>+</b></small> <span class="btn btn-success" @click="addAdditaments()" style="float: right;"><i class="ri-add-line"></i></span><hr></legend>
                  <div class="form-group">
                    <form id="addAdditaments">
                    </form>
                  </div>
                </fieldset>
              </div>
              <!--end row-->
            </div>

            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-danger" @click="resetForm" >Reset</button>
                <button type="button" class="btn btn-primary" id="goBack" style="display: none;" @click="restoreForm('back')">Back</button>
                <button type="button" class="btn btn-info" id="add-another-client" @click="addAnotherClient()">Add Another</button>
                <button type="button" class="btn btn-primary" id="goNext" style="display: none;" @click="restoreForm('next')">Next</button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="createClient">Save</button>
<!--                <button type="button" class="btn btn-success" id="edit-btn" @click="updateAgent">Update</button>-->
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Filters Modal -->
    <div id="open-filters" class="modal fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;"  data-bs-focus="false">
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
                <label for="filterType" class="form-label">Source</label>
                <select class="form-select mb-2" aria-label="Status" id="filterType" name="filterType" v-model="this.data.searchValues.type">
                  <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                </select>
              </div>
              <div class="col-lg-6">
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="editLanguage" class="form-label">Language</label>
                <select class="form-select mb-2" aria-label="Language" id="filterLanguage" name="filterLanguage" v-model="this.data.searchValues.language">
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
            <button type="button" class="btn btn-primary" @click="updateClientList()">Search</button>
          </div>

        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
  </Layout>
</template>
