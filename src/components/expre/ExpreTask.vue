<template>
  <!-- src/components/expre/ExpreTask.vue
       情绪识别任务内核：素材抽题 → 作答 → 即时反馈 → 汇总结论
       基础模式（5 类情绪 / 36 题）与进阶模式（6 类情绪 / 48 题）共用本组件 -->
  <div class="expre">
    <div class="mh-card">
      <div class="bar">
        <span class="bar__index">第 <strong>{{ currentIndex + 1 }}</strong> / {{ questions.length }} 题</span>
        <span class="bar__mode">{{ modeLabel }}</span>
        <span class="bar__done">已答 {{ answers.length }}</span>
      </div>
      <div class="mh-progress">
        <div class="mh-progress__fill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <!-- 开始 -->
      <div v-if="phase === 'waiting'" class="panel panel--center">
        <p class="panel__title">{{ modeLabel }} · 情绪识别挑战</p>
        <p class="panel__tip">
          共 {{ poolTotal }} 题，包含图片、动图{{ poolConfig.videoPerEmotion ? '与短视频' : '' }}素材。
          凭第一感觉选择最符合的情绪即可，每题作答后会立刻给出答案与面部线索要点。
        </p>
        <button class="mh-btn mh-btn--primary" @click="startGame">开始挑战</button>
      </div>

      <!-- 作答 -->
      <template v-if="phase === 'playing' && currentItem">
        <div class="nav">
          <button class="mh-btn mh-btn--ghost mh-btn--sm" :disabled="currentIndex === 0 || isAnswering" @click="goBack">
            ← 上一题
          </button>
          <button
            class="mh-btn mh-btn--ghost mh-btn--sm"
            :disabled="currentIndex >= questions.length - 1 || isAnswering"
            @click="goNext"
          >
            下一题 →
          </button>
        </div>

        <div class="media">
          <img
            v-if="currentItem.type !== 'video'"
            :src="currentItem.src"
            alt="情绪识别素材"
            @error="onMediaError"
          />
          <video
            v-else
            :src="currentItem.src"
            controls
            autoplay
            loop
            muted
            @error="onMediaError"
          ></video>
          <div v-if="mediaError" class="media__error">素材加载失败，可点「下一题」跳过</div>
        </div>

        <p class="ask">这是什么情绪？</p>

        <div class="options" :style="{ gridTemplateColumns: 'repeat(' + optionsColumns + ', 1fr)' }">
          <button
            v-for="(emotion, i) in emotions"
            :key="emotion"
            class="option"
            :class="optionClass(emotion)"
            :disabled="isAnswering"
            @click="answer(emotion)"
          >
            <span class="option__key">{{ i + 1 }}</span>
            <span class="option__text">{{ emotion }}</span>
          </button>
        </div>

        <div v-if="feedback" class="feedback" :class="feedback.correct ? 'feedback--ok' : 'feedback--no'">
          <p class="feedback__title">
            {{ feedback.correct ? '答对了' : '正确答案：' + feedback.answer }}
          </p>
          <p class="feedback__tip">{{ tips[feedback.answer] }}</p>
        </div>

        <p class="key-tip">键盘也可以用：数字键 <kbd>1</kbd> - <kbd>{{ emotions.length }}</kbd> 作答，<kbd>←</kbd> <kbd>→</kbd> 切换题目</p>
      </template>

      <!-- 完成 -->
      <div v-if="phase === 'finished'" class="panel panel--center">
        <p class="panel__title">挑战完成</p>
        <p class="panel__tip">
          正确率 {{ summary ? summary.accuracy : 0 }}%（{{ summary ? summary.correct : 0 }} / {{ summary ? summary.total : 0 }}）
          <span v-if="summary && summary.avgDuration"> · 平均每题用时 {{ (summary.avgDuration / 1000).toFixed(1) }} 秒</span>
        </p>
        <button class="mh-btn mh-btn--primary" @click="resetGame">再测一次</button>
      </div>

      <div class="actions">
        <router-link to="/game" class="mh-btn mh-btn--ghost">返回游戏主页</router-link>
      </div>

      <p class="note">{{ note }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { GAME_EVENTS, emitGameResult } from '../../utils/events'
import { EMOTION_NOTE, EMOTION_TIPS } from '../../config/emotions'
import { summarizeExpression } from '../../utils/analysis'
import expreData from '../../assets/json/expre.json'

const props = defineProps({
  mode: { type: String, default: 'easy' },
  /** 参与考察的情绪列表 */
  emotions: { type: Array, required: true },
  /** 抽题配置：每种情绪抽多少图片 / 动图 / 视频，以及是否补足动图 */
  poolConfig: {
    type: Object,
    default: () => ({ imgPerEmotion: 6, gifPerEmotion: 1, videoPerEmotion: 0, extraGifs: 1 }),
  },
})

const tips = EMOTION_TIPS
const note = EMOTION_NOTE

const phase = ref('waiting') // waiting | playing | finished
const questions = ref([])
const currentIndex = ref(0)
const currentItem = ref(null)
const selectedEmotion = ref('')
const answers = ref([])
const feedback = ref(null)
const isAnswering = ref(false)
const mediaError = ref(false)

let answerStart = 0
let advanceTimer = null

const modeLabel = computed(() => (props.mode === 'hard' ? '进阶模式' : '基础模式'))
const optionsColumns = computed(() => (props.emotions.length > 5 ? 3 : 5))
const progressPercent = computed(() =>
  questions.value.length ? Math.round((answers.value.length / questions.value.length) * 100) : 0
)
const summary = computed(() => (phase.value === 'finished' ? summarizeExpression(answers.value, props.emotions) : null))

/* ---------------- 抽题 ---------------- */
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function collectMaterials() {
  const bag = {}
  props.emotions.forEach((e) => {
    bag[e] = { imgs: [], gifs: [], videos: [] }
  })

  expreData.files.forEach((cfg) => {
    const target = bag[cfg.emotion_cn]
    if (!target) return
    for (let i = 1; i <= cfg.img.count; i++) {
      target.imgs.push({ id: cfg.emotion_en + '_img_' + i, emotion: cfg.emotion_cn, src: cfg.img.path_template.replace('{i}', i), type: 'img' })
    }
    for (let i = 1; i <= cfg.gif.count; i++) {
      target.gifs.push({ id: cfg.emotion_en + '_gif_' + i, emotion: cfg.emotion_cn, src: cfg.gif.path_template.replace('{i}', i), type: 'gif' })
    }
    for (let i = 1; i <= (cfg.video?.count || 0); i++) {
      target.videos.push({ id: cfg.emotion_en + '_video_' + i, emotion: cfg.emotion_cn, src: cfg.video.path_template.replace('{i}', i), type: 'video' })
    }
  })
  return bag
}

/**
 * 生成题池：每种情绪抽取相同数量的素材，保证各类情绪被考察的次数均衡。
 * 抽取时用 id 去重，避免原实现中「补足动图」可能抽到已选素材的问题。
 */
function generateQuestionPool() {
  const cfg = props.poolConfig
  const bag = collectMaterials()
  const picked = []
  const pickedIds = new Set()
  const leftovers = { gifs: [] }

  props.emotions.forEach((emotion) => {
    const materials = bag[emotion]
    if (!materials) return
    const take = (list, count) =>
      shuffle(list)
        .filter((m) => !pickedIds.has(m.id))
        .slice(0, count)
        .forEach((m) => {
          pickedIds.add(m.id)
          picked.push(m)
        })

    take(materials.imgs, cfg.imgPerEmotion)
    take(materials.gifs, cfg.gifPerEmotion)
    take(materials.videos, cfg.videoPerEmotion)
    leftovers.gifs.push(...materials.gifs.filter((m) => !pickedIds.has(m.id)))
  })

  // 基础模式题量不足时，用剩余动图补足
  if (cfg.extraGifs > 0) {
    shuffle(leftovers.gifs)
      .slice(0, cfg.extraGifs)
      .forEach((m) => {
        if (pickedIds.has(m.id)) return
        pickedIds.add(m.id)
        picked.push(m)
      })
  }

  return shuffle(picked)
}

const poolTotal = computed(() => {
  const cfg = props.poolConfig
  return props.emotions.length * (cfg.imgPerEmotion + cfg.gifPerEmotion + cfg.videoPerEmotion) + (cfg.extraGifs || 0)
})

/* ---------------- 流程 ---------------- */
function startGame() {
  clearTimers()
  questions.value = generateQuestionPool()
  currentIndex.value = 0
  answers.value = []
  feedback.value = null
  phase.value = 'playing'
  loadQuestion()
}

function loadQuestion() {
  if (currentIndex.value >= questions.value.length) {
    finishGame()
    return
  }
  currentItem.value = questions.value[currentIndex.value]
  const exist = answers.value.find((a) => a.index === currentIndex.value)
  selectedEmotion.value = exist ? exist.userAnswer : ''
  feedback.value = exist ? { correct: exist.isCorrect, answer: currentItem.value.emotion } : null
  isAnswering.value = false
  mediaError.value = false
  answerStart = Date.now()
}

function optionClass(emotion) {
  if (!feedback.value) return selectedEmotion.value === emotion ? 'option--selected' : ''
  if (emotion === feedback.value.answer) return 'option--correct'
  if (emotion === selectedEmotion.value && !feedback.value.correct) return 'option--wrong'
  return 'option--dim'
}

function answer(emotion) {
  if (isAnswering.value || !currentItem.value) return
  isAnswering.value = true

  const duration = answerStart ? Date.now() - answerStart : 0
  const isCorrect = emotion === currentItem.value.emotion
  const record = {
    index: currentIndex.value,
    userAnswer: emotion,
    isCorrect,
    duration,
    item: { ...currentItem.value },
  }

  const idx = answers.value.findIndex((a) => a.index === currentIndex.value)
  if (idx !== -1) answers.value[idx] = record
  else answers.value.push(record)

  selectedEmotion.value = emotion
  feedback.value = { correct: isCorrect, answer: currentItem.value.emotion }

  clearTimeout(advanceTimer)
  advanceTimer = setTimeout(() => {
    isAnswering.value = false
    advance()
  }, 1000)
}

/** 作答后前进：优先跳到「后面还没答的题」，全部答完才结束，避免漏题导致提前交卷 */
function advance() {
  const hasAnswer = (i) => answers.value.some((a) => a.index === i)
  let next = -1
  for (let i = currentIndex.value + 1; i < questions.value.length; i++) {
    if (!hasAnswer(i)) {
      next = i
      break
    }
  }
  if (next === -1) {
    for (let i = 0; i < questions.value.length; i++) {
      if (!hasAnswer(i)) {
        next = i
        break
      }
    }
  }
  if (next === -1) {
    finishGame()
    return
  }
  currentIndex.value = next
  loadQuestion()
}

function goBack() {
  if (isAnswering.value || currentIndex.value === 0) return
  currentIndex.value -= 1
  loadQuestion()
}

function goNext() {
  if (isAnswering.value) return
  if (currentIndex.value >= questions.value.length - 1) return
  currentIndex.value += 1
  loadQuestion()
}

function finishGame() {
  clearTimers()
  phase.value = 'finished'
  const s = summarizeExpression(answers.value, props.emotions)
  emitGameResult(props.mode === 'hard' ? GAME_EVENTS.EXPRESSION_HARD : GAME_EVENTS.EXPRESSION_EASY, {
    mode: props.mode,
    emotions: props.emotions,
    results: answers.value,
    totalRounds: s.total,
    correctCount: s.correct,
    accuracy: s.accuracy,
    avgDuration: s.avgDuration,
    emotionAccuracy: s.emotionAccuracy,
    confusion: s.confusion,
    strongest: s.strongest,
    weakest: s.weakest,
    grade: s.grade,
    note,
  })
}

function resetGame() {
  clearTimers()
  phase.value = 'waiting'
  questions.value = []
  currentIndex.value = 0
  currentItem.value = null
  answers.value = []
  feedback.value = null
  selectedEmotion.value = ''
  mediaError.value = false
}

function clearTimers() {
  clearTimeout(advanceTimer)
  advanceTimer = null
}

function onMediaError() {
  mediaError.value = true
}

/* ---------------- 键盘操作 ---------------- */
function onKeydown(e) {
  if (phase.value !== 'playing') return
  if (e.key === 'ArrowLeft') return goBack()
  if (e.key === 'ArrowRight') return goNext()
  const n = Number(e.key)
  if (n >= 1 && n <= props.emotions.length) answer(props.emotions[n - 1])
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimers()
})

