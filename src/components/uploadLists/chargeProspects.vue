<script>

import moment from "moment";
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: 'chargeProspects',
  props:['prospectList'],
  data () {
    return{
      prospectsArr: [],
      columnsArray: [],
    }
  },
  methods: {
    formatDate: function (date, format) {
      date = moment(date).format(format)
      return date;
    },
    async saveNote () {

      const data = {
        note: document.getElementById('userNote').value,
        agentID: localStorage.getItem('selectedUser'),
        userID: localStorage.getItem('id'),
        userEmail: localStorage.getItem('email'),
        token: localStorage.getItem('jwt'),
      }

      const pattern = '/client/';
      if(window.location.href.match(pattern)) {

        await axios
            .post('/api/workOrder/saveClientNote', data)
            .then(async response => {

              if (response.status === 200) {

                var current = new Date();

                let notesElement = document.getElementById("list-unstyled-notes");

                var row = '<li class="chat-list right">' +
                    '<div class="conversation-list">' +
                    '<div class="chat-avatar"><img src="/img/avatar-2.9ce030c2.jpg" alt=""></div>' +
                    '<div class="user-chat-content"><div class="ctext-wrap">' +
                    '<div class="ctext-wrap-content">' +
                    '<p class="mb-0 ctext-content">'+data.note+'</p>' +
                    '</div>' +
                    '<div class="conversation-name">' +
                    '<small class="text-muted time">'+current.getHours()+':'+current.getMinutes()+'</small></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>';

                notesElement.insertAdjacentHTML( 'beforeend', row)
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
      } else {
        await axios
            .post('/api/saveUserNote', data)
            .then(async response => {

              if (response.status === 200) {

                var current = new Date();

                let notesElement = document.getElementById("list-unstyled-notes");

                var row = '<li class="chat-list right"><div class="conversation-list">' +
                    '<div class="chat-avatar"><img src="/img/avatar-2.9ce030c2.jpg" alt=""></div>' +
                    '<div class="user-chat-content"><div class="ctext-wrap">' +
                    '<div class="ctext-wrap-content">' +
                    '<p class="mb-0 ctext-content">'+data.note+'</p>' +
                    '</div>' +
                    '<div class="dropdown align-self-start message-box-drop">' +
                    '<a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                    '<i class="ri-more-2-fill"></i></a><div class="dropdown-menu"><a class="dropdown-item reply-message" href="#">' +
                    '<i class="ri-reply-line me-2 text-muted align-bottom"></i>Reply</a><a class="dropdown-item" href="#">' +
                    '<i class="ri-share-line me-2 text-muted align-bottom"></i>Forward</a><a class="dropdown-item copy-message" href="#">' +
                    '<i class="ri-file-copy-line me-2 text-muted align-bottom"></i>Copy</a><a class="dropdown-item" href="#">' +
                    '<i class="ri-bookmark-line me-2 text-muted align-bottom"></i>Bookmark</a><a class="dropdown-item delete-item" href="#">' +
                    '<i class="ri-delete-bin-5-line me-2 text-muted align-bottom"></i>Delete</a>' +
                    '</div></div>' +
                    '<div class="conversation-name">' +
                    '<small class="text-muted time">'+current.getHours()+':'+current.getMinutes()+'</small></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>';

                notesElement.insertAdjacentHTML( 'beforeend', row)
                document.getElementById('userNote').value = ''
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
      }
    },
    async chargeProspectList() {

      const csvFile = document.getElementById("csvFile");
      let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
      let prospectsAr = []

      if (regex.test(document.getElementById("csvFile").value.toLowerCase())) {

        const input = csvFile.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
          const text = e.target.result;
          const headers = text.slice(0, text.indexOf("\n")).split(",");

          // slice from \n index + 1 to the end of the text
          // use split to create an array of each csv value row
          const rows = text.slice(text.indexOf("\n")).split("\n");

          // Map the rows
          // split values from each row into an array
          // use headers.reduce to create an object
          //  properties derived from headers:values
          // the object passed as an element of the array
          const data = rows.map(function (row) {
            const values = row.split(",");
            const el = headers.reduce(function (object, header, index) {
              object[index] = values[index];
              return object;
            }, {});
            return el;
          });

          var tbodyRef = document.getElementById('prechargeClients').getElementsByTagName('tbody')[0];
          for (let i = 0; i < data.length; i++) {
            let infoArr = []
            let rowArray = []

            // Insert a row at the end of table
            if (data[i][1] !== undefined && data[i][2] !== undefined) {
              for (let j = 0; j < 12; j++) {
                if (j !== 6) {
                  infoArr.push(data[i][j]);
                }
              }

              rowArray.push(infoArr[0], infoArr[1], infoArr[2], infoArr[3], infoArr[4], infoArr[5], infoArr[6], infoArr[7], infoArr[8], infoArr[9], infoArr[10])
              prospectsAr.push(rowArray)

              tbodyRef.insertAdjacentHTML("beforeend", `<tr>
                        <td><span class="badge badge-soft-primary">` + infoArr[0] + `</span></td>
                        <td>` + infoArr[1] + `</td>
                        <td>` + infoArr[2] + `</td>
                        <td>` + infoArr[3] + `</td>
                        <td>` + infoArr[4] + `</td>
                        <td>` + infoArr[5] + `</td>
                        <td>` + infoArr[6] + `</td>
                        <td>` + infoArr[7] + `</td>
                        <td>` + infoArr[8] + `</td>
                        <td>` + infoArr[9] + `</td>
                        <td>` + infoArr[10] + `</td>
                      </tr>`);
            }
          }
        }
        reader.readAsText(input);

        this.prospectsArr = prospectsAr;

      } else {
        await Swal.fire({
          position: "bottom-end",
          icon: 'error',
          title: "Please upload a valid .CSV file.",
          showConfirmButton: true,
          timer: 5000,
        });
      }
    },
    async uploadList() {

      let columnsArr = []
      let validator = true;
      for (let i = 1; i < 12; i++) {
        let id = 'select'+i;
        let selectedInput = document.getElementById(id).value;
        let columnName = document.getElementById(id).options[document.getElementById(id).selectedIndex].text;

        if(selectedInput == 0) {
          validator = false
        }

        if(!columnsArr.includes(selectedInput)){
          columnsArr.push(selectedInput)
        } else {
          await Swal.fire({
            position: "bottom-end",
            icon: 'error',
            title: "Your column: <b>"+columnName+"</b> is duplicated in column: <b>"+i+"</b>!",
            showConfirmButton: true,
            timer: 5000,
          });
        }
        this.columnsArray = columnsArr;
      }

      if(validator) {

        const data = {
          list: this.prospectsArr,
          columnList: this.columnsArray,
          userID: localStorage.getItem('id'),
          email: localStorage.getItem('email'),
          token: localStorage.getItem('jwt'),
        }

        await axios
            .post('/api/workOrder/uploadClientList', data)
            .then(async response => {

              if (response) {

                let list = '';
                let duplicated = response.data.duplicated;
                // let added = response.data.duplicated;

                if (duplicated.length > 0){
                  duplicated.forEach(function(row){
                    list += '\n' + '</br>Name: <b style="color: #eccb3f">' + row.firstName + ' ' + row.lastName + '</b> ' + 'Phone: (' + row.phoneNumber + ')';
                  });
                }

                if (duplicated.length){
                  await Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Your work has been saved! <br>"+
                        "Some registries are already in the system!" + list,
                    showConfirmButton: true
                  }).then((result) => {
                    if (result.isConfirmed) {
                      location.reload()
                    }
                  })
                }else{
                  await Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Your work has been saved!",
                    showConfirmButton: true
                  });
                }


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
      }

    },
  },
}

</script>
<style>
.tbodyDiv {
  max-height: clamp(35em,10vh,600px);
  overflow: auto;
}
</style>
<template>
  <form id="uploadForm">
    <div class="modal-body">
      <input class="form-control form-control-lg" id="csvFile" type="file" @change="chargeProspectList()" accept=".csv">
      <div class="tbodyDiv">
        <br />
        <table class="table table-bordered border-secondary table-nowrap" id="prechargeClients">
          <thead>
          <tr>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select1">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select2">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select3">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select4">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select5">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select6">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select7">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select8">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select9">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select10">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
            <th scope="col">
              <select class="form-select rounded-pill mb-3" aria-label=".form-select-sm select" id="select11">
                <option selected value="0">Search Column</option>
                <option value="1">First Name</option>
                <option value="2">Last Name</option>
                <option value="3">Address</option>
                <option value="4">City</option>
                <option value="5">State</option>
                <option value="6">ZipCode</option>
                <option value="7">Phone</option>
                <option value="8">Age</option>
                <option value="9">Type/Media</option>
                <option value="10">Language</option>
                <option value="11">Assigned</option>
              </select>
            </th>
          </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" @click="uploadList"><i class="ri-save-line align-bottom me-1" ></i> Save</button>
    </div>
  </form>
</template>