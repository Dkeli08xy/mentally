<template>
  <!-- src/components/Reaction/simple.vue · 基础反应时（绿点反应） -->
  <div class="reaction">
    <div class="mh-card">
      <div class="bar">
        <span class="bar__round">第 <strong>{{ currentRound }}</strong> / {{ totalRounds }} 轮</span>
        <div class="bar__dots">
          <span
            v-for="r in roundStates"
            :key="r.index"
            class="dot"
            :class="'dot--' + r.state"
            :title="r.title"
          ></span>
        </div>
        <span class="bar__avg">平均 {{ avgDisplay }}</span>
      </div>

      <div
        class="stage"
        :class="'stage--' + gamePhase"
        role="button"
        tabindex="0"
        :aria-label="hintText"
        @click="handleRespond"
        @keydown.space.prevent="handleRespond"
        @keydown.enter.prevent="handleRespond"
      >
        <div class="lamp" :class="'lamp--' + gamePhase"></div>
        <p class="stage__hint">{{ hintText }}</p>
        <p class="stage__sub">{{ subText }}</p>
      </div>

      <div class="actions">
        <button v-if="gamePhase === 'waiting'" class="mh-btn mh-btn--primary" @click="startRound">开始挑战</button>
        <button v-if="gamePhase === 'finished'" class="mh-btn mh-btn--primary" @click="resetGame">再测一次</button>
        <router-link to="/game" class="mh-btn mh-btn--ghost">返回游戏主页</router-link>
      </div>

      <p class="key-tip">键盘也可以用：<kbd>空格</kbd> 或 <kbd>回车</kbd> 作答</p>

      <div v-if="finishedSummary" class="result-brief mh-fade-up">
        <p class="result-brief__title">本轮完成：平均 {{ finishedSummary.avg }} ms · {{ finishedSummary.grade.text }}</p>
        <p class="mh-muted">完整图表与解读见页面下方。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { GAME_EVENTS, emitGameResult } from '../../utils/events'
import { gradeReactionTime, mean, stabilityLabel, stdDev, coefficientOfVariation, round2 } from '../../utils/analysis'

/* ---------------- 任务参数 ---------------- */
const totalRounds = 5
const WAIT_MIN = 1200 // 刺激出现的随机等待下限（毫秒）
const WAIT_MAX = 3200 // 上限
const RESPONSE_WINDOW = 1200 // 刺激出现后的作答窗口，超过记为本轮未反应
const MIN_VALID = 100 // 低于该值视为抢按（人类反应时下限）
const FEEDBACK_MS = 700 // 单轮反馈停留时间

/* ---------------- 状态 ---------------- */
const gamePhase = ref('waiting') // waiting | ready | stimulus | tooSoon | missed | feedback | finished
const currentRound = ref(0)
const results = ref([])
const anticipations = ref(0)

let stimulusTimer = null
let windowTimer = null
let feedbackTimer = null
let startTime = 0

const validTimes = computed(() =>
  results.value.filter((r) => r.isValid).map((r) => r.reactionTime)
)
const timeouts = computed(() => results.value.filter((r) => r.timeout).length)
const avgTime = computed(() => (validTimes.value.length ? round2(mean(validTimes.value)) : 0))
const avgDisplay = computed(() => (avgTime.value ? avgTime.value + ' ms' : '--'))

const finishedSummary = computed(() => {
  if (gamePhase.value !== 'finished' || !validTimes.value.length) return null
  return { avg: avgTime.value, grade: gradeReactionTime(avgTime.value) }
})

const roundStates = computed(() =>
  Array.from({ length: totalRounds }, (_, i) => {
    const round = i + 1
    const record = results.value.find((r) => r.round === round)
    if (!record) {
      return {
        index: round,
        state: round === currentRound.value && gamePhase.value !== 'waiting' ? 'current' : 'pending',
        title: '第 ' + round + ' 轮',
      }
    }
    return {
      index: round,
      state: record.timeout ? 'timeout' : record.isValid ? 'valid' : 'invalid',
      title: '第 ' + round + ' 轮：' + (record.timeout ? '未反应' : record.reactionTime + ' ms'),
    }
  })
)