defineExpose({ resetGame })
</script>

<style scoped>
.expre {
  max-width: 780px;
  margin: 0 auto;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--mh-ink-2);
}

.bar__index strong {
  color: var(--mh-primary-dark);
  font-size: 17px;
}

.bar__mode {
  font-weight: 700;
  color: var(--mh-accent);
}

.bar__done {
  color: var(--mh-muted);
}

.nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0;
}

/* 素材框固定为正方形，内部一律「完整居中显示」：
   题库里的图片分辨率与长宽比各不相同（有的 655×630，有的 1147×927），
   原先使用 object-fit: cover 会被裁切、且不同图片裁切位置不一致，
   看起来像是「图片位置错乱」。改为 contain 后：
   1. 任何比例都完整显示，不再裁掉眉、眼、嘴等关键线索；
   2. 每道题的取景一致，作答体验稳定；
   3. 框体尺寸固定，切换题目不会发生跳动。 */
.media {
  position: relative;
  width: min(340px, 100%);
  aspect-ratio: 1;
  margin: 0 auto;
  border-radius: var(--mh-radius);
  overflow: hidden;
  background: #f3f7f5;
  border: 1px solid var(--mh-line);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.media img,
.media video {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center center;
  border-radius: 10px;
  background: #fff;
}

.media__error {
  position: absolute;
  inset: auto 0 0 0;
  padding: 8px;
  background: rgba(217, 105, 74, 0.9);
  color: #fff;
  font-size: 12px;
  text-align: center;
}

.ask {
  margin: 16px 0 12px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--mh-ink);
}

