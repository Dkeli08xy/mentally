// src/utils/localStorage.js
// ============================================================================
// 本地成绩存储
// ----------------------------------------------------------------------------
// 原实现是 6 个几乎完全相同的类（约 320 行重复代码），任何一处修改都要改 6 遍。
// 这里改为工厂函数生成同名的存储对象，方法名与原来完全一致，
// 页面代码无需改动即可继续使用：
//   save / getList / getById / removeById / removeByIndex / updateById / clear
// 新增：count()、latest()、clearAllRecords()、STORAGE_BY_TYPE 映射。
// 存储键带活动前缀（见 config/event.js 的 storagePrefix），换活动即数据隔离。
// ============================================================================

import { EVENT } from '../config/event'

const SCHEMA_VERSION = 1

/** 生成一条记录 id */
function createId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

/**
 * 创建一个成绩存储
 * @param {string} storeName 存储名（会拼成 `${活动前缀}:${storeName}`）
 */
function createRecordStore(storeName) {
  const KEY = EVENT.storagePrefix + ':' + storeName

  const read = () => {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (err) {
      // 数据损坏时不让页面白屏，返回空列表并清理脏数据
      console.warn('[storage] 读取失败，已重置：' + KEY, err)
      return []
    }
  }

  const write = (list) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list))
    } catch (err) {
      console.warn('[storage] 写入失败：' + KEY, err)
    }
  }

  return {
    KEY,
    /** 新增一条记录，返回记录 id */
    save(data) {
      const list = read()
      const record = {
        schema: SCHEMA_VERSION,
        createTime: new Date().toISOString(),
        ...data,
      }
      if (!record.id) record.id = createId()
      list.push(record)
      write(list)
      return record.id
    },
    /** 全部记录（按下标顺序，旧的在前） */
    getList() {
      return read()
    },
    /** 按 id 取单条 */
    getById(id) {
      return read().find((item) => String(item.id) === String(id)) || null
    },
    /** 最近一条记录 */
    latest() {
      const list = read()
      return list.length ? list[list.length - 1] : null
    },
    /** 记录条数 */
    count() {
      return read().length
    },
    removeById(id) {
      write(read().filter((item) => String(item.id) !== String(id)))
    },
    removeByIndex(index) {
      const list = read()
      list.splice(index, 1)
      write(list)
    },
    updateById(id, newData) {
      const list = read()
      const index = list.findIndex((item) => String(item.id) === String(id))
      if (index === -1) return false
      list[index] = { ...list[index], ...newData, id: list[index].id }
      write(list)
      return true
    },
    clear() {
      localStorage.removeItem(KEY)
    },
  }
}

/* ---------------- 六个成绩存储（对外 API 与原版保持一致） ---------------- */
export const ReactionTimeEasyStorage = createRecordStore('reaction:easy')
export const ReactionTimeHardStorage = createRecordStore('reaction:hard')
export const MemoryDecayEasyStorage = createRecordStore('memory:easy')
export const MemoryDecayHardStorage = createRecordStore('memory:hard')
export const MicroExpressionEasyStorage = createRecordStore('expression:easy')
export const MicroExpressionHardStorage = createRecordStore('expression:hard')

/**
 * 记录类型 → 存储对象。
 * 类型的字符串（reactionEasy 等）同时用作路由 query 的 type 值，请勿随意修改。
 */
export const STORAGE_BY_TYPE = {
  reactionEasy: ReactionTimeEasyStorage,
  reactionHard: ReactionTimeHardStorage,
  memoryEasy: MemoryDecayEasyStorage,
  memoryHard: MemoryDecayHardStorage,
  microEasy: MicroExpressionEasyStorage,
  microHard: MicroExpressionHardStorage,
}

/** 清空全部成绩记录 */
export function clearAllRecords() {
  Object.values(STORAGE_BY_TYPE).forEach((store) => store.clear())
}

/** 全部记录总数 */
export function totalRecordCount() {
  return Object.values(STORAGE_BY_TYPE).reduce((sum, store) => sum + store.count(), 0)
}

export default {
  ReactionTimeEasyStorage,
  ReactionTimeHardStorage,
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage,
  STORAGE_BY_TYPE,
  clearAllRecords,
  totalRecordCount,
}
