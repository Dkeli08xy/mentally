<!-- src\components\Reaction\simple.vue -->
<template>
  <div class="reaction-game">
    <div class="game-container">
      <div class="status-area">
        <div class="round-info">第 {{ currentRound }} / {{ totalRounds }} 轮</div>
        <div class="average-time" v-if="results.length > 0">
          当前平均: {{ averageReactionTime }} ms
        </div>
      </div>

      <div 
        class="stimulus-box"
        :class="{
          waiting: gamePhase === 'waiting',
          ready: gamePhase === 'ready',
          stimulus: gamePhase === 'stimulus',
          'too-soon': gamePhase === 'tooSoon',
          timeout: gamePhase === 'timeout'
        }"
        @click="handleClick"
      >
        <div class="stimulus-text">
          <span v-if="gamePhase === 'waiting'">点击开始</span>
          <span v-else-if="gamePhase === 'ready'">等待绿色...</span>
          <span v-else-if="gamePhase === 'stimulus'">点击！</span>
          <span v-else-if="gamePhase === 'tooSoon'">按得太早！</span>
          <span v-else-if="gamePhase === 'timeout'">长时间未操作，请重新测试</span>
        </div>
      </div>

      <div class="control-buttons">
        <button 
          v-if="gamePhase === 'waiting'"
          class="btn start-btn"
          @click="startGame"
        >
          开始测试
        </button>
        <button 
          v-if="gamePhase === 'finished' || gamePhase === 'timeout'"
          class="btn reset-btn"
          @click="resetGame"
        >
          重新测试
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

const totalRounds = 5
const minReactionTime = 100
const maxReactionTime = 2000

const gamePhase = ref('waiting')
const currentRound = ref(0)
const results = ref([])
const startTime = ref(0)

let stimulusTimer = null
let timeoutTimer = null

const averageReactionTime = computed(() => {
  if (results.value.length === 0) return 0
  const sum = results.value.reduce((acc, curr) => acc + curr.reactionTime, 0)
  return Math.round(sum / results.value.length)
})

const startGame = () => {
  resetGameState()
  nextRound()
}

const resetGameState = () => {
  clearTimeout(stimulusTimer)
  clearTimeout(timeoutTimer)
  currentRound.value = 0
  results.value = []
  gamePhase.value = 'waiting'
}

const resetGame = () => {
  resetGameState()
  gamePhase.value = 'waiting'
}

const nextRound = () => {
  if (currentRound.value >= totalRounds) {
    gamePhase.value = 'finished'
    emitGameComplete()
    return
  }

  currentRound.value++
  gamePhase.value = 'ready'

  const delay = Math.random() * 2000 + 1000
  stimulusTimer = setTimeout(() => {
    if (gamePhase.value === 'ready') {
      showStimulus()
    }
  }, delay)
}

const showStimulus = () => {
  gamePhase.value = 'stimulus'
  startTime.value = performance.now()

  timeoutTimer = setTimeout(() => {
    if (gamePhase.value === 'stimulus') {
      handleTimeout()
    }
  }, maxReactionTime)
}

const handleTimeout = () => {
  clearTimeout(timeoutTimer)
  gamePhase.value = 'timeout'
}

const handleClick = () => {
  if (gamePhase.value === 'waiting') {
    startGame()
    return
  }

  if (gamePhase.value === 'timeout') {
    resetGame()
    return
  }

  if (gamePhase.value === 'ready') {
    clearTimeout(stimulusTimer)
    clearTimeout(timeoutTimer)
    gamePhase.value = 'tooSoon'
    setTimeout(() => {
      nextRound()
    }, 1000)
    return
  }

  if (gamePhase.value === 'stimulus') {
    const reactionTime = performance.now() - startTime.value
    clearTimeout(timeoutTimer)

    const roundData = {
      round: currentRound.value,
      reactionTime: Math.round(reactionTime),
      isValid: reactionTime >= minReactionTime && reactionTime <= maxReactionTime,
      timestamp: new Date().toISOString()
    }

    results.value.push(roundData)

    setTimeout(() => {
      if (currentRound.value < totalRounds) {
        nextRound()
      } else {
        gamePhase.value = 'finished'
        emitGameComplete()
      }
    }, 500)
  }
}

const emitGameComplete = () => {
  const event = new CustomEvent('gameComplete', {
    detail: {
      results: results.value,
      averageTime: averageReactionTime.value,
      totalRounds: totalRounds
    }
  })
  window.dispatchEvent(event)
}

onUnmounted(() => {
  clearTimeout(stimulusTimer)
  clearTimeout(timeoutTimer)
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
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.game-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.status-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 10px;
}

.round-info {
  font-size: 1.2em;
  font-weight: bold;
  color: #667eea;
}

.average-time {
  font-size: 1em;
  color: #764ba2;
}

.stimulus-box {
  width: 100%;
  height: 300px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
  margin: 20px 0;
  user-select: none;
}

.stimulus-box.waiting {
  background: #4a6fa5;
}
.stimulus-box.ready {
  background: #6b7a90;
}
.stimulus-box.stimulus {
  background: #57d1a3;
}
.stimulus-box.too-soon {
  background: #e29f5f;
}
.stimulus-box.timeout {
  background: #e74c3c;
}

.stimulus-text {
  font-size: 2em;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.control-buttons {
  text-align: center;
  margin-top: 20px;
}

.btn {
  padding: 12px 30px;
  font-size: 1.1em;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.start-btn {
  background: #667eea;
  color: white;
}

.start-btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.reset-btn {
  background: #e74c3c;
  color: white;
}

.reset-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.back-btn {
  background: #95a5a6;
  color: white;
}
.back-btn:hover {
  background: #7f8c8d;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes flash {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .game-container {
    padding: 20px;
  }
  
  .stimulus-box {
    height: 200px;
  }
  
  .stimulus-text {
    font-size: 1.2em;
  }
}
</style>