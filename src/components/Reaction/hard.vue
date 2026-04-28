<!-- src\components\Reaction\hard.vue -->
<template>
  <div class="reaction-game">
    <div class="game-container">
      <div class="status-area">
        <div class="round-info">第 {{ currentRound }} / {{ totalRounds }} 轮</div>
        <div class="time-info" v-if="gamePhase === 'playing'">
          用时：{{ useTime }} ms
        </div>
      </div>

      <div class="schulte-grid" v-if="gamePhase !== 'waiting' && gamePhase !== 'finished'">
        <div
          v-for="num in grid"
          :key="num"
          class="schulte-item"
          :class="{ done: num < currentNumber }"
          @click="handleItemClick(num)"
        >
          {{ num }}
        </div>
      </div>

      <div class="start-area" v-if="gamePhase === 'waiting'">
        <div class="start-text">点击开始 5×5 舒尔特方格挑战</div>
        <button class="btn start-btn" @click="startGame">开始挑战</button>
      </div>

      <div class="control-buttons">
        <button v-if="gamePhase === 'finished'" class="btn reset-btn" @click="resetGame">
          重新挑战
        </button>
      </div>

      <div class="back-home" style="margin-top:15px;text-align:center">
        <router-link to="/game">
          <button class="btn back-btn">返回游戏主页</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const totalRounds = 3

const gamePhase = ref('waiting')
const currentRound = ref(0)
const results = ref([])

const grid = ref([])
const currentNumber = ref(1)
const useTime = ref(0)

let roundStartTime = 0
let timerInterval = null

const updateTime = () => {
  if (gamePhase.value !== 'playing') return
  const now = performance.now()
  useTime.value = Math.round(now - roundStartTime)
}

const averageReactionTime = computed(() => {
  if (results.value.length === 0) return 0
  const sum = results.value.reduce((acc, curr) => acc + curr.reactionTime, 0)
  return Math.round(sum / results.value.length)
})

const generateGrid = () => {
  const arr = Array.from({ length: 25 }, (_, i) => i + 1)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const startGame = () => {
  resetGameState()
  startRound()
}

const resetGameState = () => {
  clearInterval(timerInterval)
  
  currentRound.value = 0
  results.value = []
  grid.value = []
  currentNumber.value = 1
  useTime.value = 0
}

const resetGame = () => {
  clearInterval(timerInterval)
  gamePhase.value = 'waiting'
  currentRound.value = 0
  results.value = []
  grid.value = []
  currentNumber.value = 1
  useTime.value = 0
}

const startRound = () => {
  if (currentRound.value >= totalRounds) {
    finishGame()
    return
  }

  currentRound.value++
  gamePhase.value = 'playing'
  currentNumber.value = 1
  useTime.value = 0
  
  grid.value = generateGrid()
  
  roundStartTime = performance.now()
  
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(updateTime, 10)
}

const completeRound = () => {
  clearInterval(timerInterval)
  const time = Math.round(performance.now() - roundStartTime)
  useTime.value = time

  results.value.push({
    round: currentRound.value,
    reactionTime: time,
    isValid: true,
    timestamp: new Date().toISOString()
  })

  setTimeout(() => {
    startRound()
  }, 800)
}

const finishGame = () => {
  gamePhase.value = 'finished'
  emitGameComplete()
}

const handleItemClick = (num) => {
  if (gamePhase.value !== 'playing') return

  if (num === currentNumber.value) {
    currentNumber.value++

    if (currentNumber.value > 25) {
      completeRound()
    }
  }
}

const emitGameComplete = () => {
  const event = new CustomEvent('gameCompleteHard', {
    detail: {
      results: results.value,
      averageTime: averageReactionTime.value,
      totalRounds: totalRounds
    }
  })
  window.dispatchEvent(event)
}

onUnmounted(() => {
  clearInterval(timerInterval)
})

defineExpose({
  resetGame,
  getResults: () => results.value,
  getAverageTime: () => averageReactionTime.value
})
</script>

<style scoped>
.reaction-game {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.game-container {
  background: transparent;
  border-radius: 0;
  padding: 24px;
  width: 100%;
  max-width: 850px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;;
  box-shadow: none;
  box-sizing: border-box;
}

.status-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 20px;
}

.round-info {
  font-size: 16px;
  font-weight: 500;
  color: #4a6fa5;
}

.time-info {
  font-size: 14px;
  color: #5a7c8a;
}

.schulte-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: 100%;
  aspect-ratio: 1 / 1;
}

.schulte-item {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #728aa7;
  color: white;
  font-size: clamp(18px, 5vw, 24px);
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: 0.2s ease;
}

.schulte-item:hover {
  background: #5b7ba8;
  transform: scale(1.02);
}

.schulte-item.done {
  background: #d2e0f3;
  color: #a0aab5;
}

.start-area {
  text-align: center;
  padding: 50px 0;
}

.start-text {
  font-size: 16px;
  margin-bottom: 20px;
  color: #333;
}

.control-buttons,
.back-home {
  text-align: center;
  margin-top: 16px;
}

.btn {
  padding: 12px 26px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.start-btn {
  background: #5b7ba8;
}
.reset-btn {
  background: #7b92a8;
}
.back-btn {
  background: #a9b8c2;
}

.btn:hover {
  opacity: 0.9;
}
</style>