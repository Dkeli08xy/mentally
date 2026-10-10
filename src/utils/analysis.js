// src/utils/analysis.js
// ============================================================================
// 成绩计算与解读的统一算法模块
// ----------------------------------------------------------------------------
// 三个挑战原本各自在组件里写统计与拟合，口径不一致（例如遗忘速率 k 只取
// 单点比值再平均、反应超时直接结束整局）。这里集中实现，保证：
//   1. 指标算法只有一份实现，页面只负责展示；
//   2. 每个指标都给出「等级 + 解读 + 建议」，面向科普而非诊断。
// ============================================================================

/** 保留两位小数 */
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100
/** 区间限幅 */
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

/** 平均值（空数组返回 0） */
export function mean(list) {
  if (!list || !list.length) return 0
  return list.reduce((a, b) => a + b, 0) / list.length
}

/** 样本标准差（n-1），用于衡量成绩波动 */
export function stdDev(list) {
  if (!list || list.length < 2) return 0
  const m = mean(list)
  const variance = list.reduce((acc, v) => acc + (v - m) ** 2, 0) / (list.length - 1)
  return Math.sqrt(variance)
}

/** 变异系数 CV = 标准差 / 平均值，反映稳定性（越小越稳定） */
export function coefficientOfVariation(list) {
  const m = mean(list)
  if (!m) return 0
  return stdDev(list) / m
}

/** 稳定性解读 */
export function stabilityLabel(cv) {
  if (!cv) return { text: '数据不足', color: '#6B7C82' }
  if (cv < 0.1) return { text: '非常稳定', color: '#1F8A70' }
  if (cv < 0.2) return { text: '比较稳定', color: '#2FA37C' }
  if (cv < 0.35) return { text: '略有波动', color: '#F2A65A' }
  return { text: '波动较大', color: '#D9694A' }
}

/* ------------------------------------------------------------------ *
 * 一、反应速度挑战
 * ------------------------------------------------------------------ */

/** 基础反应时评级（毫秒），区间为科普参考，非诊断标准 */
export function gradeReactionTime(ms) {
  if (!ms) return { level: '--', text: '暂无有效数据', color: '#6B7C82', percentile: '--' }
  if (ms < 200) return { level: 'S', text: '极快，优于多数同龄人', color: '#1F8A70', percentile: '约前 5%' }
  if (ms < 250) return { level: 'A', text: '较快，反应敏捷', color: '#2FA37C', percentile: '约前 30%' }
  if (ms < 300) return { level: 'B', text: '中等，主流区间', color: '#3E7CB1', percentile: '约前 70%' }
  if (ms < 350) return { level: 'C', text: '偏慢，可稍作状态调整', color: '#F2A65A', percentile: '约后 30%' }
  return { level: 'D', text: '本次偏慢，多与疲劳、分心有关', color: '#D9694A', percentile: '约后 5%' }
}

/** 舒尔特方格（25 格）完成时间评级（秒） */
export function gradeSchulte(sec) {
  if (!sec) return { level: '--', text: '暂无有效数据', color: '#6B7C82' }
  if (sec < 12) return { level: 'S', text: '优秀，搜索效率很高', color: '#1F8A70' }
  if (sec < 16) return { level: 'A', text: '良好，注意搜索有条理', color: '#2FA37C' }
  if (sec < 22) return { level: 'B', text: '中等，属于常见水平', color: '#3E7CB1' }
  if (sec < 28) return { level: 'C', text: '一般，可尝试分区搜索', color: '#F2A65A' }
  return { level: 'D', text: '本次较慢，注意是否疲劳或被打断', color: '#D9694A' }
}

/**
 * 汇总一组反应/完成时间
 * @param {number[]} times 有效成绩（毫秒或秒，单位由调用方约定）
 * @param {object} extra 额外计数（抢按、超时、点错等）
 */
export function summarizeTimes(times, extra = {}) {
  const list = (times || []).filter((t) => typeof t === 'number' && isFinite(t) && t > 0)
  const avg = mean(list)
  const sd = stdDev(list)
  const cv = coefficientOfVariation(list)
  return {
    count: list.length,
    min: list.length ? Math.min(...list) : 0,
    max: list.length ? Math.max(...list) : 0,
    avg: round2(avg),
    sd: round2(sd),
    cv: round2(cv),
    stability: stabilityLabel(cv),
    ...extra,
  }
}