const hintText = computed(() => {
  switch (gamePhase.value) {
    case 'waiting':
      return '准备好了吗？'
    case 'ready':
      return '等待绿点亮起…'
    case 'stimulus':
      return '亮灯了，点击！'
    case 'tooSoon':
      return '按得太早啦'
    case 'missed':
      return '这一轮没来得及反应'
    case 'feedback':
      return '已记录'
    default:
      return '挑战完成'
  }
})

const subText = computed(() => {
  switch (gamePhase.value) {
    case 'waiting':
      return '看到绿色亮起后立即点击或按空格，共 ' + totalRounds + ' 轮'
    case 'ready':
      return '不要抢按，抢按会重新开始这一轮'
    case 'stimulus':
      return '越快越好，专注当下这一下'
    case 'tooSoon':
      return '保持放松，等绿点真正亮起再按，本轮重新开始'
    case 'missed':
      return '超过 ' + RESPONSE_WINDOW + ' ms 未作答，本轮记为未反应'
    case 'feedback':
      return '下一轮马上开始'
    case 'finished':
      return '可以再来一次，看看成绩是否更稳定'
    default:
      return ''
  }
})

/* ---------------- 流程控制 ---------------- */
function clearTimers() {
  clearTimeout(stimulusTimer)
  clearTimeout(windowTimer)
  clearTimeout(feedbackTimer)
  stimulusTimer = windowTimer = feedbackTimer = null
}

function startRound() {
  clearTimers()
  if (gamePhase.value === 'waiting' || gamePhase.value === 'finished') {
    currentRound.value = 0
    results.value = []
    anticipations.value = 0
  }
  if (currentRound.value >= totalRounds) {
    finishGame()
    return
  }
  currentRound.value += 1
  gamePhase.value = 'ready'
  const delay = WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN)
  stimulusTimer = setTimeout(showStimulus, delay)
}

function showStimulus() {
  if (gamePhase.value !== 'ready') return
  gamePhase.value = 'stimulus'
  startTime = performance.now()
  windowTimer = setTimeout(() => {
    if (gamePhase.value !== 'stimulus') return
    pushResult({ reactionTime: null, isValid: false, timeout: true })
    gamePhase.value = 'missed'
    feedbackTimer = setTimeout(advance, 1100)
  }, RESPONSE_WINDOW)
}

function pushResult(payload) {
  results.value.push({
    round: currentRound.value,
    reactionTime: payload.reactionTime,
    isValid: payload.isValid,
    timeout: !!payload.timeout,
    anticipation: !!payload.anticipation,
    timestamp: new Date().toISOString(),
  })
}

function advance() {
  if (currentRound.value >= totalRounds) {
    finishGame()
  } else {
    startRound()
  }
}

function handleRespond() {
  switch (gamePhase.value) {
    case 'waiting':
      startRound()
      break
    case 'ready':
      // 抢按：本轮重新开始，并计入抢按次数
      clearTimers()
      anticipations.value += 1
      gamePhase.value = 'tooSoon'
      feedbackTimer = setTimeout(() => {
        currentRound.value -= 1
        startRound()
      }, 1200)
      break
    case 'stimulus': {
      clearTimeout(windowTimer)
      const reactionTime = Math.round(performance.now() - startTime)
      const isValid = reactionTime >= MIN_VALID
      pushResult({ reactionTime, isValid, timeout: false })
      gamePhase.value = 'feedback'
      feedbackTimer = setTimeout(advance, FEEDBACK_MS)
      break
    }
    default:
      break
  }
}

function finishGame() {
  clearTimers()
  gamePhase.value = 'finished'

  const times = validTimes.value
  const summary = {
    results: results.value,
    times,
    totalRounds,
    averageTime: times.length ? Math.round(mean(times)) : 0,
    minTime: times.length ? Math.min(...times) : 0,
    maxTime: times.length ? Math.max(...times) : 0,
    sd: round2(stdDev(times)),
    cv: round2(coefficientOfVariation(times)),
    stability: stabilityLabel(coefficientOfVariation(times)).text,
    timeouts: timeouts.value,
    anticipations: anticipations.value,
    grade: gradeReactionTime(times.length ? mean(times) : 0),
  }
  emitGameResult(GAME_EVENTS.REACTION_EASY, summary)
}

