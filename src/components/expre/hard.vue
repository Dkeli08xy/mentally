<!-- src\components\expre\hard.vue -->
<template>
  <div class="expression-game">
    <div class="game-container">
      <div class="status-area">
        <div class="round-info">第 {{ currentIndex + 1 }} / {{ totalRounds }} 题</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <div class="nav-bar" v-if="gamePhase === 'playing'">
        <button class="nav-btn back-btn" @click="goBack" :disabled="currentIndex === 0">← 上一题</button>
        <button class="nav-btn next-btn" @click="goNext" :disabled="currentIndex >= totalRounds - 1">下一题 →</button>
      </div>

      <div v-if="gamePhase === 'playing' && currentItem" class="question-area">
        <div class="stimulus-box">
          <div class="media-box">
            <img 
              v-if="currentItem.type === 'img'" 
              :src="currentItem.src" 
              :alt="currentItem.emotion"
              @error="handleImageError"
            />
            <img 
              v-else-if="currentItem.type === 'gif'" 
              :src="currentItem.src" 
              :alt="currentItem.emotion"
              @error="handleImageError"
            />
            <video 
              v-else-if="currentItem.type === 'video'" 
              :src="currentItem.src"
              controls
              autoplay
              loop
              muted
              @error="handleVideoError"
            ></video>
            <div v-if="mediaLoadError" class="error-placeholder">
              ⚠️ 媒体加载失败
            </div>
          </div>
          <div class="image-label">这是什么情绪？</div>
        </div>

        <div class="options-area">
          <button
            v-for="emotion in emotions"
            :key="emotion"
            class="option-btn"
            :class="{ selected: selectedEmotion === emotion }"
            @click="selectAndNext(emotion)"
          >
            {{ emotion }}
          </button>
        </div>
      </div>

      <div class="control-buttons" v-if="gamePhase === 'waiting'">
        <button class="btn start-btn" @click="startGame">开始测试</button>
      </div>

      <div class="finish-panel" v-if="gamePhase === 'finished'">
        <h3>测试完成！</h3>
        <p>正确率：{{ finalAccuracy }}%</p>
        <p>正确题数：{{ correctCount }} / {{ totalRounds }}</p>
        
        <!-- 新增：题号回顾 -->
        <div class="review-panel" style="margin-top:20px;">
          <h4 style="margin-bottom:12px;">📝 题目回顾</h4>
          <div class="number-grid">
            <button 
              v-for="idx in totalRounds" 
              :key="idx"
              class="num-btn"
              :class="{
                active: reviewIndex === idx-1,
                correct: getAnswerStatus(idx-1) === 'correct',
                wrong: getAnswerStatus(idx-1) === 'wrong'
              }"
              @click="reviewQuestion(idx-1)"
            >
              {{ idx }}
            </button>
          </div>

          <div v-if="reviewItem" class="review-content" style="margin-top:15px;">
            <div class="media-box" style="width:200px;height:200px;margin:10px auto;">
              <img v-if="reviewItem.type === 'img'" :src="reviewItem.src" style="width:100%;height:100%;object-fit:cover;">
              <img v-else-if="reviewItem.type === 'gif'" :src="reviewItem.src" style="width:100%;height:100%;object-fit:cover;">
              <video v-else-if="reviewItem.type === 'video'" :src="reviewItem.src" controls muted style="width:100%;height:100%;object-fit:cover;"></video>
            </div>
            <p>正确答案：<span style="color:#409eff;font-weight:bold;">{{ reviewItem.emotion }}</span></p>
            <p>你的答案：<span :style="{color: answers[reviewIndex]?.isCorrect ? '#67c23a' : '#f56c6c',fontWeight:'bold'}">
              {{ answers[reviewIndex]?.userAnswer || '未作答' }}
            </span></p>
          </div>
        </div>

        <button class="btn restart-btn" @click="resetGame">重新挑战</button>
      </div>

      <div class="back-home" style="margin-top:15px;text-align:center">
        <router-link to="/game"><button class="btn back-home-btn">返回游戏主页</button></router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import expreData from '../../assets/json/expre.json'

const emotions = expreData.emotions
const totalRounds = 48

