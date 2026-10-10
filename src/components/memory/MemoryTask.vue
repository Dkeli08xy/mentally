<template>
  <!-- src/components/memory/MemoryTask.vue
       记忆保持任务内核：识记 → 延时 → 再认（匹配）
       基础模式与进阶模式共用本组件，仅参数不同（见 simple.vue / hard.vue） -->
  <div class="memory">
    <div class="mh-card">
      <div class="bar">
        <span class="bar__mode">{{ modeLabel }}</span>
        <span class="bar__preset">{{ preset.label }} · {{ delayText }}</span>
        <span class="bar__phase">{{ phaseText }}</span>
        <span v-if="countdown > 0" class="bar__count">{{ countdown }} s</span>
      </div>

      <!-- 识记 -->
      <div v-if="phase === 'memorize'" class="panel">
        <p class="panel__title">请记住这 {{ pairs.length }} 组词对</p>
        <div class="pairs">
          <div v-for="(p, i) in pairs" :key="i" class="pair">
            <span class="pair__key">{{ p.key }}</span>
            <span class="pair__arrow">→</span>
            <span class="pair__value">{{ p.value }}</span>
          </div>
        </div>
        <div class="mh-progress">
          <div class="mh-progress__fill" :style="{ width: memorizeProgress + '%' }"></div>
        </div>
        <p class="panel__tip">小技巧：给每组词对编一个画面或一句短句，加工越深，记得越久。</p>
      </div>

      <!-- 延时等待 -->
      <div v-if="phase === 'delay'" class="panel panel--center">
        <div class="ring" :style="{ '--progress': delayProgress + '%' }">
          <span class="ring__num">{{ countdown }}</span>
          <span class="ring__unit">秒</span>
        </div>
        <p class="panel__title">{{ delayTitle }}</p>
        <p class="breath" v-if="countdown > 3">{{ breathText }}</p>
        <p class="panel__tip">静置等待也是实验的一部分，请不要默念复习，让记忆自然衰减。</p>
      </div>

      <!-- 再认匹配 -->
      <div v-if="phase === 'match'" class="panel">
        <p class="panel__title">第 {{ currentStage + 1 }} 次再认：把词对连起来</p>
        <p class="panel__tip">先点左边的词，再点右边对应的解释；已使用的选项会自动置灰。</p>

        <div class="match">
          <div class="match__col">
            <button
              v-for="(p, i) in pairs"
              :key="p.key"
              class="key-btn"
              :class="{ 'key-btn--active': selectedKey === i, 'key-btn--done': p.userAnswer }"
              @click="selectKey(i)"
            >
              <span class="key-btn__text">{{ p.key }}</span>
              <span class="key-btn__answer">{{ p.userAnswer || '未选择' }}</span>
            </button>
          </div>

          <div class="match__col">
            <button
              v-for="opt in valueOptions"
              :key="opt"
              class="opt-btn"
              :class="{ 'opt-btn--used': usedValues.includes(opt) }"
              :disabled="usedValues.includes(opt)"
              @click="assignValue(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="match__footer">
          <span class="match__count">已配对 {{ answeredCount }} / {{ pairs.length }}</span>
          <div class="match__actions">
            <button class="mh-btn mh-btn--ghost mh-btn--sm" @click="clearAnswers">清空重选</button>
            <button class="mh-btn mh-btn--primary" :disabled="answeredCount < pairs.length" @click="submitMatch">
              提交答案
            </button>
          </div>
        </div>
      </div>

      <!-- 开始 / 结束 -->
      <div v-if="phase === 'waiting'" class="panel panel--center">
        <p class="panel__title">{{ modeLabel }} · 记忆保持挑战</p>

        <div class="timing">
          <p class="timing__label">选择整体时间（延时节点）</p>
          <div class="timing__options">
            <label
              v-for="p in presets"
              :key="p.key"
              class="timing__option"
              :class="{ 'timing__option--active': presetKey === p.key }"
            >
              <input v-model="presetKey" type="radio" name="memory-timing" :value="p.key" />
              <span class="timing__name">{{ p.label }}</span>
              <span class="timing__desc">{{ p.desc }}</span>
              <span class="timing__scene">{{ p.scene }}</span>
            </label>
          </div>
          <p class="timing__summary">
            本次流程：{{ memorizeSeconds }} 秒识记 {{ pairCount }} 组词对 →
            在 {{ delayText }} 后进行再认，全程 {{ estimate }}。
          </p>
        </div>

        <p class="panel__tip">请尽量在安静的环境完成；延时期间静置等待即可，不要默念复习。</p>
        <button class="mh-btn mh-btn--primary" @click="startGame">开始记忆</button>
      </div>

      <div v-if="phase === 'finished'" class="panel panel--center">
        <p class="panel__title">测试完成</p>
        <p class="panel__tip">
          {{ preset.label }}（{{ delayText }}）各次再认的正确率依次为：
          {{ results.map((r) => r.rate + '%').join(' / ') }}
        </p>
        <button class="mh-btn mh-btn--primary" @click="resetGame">再测一次</button>
      </div>

      <div class="actions">
        <router-link to="/game" class="mh-btn mh-btn--ghost">返回游戏主页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { GAME_EVENTS, emitGameResult } from '../../utils/events'
