// src/config/memory.js
// ============================================================================
// 记忆保持挑战：整体时间方案（延时节点）配置
// ----------------------------------------------------------------------------
// 原来四个延时节点 0/20/60/120 秒是写死的，一次测试固定要 3 分多钟。
// 现在改为「整体时间档位」单选框，参与者可以按现场时间选择快测或深度测试。
// 记录里会同时保存档位与具体延时，成绩页/图表页据此分开统计。
// ============================================================================

export const MEMORY_TIMING_PRESETS = [
  {
    key: 'quick',
    label: '快速版',
    delays: [0, 10, 30, 60],
    desc: '0 / 10 / 30 / 60 秒',
    scene: '适合现场排队、课间体验',
  },
  {
    key: 'standard',
    label: '标准版',
    delays: [0, 20, 60, 120],
    desc: '0 / 20 / 60 / 120 秒',
    scene: '与经典实验范式一致，推荐',
  },
  {
    key: 'deep',
    label: '深度版',
    delays: [0, 30, 90, 180],
    desc: '0 / 30 / 90 / 180 秒',
    scene: '延时更长，曲线更完整',
  },
]

export const DEFAULT_PRESET_KEY = 'standard'

export function getPreset(key) {
  return MEMORY_TIMING_PRESETS.find((p) => p.key === key) || MEMORY_TIMING_PRESETS[1]
}

/** 延时单位格式化：0 → 0 秒，60 → 1 分钟，90 → 1 分 30 秒 */
export function formatDelay(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0))
  if (s < 60) return s + ' 秒'
  const minutes = Math.floor(s / 60)
  const rest = s % 60
  return rest ? minutes + ' 分 ' + rest + ' 秒' : minutes + ' 分钟'
}

/** 档位签名：用于把不同时间档的成绩分开统计 */
export function delaysSignature(delays) {
  return (delays || []).join('-')
}

/** 「0 秒 / 20 秒 / 1 分钟 / 2 分钟」这样的可读串 */
export function delaySummary(delays) {
  return (delays || []).map(formatDelay).join(' / ')
}

/** 单次测试总时长（秒）= 识记 + 各延时之和 */
export function estimateSeconds(delays, memorizeSeconds) {
  return (delays || []).reduce((sum, d) => sum + d, 0) + (memorizeSeconds || 0)
}

/** 「约 3 分 20 秒」 */
export function estimateText(delays, memorizeSeconds) {
  const total = estimateSeconds(delays, memorizeSeconds)
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return '约 ' + (rest ? minutes + ' 分 ' + rest + ' 秒' : minutes + ' 分钟')
}

export const FALLBACK_DELAYS = [0, 20, 60, 120]

export default {
  MEMORY_TIMING_PRESETS,
  DEFAULT_PRESET_KEY,
  getPreset,
  formatDelay,
  delaysSignature,
  delaySummary,
  estimateSeconds,
  estimateText,
  FALLBACK_DELAYS,
}
