// src\router\index.js
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/load'
  },
  {
    path: '/load',
    name: 'load',
    component: () => import('../view/load.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../view/Home.vue')
  },
  {
    path: '/men',
    name: 'men',
    component: () => import('../view/mentally.vue')
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('../view/gametext.vue')
  },
  {
    path: '/R_S',
    name: 'R_S',
    component: () => import('../view/game/Reaction_S.vue')
  },
  {
    path: '/R_H',
    name: 'R_H',
    component: () => import('../view/game/Reaction_H.vue')
  },
  {
    path: '/M_S',
    name: 'M_S',
    component: () => import('../view/game/Memory_S.vue')
  },
  {
    path: '/M_H',
    name: 'M_H',
    component: () => import('../view/game/Memory_H.vue')
  },
  {
    path: '/E_S',
    name: 'E_S',
    component: () => import('../view/game/Expre_S.vue')
  },
  {
    path: '/E_H',
    name: 'E_H',
    component: () => import('../view/game/Expre_H.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('../view/user.vue')
  },
  {
    path: '/RSC',
    name: 'RSC',
    component: () => import('../charts/R.vue')
  },
  {
    path: '/MSC',
    name: 'MSC',
    component: () => import('../charts/M.vue')
  },
  {
    path: '/EEC',
    name: 'EEC',
    component: () => import('../charts/E.vue')
  },
  {
    path: '/RC',
    name: 'RC',
    component: () => import('../components/Reaction/charts.vue')
  },
  {
    path: '/RM',
    name: 'RM',
    component: () => import('../components/Reaction/more.vue')
  },
  {
    path: '/MC',
    name: 'MC',
    component: () => import('../components/memory/charts.vue')
  },
  {
    path: '/MM',
    name: 'MM',
    component: () => import('../components/memory/more.vue')
  },
  {
    path: '/EC',
    name: 'EC',
    component: () => import('../components/expre/charts.vue')
  },
  {
    path: '/EM',
    name: 'EM',
    component: () => import('../components/expre/more.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router