import { fitForgettingCurve } from '../../utils/analysis'
import memorySimple from '../../assets/json/memory_simple.json'
import memoryHard from '../../assets/json/memory_hard.json'
import {
  DEFAULT_PRESET_KEY,
  MEMORY_TIMING_PRESETS,
  estimateText,
  formatDelay,
  getPreset,
} from '../../config/memory'

const props = defineProps({
  pairCount: { type: Number, default: 6 },
  memorizeSeconds: { type: Number, default: 10 },
  /** easy | hard，仅用于文案与事件选择 */
  mode: { type: String, default: 'easy' },
})

/** 整体时间档（延时节点）由单选框决定，成绩页与图表页会按档位分开统计 */
const presetKey = ref(DEFAULT_PRESET_KEY)
const presets = MEMORY_TIMING_PRESETS
const preset = computed(() => getPreset(presetKey.value))
const delays = computed(() => preset.value.delays)

const phase = ref('waiting') // waiting | memorize | delay | match | finished
const phaseText = ref('准备开始')
const countdown = ref(0)
const pairs = ref([])
const valueOptions = ref([])
const selectedKey = ref(null)
const results = ref([])
const currentStage = ref(0)

let timer = null
let stageTimer = null
let countStart = 0

const modeLabel = computed(() => (props.mode === 'hard' ? '进阶模式' : '基础模式'))
const source = computed(() => (props.mode === 'hard' ? memoryHard : memorySimple))

const answeredCount = computed(() => pairs.value.filter((p) => p.userAnswer).length)
const usedValues = computed(() => pairs.value.map((p) => p.userAnswer).filter(Boolean))
const estimate = computed(() => estimateText(delays.value, props.memorizeSeconds))
const delayText = computed(() => delays.value.map(formatDelay).join(' / '))

const memorizeProgress = computed(() =>
  Math.max(0, Math.min(100, ((props.memorizeSeconds - countdown.value) / props.memorizeSeconds) * 100))
)

const currentDelay = computed(() => delays.value[currentStage.value] || 0)
const delayProgress = computed(() =>
  currentDelay.value ? Math.max(0, Math.min(100, ((currentDelay.value - countdown.value) / currentDelay.value) * 100)) : 100
)

const delayTitle = computed(() => {
  if (currentStage.value === 0) return '立即开始第一次再认'
  return '休息一下，' + formatDelay(currentDelay.value) + '后开始再认'
})

/** 延时阶段给一个简单的呼吸引导，避免被试因无聊而默念复习 */
const breathText = computed(() => {
  const elapsed = currentDelay.value - countdown.value
  return Math.floor(elapsed / 4) % 2 === 0 ? '慢慢吸气…' : '缓缓呼气…'
})

/* ---------------- 出题 ---------------- */
function sample(arr, n) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
}

