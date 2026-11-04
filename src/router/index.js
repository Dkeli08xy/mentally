// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

// 路由模式：hash（地址形如 /#/men）
// 纯前端项目部署到任意静态空间、任意子目录，甚至直接用 file:// 打开都能访问，
// 且深层路由刷新不需要服务器做 SPA 回退（不依赖 404.html）。
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

const router = createRouter({
  // hash 模式下不需要区分部署路径，GitHub Pages 项目站点 /mentally/ 也能直接用
  history: createWebHashHistory(),
  routes,
  // 默认回到页面顶部；带 focus 参数时交给目标页面自己平滑下滑到指定卡片，
  // 避免「路由回顶」与「页面下滑」互相打架。
  scrollBehavior: (to) => (to.query.focus ? false : { top: 0 }),
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
  // hash 模式下地址里的 # 才是路由，直接 reload 才能重试同一路由
  window.location.reload()
})

export default router
