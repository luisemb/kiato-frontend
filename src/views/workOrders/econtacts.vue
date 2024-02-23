<script>
import flatPickr from "vue-flatpickr-component";
import moment from "moment";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import Swal from "sweetalert2";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import axios from "axios";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.scss";

// components
import Papa from "papaparse";
import {ref, watch} from "vue";
import useVuelidate from "@vuelidate/core";
import jwt_decode from "jwt-decode";
import SimpleTypeahead from "vue3-simple-typeahead";
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'; //Optional default CSS

export default {
  page: {
    title: "Emergency Contacts",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
    flatPickr,
    Multiselect,
    Lottie,
    SimpleTypeahead,
  },
  data() {
    return{
      title: "Emergency Contacts",
      items: [
        {
          text: "eContacts",
          href: "/",
        },
        {
          text: "Emergency Contacts List",
          active: true,
        },
      ],
      openCreate: 0,
      page: 1,
      perPage: 100,
      pages: [],
      errors: [],
      searchQuery: null,
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y"
      },
      dateTimeConfig: {
        enableTime: true,
        dateFormat: "F j, Y H:i K"
      },
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      typeList: {},
      EcontactData: [],
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          keyword: '',
          sortBy: 'name',
          orderBy: 'ASC',
          dateRange: '0',
          department: '0' ,
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"})
        },
      },
      defaultOptions: { animationData: animationData },
      list: [],
      agentData: {
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
      },
      departmentList: {},
      statusList: {},
      prospectStatusList: {},
      notesData: [],
      messagesData: [],
      file: [],
      content: [],
      parsed: false,
      itemsSearch: [],
      spectedColumns: [
        "Last Name",
        "First Name",
        "Address",
        "City",
        "State",
        "Zip",
        "Daytime Phone",
        "Evening Phone",
        "Age",
        "Media",
        "Language",
        "Received",
        "Assigned",
        "Second Pre-Approach Letter"
      ],
      agentVisible: true,
      idNumber: 1,
    }
  },
  watch: {
    companies() {
      this.setPages();
    },
  },
  created() {
    this.setPages();
  },
  filters: {
    trimWords(value) {
      return value.split(" ").splice(0, 20).join(" ") + "...";
    },
  },
  methods: {
    editdata(data){

      document.getElementById('id').value= data.id
      document.getElementById('customername').value=data.name;
      document.getElementById('companyname').value=data.company;
      document.getElementById('leadsscore').value=data.score;
      document.getElementById('phone').value=data.phone;
      document.getElementById('location').value=data.location;
      document.getElementById('date').value=data.date;
    },
    addNewAgentModal() {

      this.openCreate = 1;
      document.getElementById("addform").reset();
      document.getElementById('agentModalLabel').innerHTML = "Add eContact";
      document.getElementById('add-btn').style.display = 'block';
      document.getElementById('editNoteOpen').style.display = 'none';
      document.getElementById('edit-btn').style.display = 'none';
      document.getElementById("addform").reset();
    },
    async checkClientExists(){

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        userEmail: localStorage.getItem('email'),
        clientID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
        potentialClientEmail: this.EcontactData.email
      }

      if (this.validEmail(data.potentialClientEmail)) {
        await axios
            .post('/api/workOrder/emailExists', data)
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
    async updateeContact() {

      this.errors = []

      if (!this.EcontactData.lastName) {
        this.errors.push('Last Name is required.');
      }
      if (!this.EcontactData.firstName) {
        this.errors.push('First Name is required.');
      }
      if (!this.EcontactData.phone) {
        this.errors.push('Phone is required.');
      }
      if (!this.EcontactData.address) {
        this.errors.push('Address is required.');
      }

      if (this.validPhone(this.EcontactData.phone) === false && this.EcontactData.phone !== '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.errors.length) {

        const data = {
          username: '',
          firstName: this.EcontactData.firstName,
          lastName: this.EcontactData.lastName,
          phoneNumber: this.EcontactData.phone,
          state: this.EcontactData.state,
          address: this.EcontactData.address,
          age: this.EcontactData.age,
          relationship: this.EcontactData.relationship,
          postalCode: this.EcontactData.postalCode,
          createdBy: localStorage.getItem('email'),
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          clientID: localStorage.getItem('selectedUser')
        }

        await axios
            .put('/api/workOrder/updateeContact', data)
            .then(async response => {
              if (response) {
                document.getElementById('close-modal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Emergemcy Contact update successfully!'
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
    async deleteEcontact() {

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
    async getDepartments() {

      await axios
          .post('/api/getDepartments')
          .then(response => {
            console.log(response);
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
    async getEcontactInfo (id) {

      this.openCreate = 0;
      document.getElementById('edit-btn').style.display='block';
      document.getElementById('add-btn').style.display='none';
      document.getElementById('agentModalLabel').innerHTML="Edit eContact";

      let eContactInfo;
      const data = {
        token: localStorage.getItem('jwt'),
        ID: id
      }

      await axios
          .post('/api/workOrder/getEcontact', data)
          .then(response => {
            eContactInfo = response.data;
            this.eContactInfo = response.data;
            this.seteContactData(response.data);
            localStorage.setItem('selectedUser', eContactInfo.clientID);
            localStorage.setItem('selectedUserName', eContactInfo.firstName + ' ' + eContactInfo.lastName);
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
    async updateeContactList() {

      let validate = true;
      let errors = [];
      let filterKeyword = document.getElementById("filterKeyword").value;
      let filterFromDate = document.getElementById("filterFromDate").value;
      let filterToDate = document.getElementById("filterToDate").value;
      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.data.searchValues.keyword = filterKeyword;
      }else if(filterKeyword !== '' && filterKeyword.length < 3) {
        errors.push('Keyword search should have 3 or more characters!')
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
      let typeAhead = document.getElementById('typeahead_id')

      const data = {
        token: localStorage.getItem('jwt'),
        isProspect: 0,
        searchValues: this.data.searchValues,
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        deleted: 0,
        agentSearch: (typeAhead != null && typeof(typeAhead) != 'undefined' ) ? typeAhead.value : []
      }

      if(validate){
        await axios
            .post('/api/workOrder/getEmergencyContacts', data)
            .then(response => {
              this.list = response.data
              this.page = 1
              this.setPages()
            })
            .catch(error => {
              if (error.response) {

                if(error.response.data.detail === 'Your session is expired!'){
                  this.$router.push('logout')
                }

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
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    validPhone: function (phone) {
      var isphone = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
      return isphone;
    },
    formatDate: function (date, format){
      date = moment(date).format(format)
      return date;
    },
    formatPhone: function (phone, flag=0) {

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
    setPages() {
      let numberOfPages = Math.ceil(this.list.length / this.perPage);
      this.pages = []
      for (let index = 1; index <= numberOfPages; index++) {
        this.pages.push(index);
      }
    },
    paginate(companies) {
      let page = this.page;
      let perPage = this.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return companies.slice(from, to);
    },
    seteContactData(eContactInfo){

      this.EcontactData.firstName=eContactInfo.firstName;
      this.EcontactData.lastName=eContactInfo.lastName;
      this.EcontactData.phone=eContactInfo.phone;
      this.EcontactData.age=eContactInfo.age;
      this.EcontactData.city=eContactInfo.city;
      this.EcontactData.address=eContactInfo.address;
      this.EcontactData.postalCode=eContactInfo.postalCode;
      this.EcontactData.state=eContactInfo.state;
      this.EcontactData.relationship=eContactInfo.relationship;
    },
    async moveClient() {

      let client = localStorage.getItem('selectedUser');

      const data = {
        token: localStorage.getItem('jwt'),
        searchValues: this.data.searchValues,
        userEmail: localStorage.getItem('email'),
        client: client,
        status: document.getElementById('moveStatus').value,
        isProspect: 1,
      }

      await axios
          .put('/api/workOrder/moveClient', data)
          .then(async response => {
            document.getElementById('closeMove').click();
            if(response.status === 200){
              await this.updateClientList();

              await Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your Client was moved to Prospect List",
                showConfirmButton: false,
                timer: 5000,
              });
            }
          })
          .catch(error => {
            if (error.response) {

              if (error.response.data.detail === 'Your session is expired!') {
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    filterStatus(status){
      var statusButton= document.getElementById(status);
      statusButton.click();
    },
    handleFocus(e){
      e.target.setAttribute("autocomplete", "nope");
    },
    getMapsLink(){
      let link = 'https://maps.google.com/?q='
      let clientData = this.EcontactData;
      if (clientData.address.length > 0){
        link += '+'+this.EcontactData.address
      }
      if (clientData.postalCode.length > 0){
        link += '+'+clientData.postalCode
      }
      if (clientData.city.length > 0){
        link += '+'+clientData.city
      }
      if (clientData.state.length > 0){
        link += '+'+clientData.state
      }

      if(link !== 'https://maps.google.com/?q='){
        document.getElementById("gMapsLink").href = link;
      } else {
        document.getElementById("gMapsLink").href = '#';
      }

    },
    parseFile(){
      var allowedExtensions = /(\.csv)$/i;
      if (allowedExtensions.exec(this.file.name)) {
        Papa.parse( this.file, {
          header: true,
          skipEmptyLines: true,
          complete: function ( results ) {
            if( this.compare(this.spectedColumns, results.meta.fields)){
              this.content = results;
              this.parsed = true;
            }else{
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
    handleFileUpload(){
      this.file = document.getElementById('listFile').files[0];
      this.parseFile();
    },
    async changeType(){
      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        isProspect: document.getElementById('isProspect').value,
        deleted: 0,
      }

      await axios
          .post('/api/workOrder/woStatus', data)
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
          .post('/api/workOrder/woPriorities', data)
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
    },
    async uploadFile(){

      this.errors = []

      if (document.getElementById('uploadLanguage').value === '') {
        this.errors.push('Language is required.');
      }

      if (document.getElementById('uploadStatus').value === '') {
        this.errors.push('Status is required.');
      }

      if (document.getElementById('uploadType').value === '') {
        this.errors.push('Source is required.');
      }

      if (this.content.length === 0) {
        this.errors.push('Please, upload and process your .csv file.');
      }

      if(this.errors.length === 0){
        const data = {
          token: localStorage.getItem('jwt'),
          userEmail: localStorage.getItem('email'),
          userID: localStorage.getItem('id'),
          listOfData: this.content,
          uploadTo:  localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastname')
              + ' | ' +localStorage.getItem('email'),
          isProspect: 0,
          language: document.getElementById('uploadLanguage').value,
          status: document.getElementById('uploadStatus').value,
          source: document.getElementById('uploadType').value,
          listType: 1,
        }

        await axios
            .post('/api/workOrder/uploadList', data)
            .then(async response => {
              if (response.status === 200) {
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Uploaded successfully!'
                });
              }
              setTimeout(function() {
                location.reload()
              }, 2000);
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
      }else{
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
    viewUserGroup(request){
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.userGroup.includes(request)
    },
    async searchAgents() {
      let typeAhead = document.getElementById('typeahead_id')

      const data = {
        token: localStorage.getItem('jwt'),
        searchValue: (typeAhead != null && typeof(typeAhead) != 'undefined' ) ? typeAhead.value : [],
        condition: 9
      }

      if(data['searchValue'].length > 3) {
        await axios
            .post('/api/userFinder', data)
            .then(async response => {
              this.itemsSearch = response.data;
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
      }

    },
    viewPermission(request) {
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.vueViews.includes(request)
    },
  },
  async mounted() {

    let field = 'n';
    let url = window.location.href;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const status = urlParams.get(field)

    let typeAhead = document.getElementById('typeahead_id')

    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: this.data.searchValues,
      userEmail: localStorage.getItem('email'),
      userID: localStorage.getItem('id'),
      isProspect: 0,
      deleted: 0,
      agentSearch: (typeAhead != null && typeof(typeAhead) != 'undefined' ) ? typeAhead.value : []
    }

    await axios
        .post('/api/listDepartments', data)
        .then(response => {
          this.departmentList=response.data
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
        .post('/api/workOrder/woStatus', data)
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
        .post('/api/workOrder/woPriorities', data)
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

    if((url.indexOf('?' + field + '=') !== -1))
      document.getElementById(status).click()
    else
      await axios
          .post('/api/workOrder/getEmergencyContacts', data)
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

    const checkAll = document.getElementById("checkAll");

    if (checkAll) {
      checkAll.onclick = function () {
        var checkboxes = document.querySelectorAll(
            '.form-check-all input[type="checkbox"]'
        );
        if (checkAll.checked == true) {
          checkboxes.forEach(function (checkbox) {
            checkbox.checked = true;
            checkbox.closest("tr").classList.add("table-active");
          });
        } else {
          checkboxes.forEach(function (checkbox) {
            checkbox.checked = false;
            checkbox.closest("tr").classList.remove("table-active");
          });
        }
      };
    }

    function addEvent(parent, evt, selector, handler) {
      parent.addEventListener(evt, function(event) {
        if (event.target.matches(selector + ', ' + selector + ' *')) {
          handler.apply(event.target.closest(selector), arguments);
        }
      }, false);
    }

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

    // check if some elements shot be visible for techs
    this.agentVisible = !!(this.viewUserGroup('SUPER_ADMIN_GROUP') || this.viewUserGroup('ADMIN_GROUP'));
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
              data.city.toLowerCase().includes(search) ||
              data.phone.toLowerCase().includes(search) ||
              data.firstName.toLowerCase().includes(search) ||
              data.lastName.toLowerCase().includes(search) ||
              data.postalCode.toLowerCase().includes(search)
          );
        });
      } else {
        return this.displayedPosts;
      }
    },
  },
  setup() {
    let files = ref([]);
    let dropzoneFile = ref("");
    const drop = (e) => {
      dropzoneFile.value = e.dataTransfer.files[0];
      files.value.push(dropzoneFile.value);
    };
    const selectedFile = (  ) => {
      dropzoneFile.value = document.getElementById('listFile').files[0];
      files.value.push(dropzoneFile.value);
    };
    watch(
        () => [...files.value],
        (currentValue) => {
          return currentValue;
        }
    );
    return {
      dropzoneFile,
      drop,
      selectedFile,
      v$: useVuelidate(),
      files
    };
  },
};
</script>
<style>
.row-spacer{
  margin-bottom: 10px;
}
</style>
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
                      title="Search by (Phone number, City, Postal code, Name, Last name, Full Name, Address, State)"
                      v-model="this.data.searchValues.keyword"
                      @change="this.data.searchValues.keyword.length >= 3 ? updateClientList(): ''"
                      v-on:keyup.enter="this.data.searchValues.keyword === '' ? updateClientList() : ''"
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>
              </div>
              <div class="col-sm-auto ms-auto">
                <div class="hstack gap-2">
                  <div class="row">
                    <div class="col-md-6" style="margin-top: 5px;">
                      <div class="d-flex align-items-center gap-2">
                        <span class="text-muted flex-shrink-0">Sort by: </span>

                        <Multiselect class="form-control"
                                     style="width:150px;padding: 0px;"
                                     @focus="handleFocus"
                                     v-model="this.data.searchValues.sortBy"
                                     :close-on-select="true"
                                     :searchable="true"
                                     :options="[
                            { value: 'name', label: 'Name' },
                            { value: 'postalCode', label: 'Postal Code' },
                            { value: 'modified', label: 'Modified On' },
                            { value: 'created', label: 'created On' },
                            ]"
                                     @select="updateeContactList()"
                        />

                      </div>
                    </div>
                    <div class="col-md-6" style="margin-top: 5px;">
                      <div class="d-flex align-items-center gap-2">
                        <span class="text-muted flex-shrink-0">Order by: </span>

                        <Multiselect class="form-control"
                                     style="width:150px;padding: 0px;"
                                     v-model="this.data.searchValues.orderBy"
                                     @focus="handleFocus"
                                     :close-on-select="true"
                                     :searchable="true"
                                     :options="[
                            { value: 'ASC', label: 'Ascendance' },
                            { value: 'DESC', label: 'Descendant' },
                            ]"
                                     @select="updateeContactList()"
                        />

                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-8" style="margin-top: 5px;">
                      <button type="button" class="btn btn-soft-success float-end" href="#open-filters" data-bs-toggle="modal">
                        <i class="ri-filter-line align-bottom me-1"></i> Filters
                      </button>
                    </div>
                    <div class="col-md-4" style="margin-top: 5px;">
                    </div>
                  </div>
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
                <th scope="col">Name</th>
                <th scope="col" v-if="agentVisible">Department</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Create Date</th>
                <th scope="col">Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(data, index) of resultQuery" :key="index">
                <td>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="cardtableCheck01">
                    <label class="form-check-label" for="cardtableCheck01"></label>
                  </div>
                </td>
                <td>{{ data.eContactName}}</td>
                <td v-if="agentVisible">{{ data.DepartmentName }}</td>
                <td>{{ data.email }}</td>
                <td>{{ formatPhone(data.eContactPhone) }}</td>
                <td> {{ formatDate(data.eContactCreated, 'MMMM Do YYYY, h:mmA') }} </td>
                <td>
                  <ul class="list-inline hstack gap-2 mb-0">
                    <li class="list-inline-item" data-bs-toggle="modal" href="#agentModal" data-bs-trigger="hover" data-bs-placement="top" title="Edit" @click="getEcontactInfo(data.eContactID)">
                      <a class="edit-item-btn" href="javascript:void(0);"><i class="ri-eye-fill align-bottom text-muted"></i></a>
                    </li>
                  </ul>
                </td>
              </tr>
              </tbody>
            </table>
            <div class="noresult" v-if="list.length <= 0">
              <div class="text-center">
                <lottie
                    class="avatar-xl"
                    colors="primary:#121331,secondary:#08a88a"
                    :options="defaultOptions"
                    :height="75"
                    :width="75"
                />
                <h5 class="mt-2">Sorry! No Result Found</h5>
                <p class="text-muted mb-0">
                  We've searched and didn't find any
                  client for you.
                </p>
              </div>
            </div>
            <div class="d-flex justify-content-end mt-3" v-if="resultQuery.length >= 0">
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
                      active: pageNumber === page,
                      disabled: pageNumber === '...',
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
      <!--end col-->
    </div>
    <!--end row-->

    <!--  Add client modal  -->
    <div class="modal zoomIn" id="agentModal" tabindex="-1" aria-labelledby="agentModalLabel" aria-hidden="true" data-bs-focus="false">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 1000px;">
        <div class="modal-content">
          <div class="modal-header bg-light p-3">
            <h5 class="modal-title" id="agentModalLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    id="close-modal"></button>
          </div>
          <form id="addform" @submit.prevent="" autocomplete="off">
            <div class="modal-body">
              <h6> <span style="color:red; font-size: 0.7em;">Required fields (*)</span></h6>
              <input type="hidden" id="id"/>
              <div class="row g-3">
                <div class="col-lg-12">
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editFirstName" class="form-label">First Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editFirstName" name="editFirstName" class="form-control mb-2" placeholder="Enter First Name" v-model="this.EcontactData.firstName" required  autocomplete="off">
                    </div>
                    <div class="col-lg-6">
                      <label for="editLastName" class="form-label">Last Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editLastName" name="editLastName" class="form-control mb-2" placeholder="Enter Last Name" v-model="this.EcontactData.lastName" required  autocomplete="off">
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editAddress" class="form-label">Address <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editAddress" name="editAddress" class="form-control mb-2" placeholder="Enter Address" v-model="this.EcontactData.address" required>
                    </div>
                    <div class="col-lg-6">
                      <label for="editPhone" class="form-label">Phone <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editPhone" name="editPhone" class="form-control mb-2" placeholder="Enter Phone Number" v-model="this.EcontactData.phone" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editState" class="form-label">State</label>
                      <input type="text" id="editState" name="editState" class="form-control mb-2" placeholder="Enter State" required v-model="this.EcontactData.state"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editPostalCode" class="form-label">Postal code</label>
                      <input type="text" id="editPostalCode" name="editPostalCode" class="form-control mb-2" placeholder="Enter Address" required v-model="this.EcontactData.postalCode"/>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editRelation" class="form-label">Relationship</label>
                      <input type="text" id="editRelation" name="editRelation" class="form-control mb-2" placeholder="Enter Relationship" required v-model="this.EcontactData.relationship"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editAge" class="form-label">Age</label>
                      <input type="text" id="editAge" name="editAge" class="form-control mb-2" placeholder="Enter Age" required v-model="this.EcontactData.age"/>
                    </div>
                  </div>
                </div>
                <!--end col-->
              </div>
              <!--end row-->
            </div>

            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close </button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="createClient">Save </button>
                <button type="button" class="btn btn-success" id="edit-btn" @click="updateeContact">Update </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

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
            <div class="col-md-12" v-if="viewUserGroup('SUPER_ADMIN_GROUP') || viewUserGroup('ADMIN_GROUP')">
              <label for="typeahead_id" class="form-label">Find By Agent</label>
              <SimpleTypeahead
                  id="typeahead_id"
                  placeholder="Type your agent search..."
                  :items="this.itemsSearch"
                  :minInputLength="3"
                  :class="'form-control mb-2'"
                  @onInput="searchAgents"
                  @selectItem="selectItemEventHandler"
              >
              </SimpleTypeahead>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="updateeContactList()">Search</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!-- Move to Prospect Modal -->
    <div id="changeStatus" class="modal fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content ">
          <div class="modal-header">
            <h5 class="modal-title" id="myModalLabel">Move Prospects</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"> </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-lg-12">
                <label for="moveStatus" class="form-label">Status</label>
                <select class="form-select mb-2" aria-label="Status" id="moveStatus">
                  <option value="0">All</option>
                  <option v-for="(status, statusIndex) of prospectStatusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" id="closeMove" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="moveClient()">Move</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

  </Layout>
</template>
