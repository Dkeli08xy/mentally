<template>
  <!-- src/view/game/Expre_H.vue · 进阶情绪识别：挑战 + 识别能力解读 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="情绪识别挑战 · 进阶模式" subtitle="6 类情绪 · 48 题" back-to="/game" back-label="返回游戏主页" />

      <Game :key="gameKey" />

      <section v-if="showResult" class="mh-card">
        <h2 class="mh-section-title">本次成绩</h2>

        <div class="mh-stats">
          <div class="mh-stat">
            <span class="mh-stat__label">总题数</span>
            <span class="mh-stat__value">{{ data.totalRounds }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">正确数</span>
            <span class="mh-stat__value">{{ data.correctCount }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">正确率</span>
            <span class="mh-stat__value">{{ data.accuracy }}<span class="mh-stat__unit">%</span></span>
            <span class="mh-stat__hint">{{ data.grade?.text }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">平均每题用时</span>
            <span class="mh-stat__value">{{ seconds(data.avgDuration) }}<span class="mh-stat__unit">s</span></span>
          </div>
        </div>

        <div ref="chartRef" class="mh-chart"></div>

        <div class="mh-conclusion">
          <p class="mh-conclusion__headline">解读：{{ data.grade?.text }}</p>
          <p class="mh-text">{{ reading }}</p>
          <ul v-if="data.confusion && data.confusion.length" class="confusion">
            <li v-for="c in data.confusion" :key="c.actual + c.chosen">
              把「{{ c.actual }}」认成「{{ c.chosen }}」：{{ c.count }} 次
            </li>
          </ul>
        </div>

        <h2 class="mh-section-title tips-title">情绪线索速查</h2>
        <div class="tips">
          <div v-for="emotion in emotions" :key="emotion" class="tip-card">
            <strong :style="{ color: EMOTION_COLORS[emotion] }">{{ emotion }}</strong>
            <p>{{ EMOTION_TIPS[emotion] }}</p>
          </div>
        </div>

        <div class="actions">
          <button class="mh-btn mh-btn--primary" @click="retry">再测一次</button>
          <router-link to="/EC" class="mh-btn mh-btn--ghost">成绩分布对比</router-link>
          <router-link to="/home" class="mh-btn mh-btn--ghost">返回首页</router-link>
        </div>
      </section>

      <section class="mh-statement">
        <h4>说明</h4>
        <p>{{ EMOTION_NOTE }}</p>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '../../utils/echarts'
import Game from '../../components/expre/hard.vue'
import PageHead from '../../components/common/PageHead.vue'
import { EVENT } from '../../config/event'
import { EMOTION_COLORS, EMOTION_NOTE, EMOTION_TIPS, EMOTIONS_HARD } from '../../config/emotions'
import { GAME_EVENTS, onGameResult } from '../../utils/events'
import { MicroExpressionHardStorage } from '../../utils/localStorage'
import { gradeAccuracy } from '../../utils/analysis'

const chartRef = ref(null)
let chart = null
let off = null

const gameKey = ref(0)
const data = ref(null)
const emotions = EMOTIONS_HARD
const showResult = computed(() => !!data.value)

const seconds = (ms) => (ms ? (ms / 1000).toFixed(1) : '--')

const reading = computed(() => {
  if (!data.value) return ''
  const parts = []
  if (data.value.strongest) parts.push('辨认最准的是「' + data.value.strongest.emotion + '」，正确率 ' + data.value.strongest.accuracy + '%。')
  if (data.value.weakest && data.value.strongest && data.value.weakest.emotion !== data.value.strongest.emotion) {
    parts.push('相对容易看错的是「' + data.value.weakest.emotion + '」，可以对照下面的面部线索再观察一次。')
  }
  parts.push('情绪识别能力可以通过练习提升：日常交流中多留意对方的眉、眼、嘴三个部位的变化，并主动确认感受，比「猜」更可靠。')
  return parts.join('')
})

function renderChart() {
  if (!chartRef.value || !data.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const values = emotions.map((e) => data.value.emotionAccuracy?.[e] || 0)
  chart.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: emotions.map((e) => ({ name: e, max: 100 })),
      radius: '65%',
      center: ['50%', '55%'],
      splitArea: { areaStyle: { color: ['#f7fbf9', '#eef6f3'] } },
      axisName: { color: '#40525a', fontSize: 12 },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: values,
            name: '各情绪正确率',
            areaStyle: { color: 'rgba(31,138,112,0.25)' },
            lineStyle: { color: '#1F8A70', width: 2 },
            itemStyle: { color: '#1F8A70' },
          },
        ],
      },
    ],
  })
}

function handleComplete(e) {
  data.value = { ...e.detail, grade: e.detail.grade || gradeAccuracy(e.detail.accuracy) }
  MicroExpressionHardStorage.save({
    mode: 'hard',
    results: e.detail.results,
    totalRounds: e.detail.totalRounds,
    correctCount: e.detail.correctCount,
    accuracy: e.detail.accuracy,
    avgDuration: e.detail.avgDuration,
    emotionAccuracy: e.detail.emotionAccuracy,
    confusion: e.detail.confusion,
  })
  nextTick(renderChart)
}

function retry() {
  data.value = null
  gameKey.value += 1
}

watch(data, () => nextTick(renderChart))

onMounted(() => {
  off = onGameResult(GAME_EVENTS.EXPRESSION_HARD, handleComplete)
})

onUnmounted(() => {
  if (off) off()
  if (chart) chart.dispose()
})
</script>

<style scoped>
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.tips-title {
  margin-top: 24px;
}

.tips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.tip-card {
  padding: 12px 14px;
  border-radius: var(--mh-radius-sm);
  background: var(--mh-surface-2);
  border: 1px solid var(--mh-line);
}

.tip-card strong {
  font-size: 14px;
}

.tip-card p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--mh-ink-2);
}

.confusion {
  margin: 10px 0 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.9;
  color: #8a5416;
}
</style>
