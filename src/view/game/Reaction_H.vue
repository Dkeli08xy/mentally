<template>
  <!-- src/view/game/Reaction_H.vue · 进阶反应（舒尔特方格）：挑战 + 成绩解读 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="反应速度挑战 · 进阶模式" subtitle="5×5 舒尔特方格 · 3 轮" back-to="/game" back-label="返回游戏主页" />

      <Game :key="gameKey" />

      <section v-if="showResult" class="mh-card">
        <h2 class="mh-section-title">本次成绩</h2>

        <div class="mh-stats">
          <div class="mh-stat">
            <span class="mh-stat__label">平均完成</span>
            <span class="mh-stat__value">{{ seconds(data.averageTime) }}<span class="mh-stat__unit">s</span></span>
            <span class="mh-stat__hint">{{ data.grade?.text }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">最快</span>
            <span class="mh-stat__value">{{ seconds(data.bestTime) }}<span class="mh-stat__unit">s</span></span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">最慢</span>
            <span class="mh-stat__value">{{ seconds(data.worstTime) }}<span class="mh-stat__unit">s</span></span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">波动（标准差）</span>
            <span class="mh-stat__value">{{ (data.sd / 1000).toFixed(2) }}<span class="mh-stat__unit">s</span></span>
            <span class="mh-stat__hint">{{ data.stability }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">点错次数</span>
            <span class="mh-stat__value mh-stat__value--accent">{{ data.totalErrors }}<span class="mh-stat__unit">次</span></span>
          </div>
        </div>

        <div ref="chartRef" class="mh-chart"></div>

        <div class="mh-conclusion">
          <p class="mh-conclusion__headline">解读：{{ data.grade?.text }}</p>
          <p class="mh-text">{{ reading }}</p>
        </div>

        <div class="actions">
          <button class="mh-btn mh-btn--primary" @click="retry">再测一次</button>
          <router-link to="/RC" class="mh-btn mh-btn--ghost">成绩分布对比</router-link>
          <router-link to="/home" class="mh-btn mh-btn--ghost">返回首页</router-link>
        </div>
      </section>

      <section class="mh-statement">
        <h4>说明</h4>
        <p v-for="(line, i) in EVENT.statement" :key="i">{{ i + 1 }}. {{ line }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '../../utils/echarts'
import Game from '../../components/Reaction/hard.vue'
import PageHead from '../../components/common/PageHead.vue'
import { EVENT } from '../../config/event'
import { GAME_EVENTS, onGameResult } from '../../utils/events'
import { ReactionTimeHardStorage } from '../../utils/localStorage'
import { gradeSchulte } from '../../utils/analysis'

const chartRef = ref(null)
let chart = null
let off = null

const gameKey = ref(0)
const data = ref(null)
const showResult = computed(() => !!data.value)

const seconds = (ms) => (ms ? (ms / 1000).toFixed(2) : '--')

const reading = computed(() => {
  if (!data.value) return ''
  const cv = data.value.cv || 0
  const errors = data.value.totalErrors || 0
  const parts = []
  parts.push(
    cv <= 0.15
      ? '三轮用时接近，搜索策略比较稳定。'
      : '三轮用时存在波动，注意搜索节奏是否被外界打断。'
  )
  parts.push(
    errors > 0
      ? '共点错 ' + errors + ' 次，点错多出现在数字相邻区域，可以尝试「分区扫视 + 手指或视线引导」来减少误点。'
      : '全程没有点错，说明目标定位与抑制干扰的能力保持得不错。'
  )
  parts.push('舒尔特方格主要反映视觉搜索效率与注意的稳定性，练习本身也能提升注意控制，可以每天练习 1 到 2 次。')
  return parts.join('')
})

function renderChart() {
  if (!chartRef.value || !data.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const results = data.value.results || []
  const xData = results.map((i) => '第' + i.round + '轮')
  chart.setOption({
    grid: { left: 52, right: 20, top: 40, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const item = results[params[0].dataIndex]
        if (!item) return ''
        return xData[params[0].dataIndex] + '<br/>用时：' + (item.reactionTime / 1000).toFixed(2) + ' s<br/>点错：' + item.errors + ' 次'
      },
    },
    xAxis: { type: 'category', data: xData, name: '轮次' },
    yAxis: { type: 'value', name: 's', scale: true },
    series: [
      {
        name: '完成用时',
        type: 'line',
        data: results.map((i) => (i.reactionTime / 1000).toFixed(2)),
        smooth: true,
        symbolSize: 9,
        lineStyle: { width: 3, color: '#1F8A70' },
        itemStyle: { color: '#1F8A70' },
        areaStyle: { color: 'rgba(31,138,112,0.12)' },
        markLine: {
          silent: true,
          symbol: 'none',
          label: { formatter: '平均 {c} s', color: '#6B7C82', fontSize: 11 },
          lineStyle: { type: 'dashed', color: '#F2A65A' },
          data: [{ yAxis: (data.value.averageTime / 1000).toFixed(2) }],
        },
      },
    ],
  })
}

function handleComplete(e) {
  data.value = { ...e.detail, grade: e.detail.grade || gradeSchulte(e.detail.averageTime / 1000) }
  ReactionTimeHardStorage.save({
    mode: 'hard',
    average: e.detail.averageTime,
    roundTimes: e.detail.results.map((r) => r.reactionTime),
    sd: e.detail.sd,
    cv: e.detail.cv,
    totalErrors: e.detail.totalErrors,
    results: e.detail.results,
  })
  nextTick(renderChart)
}

function retry() {
  data.value = null
  gameKey.value += 1
}

watch(data, () => nextTick(renderChart))

onMounted(() => {
  off = onGameResult(GAME_EVENTS.REACTION_HARD, handleComplete)
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
</style>
