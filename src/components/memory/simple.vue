<!-- src\components\memory\simple.vue -->
<template>
  <div class="memory-game">
    <div class="game-container">
      <div class="status-area">
        <div class="phase-text">{{ phaseText }}</div>
        <div v-if="countdown > 0" class="countdown">倒计时：{{ countdown }} 秒</div>
      </div>

      <div v-if="gamePhase === 'memorize'" class="memorize-box">
        <div class="pair-item" v-for="(item,idx) in pairs" :key="idx">
          {{ item.key }} → {{ item.value }}
        </div>
      </div>

      <div v-if="gamePhase === 'match'" class="match-box">
        <div class="match-item" v-for="(item,idx) in showPairs" :key="idx">
          <span class="key-text">{{ item.key }}</span>
          <select v-model="item.userAnswer" class="select-answer">
            <option value="">请选择</option>
            <option v-for="opt in valueOptions" :value="opt" :key="opt">{{ opt }}</option>
          </select>
        </div>
        <button class="btn submit-btn" @click="submitMatch">提交答案</button>
      </div>

      <div class="control-buttons">
        <button v-if="gamePhase === 'waiting'" class="btn start-btn" @click="startGame">开始记忆</button>
        <button v-if="gamePhase === 'finished'" class="btn reset-btn" @click="resetGame">重新测试</button>
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
import { ref, onMounted } from 'vue'
import memorySimple from '../../assets/json/memory_simple.json'

const PAIR_COUNT = 6
const DELAYS = [0, 20, 60, 120]
const MEMORIZE_SECONDS = 10

const gamePhase = ref('waiting')
const phaseText = ref('点击开始')
const countdown = ref(0)
let timer = null

const pairs = ref([])
const valueOptions = ref([])
const showPairs = ref([])
const results = ref([])
let currentStage = 0

let countStart = 0

function sample(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}

function loadPairs() {
  const keys = sample(memorySimple.keys, PAIR_COUNT)
  const values = sample(memorySimple.values, PAIR_COUNT)
  const list = keys.map((k, i) => ({ key: k, value: values[i], userAnswer: '' }))
  pairs.value = list
  valueOptions.value = [...values].sort(() => 0.5 - Math.random())
}

function startGame() {
  resetGame()
  gamePhase.value = 'memorize'
  phaseText.value = '请安心记忆，无需紧张'
  loadPairs()

  startMemorizeCountdown(MEMORIZE_SECONDS, () => {
    nextStage()
  })
}

function startMemorizeCountdown(sec, callback) {
  countdown.value = sec
  countStart = Date.now()
  clearInterval(timer)
  timer = setInterval(() => {
    const used = Math.floor((Date.now() - countStart) / 1000)
    countdown.value = Math.max(0, sec - used)
    if (countdown.value <= 0) {
      clearInterval(timer)
      callback()
    }
  }, 50)
}

function nextStage() {
  if (currentStage >= DELAYS.length) {
    finishGame()
    return
  }
  const t = DELAYS[currentStage]
  gamePhase.value = 'delay'

  if (t === 0) {
    phaseText.value = '初始记忆测试（0秒）'
    setTimeout(() => doMatch(), 500)
  } else {
    phaseText.value = `请休息，${t} 秒后开始测试`
    startMemorizeCountdown(t, () => doMatch())
  }
}

function doMatch() {
  gamePhase.value = 'match'
  const t = DELAYS[currentStage]
  phaseText.value = t === 0 ? `初始记忆测试` : `第 ${currentStage} 轮匹配`
  showPairs.value = JSON.parse(JSON.stringify(pairs.value))
  showPairs.value.forEach(p => p.userAnswer = '')
}

function submitMatch() {
  const correct = showPairs.value.filter(p => p.userAnswer === p.value).length
  const rate = Math.round((correct / pairs.value.length) * 100)
  results.value.push({
    stage: currentStage + 1,
    delay: DELAYS[currentStage],
    correct,
    total: pairs.value.length,
    rate
  })
  currentStage++
  nextStage()
}

function finishGame() {
  gamePhase.value = 'finished'
  phaseText.value = '测试完成'

  const res = results.value
  const rate0 = res[0]?.rate ?? 100
  const rate20 = res[1]?.rate ?? 0
  const rate60 = res[2]?.rate ?? 0
  const rate120 = res[3]?.rate ?? 0

  const safeLog = (x) => Math.log(Math.max(0.001, Math.min(0.999, x)))
  const clamp = (x, min, max) => Math.max(min, Math.min(max, x))

  let kValues = []

  if (rate0 > 0 && rate20 > 0) {
    const r = rate20 / rate0
    const k = -20 / safeLog(r)
    kValues.push(k)
  }
  if (rate0 > 0 && rate60 > 0) {
    const r = rate60 / rate0
    const k = -60 / safeLog(r)
    kValues.push(k)
  }
  if (rate0 > 0 && rate120 > 0) {
    const r = rate120 / rate0
    const k = -120 / safeLog(r)
    kValues.push(k)
  }

  let kFinal = 50
  if (kValues.length > 0) {
    const avg = kValues.reduce((a, b) => a + b, 0) / kValues.length
    kFinal = clamp(Math.abs(avg), 5, 100)
  }

  const event = new CustomEvent('memoryComplete', {
    detail: {
      rate0, rate20, rate60, rate120,
      kValue: Math.round(kFinal * 10) / 10,
      points: res
    }
  })
  window.dispatchEvent(event)
}

function resetGame() {
  clearInterval(timer)
  gamePhase.value = 'waiting'
  phaseText.value = '点击开始'
  countdown.value = 0
  pairs.value = []
  showPairs.value = []
  results.value = []
  currentStage = 0
}

onMounted(() => {})

defineExpose({ resetGame, getResults: () => results.value })
</script>

<style scoped>
.memory-game {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.game-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}
.status-area {
  margin-bottom: 20px;
  padding: 10px 15px;
  background: #F7F9FC;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 500;
  color: #4A6FA5;
}
.countdown {
  color: #5B7BD2;
  margin-top: 5px;
  font-size: 1em;
}
.memorize-box {
  padding: 20px;
  background: #F0F5FF;
  border-radius: 12px;
}
.pair-item {
  font-size: 1.2em;
  padding: 8px 0;
  color: #2D3748;
}
.match-box {
  padding: 20px;
}
.match-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 1.1em;
}
.key-text {
  width: 40%;
}
.select-answer {
  width: 55%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  font-size: 1em;
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
  font-weight: 500;
}
.start-btn { background: #5B7BD2; color: white; }
.start-btn:hover { background: #4A6FA5; transform: translateY(-1px); }
.reset-btn { background: #D7DDF2; color: #4A5568; }
.reset-btn:hover { background: #C2C9E4; }
.back-btn { background: #E2E8F0; color: #4A5568; }
.back-btn:hover { background: #CBD5E0; }
.submit-btn {
  background: #68BD9C; color: white;
  margin-top: 20px;
  padding: 10px 25px;
}
.submit-btn:hover { background: #59A888; }
</style>