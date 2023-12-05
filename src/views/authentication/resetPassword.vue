<script>
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/rhvddzym.json";
import axios from "axios";
import Swal from "sweetalert2";

export default {
  methods:{
    validEmail: function (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.trim());
    },
    async resetPassword () {

      if(this.validEmail(document.getElementById('email').value)){

        const data = {
          email: document.getElementById('email').value
        }

        await axios
            .post('/api/resetPassword', data)
            .then(response => {

              if(response.data === true){
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'We have sent an email to your address!',
                  timer: 3000,
                });
                setTimeout(() => {
                  this.$router.push('login')
                }, 4000);
              }else {
                  Swal.fire("Oops!", "We couldn't find your email address :(", "error")
              }

            })
            .catch(error => {
              if (error.response) {
                Swal.fire("Oops!", "We couldn't find your email address :(", "error")
              }
            })
      }else{
        await Swal.fire("Oops!", "Please, write a valid email.", "error")
      }

    },
  },
  components: { lottie: Lottie },
  data() {
    return {
      defaultOptions: { animationData: animationData },
    }
  },
  mounted() {
    document.getElementById('email').value = ''
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
                  <h5 class="text-primary">Forgot Password?</h5>
                  <p class="text-muted">Reset password with DMB CRM</p>

                  <lottie
                      class="avatar-xl"
                      colors="primary:#0ab39c,secondary:#405189"
                      :options="defaultOptions"
                      :height="120"
                      :width="120"
                  />

                </div>

                <div class="alert alert-borderless alert-warning text-center mb-2 mx-2" role="alert">
                  Enter your email and instructions will be sent to you!
                </div>
                <div class="p-2">
                  <form @submit.prevent="resetPassword">
                    <div class="mb-4">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" id="email" placeholder="Enter Email">
                    </div>

                    <div class="text-center mt-4">
                      <button class="btn btn-success w-100" type="submit">Send Reset Link</button>
                    </div>
                  </form><!-- end form -->
                </div>
              </div>
              <!-- end card body -->
            </div>
            <!-- end card -->

            <div class="mt-4 text-center">
              <p class="mb-0">Wait, I remember my password... <router-link to="/login" class="fw-semibold text-primary text-decoration-underline"> Sign In </router-link> </p>
            </div>

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