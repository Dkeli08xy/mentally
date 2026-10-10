<template>
  <!-- src/view/game/Memory_S.vue · 基础记忆保持：挑战 + 衰减曲线解读 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="记忆保持挑战 · 基础模式" subtitle="6 组词对 · 10 秒识记" back-to="/game" back-label="返回游戏主页" />

      <Game :key="gameKey" />

      <section v-if="showResult" class="mh-card">
        <h2 class="mh-section-title">本次成绩</h2>

        <div class="mh-stats">
          <div v-for="(rate, i) in data.rates" :key="i" class="mh-stat">
            <span class="mh-stat__label">{{ delayLabels[i] }}后正确率</span>
            <span class="mh-stat__value">{{ rate }}<span class="mh-stat__unit">%</span></span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">时间档</span>
            <span class="mh-stat__value">{{ data.presetLabel || '标准版' }}</span>
            <span class="mh-stat__hint">{{ delayText }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">遗忘速率 k</span>
            <span class="mh-stat__value">{{ data.kValue }}</span>
            <span class="mh-stat__hint">{{ data.level }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">半衰期 t½</span>
            <span class="mh-stat__value">{{ data.halflife }}<span class="mh-stat__unit">s</span></span>
            <span class="mh-stat__hint">保持率降到一半的时间</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">拟合优度 R²</span>
            <span class="mh-stat__value">{{ data.r2 }}</span>
            <span class="mh-stat__hint">越接近 1 越贴合指数衰减</span>
          </div>
        </div>

        <div ref="chartRef" class="mh-chart"></div>

        <div class="mh-conclusion">
          <p class="mh-conclusion__headline">解读：{{ data.level }}</p>
          <p class="mh-text">{{ data.advice }}</p>
          <p v-if="data.note" class="mh-text mh-muted">{{ data.note }}</p>
          <p class="mh-text">
            模型预测：若不再复习，约 30 秒后保持率约 {{ predicted(30) }}%，60 秒后约 {{ predicted(60) }}%。
            这也解释了为什么「刚背完就复习」效果有限，而在即将遗忘时复习最省力。
          </p>
        </div>

        <div class="actions">
          <button class="mh-btn mh-btn--primary" @click="retry">再测一次</button>
          <router-link to="/MC" class="mh-btn mh-btn--ghost">成绩分布对比</router-link>
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
import Game from '../../components/memory/simple.vue'
import PageHead from '../../components/common/PageHead.vue'
import { EVENT } from '../../config/event'
import { GAME_EVENTS, onGameResult } from '../../utils/events'
import { MemoryDecayEasyStorage } from '../../utils/localStorage'
import { curveSeries } from '../../utils/analysis'
import { FALLBACK_DELAYS, formatDelay } from '../../config/memory'

const chartRef = ref(null)
let chart = null
let off = null

const gameKey = ref(0)
const data = ref(null)
const delaysUsed = computed(() => data.value?.delays || FALLBACK_DELAYS)
const delayLabels = computed(() => delaysUsed.value.map(formatDelay))
const delayText = computed(() => delayLabels.value.join(' / '))
const showResult = computed(() => !!data.value)

const predicted = (t) => {
  const hit = (data.value?.predicted || []).find((p) => p.t === t)
  return hit ? hit.rate : '--'
}

function renderChart() {
  if (!chartRef.value || !data.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const delays = delaysUsed.value
  const tMax = Math.max(...delays, 60)
  const step = tMax > 120 ? 5 : 2
  const curve = curveSeries(data.value.kValue || 60, data.value.rates?.[0] || 100, tMax, step)
  const measured = (data.value.rates || []).map((rate, i) => [delays[i], rate])

  chart.setOption({
    grid: { left: 54, right: 24, top: 52, bottom: 40 },
    legend: { data: ['拟合曲线', '实测保留率'], top: 8, textStyle: { color: '#6B7C82' } },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        if (!p) return ''
        return '时间：' + p.data[0] + ' s<br/>' + p.seriesName + '：' + p.data[1] + '%'
      },
    },
    xAxis: {
      type: 'value',
      name: '时间(秒)',
      min: 0,
      max: tMax,
      interval: tMax / 4,
      axisLabel: { formatter: '{value}s' },
    },
    yAxis: { type: 'value', name: '保留率 %', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: '拟合曲线',
        type: 'line',
        data: curve,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#3E7CB1' },
        areaStyle: { color: 'rgba(62,124,177,0.12)' },
      },
      {
        name: '实测保留率',
        type: 'line',
        data: measured,
        symbolSize: 12,
        lineStyle: { width: 2, type: 'dashed', color: '#F2A65A' },
        itemStyle: { color: '#F2A65A' },
        label: { show: true, formatter: '{c}%', position: 'top', fontSize: 11, color: '#8a5416' },
      },
    ],
  })
}

function handleComplete(e) {
  data.value = e.detail
  MemoryDecayEasyStorage.save({
    mode: 'easy',
    pairCount: e.detail.pairCount,
    memorizeSeconds: e.detail.memorizeSeconds,
    delays: e.detail.delays,
    presetKey: e.detail.presetKey,
    presetLabel: e.detail.presetLabel,
    rates: e.detail.rates,
    kValue: e.detail.kValue,
    r2: e.detail.r2,
    halflife: e.detail.halflife,
    level: e.detail.level,
    advice: e.detail.advice,
    points: e.detail.points,
  })
  nextTick(renderChart)
}

function retry() {
  data.value = null
  gameKey.value += 1
}

watch(data, () => nextTick(renderChart))

onMounted(() => {
  off = onGameResult(GAME_EVENTS.MEMORY_EASY, handleComplete)
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