function resetGame() {
  clearTimers()
  gamePhase.value = 'waiting'
  currentRound.value = 0
  results.value = []
  anticipations.value = 0
}

onMounted(() => {
  // 空格键在页面任意位置都可以作答，减少鼠标移动带来的额外时间
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimers()
})

function onKeydown(e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    if (document.activeElement && document.activeElement.classList.contains('stage')) return // 已由元素自身处理
    e.preventDefault()
    handleRespond()
  }
}

defineExpose({ resetGame, getResults: () => results.value })
</script>

<style scoped>
.reaction {
  max-width: 780px;
  margin: 0 auto;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.bar__round {
  font-size: 15px;
  color: var(--mh-ink-2);
}

.bar__round strong {
  color: var(--mh-primary-dark);
  font-size: 18px;
}

.bar__avg {
  font-size: 14px;
  color: var(--mh-muted);
}

.bar__dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dfe9e6;
}

.dot--current {
  background: var(--mh-accent);
  box-shadow: 0 0 0 4px rgba(242, 166, 90, 0.2);
}

.dot--valid {
  background: var(--mh-primary);
}

.dot--timeout {
  background: var(--mh-danger);
}

.dot--invalid {
  background: #c9b28a;
}

.stage {
  position: relative;
  height: 300px;
  border-radius: var(--mh-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background 0.15s ease, transform 0.15s ease;
  border: 1px solid var(--mh-line);
}

.stage--waiting {
  background: linear-gradient(160deg, #f2faf7, #e2f1ec);
}

.stage--ready {
  background: linear-gradient(160deg, #45585c, #33454a);
}

.stage--stimulus {
  background: linear-gradient(160deg, #2fa37c, #1f8a70);
  transform: scale(1.005);
}

.stage--tooSoon {
  background: linear-gradient(160deg, #f7c98d, #f2a65a);
}

.stage--missed {
  background: linear-gradient(160deg, #f0b9a8, #d9694a);
}

.stage--feedback {
  background: linear-gradient(160deg, #e6f4ef, #d4ece3);
}

.stage--finished {
  background: linear-gradient(160deg, #f2faf7, #e2f1ec);
}

.lamp {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  transition: all 0.12s ease;
}

.lamp--ready {
  background: rgba(255, 255, 255, 0.16);
  border: 2px dashed rgba(255, 255, 255, 0.5);
}

.lamp--stimulus {
  background: #ffffff;
  box-shadow: 0 0 0 12px rgba(255, 255, 255, 0.28), 0 0 40px rgba(255, 255, 255, 0.9);
  animation: lampPulse 0.5s ease-in-out infinite alternate;
}

.lamp--tooSoon,
.lamp--missed {
  background: rgba(255, 255, 255, 0.7);
}

@keyframes lampPulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

.stage__hint {
  font-size: 22px;
  font-weight: 700;
  color: var(--mh-ink);
  text-align: center;
}

.stage--ready .stage__hint,
.stage--stimulus .stage__hint,
.stage--tooSoon .stage__hint,
.stage--missed .stage__hint {
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.stage__sub {
  font-size: 13px;
  color: var(--mh-muted);
  text-align: center;
  padding: 0 24px;
}

.stage--ready .stage__sub,
.stage--stimulus .stage__sub,
.stage--tooSoon .stage__sub,
.stage--missed .stage__sub {
  color: rgba(255, 255, 255, 0.88);
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 18px;
  flex-wrap: wrap;
}

.key-tip {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--mh-muted);
}

kbd {
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--mh-line);
  background: #fff;
  font-size: 11px;
}

.result-brief {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-primary-soft);
  text-align: center;
}

.result-brief__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

@media (max-width: 768px) {
  .stage {
    height: 220px;
  }

  .stage__hint {
    font-size: 18px;
  }

  .lamp {
    width: 64px;
    height: 64px;
  }
}
</style>