/* ------------------------------------------------------------------ *
 * 二、记忆保持挑战
 *   模型：保留率 R(t) = R0 · e^(-t/k)
 *   拟合：对 t 做无截距最小二乘（ln(R/R0) = -t/k），比「单点求 k 再平均」
 *        更稳健，可抵抗某一轮偶然波动。
 * ------------------------------------------------------------------ */

export const FORGETTING_LEVELS = [
  { min: 150, text: '遗忘很慢', advice: '保持率随时间下降平缓，说明识记时加工较深。可尝试延长复习间隔（如隔天、隔周），把短期记住变成长期记住。', color: '#1F8A70' },
  { min: 90, text: '遗忘较慢', advice: '整体保持得不错。建议在 1 天、3 天、7 天各复习一次，用「间隔重复」把曲线持续拉平。', color: '#2FA37C' },
  { min: 50, text: '遗忘速度中等', advice: '符合多数人的一般规律。识记时不妨给词对加上画面或故事，加工越深，曲线下降越慢。', color: '#3E7CB1' },
  { min: 30, text: '遗忘偏快', advice: '曲线下降较快，多与「机械重复、缺少加工」有关。试试把 6 组词对分成 2 组、每组编一句话再复述。', color: '#F2A65A' },
  { min: 0, text: '遗忘很快', advice: '本次保持率下降明显。这通常不是记忆力的问题，而是材料未被有效加工；先分组、再串联、及时复习即可明显改善。', color: '#D9694A' },
]

export function gradeForgetting(k) {
  const hit = FORGETTING_LEVELS.find((l) => k >= l.min)
  return hit || FORGETTING_LEVELS[FORGETTING_LEVELS.length - 1]
}

/**
 * 拟合记忆衰减曲线
 * @param {number[]} rates   各延时节点的正确率（百分比），与 delays 一一对应
 * @param {number[]} delays  延时（秒），默认 [0, 20, 60, 120]
 * @returns {{k:number,r2:number,points:Array,r0:number,grades:object,halflife:number,
 *            predicted:Array,meaningful:boolean,note:string}}
 */
export function fitForgettingCurve(rates, delays = [0, 20, 60, 120]) {
  const rs = (rates || []).map((r) => (typeof r === 'number' && isFinite(r) ? clamp(r, 0, 100) : 0))
  const r0Raw = rs.length ? rs[0] : 100
  const r0 = r0Raw > 0 ? r0Raw : 100 // 初始正确率为 0 时无法建模，按满分基准回退

  // 构造散点：丢弃 t=0 点（模型中该点恒为 0 的对数残差）与完全为 0 的观测
  const points = []
  for (let i = 0; i < rs.length; i++) {
    const t = delays[i]
    if (!t || t <= 0) continue
    const r = rs[i]
    points.push({ t, rate: r, floored: r <= 0, y: Math.log(clamp(r, 1, 100) / r0) })
  }

  let k = 60
  let r2 = 0
  let meaningful = true
  let note = ''

  if (points.length >= 2) {
    const sxx = points.reduce((acc, p) => acc + p.t * p.t, 0)
    const sxy = points.reduce((acc, p) => acc + p.t * p.y, 0)
    const slope = sxx ? sxy / sxx : 0

    if (slope < -1e-6) {
      k = clamp(-1 / slope, 8, 600)
    } else {
      // 保留率未随延时下降（常见于样本量小、答案偶然全对）
      k = 600
      meaningful = false
      note = '本次各延时节点的正确率没有随延时下降，衰减趋势不明显，k 取上限值。'
    }

    // 拟合优度 R²（对数尺度）
    const yBar = mean(points.map((p) => p.y))
    const ssTot = points.reduce((acc, p) => acc + (p.y - yBar) ** 2, 0)
    const ssRes = points.reduce((acc, p) => acc + (p.y - slope * p.t) ** 2, 0)
    r2 = ssTot > 1e-9 ? clamp(1 - ssRes / ssTot, 0, 1) : ssRes < 1e-9 ? 1 : 0
    if (points.some((p) => p.floored)) {
      note = note || '部分延时节点正确率为 0，拟合时按 1% 下限处理，曲线仅供参考。'
    }
  } else {
    meaningful = false
    note = '有效延时节点不足，k 取默认参考值。'
  }

  const grades = gradeForgetting(k)
  const halflife = round2(k * Math.LN2)
  const predicted = [30, 60, 180].map((t) => ({
    t,
    rate: round2(r0 * Math.exp(-t / k)),
  }))

  return {
    k: round2(k),
    r2: round2(r2),
    points,
    r0,
    halflife,
    predicted,
    meaningful,
    note,
    grades,
  }
}

