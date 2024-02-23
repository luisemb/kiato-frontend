<script>
import { CountTo } from "vue3-count-to";

import {
  UsersIcon,
} from "@zhuowenli/vue-feather-icons";

export default {
  props:['agentsList'],
  components: {
    CountTo,
    UsersIcon
  },
};
</script>
<style>

</style>
<template>
  <h2>Agents</h2>
  <div class="row">
    <div class="col-md-2" v-for="(item, index) in agentsList" :key="index" style="width: 20rem;">
      <router-link v-bind:to="'/techs/List?n='+item.name">
        <div class="card card-animate">
          <div class="card-body border border-2" >
            <div class="d-flex justify-content-between">
              <div>
                <p class="fw-medium mb-0" v-bind:style="'color:'+ item.color">{{ item.name }}</p>
                <h2 class="mt-4 ff-secondary fw-semibold">
                  <count-to :startVal="0" :endVal="item.total" :duration="3000"></count-to>
                </h2>
  <!--            <p class="mb-0 text-muted">-->
  <!--              <span class="badge bg-light text-success mb-0">-->
  <!--                <i class="ri-arrow-up-line align-middle"></i> 16.24 %-->
  <!--              </span>-->
  <!--              vs. previous month-->
  <!--            </p>-->
              </div>
              <div>
                <div class="avatar-sm flex-shrink-0">
                  <span class="avatar-title rounded-circle fs-2">
                    <users-icon style="color: white"></users-icon>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- end card body -->
        </div>
      </router-link>
      <!-- end card-->
    </div>
  </div>
</template>
