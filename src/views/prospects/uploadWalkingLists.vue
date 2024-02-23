<script>
import {
  ref,
  watch
} from "vue";
import "@vueform/multiselect/themes/default.css";

import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import DropZone from "@/components/widgets/dropZone";
import useVuelidate from "@vuelidate/core";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import appConfig from "../../../app.config";
import PageHeader from "@/components/page-header";
import Papa from 'papaparse';
import axios from "axios";
import Swal from "sweetalert2";
import SimpleTypeahead from 'vue3-simple-typeahead';
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'; //Optional default CSS
export default {
  page: {
    title: "Create Product",
    meta: [{
      name: "description",
      content: appConfig.description,
    }, ],
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
  data() {
    return {
      title: "Upload Client/Lead List",
      items: [{
        text: "Dashboard",
        href: "/",
      },
        {
          text: "Upload List",
          active: true,
        },
      ],
      date1: null,
      datetimeConfig: {
        enableTime: true,
        dateFormat: "d.m.y",
        time_24hr: true,
      },
      editor: ClassicEditor,
      file: [],
      content: [],
      parsed: false,
      statusList: [],
      typeList: [],
      itemsSearch: [],
      spectedColumnsWalking: [
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
      spectedColumnsNtos: [
        "Master MGA",
        "MGA",
        "Agent",
        "Agent Name",
        "Agent Name_1",
        "Dco-Policy #",
        "Policy Status",
        "Status Description",
        "Owner First Name",
        "Owner Middle Name",
        "Owner Last Name",
        "Owner Suffix",
        "Policy Phone 1",
        "Policy Phone 2",
        "Policy Address",
        "Policy City",
        "Policy State",
        "Policy Zip",
        "Issue Date",
        "Paid To Day",
        "Policy Plan Code",
        "Plan Description",
        "Monthly Premium",
        "Pay Type",
        "Bill Day",
        "Insured First Name",
        "Insured Middle Name",
        "Insured Last Name",
        "Insured Suffix",
        "Current Face Amount",
        "AD&D Units",
        "Insured Birth Month",
        "Insured Birth Day",
        "Insured Birth Year",
        "Policy Language"
      ],
      spectedColumnsOrphans: [
        "Dco-Policy #",
        "Owner First Name",
        "Owner Last Name",
        "Policy Phone 1",
        "Policy Address",
        "Policy City",
        "Policy Zip",
        "Plan Description",
        "Monthly Premium",
        "Insured First Name",
        "Insured Last Name",
        "Current Face Amount",
        "AD&D Units",
      ],
      listType: 0,
    };
  },
  components: {
    // DropZone,
    Layout,
    PageHeader,
    SimpleTypeahead,
  },
  methods: {
    deleteRecord(ele) {
      ele.target.parentElement.parentElement.remove();
    },
    parseFile(){

      Papa.parse( this.file, {
        header: true,
        skipEmptyLines: true,
        complete: function ( results ) {
          console.log(this.file)
          console.log(results)
          if( this.compare(this.spectedColumnsWalking, results.meta.fields)){
            this.content = results;
            this.parsed = true;
            this.listType = 1;
          } else if(this.compare(this.spectedColumnsNtos, results.meta.fields)){
            this.content = results;
            this.parsed = true;
            this.listType = 2;
          }
          else if(this.compare(this.spectedColumnsOrphans, results.meta.fields)){
            this.content = results;
            this.parsed = true;
            this.listType = 3;
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
    handleFileUpload(){
      this.file = document.getElementById('listFile').files[0];
      this.parseFile();
    },
    async changeType() {
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
    async uploadFile() {

    this.errors = []

    if (document.getElementById('isProspect').value === '') {
      this.errors.push('Is prospect or client?');
    }

    if (document.getElementById('editLanguage').value === '') {
      this.errors.push('Language is required.');
    }

    if (document.getElementById('editStatus').value === '') {
      this.errors.push('Status is required.');
    }

    if (document.getElementById('editType').value === '') {
      this.errors.push('Source is required.');
    }

    if (document.getElementById('typeahead_id').value === '') {
      this.errors.push('Agent is is required.');
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
        uploadTo: document.getElementById('typeahead_id').value,
        isProspect: document.getElementById('isProspect').value,
        language: document.getElementById('editLanguage').value,
        status: document.getElementById('editStatus').value,
        source: document.getElementById('editType').value,
        listType: this.listType,
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
              this.listType = 0;
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
    async searchAgents() {
      const data = {
        token: localStorage.getItem('jwt'),
        searchValue: document.getElementById('typeahead_id').value
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
  },
  async mounted() {

    const data = {
      token: localStorage.getItem('jwt'),
      userEmail: localStorage.getItem('email'),
      userID: localStorage.getItem('id'),
      isProspect: 1,
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
  }
};
</script>
<style>
.simple-typeahead-list-item {
  color: black;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <div class="row">
      <div class="col-lg-12">
        <form>
          <!-- end card -->

          <div class="card">
            <div class="card-body">
              <div class="vstack gap-2">
                <label for="listFile" class="fs-14 mb-1" >Upload Your List</label>
                  <input class="form-control" id="listFile" type="file"
                         accept="csv" @change="selectedFile"/>
                <div class="row">
                  <div class="col-lg-6">
                    <label for="isProspect" class="form-label">Is Prospect</label>
                    <select class="form-select mb-2" aria-label="isProspect" id="isProspect" name="isProspect" @change="changeType">
                      <option value="">...</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                  <div class="col-lg-6">
                    <label for="editLanguage" class="form-label">Language</label>
                    <select class="form-select mb-2" aria-label="Language" id="editLanguage" name="editLanguage">
                      <option value="">...</option>
                      <option value="1">English</option>
                      <option value="2">Spanish</option>
                      <option value="3">Take from List</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <label for="editStatus" class="form-label">Status</label>
                    <select class="form-select mb-2" aria-label="Status" id="editStatus" name="editStatus">
                      <option value="">...</option>
                      <option v-for="(status, statusIndex) of statusList" :key="statusIndex" v-bind:value="status.statusID">{{ status.name }}</option>
                    </select>
                  </div>
                  <div class="col-lg-6">
                    <label for="editType" class="form-label">Source</label>
                    <select class="form-select mb-2" aria-label="Status" id="editType" name="editType">
                      <option value="">...</option>
                      <option v-for="(type, typeIndex) of typeList" :key="typeIndex" v-bind:value="type.name">{{ type.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <label for="typeahead_id" class="form-label">Assigned To</label>
                    <SimpleTypeahead
                        id="typeahead_id"
                        placeholder="Type your agent search..."
                        :items="itemsSearch"
                        :minInputLength="3"
                        :class="'form-control mb-2'"
                        @onInput="searchAgents"
                        @selectItem="selectItemEventHandler"
                    >
                    </SimpleTypeahead>
                  </div>
                  <div class="col-md-6"></div>
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
        <button type="button" class="btn btn-success w-sm" @click="uploadFile">Upload File</button>
      </div>

    </div>
    <!-- end row -->
  </Layout>
</template>