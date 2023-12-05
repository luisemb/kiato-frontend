import { createWebHistory, createRouter } from "vue-router";
import jwt_decode from "jwt-decode";
import { store } from '@/state/store'

import Dashboard from '../views/dashboard/crm/index.vue'
import Login from '../views/authentication/login.vue'
import Register from '../views/authentication/register.vue'
import agentsInterviews from '../views/authentication/scheduleAgentInterview.vue'
import Logout from '../views/authentication/logout/logout.vue'
import PageNotFound from '../views/auth/errors/404-cover.vue'
import agentList from '../views/agents/agentslist'
import successInterview from '../views/agents/succesInterview'
import agentListKanban from '../views/agents/agentlistkanban'
import agentPayment from '../views/agents/agentPayments'
import scheduleInterviews from '../views/agents/scheduleInterviews.vue'
import clientList from '../views/clients/clientlist'
import deletedClientList from '../views/clients/deletedClients'
import clientListKanban from '../views/clients/clientskanban'
import errorPage from '../views/auth/errors/404-cover.vue'
import prospectList from '../views/prospects/prospectlist'
import prospectListKanban from '../views/prospects/prospectkaban'
import deletedProspects from '../views/prospects/deletedProspects'
import departmentList from '../views/departments/departmentList'
import calendar from '../views/calendar/agentCalendar'
import agentsAppoinments from '../views/calendar/agentsAppoinments'
import test from '../views/apps/chat.vue'
import scheduleMessages from '../views/communication/scheduleMessages'
import profile from '../views/agents/profile'
import phoneCall from '../views/phoneCalls'
import agentApproval from '../views/agents/approval'
import resetPassword from '../views/authentication/resetPassword'
import changePassword from '../views/authentication/changePasssword'
import uploadWalkingList from '../views/prospects/uploadWalkingLists'
import clientsMap from '../views/clients/clientsMap'
import eContacts from '../views/clients/econtacts'
import termsAndConditions from '../views/termAndConditions'


const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requireLogin: true,
      permissions: ['DASHBOARD']
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requireLogin: false,
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/logout',
    name: 'logout',
    component: Logout
  },
  {
    path: '/errorPage',
    name: 'errorPage',
    component: errorPage
  },
  {
    path: '/:catchAll(.*)*',
    name: "PageNotFound",
    component: PageNotFound,
  },
  {
    path: '/agents/List',
    name: 'agentList',
    component: agentList,
    meta: {
      requireLogin: true,
      permissions: ['AGENTLIST']
    }
  },
  {
    path: '/agents/ListCard',
    name: 'agentListKanban',
    component: agentListKanban,
    meta: {
      requireLogin: true,
      permissions: ['AGENTLIST']
    }
  },
  {
    path: '/agents/payments',
    name: 'agentPayments',
    component: agentPayment,
    meta: {
      requireLogin: true,
      permissions: ['AGENTLIST']
    }
  },
  {
    path: '/client/List',
    name: 'clientList',
    component: clientList,
    meta: {
      requireLogin: true,
      permissions: ['CLIENTLIST']
    }
  },
  {
    path: '/client/ListCard',
    name: 'clientListKanban',
    component: clientListKanban,
    meta: {
      requireLogin: true,
      permissions: ['CLIENTLIST']
    }
  },
  {
    path: '/deleted/client/List',
    name: 'deletedClients',
    component: deletedClientList,
    meta: {
      requireLogin: true,
      permissions: ['CLIENTLIST']
    }
  },
  {
    path: '/prospects/List',
    name: 'prospectList',
    component: prospectList,
    meta: {
      requireLogin: true,
      permissions: ['PROSPECTLIST']
    }
  },
  {
    path: '/prospects/ListCard',
    name: 'prospectListKanban',
    component: prospectListKanban,
    meta: {
      requireLogin: true,
      permissions: ['PROSPECTLIST']
    }
  },
  {
    path: '/deleted/prospects/List',
    name: 'deletedProspects',
    component: deletedProspects,
    meta: {
      requireLogin: true,
      permissions: ['PROSPECTLIST']
    }
  },
  {
    path: '/agents/approval',
    name: 'agentsApproval',
    component: agentApproval,
    meta: {
      requireLogin: true,
      permissions: ['APPROVAL']
    }
  },
  {
    path: '/department/List',
    name: 'departmentList',
    component: departmentList,
    meta: {
      requireLogin: true,
      permissions: ['DEPARTMENTLIST']
    }
  },
  {
    path: '/agentInterviews',
    name: 'agentsInterviews',
    component: agentsInterviews
  },
  {
    path: '/savedInterview',
    name: 'successInterview',
    component: successInterview
  },
  {
    path: '/test',
    name: 'test',
    component: test,
    meta: {
      requireLogin: true
    }
  },
  {
    path: '/interviewAgents',
    name: 'interviewAgents',
    component: scheduleInterviews
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: calendar,
    meta: {
      requireLogin: true,
      permissions: ['CALENDAR']
    }
  },
  {
    path: '/agentsAppoinments',
    name: 'agentsAppoinments',
    component: agentsAppoinments,
    meta: {
      requireLogin: true,
      permissions: ['CALENDARAGENTS']
    }
  },
  {
    path: '/messagesList',
    name: 'messagesList',
    component: scheduleMessages,
    meta: {
      requireLogin: true,
      permissions: ['MESSAGES']
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: profile,
    meta: {
      requireLogin: true,
      permissions: ['PROFILE']
    }
  },
  {
    path: '/uploadList',
    name: 'walkingList',
    component: uploadWalkingList,
    meta: {
      requireLogin: true,
      permissions: ['UPLOADLISTS']
    }
  },
  {
    path: '/phone',
    name: 'phone',
    component: phoneCall
  },
  {
    path: '/reset',
    name: 'reset',
    component: resetPassword
  },
  {
    path: '/changePassword',
    name: 'changePassword',
    component: changePassword
  },
  {
    path: '/client/eContacts',
    name: 'eContacts',
    component: eContacts,
    meta: {
      requireLogin: true,
      permissions: ['CLIENTLIST']
    }
  },

  {
    path: '/clients/map',
    name: 'clientMap',
    meta: {
      requireLogin: true,
      permissions: ['CLIENTLIST']
    },
    component: clientsMap
  },
  {
    path: '/termsAndConditions',
    name: 'termsAndConditions',
    meta: {
      requireLogin: true,
      permissions: ['CLIENTLIST']
    },
    component: termsAndConditions
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Use the HTML5 history API (i.e. normal-looking routes)
  // instead of routes with hashes (e.g. example.com/#/about).
  // This may require some server configuration in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  mode: 'history',
  // Simulate native-like scroll behavior when navigating to a new
  // route and using back/forward buttons.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, left: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {

  // check if user is loggedIn
  if (to.matched.some(record => record.meta.requireLogin) && !store.state.isAuthenticated) {
    next('/login')
  } else {

    if(localStorage.getItem('jwt')) {

      const currentRole = jwt_decode(localStorage.getItem('jwt'))
      currentRole.vueViews

      // check if the user have access for this spescific view
      if(to.meta.permissions) {

        // if user does not have permissions to go the specific view, show error
        let isAllowed = currentRole.vueViews.includes(to.meta.permissions[0])
        if (!isAllowed) {
          next('/errorPage')
        } else {
          next()
        }
      } else {
        next()
      }
     } else {
      next()
    }
  }
})


export default router




