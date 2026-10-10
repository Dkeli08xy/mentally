<template>
  <!-- src/components/Reaction/hard.vue · 进阶反应（5×5 舒尔特方格） -->
  <div class="schulte">
    <div class="mh-card">
      <div class="bar">
        <span class="bar__round">第 <strong>{{ currentRound }}</strong> / {{ totalRounds }} 轮</span>
        <span class="bar__target">下一个：<strong>{{ currentNumber }}</strong> / 25</span>
        <span class="bar__time">{{ useTime }} ms</span>
      </div>

      <div v-if="gamePhase === 'playing' || gamePhase === 'roundDone'" class="grid">
        <button
          v-for="num in grid"
          :key="num"
          class="cell"
          :class="{
            'cell--done': num < currentNumber,
            'cell--miss': missNumber === num,
          }"
          :disabled="num < currentNumber || gamePhase !== 'playing'"
          @click="handleItemClick(num)"
        >
          {{ num }}
        </button>
      </div>

      <div v-if="gamePhase === 'waiting'" class="start">
        <p class="start__title">5×5 舒尔特方格</p>
        <p class="start__desc">
          按 1 → 25 的顺序依次点击，共 {{ totalRounds }} 轮。
          这个范式用来观察<strong>视觉搜索效率</strong>与<strong>注意的稳定性</strong>：点错不扣分，但会记入错误次数。
        </p>
        <button class="mh-btn mh-btn--primary" @click="startGame">开始挑战</button>
      </div>

      <div v-if="gamePhase === 'roundDone'" class="round-mask">
        <p class="round-mask__title">第 {{ currentRound }} 轮完成</p>
        <p class="round-mask__time">{{ (lastRoundTime / 1000).toFixed(2) }} s · 点错 {{ roundErrors }} 次</p>
      </div>

      <div v-if="gamePhase === 'finished'" class="finish">
        <p class="finish__title">全部完成</p>
        <p class="finish__desc">
          平均 {{ (averageReactionTime / 1000).toFixed(2) }} s · 最快 {{ (bestTime / 1000).toFixed(2) }} s ·
          点错 {{ totalErrors }} 次
        </p>
      </div>

      <div class="actions">
        <button v-if="gamePhase === 'finished'" class="mh-btn mh-btn--primary" @click="resetGame">再测一次</button>
        <router-link to="/game" class="mh-btn mh-btn--ghost">返回游戏主页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { GAME_EVENTS, emitGameResult } from '../../utils/events'
import {
  coefficientOfVariation,
  gradeSchulte,
  mean,
  round2,
  stabilityLabel,
  stdDev,
} from '../../utils/analysis'

const totalRounds = 3
const ROUND_FEEDBACK_MS = 900

const gamePhase = ref('waiting') // waiting | playing | roundDone | finished
const currentRound = ref(0)
const grid = ref([])
const currentNumber = ref(1)
const useTime = ref(0)
const missNumber = ref(null)

const results = ref([])
const roundErrors = ref(0)

let roundStartTime = 0
let timerInterval = null
let missTimer = null
let feedbackTimer = null

const averageReactionTime = computed(() => (results.value.length ? mean(results.value.map((r) => r.reactionTime)) : 0))
const bestTime = computed(() => (results.value.length ? Math.min(...results.value.map((r) => r.reactionTime)) : 0))
const lastRoundTime = computed(() => (results.value.length ? results.value[results.value.length - 1].reactionTime : 0))
const totalErrors = computed(() => results.value.reduce((sum, r) => sum + r.errors, 0))

