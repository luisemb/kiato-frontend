<script>

import axios from 'axios';

export default {
  name: "Login",
  data() {
    return{
      email: null,
      password: '',
      errors: [],
    }
  },
  components:{
  },
  methods: {
    async submitForm() {
      this.errors = []

      if (!this.email) {
        this.errors.push('Email required.');
      } else if (!this.validEmail(this.email.trim())) {
        this.errors.push('Valid email required.');
      }

      if(this.password === '') {
        this.errors.push('Field Password is empty!');
      }

      if(!this.errors.length) {

        const formData = {
          email: this.email,
          password: this.password
        }

        axios.defaults.headers.common['Authorization'] = ''
        localStorage.removeItem('jwt')

        await axios
            .post('/api/login', formData)
            .then(response => {
              const token = response.data.jwt

              this.$store.commit('setToken', token)
              axios.defaults.headers.common['Authorization'] = 'Token ' + token

              localStorage.setItem('jwt', token)
            })
            .catch(error => {
              if (error.response) {
                for(const property in error.response.data) {
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                }
              } else if(error.message) {
                this.errors.push('Something was wrong, please contact your SysAdmin.')
              }
            })

        await axios
            .get('/api/user', { params: { token: localStorage.getItem('jwt') } })
            .then(response => {

              if (response.data.firstName.length < 3 || response.data.lastName.length < 3 || response.data.dateOfBirth.length < 3 ||
                response.data.address.length < 3 || response.data.phoneNumber.length < 3) {
                localStorage.setItem('completeForm', 'true')
              } else {
                localStorage.setItem('completeForm', 'false')
              }

              this.$store.commit('setUser', {'id': response.data.ID, 'firstName': response.data.firstName,
                'lastname': response.data.lastName, 'email': response.data.email})

              localStorage.setItem('email', response.data.email)
              localStorage.setItem('id', response.data.ID)
              localStorage.setItem('firstName', response.data.firstName)
              localStorage.setItem('lastname', response.data.lastName)
              localStorage.setItem('profile', response.data.profileIMG)

              this.$router.push('/')
            })
            .catch(error => {
              if (error.response) {
                for(const property in error.response.data) {
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                }
              } else if(error.message) {
                this.errors.push('Something was wrong, please contact your SysAdmin.')
              }
            })
      }
    },
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    showPassword: function() {
      var x = document.getElementById("password-input");
      if (x.type === "password") {
        x.type = "text";
      } else {
        x.type = "password";
      }
    },
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
                  <img src="@/assets/images/logo-whitebg.png" alt="" height="100">
                </router-link>
              </div>
              <p class="mt-3 fs-15 fw-medium" style="color: white;">Welcome To Kiato | A Powerful Service Center Support App</p>
            </div>
          </div>
        </div>
        <!-- end row -->

        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6 col-xl-5">
            <div class="card mt-4">

              <div class="card-body p-4">
                <div class="text-center mt-2">
                  <h5 class="text-primary">Welcome Back !</h5>
                  <p class="text-muted">Sign in to continue</p>
                </div>
                <div class="p-2 mt-4">
                  <form @submit.prevent="submitForm">

                    <div class="mb-3">
                      <label for="username" class="form-label">Email</label>
                      <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter Email" name="email">
                    </div>

                    <div class="mb-3">
                      <div class="float-end">
                        <router-link to="/reset" class="text-muted">Forgot password?</router-link>
                      </div>
                      <label class="form-label" for="password-input">Password</label>
                      <div class="position-relative auth-pass-inputgroup mb-3">
                        <input v-model="password" type="password" class="form-control pe-5" placeholder="Enter password" id="password-input" autocomplete="off">
                        <button class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon" @click="showPassword()"><i class="ri-eye-fill align-middle"></i></button>
                      </div>
                    </div>

                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" value="" id="auth-remember-check">
                      <label class="form-check-label" for="auth-remember-check">Remember me</label>
                    </div>

                    <!-- danger Alert -->
                    <div v-if="errors.length">
                      <div class="alert alert-danger alert-dismissible alert-outline fade show" role="alert">
                        <strong v-for="error in errors" v-bind:key="error"> {{ error }} <br></strong>
                      </div>
                    </div>

                    <div class="mt-4">
                      <button class="btn btn-info w-100" type="submit">Sign In</button>
                    </div>
                  </form>
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
              <p class="mb-0 text-muted">&copy; {{new Date().getFullYear()}} Kiato. Crafted with <i class="mdi mdi-heart text-danger"></i> by <a href="https://anfisbena.com" target="_blank" style="text-decoration: none;"> Anfisbena </a></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- end Footer -->
  </div>
  <!-- end auth-page-wrapper -->
</template>