<script>
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/password-security.json";
import axios from "axios";
import Swal from "sweetalert2";

export default {
  components: { lottie: Lottie },
  data() {
    return {
      defaultOptions: { animationData: animationData },
      password: '',
      confirmPassword: '',
    };
  },
  methods:{
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    async updateUserPassword(){

      this.errors = []
      const password = document.getElementById('password').value
      const confirmPassword = document.getElementById('confirm').value

      if (!password || confirmPassword.length <= 0) {
        this.errors.push('Password is required.');
      }

      if (!confirmPassword || confirmPassword.length <= 0) {
        this.errors.push('Confirm Password is required.');
      }

      if(password !== confirmPassword){
        this.errors.push('Passwords don\'t match.');
      }

      if (!this.errors.length) {

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const token = urlParams.get('t')

        const data = {
          token: token,
          password: password,
          confirmPassword: confirmPassword,
        }

        await axios
            .post('/api/updateUserPassword', data)
            .then(async response => {
              if (response.status === 200) {
                await Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Password updated!',
                  timer: 2000,
                });

                await this.$router.push('login')
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
  },
  async mounted() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const token = urlParams.get('t')

    const data = {
      token: token
    }

    await axios
        .post('/api/checkResetToken', data)
        .then(response => {
          if (response.data === false){
            this.$router.push('login')
          }
        })
        .catch(error => {
          if (error.response) {
            Swal.fire("Oops!", "Something was wrong, please contact your SysAdmin.", "error")
          }
        })
  }
}
</script>

<template>
  <div class="auth-page-wrapper pt-5">
    <!-- auth page bg -->
    <div class="auth-one-bg-position auth-one-bg"  id="auth-particles">
      <div class="bg-overlay"></div>

      <div class="shape">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1440 120">
          <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
        </svg>
      </div>
    </div>

    <!-- auth page content -->
    <div class="auth-page-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="text-center mt-sm-5 mb-4 text-white-50">
              <div>
                <router-link to="/" class="d-inline-block auth-logo">
                  <img src="@/assets/images/logo-light.png" alt="" height="140">
                </router-link>
              </div>
              <p class="mt-3 fs-15 fw-medium">DMB Insurance Group</p>
            </div>
          </div>
        </div>
        <!-- end row -->

        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6 col-xl-5">
            <div class="card mt-4">

              <div class="card-body p-4">
                <div class="text-center mt-2">
                  <h5 class="text-primary">RESET PASSWORD</h5>

                  <lottie
                      class="avatar-xl"
                      colors="primary:#0ab39c,secondary:#405189"
                      :options="defaultOptions"
                      :height="120"
                      :width="120"
                  />

                </div>

                <div class="alert alert-borderless alert-warning text-center mb-2 mx-2" role="alert">
                  You will be redirect to Sign in!
                </div>
                <div class="p-2">
                  <form @submit.prevent="updateUserPassword">
                    <div class="mb-4">
                      <label class="form-label">Password</label>
                      <input type="text" class="form-control" id="password" placeholder="Enter Password" v-bind:value="this.password">
                    </div>
                    <div class="mb-4">
                      <label class="form-label">Confirm Password</label>
                      <input type="text" class="form-control" id="confirm" placeholder="Confirm Password" v-bind:value="this.confirmPassword">
                    </div>

                    <div class="text-center mt-4">
                      <button class="btn btn-success w-100" type="submit">Set Password</button>
                    </div>
                  </form><!-- end form -->
                </div>
              </div>
              <!-- end card body -->
            </div>
            <!-- end card -->

          </div>
        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </div>
    <!-- end auth page content -->

    <!-- footer -->
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="text-center">
              <p class="mb-0">&copy; {{new Date().getFullYear()}} DMB Insurance Agency. Crafted with <i class="mdi mdi-heart text-danger"></i></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- end Footer -->
  </div>
  <!-- end auth-page-wrapper -->
</template>