/** 生成理论曲线采样点（用于 ECharts 折线） */
export function curveSeries(k, r0 = 100, tMax = 120, step = 2) {
  const safeK = k > 0 ? k : 60
  const out = []
  for (let t = 0; t <= tMax; t += step) {
    out.push([t, round2(r0 * Math.exp(-t / safeK))])
  }
  return out
}

/* ------------------------------------------------------------------ *
 * 三、情绪识别挑战
 * ------------------------------------------------------------------ */

export function gradeAccuracy(acc) {
  if (!acc) return { text: '暂无数据', color: '#6B7C82' }
  if (acc >= 90) return { text: '识别准确，情绪线索捕捉敏锐', color: '#1F8A70' }
  if (acc >= 75) return { text: '整体良好，个别情绪容易混淆', color: '#2FA37C' }
  if (acc >= 60) return { text: '基本准确，可多留意易混淆情绪的细微差别', color: '#3E7CB1' }
  return { text: '本次正确率偏低，多与素材模糊或作答较快有关', color: '#F2A65A' }
}

/**
 * 汇总情绪识别作答
 * @param {Array} answers 每项 { item:{emotion}, userAnswer, isCorrect, duration }
 * @param {string[]} emotions 参与考察的情绪列表
 */
export function summarizeExpression(answers, emotions) {
  const list = answers || []
  const total = list.length
  const correct = list.filter((a) => a.isCorrect).length
  const accuracy = total ? Math.round((correct / total) * 100) : 0

  const durations = list.map((a) => a.duration).filter((d) => typeof d === 'number' && d > 0)
  const avgDuration = durations.length ? Math.round(mean(durations)) : 0

  const byEmotion = {}
  const countMap = {}
  ;(emotions || []).forEach((e) => {
    byEmotion[e] = 0
    countMap[e] = 0
  })
  list.forEach((a) => {
    const actual = a.item?.emotion
    if (!actual || byEmotion[actual] === undefined) return
    countMap[actual] += 1
    if (a.isCorrect) byEmotion[actual] += 1
  })
  const emotionAccuracy = {}
  Object.keys(byEmotion).forEach((e) => {
    emotionAccuracy[e] = countMap[e] ? Math.round((byEmotion[e] / countMap[e]) * 100) : 0
  })

  // 混淆对：把 A 误认成 B 的统计，用于给出「最容易看错」的提示
  const confusionMap = {}
  list.forEach((a) => {
    const actual = a.item?.emotion
    if (!actual || a.isCorrect || !a.userAnswer) return
    const key = actual + '→' + a.userAnswer
    confusionMap[key] = (confusionMap[key] || 0) + 1
  })
  const confusion = Object.entries(confusionMap)
    .map(([key, count]) => {
      const [actual, chosen] = key.split('→')
      return { actual, chosen, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const ranked = (emotions || [])
    .filter((e) => countMap[e] > 0)
    .map((e) => ({ emotion: e, accuracy: emotionAccuracy[e] }))
    .sort((a, b) => b.accuracy - a.accuracy)

  return {
    total,
    correct,
    accuracy,
    avgDuration,
    emotionAccuracy,
    confusion,
    strongest: ranked[0] || null,
    weakest: ranked.length > 1 ? ranked[ranked.length - 1] : null,
    grade: gradeAccuracy(accuracy),
  }
}

/** 统一的日期时间格式化 */
export function formatDateTime(isoString) {
  if (!isoString) return '--'
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return '--'
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default {
  round2,
  clamp,
  mean,
  stdDev,
  coefficientOfVariation,
  stabilityLabel,
  gradeReactionTime,
  gradeSchulte,
  summarizeTimes,
  fitForgettingCurve,
  curveSeries,
  gradeForgetting,
  gradeAccuracy,
  summarizeExpression,
  formatDateTime,
}
