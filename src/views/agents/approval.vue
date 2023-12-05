<script>
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import moment from "moment";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.scss";

import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import Swal from "sweetalert2";

// import Lottie from "@/components/widgets/lottie.vue";
// import animationData from "@/components/widgets/msoeawqm.json";
// import animationData1 from "@/components/widgets/gsqxdxog.json";
import axios from "axios";


export default {
  page: {
    title: "Agents",
    meta: [{name: "description", content: appConfig.description}],
  },
  components: {
    Layout,
    PageHeader,
    // lottie: Lottie,
    // Multiselect,
    flatPickr,
    Multiselect,
  },
  data() {
    return{
      title: "Approval Agent List",
      items: [
        {
          text: "Agents",
          href: "/",
        },
        {
          text: "Approval Agent List",
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
      page: 1,
      perPage: 100,
      pages: [],
      searchQuery: null,
      humanfriendlyConfig: {
        dateFormat: "F j, Y",
      },
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          isActive: 1,
          noteSearch: '',
          keyword: '',
          licensed: 1,
          language: 3,
          sorting: 'name',
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}),
        }
      },
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
    editdata (data){

      document.getElementById('id').value= data.id
      document.getElementById('customername').value=data.name;
      document.getElementById('companyname').value=data.company;
      document.getElementById('leadsscore').value=data.score;
      document.getElementById('phone').value=data.phone;
      document.getElementById('location').value=data.location;
      document.getElementById('date').value=data.date;
    },
    async updateAgent () {

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

      if(this.validPhone(document.getElementById('editPhoneNumber').value) === false && document.getElementById('editPhoneNumber').value !== ''){
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

      if ((!document.getElementById('editLicensed').value && document.getElementById('editStatus').value === 5) /*|| (!this.agentData.licenseNumber && document.getElementById('editLicensed').value === 1)*/) {
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
          licenseNumber: this.agentData.licenseNumber,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          agentID: document.getElementById('id').value
        }

        await axios
            .put('/api/updateAgent', data)
            .then(async response => {
              console.log(response)
              if (response) {
                document.getElementById('closemodal').click();
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
    addNewAgentModal () {
      this.resetAgentData()
      document.getElementById("addform").reset();
      document.getElementById('agentModalLabel').innerHTML="Add Agent";
      document.getElementById('add-btn').style.display='block';
      document.getElementById('edit-btn').style.display='none';
    },
    async createAgent () {
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
          email:  this.agentData.email,
          firstName:  this.agentData.firstName,
          lastName:  this.agentData.lastName,
          language:  this.agentData.language,
          status:  this.agentData.status,
          phoneNumber:  this.agentData.phone,
          departmentID:  this.agentData.department,
          state:  this.agentData.state,
          birthDate:  this.agentData.birthDate,
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
    async getDepartments () {

      await axios
          .post('/api/getDepartments')
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            if (error.response) {
              Swal.fire("Oops!", "Something was wrong, please contact your SysAdmin.", "error")
            }
          })
    },
    async getUserInfo (id) {
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
              Swal.fire("Oops!", "Something was wrong, please contact your SysAdmin.", "error")
            }
          })
    },
    validEmail: function (email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    validPhone: function (phone) {
      return /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
    },
    formatDate: function (date, format){
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
    setAgentData: function (data) {
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
    async updateAgentList () {

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

      console.log(start)
      console.log(end)

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
            .post('/api/listAgents', data)
            .then(response => {
              this.list=response.data
            })
            .catch(error => {
              if (error.response) {
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
    approveAgent (id) {

      Swal.fire({
        title: "Are you sure?",
        text: "This user will be approved to login into the system!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#f46a6a",
        confirmButtonText: "Yes, approve!",
      }).then(async (result) => {
        if (result.value) {

          const data = {
            token: localStorage.getItem('jwt'),
            agentID: id,
            userID: localStorage.getItem('id'),
            searchValues: this.data.searchValues,
          }

          await axios
              .put('/api/approveUser', data)
              .then(response => {
                this.departmentList = response.data
                Swal.fire("Approved!", "This user has been approved.", "success");
              })
              .catch(error => {
                if (error.response) {
                  Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
                }
              })

          await axios
              .post('/api/pendingApprovalAgents', data)
              .then(response => {
                this.list=response.data
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
        }
      });
      console.log('update: ' + id);
    },
    async getAgentList() {

      const data = {
        token: localStorage.getItem('jwt'),
        searchValues: this.data.searchValues,
      }

      await axios
          .post('/api/pendingApprovalAgents', data)
          .then(response => {
            this.list = response.data
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
  },
  async mounted() {

    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: this.data.searchValues,
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
        .post('/api/pendingApprovalAgents', data)
        .then(response => {
          this.list=response.data
          this.setPages();
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
  },
  computed: {
    displayedPosts() {
      return this.paginate(this.list);
    },
    resultQuery() {
      if (this.searchQuery) {
        console.log()
        const search = this.searchQuery.toLowerCase();
        return this.displayedPosts.filter((data) => {
          return (
              data.address.toLowerCase().includes(search) ||
              data.agentNumber.toLowerCase().includes(search) ||
              data.city.toLowerCase().includes(search) ||
              data.email.toLowerCase().includes(search) ||
              data.phoneNumber.toLowerCase().includes(search) ||
              data.firstName.toLowerCase().includes(search) ||
              data.lastName.toLowerCase().includes(search) ||
              data.statusName.toLowerCase().includes(search)
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
                      v-model="searchQuery"
                  />
                  <i class="ri-search-line search-icon"></i>
                </div>
              </div>
              <div class="col-sm-auto ms-auto">
                <div class="hstack gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted flex-shrink-0">Sort by: </span>

                    <Multiselect
                        class="form-control"
                        style="width: 130px"
                        v-model="value"
                        :close-on-select="true"
                        :searchable="true"
                        :create-option="true"
                        :options="[
                      { value: 'name', label: 'Name' },
                      { value: 'department', label: 'Department' },
                      { value: 'status', label: 'Status' },
                      { value: 'createDate', label: 'Create date' },
                    ]"
                    />
                  </div>
                  <button type="button" class="btn btn-soft-success add-btn" href="#open-filters" data-bs-toggle="modal">
                    <i class="ri-filter-line align-bottom me-1"></i> Filters
                  </button>
                  <button type="button" class="btn btn-soft-success add-btn" id="create-btn" data-bs-toggle="modal" href="#agentModal" @click="addNewAgentModal">
                    <i class="ri-add-line align-bottom me-1"></i> Add Agent
                  </button>
                  <span class="dropdown">
                    <button
                        class="btn btn-soft-primary btn-icon fs-14"
                        type="button"
                        id="dropdownMenuButton1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                      <i class="ri-settings-4-line"></i>
                    </button>
                    <ul
                        class="dropdown-menu"
                        aria-labelledby="dropdownMenuButton1"
                    >
                      <li><a class="dropdown-item" href="#">Copy</a></li>
                      <li>
                        <a class="dropdown-item" href="#">Move to pipline</a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#">Add to exceptions</a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#"
                        >Switch to common form view</a
                        >
                      </li>
                      <li>
                        <a class="dropdown-item" href="#"
                        >Reset form view to default</a
                        >
                      </li>
                    </ul>
                  </span>
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
                <td><a href="javascript:void(0);" class="link-success">New Agent</a></td>
                <td>
                  <ul class="list-inline hstack gap-2 mb-0">
                    <li class="list-inline-item" title="Approve Agent" @click="approveAgent(data.ID)">
                      <a class="edit-item-btn" href="javascript:void(0);"><i class="ri-checkbox-fill align-bottom text-muted"></i></a>
                    </li>
                    <li class="list-inline-item" data-bs-toggle="modal" href="#agentModal" data-bs-trigger="hover" data-bs-placement="top" title="Edit" @click="getUserInfo(data.ID)">
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
          <div class="d-flex justify-content-end mt-3">
            <div class="pagination-wrap hstack gap-2">
              <a
                  class="page-item pagination-prev disabled"
                  href="#"
                  v-if="page != 1"
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
                        <option v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
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
                      <label for="editAddress" class="form-label">Address</label>
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
                    <div class="col-lg-6">
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
                      <flat-pickr
                          placeholder="Select Interview date/time"
                          v-model="this.agentData.interview"
                          :config="dateTimeConfig"
                          class="form-control flatpickr-input"
                          id="editInterview" data-enable-time></flat-pickr>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <label for="editAgentNumber" class="form-label">Agent Number</label>
                      <input type="text" id="editAgentNumber" class="form-control mb-2" placeholder="Enter Agent Number" required v-model="this.agentData.agentNumber"/>
                    </div>
                    <div class="col-lg-6">
                      <label for="editLicensed" class="form-label">Insurance Licensed?</label>
                      <select class="form-select mb-2" aria-label="Department" id="editLicensed" v-model="this.agentData.insuranceLicense">
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

            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="createAgent">Save</button>
                <button type="button" class="btn btn-success" id="edit-btn" @click="updateAgent">Update</button>
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


  </Layout>
</template>
<style>
.row-spacer{
  margin-bottom: 10px;
}
</style>