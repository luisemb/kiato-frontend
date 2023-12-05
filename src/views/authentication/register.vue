<script>
// import {reactive} from 'vue';
// import { useRouter } from "vue-router";
import axios from 'axios';
import { toast } from 'bulma-toast'

export default {
  name: "Register",
  data() {
    return{
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
      errors: []
    }
  },
  methods: {
    submit() {
      this.errors = []

      if(this.firstName === '') {
        this.errors.push('Field First Name is empty!');
      }

      if(this.lastName === '') {
        this.errors.push('Field Last Name is empty!');
      }

      if(this.phoneNumber === '') {
        this.errors.push('Field Phone is empty!');
      }

      if(this.email === '') {
        this.errors.push('Field Email is empty!');
      }

      if(this.password === '') {
        this.errors.push('Field Password is empty!');
      }

      if(!this.errors.length){

        const formData = {
          firstName: this.firstName,
          lastName: this.lastName,
          phoneNumber: this.phoneNumber,
          email: this.email,
          password: this.password
        }

        axios
            .post('http://127.0.0.1:8000/api/register', formData)
            .then(response => {
              toast({
                message: 'account was created, please log in!',
                type: 'is-success',
                dismissible: true,
                pauseOnHover: true,
                duration: 2000,
                position: 'bottom-right',

              })
              console.log(response)
              this.$router.push('/login')
            })
            .catch(error => {
              if (error.response) {
                for(const property in error.response.data){
                  this.errors.push(`${property}: ${error.response.data[property]}`)
                }
              }else if(error.message){
                this.errors.push('Something was wrong, please contact your SysAdmin.')
              }
            })
      }
    }
  }
  // setup() {
  //   const data = reactive ({
  //     firstName: '',
  //     lastName: '',
  //     phoneNumber: '',
  //     email: '',
  //     password: '',
  //   });
  //
  //   // const router = useRouter();
  //
  //   const submit = async () =>{
  //     await fetch('http://127.0.0.1:8000/api/register',{
  //       method: 'POST',
  //       headers: {'Content-Type': 'application/json'},
  //       credentials: 'include',
  //       body: JSON.stringify(data)
  //     });
  //
  //     // await router.push('/')
  //   }
  //
  //   return {
  //     data,
  //     submit
  //   }
  // }
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
            <div class="card overflow-hidden m-0">
              <div class="row justify-content-center g-0">
                <div class="col-lg-6">
                  <div class="p-lg-5 p-4 auth-one-bg h-100">
                    <div class="bg-overlay"></div>
                    <div class="position-relative h-100 d-flex flex-column">
                      <div class="mb-4">
                        <router-link to="/register" class="d-block">
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

                <div class="col-lg-6">
                  <div class="p-lg-5 p-4">
                    <div>
                      <h5 class="text-primary">Register Account</h5>
                      <p class="text-muted">Get your Free CRM account now.</p>
                    </div>

                    <div class="mt-4">
                      <form @submit.prevent="submit" class="needs-validation" novalidate>

                        <div class="mb-3">
                          <label for="userName" class="form-label">First Name <span class="text-danger">*</span></label>
                          <input v-model="firstName" type="text" class="form-control" id="userName" placeholder="First Name" required>
                          <div class="invalid-feedback">
                            Please enter First Name
                          </div>
                        </div>

                        <div class="mb-3">
                          <label for="userLastName" class="form-label">Last Name <span class="text-danger">*</span></label>
                          <input v-model="lastName" type="text" class="form-control" id="userLastName" placeholder="Last Name" required>
                          <div class="invalid-feedback">
                            Please enter Last Name
                          </div>
                        </div>

                        <div class="mb-3">
                          <label for="userPhone" class="form-label">Phone <span class="text-danger">*</span></label>
                          <input autocomplete="off" v-model="phoneNumber" type="text" class="form-control" id="userPhone" placeholder="Phone" required>
                          <div class="invalid-feedback">
                            Please enter Phone
                          </div>
                        </div>

                        <div class="mb-3">
                          <label for="userEmail" class="form-label">Email <span class="text-danger">*</span></label>
                          <input autocomplete="off" v-model="email" type="email" class="form-control" id="userEmail" placeholder="Enter email address" required>
                          <div class="invalid-feedback">
                            Please enter email
                          </div>
                        </div>


                        <div class="mb-2">
                          <label for="userpassword" class="form-label">Password <span class="text-danger">*</span></label>
                          <input autocomplete="off" v-model="password" type="password" class="form-control" id="userpassword" placeholder="Enter password" required>
                          <div class="invalid-feedback">
                            Please enter password
                          </div>
                        </div>

                        <div class="mb-4">
                          <p class="mb-0 fs-12 text-muted fst-italic">By registering you agree to the CRM  <a href="#" class="text-primary text-decoration-underline fst-normal fw-medium">Terms of Use</a></p>
                        </div>

                        <!-- danger Alert -->
                        <div v-if="errors.length">
                          <div class="alert alert-danger alert-dismissible alert-outline fade show" role="alert">
                            <strong v-for="error in errors" v-bind:key="error"> {{ error }} <br></strong>
                          </div>
                        </div>

                        <div class="mt-4">
                          <button class="btn btn-success w-100" type="submit">Sign Up</button>
                        </div>

                      </form>
                    </div>
                    <div class="mt-5 text-center">
                      <p class="mb-0">Already have an account ? <router-link to="/login" class="fw-semibold text-primary text-decoration-underline"> Signin</router-link> </p>
                    </div>
                  </div>
                </div>
              </div>
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