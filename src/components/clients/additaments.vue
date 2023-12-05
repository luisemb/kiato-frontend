<script>

import axios from "axios";
import Swal from "sweetalert2";
import {ref} from "vue";

export default {
  name: 'additaments',
  props:['additamentsList'],
  emits: ["onFire", "additamentData"],
  setup( props, { emit }) {
    const notify = ref ("cacas")
    const notifyNotes = () => {
      emit('onFire', notify)
    }
    return {notify, notifyNotes}
  },
  data() {
    return {
      notes: [],
    };
  },
  methods: {
    async createAdditament() {
      this.errors = []

      if (document.getElementById('firstName11').value === '' || document.getElementById('firstName11').value.length <= 3) {
        this.errors.push('First Name is required.');
      }

      if (document.getElementById('lastName11').value === '' || document.getElementById('lastName11').value.length <= 3) {
        this.errors.push('Last Name is required.');
      }

      if (document.getElementById('relation11').value === '' || document.getElementById('relation11').value === '0') {
        this.errors.push('Relationship is required.');
      }

      if (document.getElementById('age11').value === '') {
        this.errors.push('Age is required.');
      }

      if (document.getElementById('gender11').value === '' || document.getElementById('gender11').value === '0') {
        this.errors.push('Gender is required.');
      }

      if (!this.errors.length) {

        let data = {
          clientsInfo: JSON.parse(localStorage.getItem("clientFormData")),
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          selectedUser: localStorage.getItem('selectedUser'),
          userEmail: localStorage.getItem('email'),
          firstName: document.getElementById('firstName11').value,
          lastName: document.getElementById('lastName11').value,
          relationship: document.getElementById('relation11').value,
          age: document.getElementById('age11').value,
          gender: document.getElementById('gender11').value,
        }

        await axios
            .post('/api/client/createAdditament', data)
            .then(async response => {
              this.$emit('additamentData', response);

              await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Additament created!'
              });

              document.getElementById('firstName11').value = '';
              document.getElementById('lastName11').value = '';
              document.getElementById('relation11').value = '0';
              document.getElementById('age11').value = '';
              document.getElementById('gender11').value = '';

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
  },
}
</script>
<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">Additaments</h5>
    </div>
    <div class="card-body">
      <div class="mb-4">
        <div style="overflow-y: scroll; max-height: 20vh; overflow-x: hidden;"  id="additamentList">
          <div v-for="data in additamentsList" :key="data.ID">
            <div class="row">
              <div class="col-lg-6">
                <label  class="form-label"><b>First Name</b></label>
                <p>{{ data.firstName }}</p>
              </div>
              <div class="col-lg-6">
                <label class="form-label"><b>Last Name</b></label>
                <p>{{ data.lastName }}</p>
              </div>
              <div class="col-lg-6">
                <label  class="form-label"><b>Gender</b></label>
                <p>{{ (data.gender === 'F') ? 'Female': 'Male'}}</p>
              </div>
              <div class="col-lg-6">
                <label class="form-label"><b>Age</b></label>
                <p>{{ data.age }}</p>
              </div>
              <div class="col-lg-6">
                <label class="form-label"><b>Relationship</b></label>
                <p>{{ data.relationship }}</p>
              </div>
              <div class="col-lg-6">
              </div>
              <div class="col-md-6" style="display: flex; justify-content: flex-end;"></div>
              <div class="col-md-6" style="display: flex; justify-content: flex-end;"></div>
              <hr>
            </div>
          </div>
        </div>
        <div style="overflow-y: scroll; max-height: 37vh; overflow-x: hidden;" >
          <div class="row">
            <div class="col-lg-6">
              <label for="benFirstName" class="form-label">First Name</label>
              <input type="text" id="firstName11" class="form-control mb-2" placeholder="Enter First Name" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benLastName" class="form-label">Last Name</label>
              <input type="text" id="lastName11" class="form-control mb-2" placeholder="Enter Last Name" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="gender1" class="form-label">Gender</label>
              <select class="form-select mb-2" aria-label="gender11" id="gender11">
                  <option value="0">Select...</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
              </select>
            </div>
            <div class="col-lg-6">
              <label for="benAge" class="form-label">Age</label>
              <input type="text" id="age11" class="form-control mb-2" placeholder="Enter Age" required style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="relation11" class="form-label">Relationship</label>
              <select class="form-select mb-2" aria-label="relation11" id="relation11">
                <option value="0">Relation...</option>
                <option value="C">Children</option>
                <option value="S">Stepson</option>
                <option value="G">Grandson</option>
              </select>
            </div>
            <div class="col-lg-6"></div>
            <div class="col-md-6" style="display: flex; justify-content: flex-end;">
            </div>
            <div class="col-md-6" style="display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-success" title="Submit" @click="createAdditament">Save</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <!-- end card -->
</template>