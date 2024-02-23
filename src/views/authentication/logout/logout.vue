<script>
import animationData from "@/components/widgets/hzomhqxz.json";
import Lottie from "@/components/widgets/lottie.vue";

export default {
     data() {
        return {
             defaultOptions: { animationData: animationData },
        }
    },
    components: {
        lottie: Lottie
    },
  mounted() {
    localStorage.removeItem('jwt')
    localStorage.removeItem('id')
    localStorage.removeItem('selectedUserName')
    localStorage.removeItem('email')
    localStorage.removeItem('lastname')
    localStorage.removeItem('firstName')
    localStorage.removeItem('clientFormData')
    localStorage.removeItem('completeForm')
    localStorage.removeItem('language')
    localStorage.removeItem('nightMode')
    localStorage.removeItem('selectedUser')
    this.$store.commit('removeToken')
  }
}
</script>

<template>
     <!-- auth-page wrapper -->
        <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
            <div class="bg-overlay"></div>

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
                    <div class="card-body p-4 text-center">
                      <lottie
                          colors="primary:#405189,secondary:#08a88a"
                          :options="defaultOptions"
                          :height="180"
                          :width="180"
                      />
                      <div class="mt-4 pt-2">
                        <h5>You are Logged Out</h5>
                        <p class="text-muted">Thank you for using <span class="fw-semibold">Kiato</span> App</p>
                        <div class="mt-4">
                          <div class="mt-4">
                            <router-link to="/login" class="btn btn-info w-100">Sign In</router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- end card body -->
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

            <!-- footer -->
            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="text-center">
                                <p class="mb-0" style="white;">&copy; {{new Date().getFullYear()}} Anfisbena. Crafted with <i class="mdi mdi-heart text-danger"></i></p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <!-- end Footer -->
        </div>
        <!-- end auth-page-wrapper -->
</template>