function loadPairs() {
  const pool = source.value
  let list = []

  if (Array.isArray(pool.pairs) && pool.pairs.length) {
    // 语义关联的词对（推荐）：整组抽取，保证每个词都有明确的搭配
    list = sample(pool.pairs, props.pairCount).map(([key, value]) => ({ key, value }))
  } else {
    // 兼容只有 keys / values 两个数组的旧数据
    const keys = sample(pool.keys, props.pairCount)
    const values = sample(pool.values, props.pairCount)
    list = keys.map((k, i) => ({ key: k, value: values[i] }))
  }

  pairs.value = list.map((item) => ({ ...item, userAnswer: '' }))
  valueOptions.value = sample(pairs.value.map((p) => p.value), pairs.value.length)
  selectedKey.value = null
}

/* ---------------- 流程 ---------------- */
function startCountdown(seconds, onDone) {
  countdown.value = seconds
  countStart = Date.now()
  clearInterval(timer)
  timer = setInterval(() => {
    const used = Math.floor((Date.now() - countStart) / 1000)
    countdown.value = Math.max(0, seconds - used)
    if (countdown.value <= 0) {
      clearInterval(timer)
      onDone()
    }
  }, 100)
}

function startGame() {
  resetState()
  loadPairs()
  phase.value = 'memorize'
  phaseText.value = '识记阶段'
  startCountdown(props.memorizeSeconds, nextStage)
}

function nextStage() {
  if (currentStage.value >= delays.value.length) {
    finishGame()
    return
  }
  const delay = delays.value[currentStage.value]
  phase.value = 'delay'
  phaseText.value = '延时等待阶段'
  if (delay === 0) {
    phaseText.value = '初始再认'
    clearTimeout(stageTimer)
    stageTimer = setTimeout(doMatch, 600)
  } else {
    startCountdown(delay, doMatch)
  }
}

function doMatch() {
  phase.value = 'match'
  phaseText.value = '再认阶段 · 第 ' + (currentStage.value + 1) + ' 次'
  countdown.value = 0
  pairs.value.forEach((p) => {
    p.userAnswer = ''
  })
  selectedKey.value = null
}

function selectKey(index) {
  selectedKey.value = selectedKey.value === index ? null : index
}

function assignValue(value) {
  if (selectedKey.value === null) return
  pairs.value[selectedKey.value].userAnswer = value
  // 自动跳到下一个未配对的词，减少点击次数
  const next = pairs.value.findIndex((p, i) => i > selectedKey.value && !p.userAnswer)
  selectedKey.value = next === -1 ? null : next
}

function clearAnswers() {
  pairs.value.forEach((p) => {
    p.userAnswer = ''
  })
  selectedKey.value = null
}

function submitMatch() {
  if (answeredCount.value < pairs.value.length) return
  const correct = pairs.value.filter((p) => p.userAnswer === p.value).length
  const total = pairs.value.length
  results.value.push({
    stage: currentStage.value + 1,
    delay: delays.value[currentStage.value],
    correct,
    total,
    rate: Math.round((correct / total) * 100),
  })
  currentStage.value += 1
  nextStage()
}

function finishGame() {
  clearInterval(timer)
  clearTimeout(stageTimer)
  phase.value = 'finished'
  phaseText.value = '测试完成'

  const rates = delays.value.map((_, i) => results.value[i]?.rate ?? 0)
  const fit = fitForgettingCurve(rates, delays.value)

  emitGameResult(props.mode === 'hard' ? GAME_EVENTS.MEMORY_HARD : GAME_EVENTS.MEMORY_EASY, {
    mode: props.mode,
    pairCount: props.pairCount,
    memorizeSeconds: props.memorizeSeconds,
    delays: delays.value,
    presetKey: presetKey.value,
    presetLabel: preset.value.label,
    rates,
    rate0: rates[0],
    rate20: rates[1],
    rate60: rates[2],
    rate120: rates[3],
    kValue: fit.k,
    r2: fit.r2,
    halflife: fit.halflife,
    predicted: fit.predicted,
    level: fit.grades.text,
    advice: fit.grades.advice,
    meaningful: fit.meaningful,
    note: fit.note,
    points: results.value,
  })
}

function resetState() {
  clearInterval(timer)
  clearTimeout(stageTimer)
  phase.value = 'waiting'
  phaseText.value = '准备开始'
  countdown.value = 0
  pairs.value = []
  valueOptions.value = []
  selectedKey.value = null
  results.value = []
  currentStage.value = 0
}

