<script>
import "@vueform/multiselect/themes/default.scss";

// import flatPickr from "vue-flatpickr-component";
// import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import "flatpickr/dist/flatpickr.css";
import Layout from "../../layouts/main.vue";
import PageHeader from "@/components/page-header";
import appConfig from "../../../app.config";
import axios from "axios";
// import moment from "moment";
import Swal from "sweetalert2";
// import {helpers, required} from "@vuelidate/validators";
// import useVuelidate from "@vuelidate/core";

import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";

export default {
  page: {
    title: "Departments",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    lottie: Lottie,
  },
  data() {
    return {
      title: "Departments",
      items: [
        {
          text: "Departments",
          href: "/",
        },
        {
          text: "Department List",
          active: true,
        },
      ],
      value: null,
      page: 1,
      perPage: 8,
      pages: [],
      searchQuery: null,
      companies: [
        {
          id: "1",
          name: "Nesta Technologies",
          owner: "Tonya Noble",
          industry_type: "Computer Industry",
          star_value: "4.5",
          location: "Los Angeles, USA",
          employee: "10-30",
          website: "www.abcd.com",
          contact_email: "info@abcd.com",
          since: "1995",
          image_src: require("@/assets/images/error.svg"),
        }
      ],
      defaultOptions: { animationData: animationData },
      defaultOptions1: { animationData: animationData1 },
    };
  },
  computed: {
    displayedPosts() {
      return this.paginate(this.companies);
    },
    resultQuery() {
      if (this.searchQuery) {
        const search = this.searchQuery.toLowerCase();
        return this.displayedPosts.filter((data) => {
          return (
              data.compnayId.toLowerCase().includes(search) ||
              data.companyName.toLowerCase().includes(search) ||
              data.owner.toLowerCase().includes(search) ||
              data.industryType.toLowerCase().includes(search) ||
              data.rating.toLowerCase().includes(search) ||
              data.location.toLowerCase().includes(search)
          );
        });
      } else {
        return this.displayedPosts;
      }
    },
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
    async getDepartments() {
      const data = {
        token: localStorage.getItem('jwt'),
        searchValues: {}
      }

      await axios
          .post('/api/listDepartments', data)
          .then(response => {
            this.companies = response.data
          })
          .catch(error => {
            if (error.response) {

              if(error.response.data.detail === 'Your session is expired!'){
                this.$router.push('logout')
              }
              Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
            }
          })
    },
    editdata(data){
      document.getElementById('exampleModalLabel').innerHTML="Edit Department"
      let result = this.companies.findIndex(o => o.departmentID === data.departmentID)
      document.getElementById('id').value=data.departmentID
      document.getElementById('companyname').value=this.companies[result].name;
      document.getElementById('ownername').value=this.companies[result].owner;
      document.getElementById('location').value=this.companies[result].location;
      document.getElementById('website').value=this.companies[result].website;
      document.getElementById('contactemail').value=this.companies[result].email;
      document.getElementById('since').value=this.companies[result].since;

      document.getElementById('edit-btn').style.display='block';
      document.getElementById('add-btn').style.display='none'
    },
    async updateorder() {
      this.errors = [];
      var name = document.getElementById('companyname').value
      var owner = document.getElementById('ownername').value
      var location = document.getElementById('location').value
      var website = document.getElementById('website').value
      var contact_email = document.getElementById('contactemail').value
      var since = document.getElementById('since').value

      if (name === '') {
        this.errors.push('Department Name is required.');
      }
      if (owner === '') {
        this.errors.push('Department Owner is required.');
      }
      if (location === '') {
        this.errors.push('Department Location is required.');
      }
      if (since === '') {
        this.errors.push('Department Since is required.');
      }

      if (!this.errors.length) {
        const data = {
          departmentID: document.getElementById('id').value,
          name: name,
          sequence: 0,
          email: contact_email,
          location: location,
          owner: owner,
          since: since,
          website: website,
          createdBy: localStorage.getItem('email'),
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id')
        }

        await axios
            .post('/api/updateDepartment', data)
            .then(async response => {
              document.getElementById("addform").reset();
              if (response.data['ID'] !== null) {
                document.getElementById('closemodal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Departement updated successfully!'
                });
                await this.getDepartments();
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
      document.getElementById('closemodal').click();
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
          this.companies.splice(this.companies.indexOf(event), 1);
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
          var cusList = this.companies;
          ids_array.forEach(function (id) {
            cusList = cusList.filter(function (orders) {
              return orders.id != id;
            });
          });
          this.companies = cusList;
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
    async addorder() {

      this.errors = [];
      var name = document.getElementById('companyname').value
      var owner = document.getElementById('ownername').value
      var location = document.getElementById('location').value
      var website = document.getElementById('website').value
      var contact_email = document.getElementById('contactemail').value
      var since = document.getElementById('since').value

      if (name === '') {
        this.errors.push('Department Name is required.');
      }
      if (owner === '') {
        this.errors.push('Department Owner is required.');
      }
      if (location === '') {
        this.errors.push('Department Location is required.');
      }
      if (since === '') {
        this.errors.push('Department Since is required.');
      }

      if (!this.errors.length) {
        const data = {
          name: name,
          sequence: 0,
          email: contact_email,
          location: location,
          owner: owner,
          since: since,
          website: website,
          createdBy: localStorage.getItem('email'),
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id')
        }

        await axios
            .post('/api/createDepartment', data)
            .then(async response => {
              document.getElementById("addform").reset();
              if (response.data['ID'] !== null) {
                document.getElementById('closemodal').click();
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Department created successfully!'
                });
                await this.getDepartments();
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
    addnew(){
      document.getElementById("addform").reset();
      document.getElementById('exampleModalLabel').innerHTML="Add Department";
      document.getElementById('add-btn').style.display='block';
      document.getElementById('edit-btn').style.display='none';
    },
    showdetail(data){

      document.getElementById('imageid').setAttribute('src', '@/assets/images/error.svg')
      document.getElementById('cname').innerHTML= data.name;
      document.getElementById('oname').innerHTML= data.owner;
      document.getElementById('loc').innerHTML= data.location;
      document.getElementById('webs').innerHTML= data.website;
      document.getElementById('eml').innerHTML= data.email;
      document.getElementById('sic').innerHTML= data.since
    },
    setPages() {
      let numberOfPages = Math.ceil(this.companies.length / this.perPage);
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

    const data = {
      token: localStorage.getItem('jwt'),
      searchValues: {}
    }

    await axios
        .post('/api/listDepartments', data)
        .then(response => {
          this.companies = response.data
        })
        .catch(error => {
          if (error.response) {
            Swal.fire("Oops!", "Departments could not be loaded, please contact your SysAdmin.", "error")
          }
        })
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header">
            <div class="d-flex align-items-center flex-wrap gap-2">
              <div class="flex-grow-1">
                <button class="btn btn-primary add-btn me-1" data-bs-toggle="modal" href="#showModal" @click="addnew">
                  <i class="ri-add-fill me-1 align-bottom"></i> Add Department
                </button>
              </div>
              <div class="flex-shrink-0">
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--end col-->
      <div class="col-xxl-9">
        <div class="card" id="companyList">
          <div class="card-header">
          </div>
          <div class="card-body">
            <div>
              <div class="table-responsive table-card mb-3">
                <table
                    class="table align-middle table-nowrap mb-0"
                    id="customerTable"
                >
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
                    <th class="sort" data-sort="name" scope="col">
                      ID
                    </th>
                    <th class="sort" data-sort="name" scope="col">
                      Department Name
                    </th>
                    <th class="sort" data-sort="leader" scope="col">Leader</th>
                    <th class="sort" data-sort="location" scope="col">
                      Location
                    </th>
                    <th scope="col">Action</th>
                  </tr>
                  </thead>
                  <tbody class="list form-check-all">
                  <tr v-for="(data, index) of companies" :key="index">
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
                    <td class="owner">{{ data.departmentID }}</td>
                    <td class="id" style="display: none">
                      <a
                          href="javascript:void(0);"
                          class="fw-medium link-primary"
                      >{{ data.departmentID }}</a
                      >
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="flex-shrink-0">
                          <img
                              :src="require('@/assets/images/error.svg')"
                              alt=""
                              class="avatar-xxs rounded-circle"
                          />
                        </div>
                        <div class="flex-grow-1 ms-2 name">
                          {{ data.name }}
                        </div>
                      </div>
                    </td>
                    <td class="owner">{{ data.leader }}</td>
                    <td class="location">{{ data.location }}</td>
                    <td>
                      <ul class="list-inline hstack gap-2 mb-0">

                        <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="View" @click="showdetail(data)">
                          <a href="javascript:void(0);"><i class="ri-eye-fill align-bottom text-muted"></i></a>
                        </li>
                        <li class="list-inline-item" data-bs-toggle="modal" data-bs-trigger="hover" data-bs-placement="top" title="Edit" href="#showModal" @click="editdata(data)">
                          <a class="edit-item-btn"><i class="ri-pencil-fill align-bottom text-muted"></i></a>
                        </li>
                        <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Delete" @click="deletedata(data)">
                          <a class="remove-item-btn">
                            <i class="ri-delete-bin-fill align-bottom text-muted"></i>
                          </a>
                        </li>
                      </ul>
                    </td>
                  </tr>
                  </tbody>
                </table>
                <div class="noresult" style="display: none">
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
                      We've searched more than 150+ Orders We did not find any
                      orders for you search.
                    </p>
                  </div>
                </div>
              </div>
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
        <!--end card-->
      </div>
      <!--end col-->
      <div class="col-xxl-3">
        <div class="card">
          <div class="card-body text-center">
            <div class="position-relative d-inline-block">
              <div class="avatar-md">
                <div class="avatar-title bg-light rounded-circle">
                  <img src="@/assets/images/error.svg" alt="" class="avatar-xs" id="imageid"/>
                </div>
              </div>
            </div>
            <h5 class="mt-3 mb-1" id="cname">DMB Group</h5>
            <p class="text-muted" id="oname">Daniela Etchegoyen</p>

            <ul class="list-inline mb-0">
              <li class="list-inline-item avatar-xs">
                <a href="javascript:void(0);" class="avatar-title bg-soft-success text-success fs-15 rounded">
                  <i class="ri-global-line"></i>
                </a>
              </li>
              <li class="list-inline-item avatar-xs">
                <a href="javascript:void(0);" class="avatar-title bg-soft-danger text-danger fs-15 rounded">
                  <i class="ri-mail-line"></i>
                </a>
              </li>
              <li class="list-inline-item avatar-xs">
                <a href="javascript:void(0);" class="avatar-title bg-soft-warning text-warning fs-15 rounded">
                  <i class="ri-question-answer-line"></i>
                </a>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <div class="table-responsive table-card">
              <table class="table table-borderless mb-0">
                <tbody>
                <tr>
                  <td class="fw-medium" scope="row">Location</td>
                  <td id="loc">Damascus, Syria</td>
                </tr>
                <tr>
                  <td class="fw-medium" scope="row">Website</td>
                  <td>
                    <a href="javascript:void(0);" class="link-primary text-decoration-underline" id="webs">www.dmbgroup.online</a>
                  </td>
                </tr>
                <tr>
                  <td class="fw-medium" scope="row">Contact Email</td>
                  <td id="eml">info@syntycesolution.com</td>
                </tr>
                <tr>
                  <td class="fw-medium" scope="row">Since</td>
                  <td id="sic">1995</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!--end card-->
      </div>
      <!--end col-->
    </div>
    <!--end row-->
    <div class="modal fade" id="showModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header bg-soft-info p-3">
            <h5 class="modal-title" id="exampleModalLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close-modal"></button>
          </div>
          <form @submit.prevent="" action="" id="addform">
            <div class="modal-body">
              <input type="hidden" id="id" />
              <div class="row g-3">
                <div class="col-lg-12">
                  <div>
                    <label for="name-field" class="form-label">Name</label>
                    <input type="text" id="companyname" class="form-control" placeholder="Enter company name" required />
                  </div>
                </div>
                <div class="col-lg-12">
                  <div>
                    <label for="owner-field" class="form-label">Owner Name</label>
                    <input type="text" id="ownername" class="form-control" placeholder="Enter owner name" required />
                  </div>
                </div>
                <div class="col-lg-12">
                  <div>
                    <label for="location-field" class="form-label">location</label>
                    <input type="text" id="location" class="form-control" placeholder="Enter location" required />
                  </div>
                </div>
                <div class="col-lg-12">
                  <div>
                    <label for="website-field" class="form-label">Website</label>
                    <input type="text" id="website" class="form-control" placeholder="Enter website" required />
                  </div>
                </div>
                <div class="col-lg-12">
                  <div>
                    <label for="contact_email-field" class="form-label">Contact Email</label>
                    <input type="text" id="contactemail" class="form-control" placeholder="Enter contact email" required />
                  </div>
                </div>
                <div class="col-lg-12">
                  <div>
                    <label for="since-field" class="form-label">Since</label>
                    <input type="text" id="since" class="form-control" placeholder="Enter since" required />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="hstack gap-2 justify-content-end">
                <button type="button" class="btn btn-light" id="closemodal" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-success" id="add-btn" @click="addorder">Add Department</button>
                <button type="button" class="btn btn-success" id="edit-btn" @click="updateorder">Update</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>
