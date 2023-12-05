<script>
import { CountTo } from "vue3-count-to";
import Lottie from "@/components/widgets/lottie";
import animationData from "@/components/widgets/msoeawqm.json";

export default {
  props:['prospectsList'],
  components: {
    CountTo,
    Lottie,
  },
  data(){
    return{
      defaultOptions: { animationData: animationData },
    }
  },
};
</script>
<style>
.crm-widget .col {
  border-right: 3px solid #e9ebec !important;
}

.crm-widget .col:last-child {
  border: 0px !important;
}
</style>
<template>
  <h2>Prospects</h2>
  <div class="card crm-widget border-3">
    <div class="card-body p-0">
      <div class="row row-cols-xxl-5 row-cols-md-3 row-cols-1 g-0">
        <div class="col" v-for="(item, index) in prospectsList[0]" :key="index">
          <router-link v-bind:to="'/prospects/List?n='+item.name">
            <div class="py-4 px-3">
              <h5 class="text-muted text-uppercase fs-13">
                <p class="fw-medium mb-0" v-bind:style="'color:'+ item.colors">{{ item.name }}</p>
                <i :class="`${item.badge} fs-18 float-end align-middle`"></i>
              </h5>
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <i :class="`${item.icon} display-6 text-muted`"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                  <h2 class="mb-0">
                    <count-to :startVal='0' :endVal='item.total' :duration='2000'></count-to>
                  </h2>
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <!-- end col -->
        <div v-if="prospectsList[0] === []"  class="">
          <div class="text-center d-flex align-items-center">
            <lottie
                class="avatar-xl"
                colors="primary:#121331,secondary:#08a88a"
                :options="defaultOptions"
                :height="75"
                :width="75"
            />
            <h6 class="mt-2">Sorry! No Result Found</h6>
          </div>
        </div>
      </div>
      <!-- end row -->
    </div>
    <!-- end card body -->
  </div>
  <!-- end card -->
</template>
