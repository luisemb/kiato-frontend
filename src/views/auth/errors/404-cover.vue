<script>
import axios from 'axios';

export default {
    methods:{
      async logout() {
        await axios
            .post('/api/logout')
            .then(response => {
              console.log(response)
            })
            .catch(error =>{
              console.log(JSON.stringify(error))
            })

        axios.defaults.headers.common['Authorization'] = ''
        localStorage.removeItem('jwt')
        this.$store.commit('removeToken')
      },
    }
}
</script>

<template>
        <!-- auth-page wrapper -->
        <div class="auth-page-wrapper py-5 d-flex justify-content-center align-items-center min-vh-100">

            <!-- auth-page content -->
            <div class="auth-page-content overflow-hidden p-0">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-xl-7 col-lg-8">
                            <div class="text-center">
                                <img src="@/assets/images/coming-soon-img.png" alt="error img" class="img-fluid">
                                <div class="mt-3">
                                    <h3 class="text-uppercase">Sorry, You don't have permissions 😟</h3>
                                    <p class="text-muted mb-4">Ask to your SysAdmin for this inconvenience</p>
                                    <router-link to="/" class="btn btn-success"><i class="mdi mdi-home me-1"></i>Back to home</router-link>
                                    <br>
                                    <router-link to="/logout" class="btn btn-success" style="margin-top: 10px;" @click="logout()">
                                      <i class="mdi mdi-logout me-1"></i>LogOut
                                    </router-link>
                                </div>
                            </div>
                        </div><!-- end col -->
                    </div>
                    <!-- end row -->
                </div>
                <!-- end container -->
            </div>
            <!-- end auth-page content -->
        </div>
        <!-- end auth-page-wrapper -->
</template>