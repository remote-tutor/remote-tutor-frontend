import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Announcements from '../views/announcements/Announcements.vue'
import PendingStudents from '../views/admin/PendingStudents.vue'
import CreateQuiz from '../views/admin/CreateQuiz.vue'
import CreateQuestion from '../views/admin/CreateQuestion.vue'

Vue.use(VueRouter)

const DEFAULT_TITLE = "Remote Tutor"
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: "Login"
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Create New User'
    }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: Announcements,
    meta: {
      title: 'Announcements'
    }
  },
  {
    path: '/students',
    name: 'Students',
    component: PendingStudents,
    meta: {
      title: 'Students'
    } 
  },
  {
    path: '/create-quiz',
    name: 'CreateQuiz',
    component: CreateQuiz,
    meta: {
      title: 'New Quiz'
    } 
  },
  {
    path: '/create-question/:quizID',
    name: 'CreateQuestion',
    component: CreateQuestion,
    meta: {
      title: 'New Question'
    } 
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.afterEach((to) => {
  Vue.nextTick(() => {
    document.title = to.meta.title || DEFAULT_TITLE;
  });
})

export default router
