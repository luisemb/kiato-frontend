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
  <!-- auth-page wrapper -->
  <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
    <div class="bg-overlay"></div>
    <!-- auth-page content -->
    <div class="auth-page-content overflow-hidden pt-lg-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="card overflow-hidden">
              <div class="row g-0">
                <div class="col-lg-6">
                  <div class="p-lg-5 p-4 auth-one-bg h-100">
                    <div class="bg-overlay"></div>
                    <div class="position-relative h-100 d-flex flex-column">
                      <div class="mb-4">
                        <router-link to="/login" class="d-block">
<!--                          <img src="@/assets/images/logo-light.png" alt="" height="18">-->
                        </router-link>
                      </div>
                      <div class="mt-auto">
                        <div class="mb-3">
                          <i class="ri-double-quotes-l display-4 text-success"></i>
                        </div>

                        <div id="qoutescarouselIndicators" class="carousel slide" data-bs-ride="carousel">
                          <div class="carousel-indicators">
                            <button type="button" data-bs-target="#qoutescarouselIndicators" data-bs-slide-to="0" class="active"
                                    aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#qoutescarouselIndicators" data-bs-slide-to="1"
                                    aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#qoutescarouselIndicators" data-bs-slide-to="2"
                                    aria-label="Slide 3"></button>
                          </div>
                          <div class="carousel-inner text-center text-white-50 pb-5">
                            <div class="carousel-item active">
                              <p class="fs-15 fst-italic">“Learn as if you will live forever, live like you will die tomorrow.” — <quote>Mahatma Gandhi</quote></p>
                            </div>
                            <div class="carousel-item">
                              <p class="fs-15 fst-italic">"Success is not final; failure is not fatal: It is the courage to continue that counts." — <quote>Winston S. Churchill</quote></p>
                            </div>
                            <div class="carousel-item">
                              <p class="fs-15 fst-italic">“Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus. “ — <quote>Alexander Graham Bell</quote></p>
                            </div>
                          </div>
                        </div>
                        <!-- end carousel -->
                      </div>
                    </div>
                  </div>
                </div>
                <!-- end col -->

                <div class="col-lg-6">
                  <div class="p-lg-5 p-4">
                    <div>
                      <h5 class="text-primary">Welcome Back!</h5>
                      <p class="text-muted">Sign in to continue to CRM.</p>
                    </div>

                    <div class="mt-4">
                      <form @submit.prevent="submitForm">

                        <div class="mb-3">
                          <label for="email" class="form-label">Email</label>
                          <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter Email" name="email">
                        </div>

                        <div class="mb-3">
                          <div class="float-end">
                            <router-link to="/auth/reset-pwd-cover" class="text-muted">Forgot password?</router-link>
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
                          <button class="btn btn-success w-100" type="submit">Sign In</button>
                        </div>

                        <div class="mt-2 text-center">
                          <p class="mb-0"><router-link to="/reset" class="fw-semibold text-primary text-decoration-underline"> Reset Password </router-link> </p>
                        </div>

                        <div class="mt-4 text-center">
                          <div class="signin-other-title">
                            <h5 class="fs-13 mb-4 title">Follow Us</h5>
                          </div>
                          <div>
                            <a href="https://www.facebook.com/DMBAGENCY" target="_blank">
                              <button type="button" class="btn btn-primary btn-icon waves-effect waves-light"><i class="ri-facebook-fill fs-16"></i></button>
                            </a>
                            <a href="https://www.instagram.com/dmbinsuranceagency" target="_blank">
                              <button type="button" class="btn btn-danger btn-icon waves-effect waves-light ms-1"><i class="ri-instagram-fill fs-16"></i></button>
                            </a>
                          </div>
                        </div>

                      </form>
                    </div>
                    <div class="mt-5 text-center">
                      <p class="mb-0">Don't have an account ? <router-link to="/register" class="fw-semibold text-primary text-decoration-underline"> Signup</router-link> </p>
                    </div>
                  </div>
                </div>
                <!-- end col -->
              </div>
              <!-- end row -->
            </div>
            <!-- end card -->
          </div>
          <!-- end col -->

        </div>
        <!-- end row -->
      </div>
      <!-- end container -->
    </div>
    <!-- end auth page content -->

  </div>
  <!-- end auth-page-wrapper -->
</template>