// src/utils/events.js
// ============================================================================
// 各挑战完成时通过 window 事件回传结果。
// 事件名统一在这里定义，避免「派发的名字」和「监听的名字」写不一致
// —— 这是原 5·25 版本中进阶记忆挑战成绩无法显示的直接原因。
// ============================================================================

export const GAME_EVENTS = {
  REACTION_EASY: 'wmhd:reaction:easy:complete',
  REACTION_HARD: 'wmhd:reaction:hard:complete',
  MEMORY_EASY: 'wmhd:memory:easy:complete',
  MEMORY_HARD: 'wmhd:memory:hard:complete',
  EXPRESSION_EASY: 'wmhd:expression:easy:complete',
  EXPRESSION_HARD: 'wmhd:expression:hard:complete',
}

/** 派发一次成绩事件 */
export function emitGameResult(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

/** 订阅成绩事件，返回取消订阅函数（可直接在 onUnmounted 中调用） */
export function onGameResult(eventName, handler) {
  window.addEventListener(eventName, handler)
  return () => window.removeEventListener(eventName, handler)
}

export default GAME_EVENTS
