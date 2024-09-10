import { createRouter, createWebHistory } from 'vue-router'
import { useTokenStore } from '@/stores/mytoken'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'index', component: () => import('@/views/IndexView.vue') },
        { path: 'about', name: 'about', component: () => import('@/views/IndexView.vue') },
        { path: '/exercises', name: 'exercises', component: () => import('@/views/IndexView.vue') },
        { path: '/upload', name: 'upload', component: () => import('@/views/uploadCSV.vue') },
        // { path: 'table', name: 'table', component: () => import('@/views/menus/TablePage.vue') },
        {
          path: '/:xxx(.*)*',
          name: 'ErrorPage',
          component: () => import('@/components/layout/ErrorPage.vue')
        }
      ]
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginView.vue')
    },
    {
      path: '/review',
      name: 'review',
      component: () => import('@/views/questionList/QuestionDetail.vue')
    }
    // {
    //   path: '/menus',
    //   name: 'table',
    //   component: () => import('@/views/TablePage.vue')
    // },
  ]
})

router.beforeEach((to, from, next) => {
  // console.log('excute router Guard')
  if (to.matched.some((r) => r.meta?.requiresAuth)) {
    const store = useTokenStore()
    if (!store.token?.access) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }
  next()
})

export default router
