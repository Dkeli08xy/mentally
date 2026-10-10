// src/config/event.js
// ============================================================================
// 10·10 世界精神卫生日 · 心理建模趣味活动 —— 全站活动配置
// ----------------------------------------------------------------------------
// 【二次开发说明】
// 本文件是活动信息（名称 / 年份 / 年度主题 / 口号 / 主办方 / 求助渠道 /
// 视觉主色 / 本地存储前缀）的唯一数据源。
// 学校正式活动方案或官方年度主题确定后，只需修改这里，全站文案同步生效。
// ============================================================================

export const EVENT = {
  /* ---------------- 基础信息 ---------------- */
  key: 'wmhd2026',
  year: 2026,
  /** 第几个世界精神卫生日（1992 年发起，1992 年为第 1 个） */
  ordinal: '第35个',
  name: '世界精神卫生日',
  nameEn: 'World Mental Health Day',
  badge: '10·10',
  dateLabel: '10月10日',
  dateText: '2026年10月10日',

  /* ---------------- 年度主题 ---------------- */
  /** 2026 年世界精神卫生日主题（国家心理健康和精神卫生防治中心发布） */
  themeText: '悦纳情绪，心有阳光',
  themeFrom: '国家心理健康和精神卫生防治中心发布',
  themeNote:
    '「悦纳情绪，心有阳光」由国家心理健康和精神卫生防治中心确定为 2026 年世界精神卫生日主题；校园活动的具体安排以学校正式通知为准。',

  /* ---------------- 宣传语 ---------------- */
  slogan: '关爱心灵，从了解开始',
  subSlogan: '心理活动可以被观察、被测量、被理解',
  pageTitle: '世界精神卫生日 · 心灵绿洲',
  loadingTip: '点击任意位置进入活动',

  /* ---------------- 主办与声明 ---------------- */
  organizer: '心理健康中心',
  statement: [
    '本活动为世界精神卫生日校园科普活动，仅用于心理知识趣味体验，不构成任何心理诊断、健康评估或临床结论。',
    '所有数据仅保存在本机浏览器（localStorage）中，采用匿名方式记录，不上传服务器、不采集姓名、学号等个人信息。',
    '本工具为游戏化科普内容，旨在展示心理活动可量化的特征，不替代专业心理咨询与治疗。',
  ],

  /* ---------------- 求助渠道 ---------------- */
  hotline: {
    number: '12356',
    label: '全国统一心理援助热线',
    note: '国家卫生健康委统一部署，24 小时提供免费心理支持。',
  },
  emergencyNote: '如遇紧急危险，请立即拨打 110 / 120，或前往就近医院急诊科。',

  /* ---------------- 校内心理健康中心（免费咨询） ----------------
     预约二维码：把图片放进 public/ 目录后，把路径填到 qrImage 即可，
     例如 public/qr/appointment.png → qrImage: '/qr/appointment.png'。
     留空时页面显示占位框与填写提示，不影响其他内容。            */
  counseling: {
    name: '心理健康中心',
    subtitle: '面向全体在校学生 · 免费 · 保密',
    hoursText: '每周一至周五 08:00–12:00、14:00–17:00',
    hours: [
      { label: '上午', time: '08:00 – 12:00' },
      { label: '下午', time: '14:00 – 17:00' },
      { label: '时段', time: '周一至周五' },
    ],
    location: '', // 待填写：咨询中心地址
    phone: '', // 待填写：预约电话
    qrImage: '', // 待填写：预约二维码图片路径（如 '/qr/appointment.png'）
    qrTip: '扫码进入预约通道',
    qrPlaceholder: '预约二维码位置',
    qrHint: '把二维码图片放入 public/ 目录，并在 src/config/event.js 的 counseling.qrImage 中填写路径。',
    qrFileName: '心理健康中心预约二维码.png',
    note:
      '走进心理健康中心，不代表「有问题」，而是像去操场跑步一样，是对自己状态的一次照顾。' +
      '学业压力、人际相处、情绪起伏、对未来迷茫，甚至只是想更了解自己，都可以来聊。' +
      '咨询遵循保密原则（依法需要突破保密的特殊情形除外），全程免费，无需担心费用。',
  },

  /* ---------------- 同期校园活动（日期暂定，以学校通知为准） ---------------- */
  activities: [
    {
      name: '世界精神卫生日心理挑战',
      date: '10 月 10 日',
      tag: '线上开放',
      note: '本网站的三个心理小挑战（反应速度 / 记忆保持 / 情绪识别），可随时参与并查看自己的成绩。',
    },
    {
      name: '京东校园解压运动会',
      date: '10 月 10 日（暂定）',
      tag: '线下现场',
      note: '由京东校园支持的减压运动会，具体时间、地点与参与方式以学校正式通知为准。',
    },
  ],

  /* ---------------- 视觉主色（与 src/style.css 中的 CSS 变量保持一致） ---------------- */
  colors: {
    primary: '#1F8A70',
    primaryDark: '#146A55',
    primaryLight: '#2FA37C',
    accent: '#F2A65A',
    ink: '#1F2A2E',
    muted: '#6B7C82',
  },

  /* ---------------- 本地存储前缀（换活动时修改可让数据完全隔离） ---------------- */
  storagePrefix: 'wmhd2026',
}

