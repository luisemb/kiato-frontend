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
import notes from '../../components/users/notes';

export default {
  page: {
    title: "Deleted Clients",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
    flatPickr,
    Multiselect,
    Lottie,
    notes
  },
  data() {
    return{
      title: "Deleted Client List",
      items: [
        {
          text: "Clients",
          href: "/",
        },
        {
          text: "Deleted Client List",
          active: true,
        },
      ],
      openCreate: 0,
      page: 1,
      perPage: 100,
      pages: [],
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
      clientData: [],
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          type: '',
          noteSearch: '',
          keyword: '',
          language: '3',
          clients: 1,
          status: 0,
          sortBy: 'name',
          orderBy: 'ASC',
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
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
      this.resetAgentData()
      document.getElementById("addform").reset();
      document.getElementById('agentModalLabel').innerHTML="Add Client";
      document.getElementById('add-btn').style.display='block';
      document.getElementById('edit-btn').style.display='none';
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
    async updateClient() {

      this.errors = []

      if (!this.clientData.lastName) {
        this.errors.push('Last Name is required.');
      }
      if (!this.clientData.gender) {
        this.errors.push('Gender is required.');
      }

      if (!this.clientData.language) {
        this.errors.push('Language is required.');
      }

      if (!this.clientData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.clientData.phoneNumber) {
        this.errors.push('Phone is required.');
      }

      if (this.validPhone(this.clientData.phoneNumber) === false && this.clientData.phoneNumber !== '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.clientData.departmentID) {
        this.errors.push('Department is required.');
      }

      if (!this.errors.length) {

        const data = {
          username: '',
          email: this.clientData.email,
          city: this.clientData.city,
          firstName: this.clientData.firstName,
          lastName: this.clientData.lastName,
          language: this.clientData.language,
          status: this.clientData.status,
          leadType: this.clientData.leadType,
          gender: this.clientData.gender,
          phoneNumber: this.clientData.phoneNumber,
          departmentID: this.clientData.departmentID,
          state: this.clientData.state,
          birthDate: this.formatDate(this.clientData.birthday, 'DD MMM, YYYY'),
          address: this.clientData.address,
          country: this.clientData.country,
          postalCode: this.clientData.postalCode,
          interviewDate: this.clientData.interview,
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

      if (!this.clientData.phoneNumber) {
        this.errors.push('Phone is required.');
      }

      if (this.validPhone(this.clientData.phone) === false && this.clientData.phone === '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.clientData.departmentID) {
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
        let beneficiaries = this.getBenficiaries();
        let emergencyContacts = this.getEmergency();
        let addedChilds = this.getAddedChilds();
        let note = {'note': this.clientData.note};

        let formValues = {'address': this.clientData.address, 'birthday': this.clientData.birthday,
          'city': this.clientData.city, 'country': this.clientData.country, 'department': this.clientData.departmentID,
          'email': this.clientData.email, 'firstName': this.clientData.firstName,
          'interview': this.clientData.interview, 'language': this.clientData.language, 'lastName': this.clientData.lastName,
          'leadType': this.clientData.leadType, 'note': this.clientData.note, 'phoneNumber': this.clientData.phoneNumber,
          'postalCode': this.clientData.postalCode,'state': this.clientData.state,'status': this.clientData.status,
          'length': this.clientData.length, 'gender': this.clientData.gender};

        // let form = document.getElementById("addform");

        // for (var i = 0; i < form.elements.length; i++) {
        //   let e = form.elements[i];
        //
        //   console.log(e)
        // if(e.name !== '') {
        //   formValues[e.name] = e.value;
        // }
        // formValues['editGender'] = document.querySelector("input[type='radio'][name=editGender]:checked").value;
        //
        // if(this.isClientList){
        //   formValues['editType'] = document.querySelector("#editType").value;
        // }else{
        //   formValues['editType'] = document.querySelector("#editType1").value;
        // }
        // }

        let values = {0: {formValues, beneficiaries, emergencyContacts, addedChilds, note}}

        let data = {
          clientsInfo: values,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          userEmail: localStorage.getItem('email'),
          isProspect: 0,
          totalClients: 1,
        }

        await axios
            .post('/api/client/createClientList', data)
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
    async getUserInfo(id) {
      document.getElementById('edit-btn').style.display='block';
      document.getElementById('add-btn').style.display='none'
      document.getElementById('agentModalLabel').innerHTML="Edit Agent"

      const data = {
        token: localStorage.getItem('jwt'),
        ID: id
      }

      let agentInfo;

      await axios
          .post('/api/getUser', data)
          .then(response => {
            agentInfo=response.data
            this.setAgentData(agentInfo);
            document.getElementById('id').value=agentInfo.ID
            document.getElementById('editEmail').value=agentInfo.email;
            document.getElementById('editFirstName').value=agentInfo.firstName;
            document.getElementById('editLastName').value=agentInfo.lastName;
            document.getElementById('editLanguage').value=agentInfo.language;
            document.getElementById('editStatus').value=agentInfo.status
            document.getElementById('editPhoneNumber').value= agentInfo.phoneNumber;
            document.getElementById('editDepartment').value=agentInfo.departmentID;
            document.getElementById('editBirthDate').value=agentInfo.dateOfBirth;
            document.getElementById('editAddress').value=agentInfo.address;
            document.getElementById('editState').value=agentInfo.state;
            document.getElementById('editCountry').value=agentInfo.country;
            document.getElementById('editPostalCode').value=agentInfo.postalCode;
            document.getElementById('editAgentNumber').value=agentInfo.agentNumber;
            document.getElementById('editCreatedBy').value=agentInfo.createdBy;
            document.getElementById('editLicensed').value=agentInfo.isLicensed;
            // document.getElementById('editInterview').value=agentInfo.interviewDate;
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
      this.openCreate = 0;
      document.getElementById('edit-btn').style.display='block';
      document.getElementById('add-btn').style.display='none'
      document.getElementById('agentModalLabel').innerHTML="Edit Client"

      const data = {
        token: localStorage.getItem('jwt'),
        ID: id
      }

      let clientInfo;

      await axios
          .post('/api/client/getClient', data)
          .then(response => {
            clientInfo = response.data;
            this.setClientData(response.data);
            localStorage.setItem('selectedUser', clientInfo.ID);
            localStorage.setItem('selectedUserName', clientInfo.firstName + ' ' + clientInfo.lastName);
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
    async updateClientList(status=0) {

      let validate = true;
      let errors = [];
      let filterLanguage = document.getElementById("filterLanguage").value;
      let filterKeyword = document.getElementById("filterKeyword").value;
      let filterType = document.getElementById("filterType").value;
      let filterNotes = document.getElementById("filterNotes").value;
      let filterFromDate = document.getElementById("filterFromDate").value;
      let filterToDate = document.getElementById("filterToDate").value;
      this.data.searchValues.status = status;

      if (filterLanguage !== '' && (filterLanguage === '1' || filterLanguage === '2')){
        this.data.searchValues.language = filterLanguage;
      }

      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.data.searchValues.keyword = filterKeyword;
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
        deleted: 1,
      }

      if(validate){
        await axios
            .post('/api/client/listClients', data)
            .then(response => {
              this.list = response.data
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
    formatDate: function(date, format){
      date = moment(date).format(format)
      return date;
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
    setAgentData: function(data) {
      this.agentData.email=data.email;
      this.agentData.firstName=data.firstName;
      this.agentData.lastName=data.lastName;
      this.agentData.language=data.language;
      this.agentData.status=data.status
      this.agentData.phone=data.phoneNumber;
      this.agentData.department=data.departmentID
      this.agentData.birthDate= this.formatDate(data.dateOfBirth, 'DD MM, YYYY');
      this.agentData.interview= this.formatDate(data.interviewDate, 'm-d-y H:i K');
      this.agentData.address=data.address;
      this.agentData.state=data.state;
      this.agentData.country=data.country;
      this.agentData.zipCode=data.postalCode;
      this.agentData.agentNumber=data.agentNumber;
      this.agentData.createdBy=data.createdBy;
      this.agentData.insuranceLicense=data.isLicensed;
    },
    resetAgentData: function(){
      this.agentData =
          {username: '',
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
    setPages() {
      let numberOfPages = Math.ceil(this.list.length / this.perPage);
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
    setClientData(clientInfo){

      this.clientData.email=clientInfo.email;
      this.clientData.firstName=clientInfo.firstName;
      this.clientData.lastName=clientInfo.lastName;
      this.clientData.language=clientInfo.language;
      this.clientData.status=clientInfo.status;
      this.clientData.phoneNumber=clientInfo.phoneNumber;
      this.clientData.gender=clientInfo.gender;
      this.clientData.age=clientInfo.age;
      this.clientData.type=(clientInfo.type !== '') ? clientInfo.type: clientInfo.leadType;
      this.clientData.city=clientInfo.city;
      this.clientData.departmentID=clientInfo.departmentID;
      this.clientData.leadType= clientInfo.leadType;
      this.clientData.birthday= this.formatDate(clientInfo.dateOfBirth, 'DD MMM, YYYY');
      this.clientData.interview= this.formatDate(clientInfo.interviewDate, 'MMMM D, YYYY h:mm A');
      this.clientData.address=clientInfo.address;
      this.clientData.state=clientInfo.state;
      this.clientData.country=clientInfo.country;
      this.clientData.postalCode=clientInfo.postalCode;
      this.clientData.agentNumber=clientInfo.agentNumber;
      this.clientData.createdBy=clientInfo.createdBy;
      this.clientData.insuranceLicense=clientInfo.isLicensed;
    },
    async getNotes (id = localStorage.getItem('selectedUser')) {
      const data = {
        token: localStorage.getItem('jwt'),
        userID: localStorage.getItem('id'),
        agentID: id,
        clientID: id,
      }

      localStorage.setItem('selectedUser', id)

      let url = '';
      url = '/api/client/getClientNotes';

      await axios
          .post(url, data)
          .then(response => {
            this.notesData = response.data;
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Notes could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    async getProspectStatus(id) {

      localStorage.setItem('selectedUser', id)
      const data = {
        token: localStorage.getItem('jwt'),
        searchValues: this.data.searchValues,
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        isProspect: 1,
      }

      await axios
          .post('/api/client/clientStatus', data)
          .then(response => {
            this.prospectStatusList = response.data
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
          .put('/api/client/moveClient', data)
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
    deleteclient(ID) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-danger ml-2",
          cancelButton: "btn btn-success",
        },
        buttonsStyling: false,
      });
      localStorage.setItem('selectedUser', ID)
      swalWithBootstrapButtons
          .fire({
            title: "Are you sure?",
            text: "This client will be recover and send to the clients list.",
            icon: "warning",
            confirmButtonText: "Yes, recover it!",
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
                agentID: localStorage.getItem('selectedUser'),
                deleted: 0
              }

              axios
                  .put('/api/client/delete', data)
                  .then(async response => {
                    if (response) {
                      await this.updateClientList()
                      await swalWithBootstrapButtons.fire(
                          "Success!",
                          "Client has been recovered.",
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
    handleFocus(e){
      e.target.setAttribute("autocomplete", "nope");
    },
  },
  async mounted() {

    let field = 'n';
    let url = window.location.href;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const status = urlParams.get(field)

    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: this.data.searchValues,
      userEmail: localStorage.getItem('email'),
      userID: localStorage.getItem('id'),
      isProspect: 0,
      deleted: 1,
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

    if((url.indexOf('?' + field + '=') !== -1))
      document.getElementById(status).click()
    else
      await axios
          .post('/api/client/listClients', data)
          .then(response => {
            this.list=response.data
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
              data.policyNumber.toLowerCase().includes(search) ||
              data.email.toLowerCase().includes(search) ||
              data.phoneNumber.toLowerCase().includes(search) ||
              data.firstName.toLowerCase().includes(search) ||
              data.lastName.toLowerCase().includes(search) ||
              data.FullName.toLowerCase().includes(search) ||
              data.postalCode.toLowerCase().includes(search)
          );
        });
      } else {
        return this.displayedPosts;
      }
    },
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
                      v-model="this.data.searchValues.keyword"
                      @change="this.data.searchValues.keyword.length >= 3 ? updateClientList(): ''"
                      v-on:keyup.enter="this.data.searchValues.keyword === '' ? updateClientList() : ''"
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>
              </div>
              <div class="col-sm-auto ms-auto">
                <div class="hstack gap-2">
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
                  <button type="button" class="btn btn-soft-success add-btn" href="#open-filters" data-bs-toggle="modal">
                    <i class="ri-filter-line align-bottom me-1"></i> Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Head -->
          <ul
              class="nav nav-tabs nav-tabs-custom nav-primary mb-3"
              role="tablist">
            <li class="nav-item">
              <a
                  class="nav-link active All py-3"
                  data-bs-toggle="tab"
                  id="All"
                  href="#home1"
                  role="tab"
                  aria-selected="true"
                  @click="updateClientList(0)"
              >
                <i class="ri-file-search-line me-1 align-bottom"></i> All
              </a>
            </li>
            <li class="nav-item" v-for="(data, index) of statusList" :key="index">
              <a
                  class="nav-link py-3 " v-bind:class="data.name"
                  data-bs-toggle="tab"
                  v-bind:id="data.name"
                  v-bind:href="'#'+data.name"
                  role="tab"
                  aria-selected="false"
                  @click="updateClientList(data.statusID)"
              >
                <i class="me-1 align-bottom"></i>
                {{ data.name }}
              </a>
            </li>
          </ul>
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
              <th scope="col">Department</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Create Date</th>
              <th scope="col">Status</th>
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
              <td>{{ data.firstName }} {{ data.lastName }}</td>
              <td>{{ data.departmentName }}</td>
              <td>{{ data.email }}</td>
              <td>{{ formatPhone(data.phoneNumber) }}</td>
              <td> {{ formatDate(data.createdOn, 'MMMM Do YYYY, h:mmA') }} </td>
              <td><a href="javascript:void(0);" v-bind:style="'color:'+data.colors"  @click="filterStatus(data.statusName)">{{ data.statusName}}</a></td>
              <td>
                <ul class="list-inline hstack gap-2 mb-0">
                  <li class="list-inline-item" data-bs-toggle="modal" href="#agentModal" data-bs-trigger="hover" data-bs-placement="top" title="Edit" @click="getClientInfo(data.ID)">
                    <a class="edit-item-btn" href="javascript:void(0);"><i class="ri-pencil-fill align-bottom text-muted"></i></a>
                  </li>
                  <li class="list-inline-item" data-bs-toggle="modal" href="#open-notes" data-bs-trigger="hover" data-bs-placement="top" title="Notes" @click="getNotes(data.ID)">
                    <a href="javascript:void(0);" class="text-muted d-inline-block" >
                      <i class="ri-sticky-note-line fs-16"></i>
                    </a>
                  </li>
                  <li class="list-inline-item" data-bs-toggle="modal" data-bs-trigger="hover"  href="#changeStatus"  data-bs-placement="top" title="Update Status" @click="getProspectStatus(data.ID)">
                    <a href="javascript:void(0);" ><i class="ri-refresh-fill align-bottom text-muted"></i></a>
                  </li>
                  <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Delete" @click="deleteclient(data.ID)">
                    <a class="remove-item-btn" data-bs-toggle="modal" href="javascript:void(0);">
                      <i class="ri-device-recover-fill align-bottom text-muted"></i>
                    </a>
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
      <!--end col-->
    </div>
    <!--end row-->

    <!--  Add agent modal  -->
    <div class="modal zoomIn" id="agentModal" tabindex="-1" aria-labelledby="agentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 1000px;">
        <div class="modal-content">
          <div class="modal-header bg-light p-3">
            <h5 class="modal-title" id="agentModalLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    id="close-modal"></button>
          </div>
          <form id="addform" @submit.prevent="">
            <div class="modal-body">
              <h6> <span style="color:red; font-size: 0.7em;">Required fields (*)</span></h6>
              <input type="hidden" id="id"/>
              <div class="row g-3">
                <div class="col-lg-12">
                  <div class="row">
                    <div class="col-lg-8">
                      <label for="editEmail" class="form-label">Email</label>
                      <input type="text" id="editEmail" name="editEmail" class="form-control mb-2 createEmail" placeholder="Enter Email"
                             v-model="this.clientData.email">
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
                      <label for="editType" class="form-label">Type clients <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <select class="form-select mb-2" aria-label="Status" id="editType" name="editType" v-model="this.clientData.leadType">
                        <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-4">
                      <label for="editPhoneNumber" class="form-label">Phone <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <input type="text" id="editPhoneNumber" name="editPhoneNumber" class="form-control mb-2" placeholder="Phone number" required v-model="this.clientData.phoneNumber"/>
                    </div>
                    <div class="col-lg-4">
                      <label for="editDepartment" class="form-label">Department <span style="color:red; font-size: 0.7em;">(*)</span></label>
                      <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                              v-model="this.clientData.departmentID" v-if="(departmentList.length > 1)">
                        <option v-for="(department, index) of departmentList"  :key="index"
                                v-bind:value="department.departmentID">{{ department.name }}
                        </option>
                      </select>
                      <select class="form-select mb-2" aria-label="Department" id="editDepartment" name="editDepartment"
                              v-model="this.clientData.departmentID" v-else>
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
                          :config="timeConfig"
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
                      <input type="text" id="editPostalCode" name="editPostalCode" class="form-control mb-2" placeholder="Enter Address" required v-model="this.clientData.postalCode"/>
                    </div>
                  </div>
                  <div class="row" v-if="this.openCreate === 1">
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
                  </div >
                  <div class="row" v-if="this.openCreate === 1">
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
                </div>
                <!--end col-->
              </div>
              <!--end row-->
            </div>

            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="createClient">Save</button>
                <button type="button" class="btn btn-success" id="edit-btn" @click="updateClient">Update</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

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
                <label for="filterType" class="form-label">Type</label>
                <select class="form-select mb-2" aria-label="Status" id="filterType" name="filterType" v-model="this.data.searchValues.type">
                  <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.code">{{ type.name }}</option>
                </select>
              </div>
              <div class="col-lg-6">
                <label for="filterStatus" class="form-label">Status</label>
                <select class="form-select mb-2" aria-label="Status" id="filterStatus" v-model="this.data.searchValues.status">
                  <option value="0">All</option>
                  <option v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="editLanguage" class="form-label">Language</label>
                <select class="form-select mb-2" aria-label="Language" id="filterLanguage" name="filterLanguage" v-model="this.data.searchValues.language">
                  <option value="1">English</option>
                  <option value="2">Spanish</option>
                  <option value="3">Both</option>
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
            <button type="button" class="btn btn-primary" @click="updateClientList()">Search</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!-- Notes Modal -->
    <div id="open-notes" class="modal fade" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
      <div class="modal-dialog">
        <div class="modal-content">
          <notes :dataList="notesData" @onFire="getNotes()"> </notes>
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
                <label for="filterStatus" class="form-label">Status</label>
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
<style>
.row-spacer{
  margin-bottom: 10px;
}
</style>