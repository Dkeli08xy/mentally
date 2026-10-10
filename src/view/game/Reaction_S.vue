<template>
  <!-- src/view/game/Reaction_S.vue · 基础反应时：挑战 + 成绩解读 -->
  <div class="mh-page">
    <div class="mh-shell mh-shell--narrow">
      <PageHead title="反应速度挑战 · 基础模式" subtitle="绿点反应 · 5 轮" back-to="/game" back-label="返回游戏主页" />

      <Game :key="gameKey" />

      <section v-if="showResult" class="mh-card">
        <h2 class="mh-section-title">本次成绩</h2>

        <div class="mh-stats">
          <div class="mh-stat">
            <span class="mh-stat__label">平均反应时</span>
            <span class="mh-stat__value">{{ data.averageTime }}<span class="mh-stat__unit">ms</span></span>
            <span class="mh-stat__hint">{{ data.grade?.text }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">最快</span>
            <span class="mh-stat__value">{{ data.minTime }}<span class="mh-stat__unit">ms</span></span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">最慢</span>
            <span class="mh-stat__value">{{ data.maxTime }}<span class="mh-stat__unit">ms</span></span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">波动（标准差）</span>
            <span class="mh-stat__value">{{ data.sd }}<span class="mh-stat__unit">ms</span></span>
            <span class="mh-stat__hint">{{ data.stability }}</span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">抢按</span>
            <span class="mh-stat__value mh-stat__value--accent">{{ data.anticipations }}<span class="mh-stat__unit">次</span></span>
          </div>
          <div class="mh-stat">
            <span class="mh-stat__label">未反应</span>
            <span class="mh-stat__value mh-stat__value--accent">{{ data.timeouts }}<span class="mh-stat__unit">次</span></span>
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
import Game from '../../components/Reaction/simple.vue'
import PageHead from '../../components/common/PageHead.vue'
import { EVENT } from '../../config/event'
import { GAME_EVENTS, onGameResult } from '../../utils/events'
import { ReactionTimeEasyStorage } from '../../utils/localStorage'
import { gradeReactionTime } from '../../utils/analysis'

const chartRef = ref(null)
let chart = null
let off = null

const gameKey = ref(0)
const data = ref(null)
const showResult = computed(() => !!data.value)

/** 结论文案：把指标翻译成可理解、可行动的说明 */
const reading = computed(() => {
  if (!data.value) return ''
  const cv = data.value.cv || 0
  const parts = []
  parts.push(
    cv <= 0.15
      ? '几轮成绩很接近，说明注意保持得比较稳定。'
      : cv <= 0.3
        ? '几轮成绩有一定起伏，属于常见范围，通常与注意力短暂漂移有关。'
        : '几轮之间差异较大，可能受疲劳、环境干扰或操作节奏影响，休息后再测一次对比会更准确。'
  )
  if (data.value.anticipations > 0) parts.push('出现抢按说明预期判断偏早，等刺激真正出现再反应，成绩会更真实。')
  if (data.value.timeouts > 0) parts.push('有未反应的轮次，若屏幕延迟或设备卡顿也可能造成，可作为参考而非绝对水平。')
  parts.push('单次成绩受状态影响明显，建议在同一天内测 2 到 3 次，取平均更有参考价值。')
  return parts.join('')
})

function renderChart() {
  if (!chartRef.value || !data.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const results = data.value.results || []
  const xData = results.map((i) => '第' + i.round + '轮')
  const series = results.map((i) => (i.isValid ? i.reactionTime : null))

  chart.setOption({
    grid: { left: 48, right: 20, top: 40, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        const item = results[p.dataIndex]
        if (!item) return ''
        if (item.timeout) return xData[p.dataIndex] + '<br/>未反应（超过作答窗口）'
        return xData[p.dataIndex] + '<br/>反应时：' + item.reactionTime + ' ms'
      },
    },
    xAxis: { type: 'category', data: xData, name: '轮次' },
    yAxis: { type: 'value', name: 'ms', scale: true },
    series: [
      {
        name: '反应时',
        type: 'line',
        data: series,
        smooth: true,
        connectNulls: true,
        symbolSize: 9,
        lineStyle: { width: 3, color: '#1F8A70' },
        itemStyle: { color: '#1F8A70' },
        areaStyle: { color: 'rgba(31,138,112,0.12)' },
        markLine: {
          silent: true,
          symbol: 'none',
          label: { formatter: '平均 {c} ms', color: '#6B7C82', fontSize: 11 },
          lineStyle: { type: 'dashed', color: '#F2A65A' },
          data: [{ yAxis: data.value.averageTime }],
        },
      },
    ],
  })
}

function handleComplete(e) {
  const detail = { ...e.detail, grade: e.detail.grade || gradeReactionTime(e.detail.averageTime) }
  data.value = detail
  ReactionTimeEasyStorage.save({
    mode: 'easy',
    average: detail.averageTime,
    roundTimes: detail.results.map((r) => r.reactionTime).filter((t) => typeof t === 'number'),
    sd: detail.sd,
    cv: detail.cv,
    timeouts: detail.timeouts,
    anticipations: detail.anticipations,
    results: detail.results,
  })
  nextTick(renderChart)
}

function retry() {
  data.value = null
  gameKey.value += 1
}

watch(data, () => nextTick(renderChart))

onMounted(() => {
  off = onGameResult(GAME_EVENTS.REACTION_EASY, handleComplete)
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