function resetGame() {
  resetState()
}

onUnmounted(() => {
  clearInterval(timer)
  clearTimeout(stageTimer)
})

defineExpose({ resetGame, getResults: () => results.value })
</script>

<style scoped>
.memory {
  max-width: 780px;
  margin: 0 auto;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--mh-ink-2);
}

.bar__mode {
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.bar__preset {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--mh-primary-soft);
  color: var(--mh-primary-dark);
  font-size: 12px;
  font-weight: 600;
}

.timing {
  margin: 4px auto 14px;
  max-width: 620px;
  text-align: left;
}

.timing__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--mh-ink-2);
  margin-bottom: 8px;
}

.timing__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.timing__option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px 10px 34px;
  border-radius: var(--mh-radius-sm);
  border: 1px solid var(--mh-line);
  background: #fff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.timing__option:hover {
  border-color: var(--mh-primary-light);
  transform: translateY(-1px);
}

.timing__option--active {
  border-color: var(--mh-primary);
  background: var(--mh-primary-soft-2);
  box-shadow: 0 0 0 3px rgba(31, 138, 112, 0.12);
}

.timing__option input {
  position: absolute;
  left: 12px;
  top: 13px;
  accent-color: var(--mh-primary);
}

.timing__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.timing__desc {
  font-size: 12px;
  color: var(--mh-ink-2);
}

.timing__scene {
  font-size: 11px;
  color: var(--mh-muted);
}

.timing__summary {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--mh-muted);
}


.bar__count {
  font-variant-numeric: tabular-nums;
  color: var(--mh-accent);
  font-weight: 700;
}

.panel {
  padding: 18px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
}

.panel--center {
  text-align: center;
}

.panel__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--mh-primary-dark);
  margin-bottom: 12px;
  text-align: center;
}

.panel__tip {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--mh-muted);
  text-align: center;
}

.pairs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
}

.pair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: var(--mh-radius-sm);
  background: #fff;
  border: 1px solid var(--mh-line);
  font-size: 15px;
}

.pair__key {
  font-weight: 700;
  color: var(--mh-ink);
}

.pair__arrow {
  color: var(--mh-primary-light);
}

.pair__value {
  color: var(--mh-primary-dark);
}

.ring {
  width: 132px;
  height: 132px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: conic-gradient(var(--mh-primary) calc(var(--progress) * 1%), #e3ecea 0);
  position: relative;
}

.ring::after {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: #fff;
}

.ring__num,
.ring__unit {
  position: relative;
  z-index: 1;
}

.ring__num {
  font-size: 30px;
  font-weight: 800;
  color: var(--mh-primary-dark);
  line-height: 1;
}

.ring__unit {
  font-size: 12px;
  color: var(--mh-muted);
}

.breath {
  font-size: 15px;
  font-weight: 600;
  color: var(--mh-accent);
  animation: breathFade 4s ease-in-out infinite;
}

@keyframes breathFade {
  0%,
  100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}

.match {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.match__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 14px;
  border-radius: var(--mh-radius-sm);
  border: 1px solid var(--mh-line);
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  transition: all 0.15s ease;
}

.key-btn--active {
  border-color: var(--mh-primary);
  box-shadow: 0 0 0 3px rgba(31, 138, 112, 0.14);
}

.key-btn--done .key-btn__answer {
  color: var(--mh-primary);
  font-weight: 600;
}

.key-btn__answer {
  font-size: 12px;
  color: var(--mh-muted);
}

.opt-btn {
  padding: 11px 14px;
  border-radius: var(--mh-radius-sm);
  border: 1px solid var(--mh-line);
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
}

.opt-btn:not(:disabled):hover {
  border-color: var(--mh-primary-light);
  transform: translateY(-1px);
}

.opt-btn--used {
  background: #eef2f1;
  color: #b3bfbc;
  cursor: not-allowed;
}

.match__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.match__count {
  font-size: 13px;
  color: var(--mh-muted);
}

.match__actions {
  display: flex;
  gap: 10px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .match {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 14px;
  }
}
</style>
