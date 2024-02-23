<script>
import NavBar from "@/components/nav-bar";
import RightBar from "@/components/right-bar";
import Footer from "@/components/footer";
import {HomeIcon, ArchiveIcon, BriefcaseIcon, MapIcon, TruckIcon} from "@zhuowenli/vue-feather-icons";
import jwt_decode from "jwt-decode";

export default {
  watch: {
    $route: {
      handler: "onRoutechange",
      immediate: true,
      deep: true,
    },
  },
  methods: {
    onRoutechange(ele) {
      this.initActiveMenu(ele.path);
    },
    initActiveMenu(ele) {
      setTimeout(() => {
        if (document.querySelector("#navbar-nav")) {
          let a = document
            .querySelector("#navbar-nav")
            .querySelector('[href="' + ele + '"]');

          if (a) {
            a.classList.add("active");
            let parentCollapseDiv = a.closest(".collapse.menu-dropdown");
            if (parentCollapseDiv) {
              parentCollapseDiv.classList.add("show");
              parentCollapseDiv.parentElement.children[0].classList.add(
                "active"
              );
              parentCollapseDiv.parentElement.children[0].setAttribute(
                "aria-expanded",
                "true"
              );
              if (
                parentCollapseDiv.parentElement.closest(
                  ".collapse.menu-dropdown"
                )
              ) {
                parentCollapseDiv.parentElement
                  .closest(".collapse")
                  .classList.add("show");
                if (
                  parentCollapseDiv.parentElement.closest(".collapse")
                    .previousElementSibling
                )
                  parentCollapseDiv.parentElement
                    .closest(".collapse")
                    .previousElementSibling.classList.add("active");
              }
            }
          }
        }
      }, 1000);
    },

    viewPermission(request) {
      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      return currentRole.vueViews.includes(request)
    },
  },
  components: { NavBar, RightBar, Footer, HomeIcon,
    ArchiveIcon, BriefcaseIcon, MapIcon, TruckIcon},
};
</script>