/** 洗牌：Fisher-Yates，避免 sort(random) 分布不均 */
function generateGrid() {
  const arr = Array.from({ length: 25 }, (_, i) => i + 1)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function clearTimers() {
  clearInterval(timerInterval)
  clearTimeout(missTimer)
  clearTimeout(feedbackTimer)
  timerInterval = missTimer = feedbackTimer = null
}

function startGame() {
  resetState()
  startRound()
}

function resetState() {
  clearTimers()
  gamePhase.value = 'waiting'
  currentRound.value = 0
  grid.value = []
  currentNumber.value = 1
  useTime.value = 0
  results.value = []
  roundErrors.value = 0
}

function startRound() {
  if (currentRound.value >= totalRounds) {
    finishGame()
    return
  }
  currentRound.value += 1
  roundErrors.value = 0
  currentNumber.value = 1
  useTime.value = 0
  grid.value = generateGrid()
  gamePhase.value = 'playing'
  roundStartTime = performance.now()
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    useTime.value = Math.round(performance.now() - roundStartTime)
  }, 50)
}

function completeRound() {
  clearInterval(timerInterval)
  const time = Math.round(performance.now() - roundStartTime)
  useTime.value = time
  results.value.push({
    round: currentRound.value,
    reactionTime: time,
    errors: roundErrors.value,
    isValid: true,
    timestamp: new Date().toISOString(),
  })
  gamePhase.value = 'roundDone'
  feedbackTimer = setTimeout(() => {
    if (currentRound.value >= totalRounds) finishGame()
    else startRound()
  }, ROUND_FEEDBACK_MS)
}

function finishGame() {
  clearTimers()
  gamePhase.value = 'finished'
  const times = results.value.map((r) => r.reactionTime)
  const avg = times.length ? mean(times) : 0
  const cv = coefficientOfVariation(times)
  emitGameResult(GAME_EVENTS.REACTION_HARD, {
    results: results.value,
    totalRounds,
    averageTime: Math.round(avg),
    bestTime: times.length ? Math.min(...times) : 0,
    worstTime: times.length ? Math.max(...times) : 0,
    sd: round2(stdDev(times)),
    cv: round2(cv),
    stability: stabilityLabel(cv).text,
    totalErrors: totalErrors.value,
    grade: gradeSchulte(avg / 1000),
  })
}

function handleItemClick(num) {
  if (gamePhase.value !== 'playing') return
  if (num === currentNumber.value) {
    currentNumber.value += 1
    if (currentNumber.value > 25) completeRound()
  } else {
    // 点错：计入错误次数并给出即时反馈，不影响当前进度
    roundErrors.value += 1
    missNumber.value = num
    clearTimeout(missTimer)
    missTimer = setTimeout(() => {
      missNumber.value = null
    }, 320)
  }
}

function resetGame() {
  resetState()
}

onUnmounted(clearTimers)

defineExpose({ resetGame, getResults: () => results.value })
</script>

<style scoped>
.schulte {
  max-width: 780px;
  margin: 0 auto;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--mh-ink-2);
}

.bar__round strong,
.bar__target strong {
  color: var(--mh-primary-dark);
  font-size: 18px;
}

.bar__time {
  font-variant-numeric: tabular-nums;
  color: var(--mh-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.cell {
  aspect-ratio: 1;
  border: 1px solid var(--mh-line);
  border-radius: 12px;
  background: linear-gradient(160deg, #ffffff, #f2faf7);
  color: var(--mh-primary-dark);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.cell:not(:disabled):hover {
  transform: translateY(-2px);
  background: var(--mh-primary-soft);
}

.cell--done {
  background: #eef4f2;
  color: #b6c4c0;
  border-color: #e8efec;
  cursor: default;
}

.cell--miss {
  background: #fde3da;
  color: var(--mh-danger);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.start,
.finish,
.round-mask {
  text-align: center;
  padding: 26px 20px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-primary-soft-2);
  border: 1px dashed var(--mh-primary-light);
}

.round-mask {
  margin-top: 16px;
  padding: 16px;
}

.start__title,
.finish__title,
.round-mask__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.start__desc,
.finish__desc,
.round-mask__time {
  margin: 10px auto 16px;
  max-width: 520px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--mh-ink-2);
}

.round-mask__time,
.finish__desc {
  margin-bottom: 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 18px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .cell {
    font-size: 16px;
    border-radius: 9px;
  }

  .grid {
    gap: 7px;
  }
}
</style>
