// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 说明：如果部署环境不支持 SPA 重写（例如直接把 dist 目录丢到静态空间、
// 或者用 file:// 打开），可以把下面的 createWebHistory 换成 createWebHashHistory，
// 同时把 vite.config.js 的 base 改成 './'，这样任意路径都能正常访问。
const routes = [
  {
    path: '/',
    redirect: '/load',
  },
  {
    path: '/load',
    name: 'load',
    component: () => import('../view/load.vue'),
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../view/Home.vue'),
  },
  {
    path: '/men',
    name: 'men',
    component: () => import('../view/mentally.vue'),
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('../view/gametext.vue'),
  },
  /* ---------------- 反应速度挑战 ---------------- */
  { path: '/R_S', name: 'R_S', component: () => import('../view/game/Reaction_S.vue') },
  { path: '/R_H', name: 'R_H', component: () => import('../view/game/Reaction_H.vue') },
  /* ---------------- 记忆保持挑战 ---------------- */
  { path: '/M_S', name: 'M_S', component: () => import('../view/game/Memory_S.vue') },
  { path: '/M_H', name: 'M_H', component: () => import('../view/game/Memory_H.vue') },
  /* ---------------- 情绪识别挑战 ---------------- */
  { path: '/E_S', name: 'E_S', component: () => import('../view/game/Expre_S.vue') },
  { path: '/E_H', name: 'E_H', component: () => import('../view/game/Expre_H.vue') },
  /* ---------------- 记录与图表 ---------------- */
  { path: '/user', name: 'user', component: () => import('../view/user.vue') },
  { path: '/RSC', name: 'RSC', component: () => import('../charts/R.vue') },
  { path: '/MSC', name: 'MSC', component: () => import('../charts/M.vue') },
  { path: '/EEC', name: 'EEC', component: () => import('../charts/E.vue') },
  /* ---------------- 成绩分布（汇总） ---------------- */
  { path: '/RC', name: 'RC', component: () => import('../components/Reaction/charts.vue') },
  { path: '/MC', name: 'MC', component: () => import('../components/memory/charts.vue') },
  { path: '/EC', name: 'EC', component: () => import('../components/expre/charts.vue') },
  /* ---------------- 科学原理科普 ---------------- */
  { path: '/RM', name: 'RM', component: () => import('../components/Reaction/more.vue') },
  { path: '/MM', name: 'MM', component: () => import('../components/memory/more.vue') },
  { path: '/EM', name: 'EM', component: () => import('../components/expre/more.vue') },
  /* ---------------- 兜底：未知路径回到封面，避免白屏 ---------------- */
  { path: '/:pathMatch(.*)*', redirect: '/load' },
]

// 路由基址取 Vite 的 BASE_URL（vite.config.js 中的 base），
// 部署到 GitHub Pages 项目地址 /mentally/ 时，路由才会落在同一路径下，
// 否则访问 https://<user>.github.io/mentally/ 会被改写到站点根目录 /load。
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 弱网环境下路由级资源可能加载失败（例如校内 Wi-Fi 抖动）。
// 这里做一次「整页刷新」兜底：把失败的路由重新拉一次，
// 并用 sessionStorage 打标记，避免无限刷新。
router.onError((error, to) => {
  const message = String(error?.message || '')
  const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(message)
  if (!isChunkError) return
  const flag = 'wmhd:retry:' + (to?.fullPath || '/')
  if (sessionStorage.getItem(flag)) {
    sessionStorage.removeItem(flag)
    return
  }
  sessionStorage.setItem(flag, '1')
  window.location.assign(to?.fullPath || '/')
})

export default router
