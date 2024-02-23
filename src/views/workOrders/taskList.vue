<script>
import { CountTo } from "vue3-count-to";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import appConfig from "../../../app.config.json";
import Swal from "sweetalert2";

import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";
import Lottie from "@/components/widgets/lottie.vue";
import axios from "axios";
import jwt_decode from "jwt-decode";
import SimpleTypeahead from "vue3-simple-typeahead";
import moment from "moment";
import notes from '../../components/users/notes';
import { Upload } from '@progress/kendo-vue-upload';
import '@progress/kendo-theme-default/dist/all.css';
// components
// import Papa from "papaparse";

export default {
  page: {
    title: "List View",
    meta: [{ name: "description", content: appConfig.description }],
  },
  data() {
    return {
      title: "Work Orders List",
      items: [
        {
          text: "W/O",
          href: "/",
        },
        {
          text: "W/O List",
          active: true,
        },
      ],
      openCreate: 0,
      page: 1,
      perPage: 100,
      pages: [],
      errors: [],
      woData: {
        editorData: "",
        editor: ClassicEditor,
        dueDate: null,
        listOfTechs: [],
        priorities: 0,
        labels: 0,
      },
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
      locationList: {},
      statusList: {},
      prospectStatusList: {},
      notesData: [],
      uploadFiles: [],
      messagesData: [],
      file: [],
      content: [],
      parsed: false,
      itemsSearch: [],
      data: {
        token: localStorage.getItem('jwt'),
        searchValues: {
          priority: '5',
          noteSearch: '',
          keyword: '',
          status: '8',
          sortBy: 'name',
          orderBy: 'ASC',
          dateRange: '0',
          location: '0' ,
          toDate: new Date().toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) ,
          fromDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"})
        },
      },
      // 16 Jan, 2024 to 02 Feb, 2024
      date2: moment(new Date().setDate(new Date().getDate() - 30)).format("DD MMM, YYYY")  +  " to " + moment(new Date().setDate(new Date().getDate() + 30)).format("DD MMM, YYYY"),
      date3: null,
      labels: {},
      technicians: {},
      status: {},
      priorities: {},
      rangeDateconfig: {
        mode: "range",
        dateFormat: "d M, Y",
        defaultDate: this.date2
      },
      config: {
        wrap: true, // set wrap to true only when using 'input-group'
        altFormat: "M j, Y",
        altInput: true,
        dateFormat: "d M, Y",
      },
      date: null,
      allTask: [],
      defaultOptions: { animationData: animationData },
      defaultOptions1: { animationData: animationData1 },
      value: null,
      crmUserID: localStorage.getItem('id'),
      optionsList: [
        { name: 'Vue.js', language: 'JavaScript' },
        { name: 'Adonis', language: 'JavaScript' },
        { name: 'Rails', language: 'Ruby' },
        { name: 'Sinatra', language: 'Ruby' },
        { name: 'Laravel', language: 'PHP' },
        { name: 'Phoenix', language: 'Elixir' }
      ],
      plugins: [
        "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
        "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
        "save table contextmenu directionality emoticons template paste textcolor",
      ],
      fileList: [],
      toolbar:
          "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons",
      options: {
        height: 300,
        style_formats: [
          { title: "Bold text", inline: "b" },
          { title: "Red text", inline: "span", styles: { color: "#ff0000" } },
          { title: "Red header", block: "h1", styles: { color: "#ff0000" } },
          { title: "Example 1", inline: "span", classes: "example1" },
          { title: "Example 2", inline: "span", classes: "example2" },
          { title: "Table styles" },
          { title: "Table row 1", selector: "tr", classes: "tablerow1" },
        ],
      },
      crmSelectedUser: localStorage.getItem('selectedUser'),

    };
  },
  components: {
    SimpleTypeahead,
    CountTo,
    Layout,
    PageHeader,
    lottie: Lottie,
    Multiselect,
    flatPickr,
    ckeditor: CKEditor.component,
    notes,
    Upload
  },
  watch: {
    allTask() {
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
    async editdata(id) {
      document.getElementById('exampleModalLabel').innerHTML = "Edit W/O"
      document.getElementById('id').value = id
      document.getElementById('edit-btn').style.display = 'block';
      document.getElementById('add-btn').style.display = 'none'
      this.openCreate = 0;

      const data = {
        token: localStorage.getItem('jwt'),
        ID: id
      }

      await this.getNotes(id)
      let woInfo;

      await axios
          .post('/api/workOrder/getWorkOrder', data)
          .then(response => {
            woInfo = response.data
            this.woData = response.data
            // let arrayPriority = []
            // arrayPriority[0] = this.priorities[clientInfo.woPriority] ['label']
            // console.log(arrayPriority)
            this.woData.priorities = woInfo.woPriority
            this.woData.labels = woInfo.woLabels
            this.woData.dueDate = woInfo.woDueDate
            this.woData.editorData = woInfo.woDescription
            localStorage.setItem('selectedUser', woInfo.ID)
            localStorage.setItem('selectedUserName', woInfo.firstName + ' ' + woInfo.lastName)
            this.getMapsLink()
            this.checkUncheck()
            JSON.parse(woInfo.assignedTo).forEach( function(value) {
              document.getElementById("tech-"+value['ID']).checked = true;
            });

          })
          .catch(error => {
            if (error.response) {

              if (error.response.data.detail === 'Your session is expired!') {
                this.$router.push('logout')
              }

              Swal.fire("Oops!", "Something was wrong, please contact your SysAdmin.", "error")
            }
          })

    },
    // updateWorkOrder(){
    //   let result = this.allTask.findIndex(o => o.id === document.getElementById('id').value)
    //
    //   this.allTask[result].project=document.getElementById('projectName').value;
    //   this.allTask[result].task=document.getElementById('tasksTitle').value;
    //   this.allTask[result].creater=document.getElementById('createName').value;
    //   this.allTask[result].dueDate=document.getElementById('date').value;
    //   this.allTask[result].status=this.value1
    //   this.allTask[result].priority=this.value3
    //   document.getElementById('closemodal').click();
    // },
    async updateWorkOrder() {

      this.errors = []
      this.getSelectedTechs();
      this.openCreate = 0;

      if (!this.woData.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.woData.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.woData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.woData.phoneNumber) {
        this.errors.push('Phone is required.');
      }

      if (!this.woData.priorities) {
        this.errors.push('Priority is required.');
      }

      if (!this.woData.labels) {
        this.errors.push('Label is required.');
      }

      if (!this.woData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.woData.dueDate) {
        this.errors.push('Due Date is required.');
      }

      if (this.woData.listOfTechs.length === 0) {
        this.errors.push('Select almost one Technician.');
      }

      if (!this.errors.length) {

        let note = {'note': this.woData.note};

        let data = {
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          userEmail: localStorage.getItem('email'),
          'address': this.woData.address, 'dueDate': this.woData.dueDate,
          'editor': this.woData.editorData , 'firstName': this.woData.firstName,
          'labels':this.woData.labels, 'lastName': this.woData.lastName, 'note:': this.woData.note,
          'phoneNumber': this.woData.phoneNumber, 'priorities':this.woData.priorities,
          'status': this.woData.status, 'assignedTechs': this.woData.listOfTechs,
          'note': note,
          'serial': this.woData.serial,
          'model': this.woData.model,
          woID: localStorage.getItem('selectedUser')
        }

        await axios
            .put('/api/workOrder/updateWo', data)
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
    deletedata(event){
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#f46a6a",
        confirmButtonColor: "#34c38f",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.value) {
          this.allTask.splice(this.allTask.indexOf(event), 1);
          Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    deleteMultiple() {
      let ids_array = [];
      var items = document.getElementsByName("chk_child");
      items.forEach(function (ele) {
        if (ele.checked == true) {
          var trNode = ele.parentNode.parentNode.parentNode;
          var id = trNode.querySelector(".id a").innerHTML;
          ids_array.push(id);
        }
      });
      if (typeof ids_array !== "undefined" && ids_array.length > 0) {
        if (confirm("Are you sure you want to delete this?")) {
          var cusList = this.allTask;
          ids_array.forEach(function (id) {
            cusList = cusList.filter(function (allTask) {
              return allTask.ID != id;
            });
          });
          this.allTask = cusList;
          document.getElementById("checkAll").checked = false;
          var itemss = document.getElementsByName("chk_child");
          itemss.forEach(function (ele) {
            if (ele.checked == true) {
              ele.checked = false
              ele.closest("tr").classList.remove("table-active");
            }
          });
        } else {
          return false;
        }
      } else {
        Swal.fire({
          title: "Please select at least one checkbox",
          confirmButtonClass: "btn btn-info",
          buttonsStyling: false,
          showCloseButton: true,
        });
      }
    },
    addorder(){
      var id=this.allTask.length+1;
      var project = document.getElementById('projectName').value;
      var task =document.getElementById('tasksTitle').value;
      var creater = document.getElementById('createName').value;
      var dueDate = document.getElementById('date').value;
      var status = 'Inprogress';
      var priority = 'High';
      var statusClass = 'secondary'
      var priorityClass = 'danger'

      var data=  {
        id : id,
        ID:'#VZ1D24',
        project : project,
        task : task,
        creater : creater,
        dueDate : dueDate,
        status : status,
        priority : priority,
        statusClass : statusClass,
        priorityClass : priorityClass,
        subItem: [
          { id: 1, img: require("@/assets/images/users/avatar-3.jpg") },
          { id: 2, img: require("@/assets/images/users/avatar-1.jpg") },
        ],
      };
      this.allTask.push(data)
      document.getElementById('closemodal').click();
      document.getElementById("addform").reset();
    },
    addnew(){
      document.getElementById("addform").reset();
      document.getElementById('exampleModalLabel').innerHTML="Add Task";
      document.getElementById('add-btn').style.display='block';
      document.getElementById('edit-btn').style.display='none';
      this.openCreate = 1;
    },
    setPages() {
      let numberOfPages = Math.ceil(this.allTask.length / this.perPage);
      this.pages = []
      for (let index = 1; index <= numberOfPages; index++) {
        this.pages.push(index);
      }
    },
    paginate() {
      let page = this.page;
      let perPage = this.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return this.allTask.slice(from, to);
    },
    validPhone: function (phone) {
      var isphone = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
      return isphone;
    },
    getSelectedTechs(){
      var markedCheckbox = document.getElementsByName('techniciansCheckBox');
      let listOfTechs = []
      for (var checkbox of markedCheckbox) {
        if (checkbox.checked)
          listOfTechs[checkbox.value] = checkbox.value
      }
      this.woData.listOfTechs = listOfTechs

    },
    async createWorkOrder() {

      this.errors = []
      this.getSelectedTechs();
      this.openCreate = 1;

      if (!this.woData.firstName) {
        this.errors.push('First Name is required.');
      }

      if (!this.woData.lastName) {
        this.errors.push('Last Name is required.');
      }

      if (!this.woData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.woData.phoneNumber) {
        this.errors.push('Phone is required.');
      }

      if (!this.woData.priorities) {
        this.errors.push('Priority is required.');
      }

      if (!this.woData.labels) {
        this.errors.push('Label is required.');
      }

      if (!this.woData.status) {
        this.errors.push('Status is required.');
      }

      if (!this.woData.dueDate) {
        this.errors.push('Due Date is required.');
      }

      if (this.woData.listOfTechs.length === 0) {
        this.errors.push('Select almost one Technician.');
      }

      if (this.validPhone(this.woData.phone) === false && this.woData.phone === '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (!this.errors.length) {
        let note = {'note': this.woData.note};

        let formValues = {'address': this.woData.address, 'dueDate': this.woData.dueDate,
                          'editor': this.woData.editorData , 'firstName': this.woData.firstName,
                          'labels':this.woData.labels, 'lastName': this.woData.lastName, 'note:': this.woData.note,
                          'phoneNumber': this.woData.phoneNumber, 'priorities':this.woData.priorities,
                          'status': this.woData.status, 'assignedTechs': this.woData.listOfTechs, 'model': this.woData.model,
                          'serial': this.woData.serial};

        let values = {0: {formValues, note}}

        let data = {
          workOrderInfo: values,
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          userEmail: localStorage.getItem('email'),
        }

        await axios
            .post('/api/workOrder/createWorkOrderList', data)
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
    viewUserGroup(request){
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.userGroup.includes(request)
    },
    printSomething(){
      console.log(this.date2)
    },
    async updateWorkOrderList(status=this.data.searchValues.status, priority=this.data.searchValues.priority) {
      console.log(this.data.searchValues.status)
      console.log(this.data.searchValues.priority)

      let validate = true;
      let errors = [];
      let filterKeyword = document.getElementById("filterKeyword").value;
      this.data.searchValues.status = status;
        this.data.searchValues.priority = priority.toString();

      if (filterKeyword !== '' && filterKeyword.length >= 3) {
        this.data.searchValues.keyword = filterKeyword;
      } else if(filterKeyword !== '' && filterKeyword.length < 3) {
        errors.push('Keyword search should have 3 or more characters!')
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
            .post('/api/workOrder/listWorkOrders', data)
            .then(response => {
              this.allTask = response.data
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
    getMapsLink(){
      let link = 'https://maps.google.com/?q=';

      if (this.woData.address.length > 0){
        link += this.woData.address.replaceAll(" ", '+')
      }

      if(link !== 'https://maps.google.com/?q='){
        document.getElementById("gMapsLink").href = link;
      } else {
        document.getElementById("gMapsLink").href = '#';
      }

    },
    async getNotes (id = localStorage.getItem('selectedUser'), name = localStorage.getItem('selectedUserName')) {

      const data = {
        token: localStorage.getItem('jwt'),
        userID: localStorage.getItem('id'),
        agentID: id,
        clientID: id,
      }

      localStorage.setItem('selectedUserName', name)
      localStorage.setItem('selectedUser', id)

      let url = '';
      url = '/api/workOrder/getWoNotes';

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
    async getFiles (id) {

      const data = {
        token: localStorage.getItem('jwt'),
        ID: id,
        isClient: 1
      }

      await axios
          .post('/api/comm/getFiles', data)
          .then(response => {
            this.fileList = response.data;
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
    onAddFile(event) {
      console.log('onAdd: ', event.affectedFiles);
      this.uploadFiles= event.newState;
    },
    onRemoveFile(event) {
      console.log('onRemove: ', event.affectedFiles);
      this.uploadFiles= event.newState;
    },
    async handleFileUpload(){
      this.file = JSON.parse(document.getElementById('woJobs').value);
      console.log(this.file)
      this.content = this.file;
      this.parsed = true;
    },
    formatDate: function (date, format){
      date = moment(date).format(format)
      return date;
    },
    async downloadFile(url) {
      const a = document.createElement('a')
      a.href = url
      a.download = url.split('/').pop()
      a.click()
    },
    // parseFile(){
    //   Papa.parse( this.file, {
    //     header: true,
    //     skipEmptyLines: true,
    //     complete: function ( results ) {
    //         this.content = results;
    //         this.parsed = true;
    //     }.bind(this)
    //   } );
    // },
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
    async uploadFile(){

      const data = {
        token: localStorage.getItem('jwt'),
        userEmail: localStorage.getItem('email'),
        userID: localStorage.getItem('id'),
        list: this.content
      }

      await axios
          .post('/api/workOrder/uploadWoList', data)
          .then(async response => {
            if (response.status === 200) {
              await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Uploaded successfully!'
              });
            }
            // setTimeout(function() {
            //   location.reload()
            // }, 2000);
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
    },
    checkUncheck() {
      let get = document.getElementsByName('techniciansCheckBox');
      for(var i= 0; i < get.length; i++){
        get[i].checked = false;
      }
    }
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
      agentSearch: (typeAhead != null && typeof (typeAhead) != 'undefined') ? typeAhead.value : []
    }

    await axios
        .post('/api/listDepartments', data)
        .then(response => {
          this.locationList = response.data
        })
        .catch(error => {
          if (error.response) {

            if (error.response.data.detail === 'Your session is expired!') {
              this.$router.push('logout')
            }
            Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
          }
        })

    await axios
        .post('/api/workOrder/woStatusList', data)
        .then(response => {
          this.status = response.data
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
          this.priorities = response.data
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
        .post('/api/workOrder/woLabels', data)
        .then(response => {
          this.labels = response.data
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
        .post('/api/getTechnicians', data)
        .then(response => {
          this.technicians = response.data
        })
        .catch(error => {
          if (error.response) {

            if (error.response.data.detail === 'Your session is expired!') {
              this.$router.push('logout')
            }

            Swal.fire("Oops!", "Status could not be loaded, please contact your SysAdmin.", "error")
          }
        })


    if ((url.indexOf('?' + field + '=') !== -1))
      document.getElementById(status).click()
    else
      await axios
          .post('/api/workOrder/listWorkOrders', data)
          .then(response => {
            this.allTask = response.data
            this.page = 1
            this.setPages()
          })
          .catch(error => {
            if (error.response) {

              if (error.response.data.detail === 'Your session is expired!') {
                this.$router.push('logout')
              }

              // for (const property in error.response.data) {
              // this.errors.push(`${property}: ${error.response.data[property]}`)
              // }
            } else if (error.message) {
              this.errors.push('Something was wrong, please contact your SysAdmin.')
            }
          })


    var checkAll = document.getElementById("checkAll");
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
      return this.paginate();
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
    <PageHeader :title="title" :items="items" />
    <input type="hidden" id="id"/>
    <div class="row">
      <div class="col-xxl-3 col-sm-6">
        <div class="card card-animate">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="fw-medium text-muted mb-0">Total Tasks</p>
                <h2 class="mt-4 ff-secondary fw-semibold">
                  <count-to
                      :startVal="0"
                      :endVal="234"
                      :duration="5000"
                  ></count-to
                  >k
                </h2>
                <p class="mb-0 text-muted">
                  <span class="badge bg-light text-success mb-0">
                    <i class="ri-arrow-up-line align-middle"></i> 17.32 %
                  </span>
                  vs. previous month
                </p>
              </div>
              <div>
                <div class="avatar-sm flex-shrink-0">
                  <span
                      class="
                      avatar-title
                      bg-soft-primary
                      text-primary
                      rounded-circle
                      fs-4
                    "
                  >
                    <i class="ri-ticket-2-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
        <!-- end card-->
      </div>
      <!--end col-->
      <div class="col-xxl-3 col-sm-6">
        <div class="card card-animate">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="fw-medium text-muted mb-0">Pending Tasks</p>
                <h2 class="mt-4 ff-secondary fw-semibold">
                  <count-to
                      :startVal="0"
                      :endVal="64"
                      :duration="5000"
                  ></count-to
                  >k
                </h2>
                <p class="mb-0 text-muted">
                  <span class="badge bg-light text-danger mb-0">
                    <i class="ri-arrow-down-line align-middle"></i> 0.87 %
                  </span>
                  vs. previous month
                </p>
              </div>
              <div>
                <div class="avatar-sm flex-shrink-0">
                  <span
                      class="
                      avatar-title
                      bg-soft-primary
                      text-primary
                      rounded-circle
                      fs-4
                    "
                  >
                    <i class="mdi mdi-timer-sand"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
      </div>
      <!--end col-->
      <div class="col-xxl-3 col-sm-6">
        <div class="card card-animate">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="fw-medium text-muted mb-0">Completed Tasks</p>
                <h2 class="mt-4 ff-secondary fw-semibold">
                  <count-to
                      :startVal="0"
                      :endVal="116"
                      :duration="5000"
                  ></count-to
                  >K
                </h2>
                <p class="mb-0 text-muted">
                  <span class="badge bg-light text-danger mb-0">
                    <i class="ri-arrow-down-line align-middle"></i> 2.52 %
                  </span>
                  vs. previous month
                </p>
              </div>
              <div>
                <div class="avatar-sm flex-shrink-0">
                  <span
                      class="
                      avatar-title
                      bg-soft-primary
                      text-primary
                      rounded-circle
                      fs-4
                    "
                  >
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
      </div>
      <!--end col-->
      <div class="col-xxl-3 col-sm-6">
        <div class="card card-animate">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="fw-medium text-muted mb-0">Deleted Tasks</p>
                <h2 class="mt-4 ff-secondary fw-semibold">
                  <count-to
                      :startVal="0"
                      :endVal="14"
                      :duration="5000"
                  ></count-to
                  >%
                </h2>
                <p class="mb-0 text-muted">
                  <span class="badge bg-light text-success mb-0">
                    <i class="ri-arrow-up-line align-middle"></i> 0.63 %
                  </span>
                  vs. previous month
                </p>
              </div>
              <div>
                <div class="avatar-sm flex-shrink-0">
                  <span
                      class="
                      avatar-title
                      bg-soft-primary
                      text-primary
                      rounded-circle
                      fs-4
                    "
                  >
                    <i class="ri-delete-bin-line"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
      </div>
      <!--end col-->
    </div>
    <!--end row-->

    <div class="row">
      <div class="col-lg-12">
        <div class="card" id="tasksList">
          <div class="card-header border-0">
            <div class="d-flex align-items-center">
              <h5 class="card-title mb-0 flex-grow-1">All Tasks</h5>
              <div class="flex-shrink-0">
                <button class="btn btn-soft-danger me-1" @click="deleteMultiple">
                  <i class="ri-delete-bin-2-line"></i>
                </button>
                <button class="btn btn-soft-primary add-btn" data-bs-toggle="modal" href="#showmodal" @click="addnew">
                  <i class="ri-add-line align-bottom me-1"></i> Create Task
                </button>
                <button v-if="viewUserGroup('SUPER_ADMIN_GROUP')"
                    style="margin-left: 3px;"
                    type="button"
                    id="dropdownMenuLink1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    class="btn btn-soft-info"
                >
                  <i class="ri-more-2-fill"></i>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink1">
                  <li><a class="dropdown-item" href="#uploadLeads" data-bs-toggle="modal">Upload W/O</a></li>
                </ul>
              </div>

            </div>
          </div>
          <div
              class="card-body border border-dashed border-end-0 border-start-0"
          >
            <form>
              <div class="row g-3">
                <div class="col-xxl-4 col-sm-11">
                  <div class="search-box">
                    <input
                        type="text"
                        class="form-control search bg-light border-light"
                        placeholder="Search for Work Order..."
                    />
                    <i class="ri-search-line search-icon"></i>
                  </div>
                </div>
                <!--end col-->

                <div class="col-xxl-3 col-sm-4">
                  <flat-pickr
                      v-model="date2"
                      placeholder="Select date range"
                      :config="rangeDateconfig"
                      class="form-control bg-light border-light"
                      @change="printSomething"
                  ></flat-pickr>
                </div>
                <!--end col-->

                <div class="col-xxl-2 col-sm-3">
                  <div class="input-light">
                    <Multiselect
                        v-model="this.data.searchValues.priority"
                        :close-on-select="true"
                        :searchable="true"
                        :create-option="true"
                        :options="priorities"
                        @select="updateWorkOrderList(this.data.searchValues.status, this.data.searchValues.priority)"
                    />
                  </div>
                </div>
                <!--end col-->

                <div class="col-xxl-2 col-sm-3">
                  <div class="input-light">
                    <Multiselect
                        v-model="this.data.searchValues.status"
                        :close-on-select="true"
                        :searchable="true"
                        :create-option="true"
                        :options="status"
                        @select="updateWorkOrderList(this.data.searchValues.status, this.data.searchValues.priority)"
                    />
                  </div>
                </div>
                <!--end col-->

                <div class="col-xxl-1 col-sm-4">
                  <button
                      type="button"
                      class="btn btn-primary w-100"
                      href="#open-filters"
                      data-bs-toggle="modal"
                  >
                    <i class="ri-equalizer-fill me-1 align-bottom"></i>
                    Filters
                  </button>
                </div>
                <!--end col-->
              </div>
              <!--end row-->
            </form>
          </div>
          <!--end card-body-->
          <div class="card-body">
            <div class="table-responsive table-card mb-4">
              <table
                  class="table align-middle table-nowrap mb-0"
                  id="tasksTable"
              >
                <thead class="table-light text-muted">
                <tr>
                  <th scope="col" style="width: 40px">
                    <div class="form-check">
                      <input
                          class="form-check-input"
                          type="checkbox"
                          id="checkAll"
                          value="option"
                      />
                    </div>
                  </th>
                  <th class="sort" data-sort="id">ID</th>
                  <th class="sort" data-sort="project_name">Customer</th>
                  <th class="sort" data-sort="assignedto">Assigned To</th>
                  <th class="sort" data-sort="tasks_name">Actions</th>
                  <th class="sort" data-sort="due_date">Due Date</th>
                  <th class="sort" data-sort="status">Status</th>
                  <th class="sort" data-sort="priority">Priority</th>
                  <th class="sort" data-sort="client_name">Location</th>
                </tr>
                </thead>
                <tbody class="list form-check-all">
                <tr v-for="(task, index) of resultQuery" :key="index">
                  <th scope="row">
                    <div class="form-check">
                      <input
                          class="form-check-input"
                          type="checkbox"
                          name="chk_child"
                          value="option1"
                      />
                    </div>
                  </th>
                  <td class="id">
                    <router-link
                        to="/apps/tasks-details"
                        class="fw-medium link-primary"
                    >{{ task.woID }}</router-link
                    >
                  </td>
                  <td class="project_name">
                    <router-link
                        to="/apps/projects-overview"
                        class="fw-medium link-secondary"
                    >{{ task.firstName }} {{ task.lastName }}
                    </router-link
                    >
                  </td>
                  <td class="assignedto">
                    <div class="avatar-group" >
                      <span v-for="(assigned, index) of JSON.parse(task.assignedTo)"
                            :key="index">
                        <a
                            href="javascript: void(0);"

                            class="avatar-group-item"
                            data-bs-toggle="tooltip"
                            data-bs-trigger="hover"
                            data-bs-placement="top"
                            v-bind:title="assigned.Name"
                        >
                          <img
                              :src="assigned.img"
                              alt=""
                              class="rounded-circle avatar-xxs"
                          />
                        </a>
                      </span>

                    </div>
                  </td>
                  <td>
                    <div class="d-flex">
                      <div class="flex-shrink-0 ms-4">
                        <ul class="list-inline tasks-list-menu mb-0">
                          <li class="list-inline-item">
                            <router-link to="/apps/tasks-details"
                            ><i
                                class="
                                    ri-eye-fill
                                    align-bottom
                                    me-2
                                    text-muted
                                  "
                            >
                            </i>
                            </router-link>
                          </li>
                          <li class="list-inline-item" data-bs-toggle="modal" href="#showmodal" @click="editdata(task.ID)">
                            <a href="#"><i class="ri-pencil-fill align-bottom me-2 text-muted"></i></a>
                          </li>
                          <li class="list-inline-item">
                            <a class="remove-item-btn" @click="deletedata(task)" >
                              <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                  <td class="due_date">{{ task.woDueDate }}</td>
                  <td class="status">
                      <span class="badge"
                            :class="{
                          'badge-soft-primary':task.statusName==='To Do',
                          'badge-soft-danger':task.statusName==='Scheduled Review',
                          'badge-soft-warning':task.statusName==='Waiting for parts',
                          'badge-soft-info':task.statusName==='Finished',
                          'badge-soft-success':task.statusName==='Submitted',
                          'badge-soft-secondary':task.statusName === 'Cancelled',
                          'badge-soft-dark':task.statusName === 'Archived',
                        }"
                      >{{
                          task.statusName
                        }}
                      </span>
                  </td>
                  <td class="priority">
                      <span class="badge text-uppercase"
                            :class="{
                          'bg-danger':task.priorityName==='URGENT',
                          'bg-warning':task.priorityName==='HIGH',
                          'bg-info':task.priorityName==='MEDIUM',
                          'bg-success':task.priorityName==='LOW',
                        }"
                      >{{ task.priorityName }}</span>
                  </td>
                  <td class="client_name">{{ task.departmentName }}</td>
                </tr>
                </tbody>
              </table>
              <!--end table-->
              <div class="noresult" style="display: none">
                <div class="text-center">
                  <lottie
                      colors="primary:#121331,secondary:#08a88a"
                      :options="defaultOptions"
                      :height="75"
                      :width="75"
                  />
                  <h5 class="mt-2">Sorry! No Result Found</h5>
                  <p class="text-muted mb-0">
                    We've searched more than 200k+ tasks We did not find any
                    tasks for you search.
                  </p>
                </div>
              </div>
            </div>
            <div class="noresult" v-if="allTask.length <= 0">
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
            <div class="d-flex justify-content-end mt-3"  v-if="resultQuery.length >= 0">
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
                    v-if="page < pages.length">
                  Next
                </a>
              </div>
            </div>
          </div>
          <!--end card-body-->
        </div>
        <!--end card-->
      </div>
      <!--end col-->
    </div>
    <!--end row-->

    <!-- CREATE AND EDIT TASK MODAL -->
    <div class="modal fade zoomIn" id="showmodal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0">
          <div class="modal-header p-3 bg-soft-info">
            <h5 class="modal-title" id="exampleModalLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close-modal"></button>
          </div>
          <form id="addform" @submit.prevent=""  autocomplete="off">
            <div class="modal-body">
              <div class="row g-3">
                <input type="hidden" id="id" name="">
                <div class="col-lg-12">
                  <label for="priorities" class="form-label">Priority</label>
                  <select class="form-select mb-2" aria-label="Priorities" id="priorities" name="priorities"
                          v-model="this.woData.priorities" v-if="(priorities.length > 1)">
                    <option v-for="(priority, index) of priorities"  :key="index"
                            v-bind:value="priority.value">{{ priority.label }}
                    </option>
                  </select>
                  <select class="form-select mb-2" aria-label="Priorities" id="priorities" name="priorities"
                          v-model="this.woData.priorities" v-else>
                    <option v-bind:value="priorities.value">{{ priorities.label }}</option>
                  </select>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <label for="taskFirstName" class="form-label">First Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                  <input type="text" id="taskFirstName" name="taskFirstName" class="form-control mb-2" v-model="this.woData.firstName" required  autocomplete="off">
                </div>
                <div class="col-lg-6">
                  <label for="taskLastName" class="form-label">Last Name <span style="color:red; font-size: 0.7em;">(*)</span></label>
                  <input type="text" id="taskLastName" name="taskLastName" class="form-control mb-2" v-model="this.woData.lastName" required  autocomplete="off">
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <div>
                    <label for="tasksAddress" class="form-label">Address</label> <code><a href="#" target="_blank" id="gMapsLink">Google Maps</a></code>
                    <input type="text" id="tasksAddress" class="form-control" placeholder="Address" v-model="this.woData.address" required/>
                  </div>
                </div>
                <div class="col-lg-6">
                  <label for="tasksPhoneNumber" class="form-label">Phone Number</label>
                  <div class="input-group">
                    <input type="text" class="form-control" aria-label="Phone Number" aria-describedby="tasksPhoneNumber" id="tasksPhoneNumber" v-model="this.woData.phoneNumber">
                    <a :href="'tel:'+this.woData.phoneNumber"><button class="btn btn-outline-info" type="button" >Call Now</button></a>
                  </div>
                </div>
                <!--end col-->

                <div class="col-lg-6">
                  <div>
                    <label for="tasksModel" class="form-label">Model</label>
                    <input type="text" id="tasksModel" class="form-control" placeholder="" v-model="this.woData.model" required/>
                  </div>
                </div>
                <div class="col-lg-6">
                  <label for="tasksSerial" class="form-label">Serial</label>
                  <div class="input-group">
                    <input type="text" id="tasksSerial" class="form-control" placeholder="" v-model="this.woData.serial" required/>
                  </div>
                </div>
                <!--end col-->

                <div class="ckeditor-classic">
                  <ckeditor v-model="this.woData.editorData" :editor="this.woData.editor"></ckeditor>
                </div>
                <!--end col-->
                <div class="col-lg-12">
                  <label class="form-label">Assigned To</label>
                  <div data-simplebar style="height: 95px">
                    <ul class="list-unstyled vstack gap-2 mb-0">

                      <li v-for="(data, index) of technicians" :key="index">
                        <div class="form-check d-flex align-items-center">
                          <input class="form-check-input me-3" type="checkbox" v-bind:value="data.ID" v-bind:id="'tech-'+data.ID" name="techniciansCheckBox"/>
                          <label class="form-check-label d-flex align-items-center" v-bind:for="'tech-'+data.ID">
                            <span class="flex-shrink-0">
                              <img v-bind:src="data.profileIMG" alt="" class="avatar-xxs rounded-circle" width="50" height="50" />
                            </span>
                            <span class="flex-grow-1 ms-2"> {{ data.fullname }} </span>
                          </label>
                        </div>
                      </li>

                    </ul>
                  </div>
                </div>
                <!--end col-->
                <div class="col-lg-12">
                  <label for="labels" class="form-label">Labels</label>

                  <select class="form-select mb-2" aria-label="Status" id="labels" name="labels"
                          v-model="this.woData.labels" v-if="(labels.length > 1)">
                    <option v-for="(labelss, index) of labels"  :key="index"
                            v-bind:value="labelss.value">{{ labelss.label }}
                    </option>
                  </select>
                  <select class="form-select mb-2" aria-label="Status" id="labels" name="labels"
                          v-model="this.woData.labels" v-else>
                    <option v-bind:value="labels.value">{{ labels.label }}</option>
                  </select>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <label for="duedate-field" class="form-label">Due Date</label>
                  <flat-pickr
                      placeholder="Select date"
                      v-model="this.woData.dueDate"
                      :config="timeConfig"
                      class="form-control flatpickr-input"
                      id="date"></flat-pickr>
                </div>
                <!--end col-->
                <div class="col-lg-6">
                  <label for="ticket-status" class="form-label">Status</label>

                  <select class="form-select mb-2" aria-label="Status" id="ticket-status" name="ticket-status"
                          v-model="this.woData.status" v-if="(status.length > 1)">
                    <option v-for="(statuss, index) of status"  :key="index"
                            v-bind:value="statuss.value">{{ statuss.label }}
                    </option>
                  </select>
                  <select class="form-select mb-2" aria-label="Status" id="ticket-status" name="ticket-status"
                          v-model="this.woData.status" v-else>
                    <option v-bind:value="status.value">{{ status.label }}</option>
                  </select>

                </div>
                <div class="col-lg-12" v-if="this.openCreate === 1" >
                  <textarea
                      class="form-control alert alert-primary"
                      v-model="this.woData.note"
                      id="editNotes"
                      name="editNotes"
                      placeholder="Notes"
                      rows="2"
                  ></textarea>
                </div>

                <div class="col-xl-12" style="margin-top: 10px;" v-if="this.openCreate === 0">
                  <div class="card">
                    <div class="card-body checkout-tab">
                      <form action="#">
                        <div class="step-arrow-nav mt-n3 mx-n3 mb-3">
                          <ul class="nav nav-pills nav-justified custom-nav" role="tablist">
                            <li class="nav-item" role="presentation">
                              <button
                                  class="nav-link fs-15 p-3 active"
                                  id="pills-bill-notes-tab"
                                  data-bs-toggle="pill"
                                  data-bs-target="#pills-pills-notes"
                                  type="button"
                                  role="tab"
                                  aria-controls="pills-pills-notes"
                                  aria-selected="true"
                              >
                                <i
                                    class="
                                    ri-sticky-note-line
                                    fs-16
                                    p-2
                                    bg-soft-primary
                                    text-primary
                                    rounded-circle
                                    align-middle
                                    me-2
                                  "
                                ></i>
                                Notes
                              </button>
                            </li>
                            <li class="nav-item" role="presentation">
                              <button
                                  class="nav-link fs-15 p-3"
                                  id="pills-econtact"
                                  data-bs-toggle="pill"
                                  data-bs-target="#pills-econtact-tab"
                                  type="button"
                                  role="tab"
                                  aria-controls="pills-econtact-tab"
                                  aria-selected="false"
                              >
                                <i
                                    class="
                                      ri-tools-fill
                                      fs-16
                                      p-2
                                      bg-soft-primary
                                      text-primary
                                      rounded-circle
                                      align-middle
                                      me-2"></i>
                                Parts
                              </button>
                            </li>
                            <li class="nav-item" role="presentation">
                              <button
                                  class="nav-link fs-15 p-3"
                                  id="pills-payment-tab"
                                  data-bs-toggle="pill"
                                  data-bs-target="#pills-payment"
                                  type="button"
                                  role="tab"
                                  aria-controls="pills-payment"
                                  aria-selected="false"
                                  @click="getFiles(this.crmSelectedUser)"
                              >
                                <i class="
                                            ri-folder-upload-line
                                            fs-16
                                            p-2
                                            bg-soft-primary
                                            text-primary
                                            rounded-circle
                                            align-middle
                                            me-2
                                          "
                                ></i>
                                Upload Files
                              </button>
                            </li>
                          </ul>
                        </div>

                        <div class="tab-content">
                          <div
                              class="tab-pane fade show active"
                              id="pills-pills-notes"
                              role="tabpanel"
                              aria-labelledby="pills-notes"
                          >
                            <div>
                              <div class="row" id="editNoteOpen">
                                <notes :dataList="notesData" @onFire="getNotes()" :idNumber="1"> </notes>
                              </div>
                            </div>
                          </div>
                          <!-- end tab pane -->

                          <div
                              class="tab-pane fade"
                              id="pills-econtact-tab"
                              role="tabpanel"
                              aria-labelledby="pills-econtact"
                          >
                          </div>
                          <!-- end tab pane -->

                          <div
                              class="tab-pane fade"
                              id="pills-payment"
                              role="tabpanel"
                              aria-labelledby="pills-payment-tab"
                          >
                            <div>
                              <div class="col-12 text-center">
                                <h1 class="mb-3">Upload Files</h1>
                                <h6><b>Allowed Files:</b> <p>.jpg, .png, .docx, .xls, .jpeg, .pdf</p></h6>
                                <h6><b>Max. File Size:</b> <p>5 mb</p></h6>
                              </div>

                              <div class="col-md-12">
                                <form enctype='multipart/form-data'>
                                  <div class="form-group">
                                    <label for="uploadFiles">Select Image</label>
                                    <Upload
                                        :restrictions="{
                                             allowedExtensions: [ '.jpg', '.png', '.docx', '.xls', '.jpeg', '.pdf'],
                                             maxFileSize: 5000000
                                         }"
                                        :auto-upload="false"
                                        :files="uploadFiles"
                                        @add="onAddFile"
                                        @remove="onRemoveFile"
                                        :multiple="true"
                                        :with-credentials="false"
                                        :save-url="'http://127.0.0.1:8000/api/comm/uploadFile?id='+this.crmUserID+'&selectedUser='+this.crmSelectedUser+'&isClient='+1"
                                        :remove-url="'http://127.0.0.1:8000/api/comm/uploadFile?id='+this.crmUserID+'&selectedUser='+this.crmSelectedUser+'&isClient='+1"
                                    />
                                  </div>
                                </form>
                                <div class="table-responsive" style="margin-top: 20px;">
                                  <button type="button" class="btn btn-soft-success float-end" @click="getFiles(this.crmSelectedUser)"
                                          style="margin-bottom: 10px;"> Refresh File List </button>
                                  <table class="table align-middle table-nowrap mb-0">
                                    <thead class="table-light">
                                    <tr>
                                      <th scope="col">File Name</th>
                                      <th scope="col">Created On</th>
                                      <th scope="col">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="(data, index) of this.fileList" :key="index">
                                      <td>{{ data.fileName }}</td>
                                      <td>{{ formatDate(data.createdOn, 'MMMM Do YYYY, h:mmA') }}</td>
                                      <td>
                                        <ul class="list-inline hstack gap-2 mb-0">
                                          <li class="list-inline-item" data-bs-placement="top" title="Download" @click="downloadFile(data.path)">
                                            <a class="edit-item-btn">
                                              <i class="ri-file-download-line align-bottom text-muted"></i>
                                            </a>
                                          </li>
                                          <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Delete">
                                            <a class="remove-item-btn" data-bs-toggle="modal" href="javascript:void(0);">
                                              <i class="ri-delete-bin-fill align-bottom text-muted"></i>
                                            </a>
                                          </li>
                                          <li class="list-inline-item showFile" data-bs-placement="top" title="Image Preview">
                                              <!-- Thumbnails Images -->
                                              <b-img class="img-thumbnail" alt="image Preview" width="100" :src="data.path" data-holder-rendered="true"></b-img>
                                          </li>
                                        </ul>
                                      </td>
                                    </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                          <!-- end tab pane -->
                        </div>
                        <!-- end tab content -->
                      </form>
                    </div>
                    <!-- end card body -->
                  </div>
                  <!-- end card -->
                </div>
                <!--end col-->
              </div>
              <!--end row-->
            </div>
            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal" id="closemodal"> Close </button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="createWorkOrder"> Add W/O </button>
                <button type="button" class="btn btn-success" id="edit-btn" @click="updateWorkOrder()">Update</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- FILTER MODALS -->
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
                <label for="filterKeyword" class="form-label">Search</label>
                <input type="text" id="filterKeyword" name="filterKeyword" class="form-control mb-2" placeholder="Search for Work Order..." v-model="this.data.searchValues.keyword">
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterType" class="form-label">Priority</label>
                <select class="form-select mb-2" aria-label="Status" id="filterType" name="filterType" v-model="this.data.searchValues.priority">
                  <option v-for="(priority, priorityIndex) of priorities" :key="priorityIndex" v-bind:value="priority.value">{{ priority.label }}</option>
                </select>
              </div>
              <div class="col-lg-6">
                <label for="filterStatus" class="form-label">Status</label>
                <select class="form-select mb-2" aria-label="Status" id="filterStatus" v-model="this.data.searchValues.status">
                  <option v-for="(stat, statusIndex) of status" :key="statusIndex" v-bind:value="stat.value">{{ stat.label }}</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <label for="filterDateRange" class="form-label">Time Range</label>
                <flat-pickr
                    v-model="date2"
                    placeholder="Select date range"
                    :config="rangeDateconfig"
                    class="form-control bg-light border-light"
                    @change="printSomething"
                ></flat-pickr>
              </div>
              <div class="col-lg-6">
                <span v-if="viewUserGroup('SUPER_ADMIN_GROUP')">
                  <label for="filterDateRange" class="form-label">Locations</label>
                    <select class="form-select mb-2" aria-label="Department" id="filterDepartment" name="filterDepartment"
                            v-model="this.data.searchValues.location">
                        <option value="0"> All</option>
                        <option v-for="(locations, index) of locationList"  :key="index"
                                v-bind:value="locations.departmentID"> {{ locations.name }}
                        </option>
                    </select>
                </span>
              </div>
            </div>
            <div class="col-md-12" v-if="viewUserGroup('SUPER_ADMIN_GROUP') || viewUserGroup('ADMIN_GROUP')">
              <label for="typeahead_id" class="form-label">Search By Technician</label>
              <SimpleTypeahead
                  id="typeahead_id"
                  placeholder="Type technician name..."
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
            <button type="button" class="btn btn-primary" @click="updateWorkOrderList()">Search</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!-- Upload WO Modal -->
    <b-modal id="uploadLeads" title="Fullscreen | Upload WorkOrders" class="v-modal-custom" fullscreen>
      <div class="row">
        <div class="col-lg-12">
          <form>
            <!-- end card -->

            <div class="card">
              <div class="card-body">
                <label for="exampleFormControlTextarea5" class="form-label">Example Textarea</label>
                <textarea class="form-control" id="woJobs" rows="5"></textarea>
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
                <th scope="col">
                  Claim #
                </th>
                <th scope="col">Full Name</th>
                <th scope="col">Address</th>
                <th scope="col">Serial</th>
                <th scope="col">Model</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, rowKey) in content" v-bind:key="rowKey">
                <td>
                  {{ (rowKey+1) }}
                </td>
                <td>
                  {{ row.Extensions.JobID }}
                </td>
                <td>
                  {{ row.Account.Name }}
                </td>
                <td>
                  {{ row.Location.Address.AddrLine1 + ' ' + row.Location.Address.City + ' ' + row.Location.Address.Region + ' - ' + row.Location.Address.Zip  }}
                </td>
                <td>
                  {{ row.Assets[0].Model }}
                </td>
                <td>
                  {{ row.Assets[0].SerialNum }}
                </td>
              </tr>
              </tbody>
            </table>

          </div>
        </div>
        <div class="text-end mb-3">
          <button type="button" class="btn btn-success w-sm" @click="handleFileUpload">Process File</button>
        </div>
        <div class="text-end mb-3">
          <button type="button" class="btn btn-success w-sm" @click="uploadFile">Upload File</button>
        </div>
      </div>
    </b-modal>
  </Layout>
</template>