.options {
  display: grid;
  gap: 10px;
}

.option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: var(--mh-radius-sm);
  border: 2px solid var(--mh-line);
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  color: var(--mh-ink-2);
  cursor: pointer;
  transition: all 0.18s ease;
}

.option:not(:disabled):hover {
  border-color: var(--mh-primary-light);
  transform: translateY(-2px);
}

.option__key {
  font-size: 11px;
  font-weight: 500;
  color: var(--mh-muted);
}

.option--selected {
  border-color: var(--mh-primary);
  color: var(--mh-primary-dark);
}

.option--correct {
  border-color: var(--mh-primary);
  background: var(--mh-primary-soft);
  color: var(--mh-primary-dark);
}

.option--wrong {
  border-color: var(--mh-danger);
  background: #fdeeea;
  color: var(--mh-danger);
}

.option--dim {
  opacity: 0.55;
}

.feedback {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: var(--mh-radius-sm);
  border-left: 4px solid var(--mh-primary);
  background: var(--mh-primary-soft);
}

.feedback--no {
  border-left-color: var(--mh-danger);
  background: #fdeeea;
}

.feedback__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--mh-primary-dark);
}

.feedback--no .feedback__title {
  color: var(--mh-danger);
}

.feedback__tip {
  margin-top: 4px;
  font-size: 13px;
  color: var(--mh-ink-2);
}

.panel {
  padding: 22px 18px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
  margin-top: 16px;
}

.panel--center {
  text-align: center;
}

.panel__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--mh-primary-dark);
  margin-bottom: 10px;
}

.panel__tip {
  margin: 0 auto 16px;
  max-width: 520px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--mh-muted);
}

.key-tip {
  margin-top: 14px;
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

.actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-accent-soft);
  font-size: 12px;
  line-height: 1.8;
  color: #8a5416;
}

@media (max-width: 768px) {
  .options {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>