const gamePhase = ref('waiting')
const currentIndex = ref(0)
const currentItem = ref(null)
const selectedEmotion = ref('')
const answers = ref([])
let questions = []

const isAnswering = ref(false)
const mediaLoadError = ref(false)

const reviewIndex = ref(-1)
const reviewItem = ref(null)

const answeredCount = computed(() => answers.value.length)
const progressPercent = computed(() => (answeredCount.value / totalRounds) * 100)
const correctCount = computed(() => answers.value.filter(a => a.isCorrect).length)
const finalAccuracy = computed(() => {
  if (!questions.length) return 0
  return Math.round((correctCount.value / questions.length) * 100)
})

function getAnswerStatus(idx) {
  const ans = answers.value[idx]
  if (!ans) return ''
  return ans.isCorrect ? 'correct' : 'wrong'
}

function handleImageError() {
  mediaLoadError.value = true
  setTimeout(() => mediaLoadError.value = false, 2000)
}
function handleVideoError() {
  mediaLoadError.value = true
  setTimeout(() => mediaLoadError.value = false, 2000)
}

function generateQuestionPool() {
  const emotionMaterials = {}
  emotions.forEach(e => {
    emotionMaterials[e] = { imgs: [], gifs: [], videos: [] }
  })

  expreData.files.forEach(cfg => {
    for (let i = 1; i <= cfg.img.count; i++) {
      emotionMaterials[cfg.emotion_cn].imgs.push({
        id: `${cfg.emotion_en}_img_${i}`,
        emotion: cfg.emotion_cn,
        src: cfg.img.path_template.replace('{i}', i),
        type: 'img'
      })
    }
    for (let i = 1; i <= cfg.gif.count; i++) {
      emotionMaterials[cfg.emotion_cn].gifs.push({
        id: `${cfg.emotion_en}_gif_${i}`,
        emotion: cfg.emotion_cn,
        src: cfg.gif.path_template.replace('{i}', i),
        type: 'gif'
      })
    }
    for (let i = 1; i <= cfg.video.count; i++) {
      emotionMaterials[cfg.emotion_cn].videos.push({
        id: `${cfg.emotion_en}_video_${i}`,
        emotion: cfg.emotion_cn,
        src: cfg.video.path_template.replace('{i}', i),
        type: 'video'
      })
    }
  })

  let pool = []
  emotions.forEach(e => {
    const all = [...emotionMaterials[e].imgs, ...emotionMaterials[e].gifs, ...emotionMaterials[e].videos]
    const selected = shuffleArray([...all]).slice(0, 8)
    pool.push(...selected)
  })

  return shuffleArray(pool.slice(0, 48))
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function initQuestions() {
  questions = generateQuestionPool()
}

function startGame() {
  resetGameState()
  initQuestions()
  gamePhase.value = 'playing'
  nextTick(() => loadQuestion())
}

function loadQuestion() {
  if (!questions || questions.length === 0) {
    console.error('题目池为空，请检查 expre.json 配置')
    return
  }
  if (currentIndex.value >= questions.length) {
    finishGame()
    return
  }
  currentItem.value = questions[currentIndex.value]
  const exist = answers.value.find(a => a.index === currentIndex.value)
  selectedEmotion.value = exist ? exist.userAnswer : ''
  isAnswering.value = false
  mediaLoadError.value = false
}

function selectAndNext(emotion) {
  if (isAnswering.value || !currentItem.value) return
  isAnswering.value = true

  const ans = {
    index: currentIndex.value,
    userAnswer: emotion,
    isCorrect: emotion === currentItem.value.emotion,
    item: { ...currentItem.value }
  }

  const idx = answers.value.findIndex(a => a.index === currentIndex.value)
  idx !== -1 ? (answers.value[idx] = ans) : answers.value.push(ans)
  selectedEmotion.value = emotion

  setTimeout(() => {
    currentIndex.value++
    loadQuestion()
    isAnswering.value = false
  }, 300)
}

function goBack() {
  if (isAnswering.value) return
  if (currentIndex.value > 0) {
    currentIndex.value--
    loadQuestion()
  }
}
function goNext() {
  if (isAnswering.value) return
  if (currentIndex.value < questions.length - 1) {
    currentIndex.value++
    loadQuestion()
  }
}

function reviewQuestion(idx) {
  reviewIndex.value = idx
  reviewItem.value = questions[idx] || null
}

const emotionAccuracy = computed(() => {
  const stats = {}
  emotions.forEach(e => {
    const items = answers.value.filter(a => a.item?.emotion === e)
    const correct = items.filter(a => a.isCorrect).length
    stats[e] = items.length ? Math.round((correct / items.length) * 100) : 0
  })
  return stats
})

function finishGame() {
  gamePhase.value = 'finished'
  emitGameComplete()
}

function emitGameComplete() {
  window.dispatchEvent(new CustomEvent('expressionHardComplete', {
    detail: {
      results: answers.value,
      totalRounds: questions.length,
      correctCount: correctCount.value,
      accuracy: finalAccuracy.value,
      emotionAccuracy: emotionAccuracy.value
    }
  }))
}

function resetGameState() {
  currentIndex.value = 0
  answers.value = []
  selectedEmotion.value = ''
  currentItem.value = null
  questions = []
  isAnswering.value = false
  mediaLoadError.value = false
  reviewIndex.value = -1
  reviewItem.value = null
}

function resetGame() {
  resetGameState()
  gamePhase.value = 'waiting'
}

defineExpose({ resetGame })
</script>

<style scoped>
.expression-game { max-width:800px;margin:0 auto;font-family:apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; }
.game-container { background:#fff;border-radius:20px;padding:30px;box-shadow:0 8px 30px rgba(0,0,0,0.06); }
.status-area { margin-bottom:20px;padding:10px 15px;background:#f8f9fa;border-radius:10px; }
.round-info { font-size:1.1em;font-weight:500;color:#409eff;margin-bottom:8px; }
.progress-bar { width:100%;height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden; }
.progress-fill { height:100%;background:#67c23a;border-radius:3px;transition:width .3s ease; }
.nav-bar { display:flex;justify-content:space-between;margin-bottom:20px;gap:15px; }
.nav-btn { padding:8px 20px;font-size:14px;border:1px solid #d0d7de;border-radius:8px;background:#fff;cursor:pointer;transition:all .3s; }
.nav-btn:hover:not(:disabled) { background:#f0f2f5;border-color:#409eff; }
.nav-btn:disabled { opacity:.4;cursor:not-allowed; }
.question-area { padding:20px; }
.stimulus-box { text-align:center;margin-bottom:30px; }
.media-box { width:300px;height:300px;margin:0 auto;background:#f5f5f5;border-radius:16px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative; }
.media-box img { width:100%;height:100%;object-fit:cover; }
.media-box video { width:100%;height:100%;object-fit:cover; }
.error-placeholder { color:#f56c6c;font-size:14px; }
.image-label { margin-top:15px;font-size:16px;color:#666;font-weight:500; }
.options-area { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px; }
.option-btn { padding:14px;font-size:16px;border:2px solid #e0e0e0;border-radius:10px;background:#fff;cursor:pointer;transition:all .3s; }
.option-btn:hover { border-color:#409eff;transform:translateY(-2px); }
.option-btn.selected { background:#409eff;color:white;border-color:#409eff; }
.control-buttons { text-align:center;margin-top:20px; }
.finish-panel { text-align:center;padding:20px; }
.finish-panel p { margin:10px 0;font-size:16px; }
.btn { padding:12px 30px;font-size:1.1em;border:none;border-radius:10px;cursor:pointer;font-weight:500;margin:5px; }
.start-btn { background:#409eff;color:white; }
.restart-btn { background:#67c23a;color:white; }
.back-home-btn { background:#95a5a6;color:white; }

.number-grid { display:flex;flex-wrap:wrap;gap:8px;justify-content:center; }
.num-btn { width:36px;height:36px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer; }
.num-btn.active { background:#409eff;color:white;border-color:#409eff; }
.num-btn.correct { background:#e6f7e6;color:#67c23a;border-color:#67c23a; }
.num-btn.wrong { background:#fff1f0;color:#f56c6c;border-color:#f56c6c; }
.review-content { background:#f8f9fa;padding:12px;border-radius:12px; }

@media (max-width:768px){
  .game-container{padding:20px;}
  .media-box{width:220px;height:220px;}
  .options-area{grid-template-columns:repeat(2,1fr);}
}
</style>