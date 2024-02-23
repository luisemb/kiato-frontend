<script>
export default {

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
              <div class="row justify-content-center g-0">
                <div class="col-lg-6">
                  <div class="p-lg-5 p-4 auth-one-bg h-100">
                    <div class="bg-overlay"></div>
                    <div class="position-relative h-100 d-flex flex-column">
                      <div class="mb-4">
                        <span class="d-block">
                          <img src="@/assets/images/logo-light.png" alt="" height="100"  style="margin-left: auto;margin-right: auto;display: block;">
                        </span>
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
                  <div class="p-lg-5 p-4 text-center">
                    <div class="avatar-lg mx-auto mt-2">
                      <div class="avatar-title bg-light text-success display-3 rounded-circle">
                        <i class="ri-checkbox-circle-fill"></i>
                      </div>
                    </div>
                    <div class="mt-4 pt-2">
                      <h4>Well done !</h4>
                      <p class="text-muted mx-4">Aww yeah, you're a step near to become a great Insurance Agent.</p>
                      <br>
                      <p class="text-muted mx-6"><b>In a few minutes one of recruiters will be in touch with you.</b></p>
                      <div class="mt-4">
                        <div class="mt-4 text-center">
                          <div class="signin-other-title">
                            <h5 class="fs-13 mb-4 title">Know more about us:</h5>
                          </div>
                          <div>
                            <a href="https://www.facebook.com/DMBAGENCY" target="_blank" title="DMB Facebook">
                              <button type="button" class="btn btn-primary btn-icon waves-effect waves-light"><i class="ri-facebook-fill fs-16"></i></button>
                            </a>
                            <a href="https://www.instagram.com/dmbinsuranceagency" target="_blank" title="DMB Instagram">
                              <button type="button" class="btn btn-danger btn-icon waves-effect waves-light ms-1"><i class="ri-instagram-fill fs-16"></i></button>
                            </a>
                            <a href="https://www.dmbgroup.online/" target="_blank" style="margin-left: 5px;" title="DMB Website">
                              <button type="button" class="btn btn-primary btn-icon waves-effect waves-light"><i class="ri-safari-line fs-16"></i></button>
                            </a>
                          </div>
                        </div>
                      </div>
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

    <!-- footer -->
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="text-center">
              <p class="mb-0">&copy; {{new Date().getFullYear()}} DMB Insurance Group. Crafted with <i class="mdi mdi-heart text-danger"></i></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- end Footer -->
  </div>
  <!-- end auth-page-wrapper -->
</template>