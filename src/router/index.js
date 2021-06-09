import Vue from 'vue'
import VueRouter from 'vue-router'
import Announcements from '../views/announcements/Announcements.vue'
import PendingStudents from '../views/students/admins/Students.vue'
import Quizzes from '../views/quizzes/shared/Quizzes.vue'
import AdminQuiz from '../views/quizzes/admins/Quiz.vue'
import StudentQuiz from '../views/quizzes/users/Quiz.vue'
import Grades from "@/views/grades/shared/Grades";
import ResetPassword from "@/views/users/ResetPassword";
import Assignments from "@/views/assignments/shared/Assignments";
import Assignment from "@/views/assignments/shared/Assignment";
import Video from "@/views/videos/shared/Video";
import Videos from "@/views/videos/shared/Videos";
import EnrolledClasses from "@/views/classes/shared/EnrolledClasses";
import AllClasses from "@/views/classes/shared/AllClasses";
import Access from "@/views/payments/admins/Access";

Vue.use(VueRouter)

const DEFAULT_TITLE = "Remote Tutor"
const routes = [
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/announcements',
    alias: '/',
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
    path: '/access',
    name: 'Access',
    component: Access,
    meta: {
      title: 'Students Access'
    }
  },
  {
    path: '/quizzes',
    name: 'Quizzes',
    component: Quizzes,
    meta: {
      title: 'Quizzes'
    }
  },
  {
    path: '/quizzes/questions/:quizHash',
    name: 'QuizQuestions',
    component: AdminQuiz,
    meta: {
      title: 'New Question'
    } 
  },
  {
    path: '/quizzes/:action/:quizHash',
    name: 'SolveQuiz',
    component: StudentQuiz,
    meta: {
      title: 'Quiz'
    }
  },
  {
    path: '/grades',
    name: 'Grades',
    component: Grades,
    meta: {
      title: 'Grades'
    }
  },
  {
    path: '/assignments',
    name: 'Assignments',
    component: Assignments,
    meta: {
      title: 'Assignments'
    }
  },
  {
    path: '/assignment/:assignmentHash',
    name: 'Assignment',
    component: Assignment,
    meta: {
      title: 'Assignment'
    },
  },
  {
    path: '/videos',
    name: 'Videos',
    component: Videos,
    meta: {
      title: 'Videos'
    }
  },
  {
    path: '/video/:videoHash',
    name: 'ViewVideo',
    component: Video,
    meta: {
      title: 'Video'
    }
  },
  {
    path: '/password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      title: 'Reset Password'
    }
  },
  {
    path: '/classes',
    name: 'Classes',
    component: EnrolledClasses,
    meta: {
      title: 'Enrolled Classes'
    }
  },
  {
    path: '/classes/all',
    name: 'AllClasses',
    component: AllClasses,
    meta: {
      title: 'Available Classes'
    }
  },
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