<template>
  <div>
    <div id="layout-wrapper">
      <NavBar />
      <!-- ========== App Menu ========== -->
      <div class="app-menu navbar-menu">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <!-- Dark Logo-->
          <router-link to="/" class="logo logo-dark">
            <span class="logo-sm">
              <img src="@/assets/images/kiato_logo.png" alt="" height="30" />
            </span>
            <span class="logo-lg">
              <img src="@/assets/images/kiato_logo.png" alt="" height="50" />
            </span>
          </router-link>
          <!-- Light Logo-->
          <router-link to="/" class="logo logo-light">
            <span class="logo-sm">
              <img src="@/assets/images/kiato_logo.png" alt="" height="30" />
            </span>
            <span class="logo-lg">
              <img src="@/assets/images/kiato_logo.png" alt="" height="50" />
            </span>
          </router-link>
          <button
            type="button"
            class="
              btn btn-sm
              p-0
              fs-20
              header-item
              float-end
              btn-vertical-sm-hover
            "
            id="vertical-hover"
          >
            <i class="ri-record-circle-line"></i>
          </button>
        </div>
        <div id="scrollbar">
          <div class="container-fluid">
            <ul class="navbar-nav h-100" id="navbar-nav">
              <li class="menu-title">
                <span data-key="t-menu"> {{ $t("t-menu") }} </span>
              </li>
              <li class="nav-item">
                <router-link
                    :to="{name: 'Dashboard'}"
                    data-key="t-dashboards"
                    class="nav-link menu-link"
                >
                  <HomeIcon></HomeIcon>
                  <span data-key="t-agent-portal">{{ $t("t-dashboards") }}</span>
                </router-link>
              </li>
              <!-- end Dashboard Menu -->

              <li class="menu-title" v-if="viewPermission('AGENTLIST')">
                <i class="ri-more-fill"></i>
                <span data-key="t-techs-tab">{{ $t("t-techs-tab") }}</span>
              </li>
              <li class="nav-item" v-if="viewPermission('AGENTLIST')">
                <a
                    class="nav-link menu-link"
                    href="#sidebarApps"
                    data-bs-toggle="collapse"
                    role="button"
                    aria-expanded="false"
                    aria-controls="sidebarApps"
                >
                  <BriefcaseIcon></BriefcaseIcon>
                  <span data-key="t-techs"> {{ $t("t-techs") }}</span>
                </a>
                <div class="collapse menu-dropdown" id="sidebarApps">
                  <ul class="nav nav-sm flex-column">
                    <li class="nav-item">
                      <router-link
                          :to="{name: 'techList'}"
                          class="nav-link"
                          data-key="t-techs-list"
                      >
                        {{ $t("t-techs-list") }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </li>
              <!-- end technicians Menu -->

              <li class="menu-title" v-if="viewPermission('CLIENTLIST')">
                <i class="ri-more-fill"></i>
                <span data-key="t-clients-tab">{{ $t("t-workOrders") }}</span>
              </li>
              <li class="nav-item" v-if="viewPermission('CLIENTLIST')">
                <a
                    class="nav-link menu-link"
                    href="#sidebarAuth"
                    data-bs-toggle="collapse"
                    role="button"
                    aria-expanded="false"
                    aria-controls="sidebarAuth"
                >
                  <ArchiveIcon></ArchiveIcon>
                  <span data-key="t-workOrders">{{
                      $t("t-workOrders")
                    }}</span>
                </a>
                <div class="collapse menu-dropdown" id="sidebarAuth">
                  <ul class="nav nav-sm flex-column">
                    <li class="nav-item">
                      <router-link
                          to="/techs/taskList"
                          class="nav-link"
                          data-key="t-workOrders-list"
                      >
                        {{ $t("t-workOrders-list") }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </li>
              <!-- end workOrders Menu -->

              <li class="menu-title" v-if="viewPermission('DEPARTMENTLIST')">
                <i class="ri-more-fill"></i>
                <span data-key="t-location">{{ $t("t-location") }}</span>
              </li>

              <li class="nav-item" v-if="viewPermission('DEPARTMENTLIST')">
                <a
                    class="nav-link menu-link"
                    href="#sidebarLocations"
                    data-bs-toggle="collapse"
                    role="button"
                    aria-expanded="false"
                    aria-controls="sidebarAuth"
                >
                  <MapIcon></MapIcon>
                  <span data-key="t-location">{{
                      $t("t-location")
                    }}</span>
                </a>
                <div class="collapse menu-dropdown" id="sidebarLocations">
                  <ul class="nav nav-sm flex-column">
                    <li class="nav-item">
                      <router-link
                          to="/locationsList"
                          class="nav-link"
                          data-key="t-location-list">
                        {{ $t("t-location-list") }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </li>
              <!-- end department Menu -->

              <li class="nav-item" v-if="viewPermission('DEPARTMENTLIST')">
                <a
                    class="nav-link menu-link"
                    href="#sidebarInventory"
                    data-bs-toggle="collapse"
                    role="button"
                    aria-expanded="false"
                    aria-controls="sidebarAuth"
                >
                  <TruckIcon></TruckIcon>
                  <span data-key="t-parts">{{
                      $t("t-parts")
                    }}</span>
                </a>
                <div class="collapse menu-dropdown" id="sidebarInventory">
                  <ul class="nav nav-sm flex-column">
                    <li class="nav-item">
                      <router-link
                          to="/inventoryList"
                          class="nav-link"
                          data-key="t-parts-inv">
                        {{ $t("t-parts-inv") }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </li>
              <!-- end Inventory Menu -->

            </ul>
          </div>
          <!-- Sidebar -->
        </div>
        <!-- Left Sidebar End -->
        <!-- Vertical Overlay-->
        <div class="vertical-overlay"></div>
      </div>
      <!-- ============================================================== -->
      <!-- Start Page Content here -->
      <!-- ============================================================== -->

      <div class="main-content">
        <div class="page-content">
          <!-- Start Content-->
          <div class="container-fluid">
            <slot />
          </div>
        </div>
        <Footer />
      </div>
      <RightBar />
    </div>
  </div>
</template>