/**
 * 三个心理挑战的统一元信息。
 * 页面标题、按钮文案、路线、主题色都从这里取，避免多处硬编码。
 */
export const GAMES = [
  {
    key: 'reaction',
    name: '反应速度挑战',
    shortName: '反应时',
    icon: '⚡',
    accent: '#1F8A70',
    tagline: '毫秒之间，看见注意力的分配',
    desc: '源自实验心理学的经典范式：从刺激出现到按键反应的精确时间间隔，是感知、注意与决策速度的量化窗口。',
    easy: { label: '基础模式', route: '/R_S', note: '绿点反应 · 5 轮' },
    hard: { label: '进阶模式', route: '/R_H', note: '5×5 舒尔特方格 · 3 轮' },
    science: { label: '科学原理', route: '/RM' },
    stats: { label: '成绩分布', route: '/RC' },
    detailRoute: '/RSC',
    detailLabel: '反应时挑战',
  },
  {
    key: 'memory',
    name: '记忆保持挑战',
    shortName: '记忆衰减',
    icon: '🌱',
    accent: '#3E7CB1',
    tagline: '遗忘有规律，复习有方法',
    desc: '还原「识记 — 延时 — 再认」经典实验流程，可自选快速 / 标准 / 深度三档时间，用指数衰减模型拟合属于你自己的记忆保持曲线。',
    easy: { label: '基础模式', route: '/M_S', note: '6 组词对 · 10 秒识记 · 可选时间档' },
    hard: { label: '进阶模式', route: '/M_H', note: '8 组词对 · 15 秒识记 · 可选时间档' },
    science: { label: '科学原理', route: '/MM' },
    stats: { label: '成绩分布', route: '/MC' },
    detailRoute: '/MSC',
    detailLabel: '记忆衰减曲线',
  },
  {
    key: 'expression',
    name: '情绪识别挑战',
    shortName: '微表情',
    icon: '🙂',
    accent: '#F2A65A',
    tagline: '读懂表情，也读懂彼此',
    desc: '在图片、动图与短视频中辨认基本情绪，理解情绪识别的规律与边界，练习共情式的沟通。',
    easy: { label: '基础模式', route: '/E_S', note: '5 类情绪 · 36 题' },
    hard: { label: '进阶模式', route: '/E_H', note: '6 类情绪 · 48 题' },
    science: { label: '科学原理', route: '/EM' },
    stats: { label: '成绩分布', route: '/EC' },
    detailRoute: '/EEC',
    detailLabel: '情绪识别详情',
  },
]

/** 本地存储记录类型 → 中文名（历史记录页、图表页共用） */
export const RECORD_TYPES = [
  { type: 'reactionEasy', label: '反应速度 · 基础', game: 'reaction', mode: '简单' },
  { type: 'reactionHard', label: '反应速度 · 进阶', game: 'reaction', mode: '进阶' },
  { type: 'memoryEasy', label: '记忆保持 · 基础', game: 'memory', mode: '简单' },
  { type: 'memoryHard', label: '记忆保持 · 进阶', game: 'memory', mode: '进阶' },
  { type: 'microEasy', label: '情绪识别 · 基础', game: 'expression', mode: '简单' },
  { type: 'microHard', label: '情绪识别 · 进阶', game: 'expression', mode: '进阶' },
]

export default EVENT
