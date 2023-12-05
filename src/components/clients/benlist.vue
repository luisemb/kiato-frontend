<script>

import axios from "axios";
import Swal from "sweetalert2";
// import {ref} from "vue";

export default {
  name: 'econtacts',
  props:['benList'],
  // emits: ["onFire", "eContactData"],
  // setup( props, { emit }) {
  //   const notify = ref ("cacas")
  //   const notifyNotes = () => {
  //     emit('onFire', notify)
  //   }
  //   return {notify, notifyNotes}
  // },
  data() {
    return {
      notes: [],
    };
  },
  methods: {
    validPhone: function (phone) {
      var isphone = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm.test(phone);
      return isphone;
    },
    async createBeneficiary() {
      this.errors = []

      if (document.getElementById('firstName1').value === '' || document.getElementById('firstName1').value.length <= 3) {
        this.errors.push('First Name is required.');
      }

      if (document.getElementById('lastName1').value === '' || document.getElementById('lastName1').value.length <= 3) {
        this.errors.push('Last Name is required.');
      }

      if (document.getElementById('address1').value === '' || document.getElementById('address1').value.length <= 3) {
        this.errors.push('Address is required.');
      }

      if (this.validPhone(document.getElementById('phone1').value) === false && document.getElementById('phone1').value === '') {
        this.errors.push('Please, write a valid phone number!');
      }

      if (document.getElementById('state1').value === '') {
        this.errors.push('State is required.');
      }

      if (document.getElementById('postalCode1').value === '') {
        this.errors.push('Postal Code is required.');
      }

      if (document.getElementById('relation1').value === '') {
        this.errors.push('Relationship is required.');
      }

      if (document.getElementById('age1').value === '') {
        this.errors.push('Age is required.');
      }

      if (document.getElementById('type').value === '') {
        this.errors.push('Beneficiary type is required.');
      }

      if (!this.errors.length) {

        let data = {
          clientsInfo: JSON.parse(localStorage.getItem("clientFormData")),
          token: localStorage.getItem('jwt'),
          userID: localStorage.getItem('id'),
          selectedUser: localStorage.getItem('selectedUser'),
          userEmail: localStorage.getItem('email'),
          firstName: document.getElementById('firstName1').value,
          lastName: document.getElementById('lastName1').value,
          address: document.getElementById('address1').value,
          phone: document.getElementById('phone1').value,
          state: document.getElementById('state1').value,
          postalCode: document.getElementById('postalCode1').value,
          relation: document.getElementById('relation1').value,
          age: document.getElementById('age1').value,
          relevance: document.getElementById('type').value,
        }

        await axios
            .post('/api/client/createbeneficiary', data)
            .then(async response => {
              this.$emit('benData', response);

                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Beneficiary created!'
                });

              document.getElementById('firstName1').value = '';
              document.getElementById('lastName1').value = '';
              document.getElementById('address1').value = '';
              document.getElementById('phone1').value = '';
              document.getElementById('state1').value = '';
              document.getElementById('postalCode1').value = '';
              document.getElementById('relation1').value = '';
              document.getElementById('age1').value = '';

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
      <h5 class="card-title mb-0">Beneficiaries</h5>
    </div>
    <div class="card-body">
      <div class="mb-4">
        <div style="overflow-y: scroll; max-height: 17vh; overflow-x: hidden;" id="benList">
          <div v-for="data in benList" :key="data.ID">
            <div class="row">
              <div class="col-lg-6">
                <label for="benFirstName" class="form-label"><b>First Name</b></label>
                <p>{{ data.firstName }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benLastName" class="form-label"><b>Last Name</b></label>
                <p>{{ data.lastName }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benAddress" class="form-label"><b>Address</b></label>
                <p>{{ data.address }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benPhone" class="form-label"><b>Phone</b></label>
                <p>{{ data.phone }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benState" class="form-label"><b>State</b></label>
                <p>{{ data.state }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benPostalCode" class="form-label"><b>Postal Code</b></label>
                <p>{{ data.postalCode }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benRelation" class="form-label"><b>Relationship</b></label>
                <p>{{ data.relationship }}</p>
              </div>
              <div class="col-lg-6">
                <label for="benAge" class="form-label"><b>Age</b></label>
                <p>{{ data.age }}</p>
              </div>
              <div class="col-md-6">
                <label for="benAge" class="form-label"><b>Beneficiary Type</b></label>
                <p>{{ (data.relevance) === 1 ? 'Primary beneficiary' : 'Contingent beneficiary' }}</p>
              </div>
              <div class="col-md-6" style="display: flex; justify-content: flex-end;">
              </div>
              <hr>
            </div>
          </div>
        </div>
        <div style="overflow-y: scroll; max-height: 37vh; overflow-x: hidden;">
          <div class="row">
            <div class="col-lg-6">
              <label for="benFirstName" class="form-label">First Name</label>
              <input type="text" id="firstName1" class="form-control mb-2" placeholder="Enter First Name" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benLastName" class="form-label">Last Name</label>
              <input type="text" id="lastName1" class="form-control mb-2" placeholder="Enter Last Name" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benAddress" class="form-label">Address</label>
              <input type="text" id="address1" class="form-control mb-2" placeholder="Enter Address" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benPhone" class="form-label">Phone</label>
              <input type="text" id="phone1" class="form-control mb-2" placeholder="Enter Phone" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benState" class="form-label">State</label>
              <input type="text" id="state1" class="form-control mb-2" placeholder="Enter State"  required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benPostalCode" class="form-label">Postal Code</label>
              <input type="text" id="postalCode1" class="form-control mb-2" placeholder="Enter Postal Code" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benRelation" class="form-label">Relationship</label>
              <input type="text" id="relation1" class="form-control mb-2" placeholder="Enter Relationship" required value="" style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-lg-6">
              <label for="benAge" class="form-label">Age</label>
              <input type="text" id="age1" class="form-control mb-2" placeholder="Enter Age" required style="padding: 0.2rem 0.9rem;">
            </div>
            <div class="col-md-6" style="display: flex; justify-content: flex-end;">
              <div class="col-lg-12">
                <label for="type" class="form-label">Benficiary Type</label>
                <select class="form-select mb-2" aria-label="type" id="type" name="type" style="padding: 0.2rem 0.9rem;">
                  <option value="">...</option>
                  <option value="1">Primary beneficiary</option>
                  <option value="2">Contingent beneficiary</option>
                </select>
              </div>
            </div>
            <div class="col-md-6" style="display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-success" title="Submit" @click="createBeneficiary" style="padding: 0.2rem 0.9rem;" >Save</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <!-- end card -->
</template>