<template>
  <!-- src/view/user.vue · 我的记录 -->
  <div class="mh-page">
    <div class="mh-shell">
      <PageHead title="我的记录" subtitle="所有成绩仅保存在本机浏览器，不会上传" back-to="/home" back-label="返回首页">
        <el-button type="danger" plain @click="handleClearAll">清空全部记录</el-button>
      </PageHead>

      <div class="summary">
        <div class="mh-stat">
          <span class="mh-stat__label">记录总数</span>
          <span class="mh-stat__value">{{ total }}</span>
          <span class="mh-stat__hint">六类挑战合计</span>
        </div>
        <div v-for="game in GAMES" :key="game.key" class="mh-stat">
          <span class="mh-stat__label">{{ game.shortName }}</span>
          <span class="mh-stat__value">{{ gameCount(game.key) }}</span>
          <span class="mh-stat__hint">已完成测试次数</span>
        </div>
      </div>

      <el-tabs v-model="activeTab" type="border-card" class="tabs">
        <el-tab-pane v-for="item in RECORD_TYPES" :key="item.type" :label="item.label" :name="item.type">
          <div v-if="lists[item.type].length === 0" class="empty">
            <el-empty description="暂无测试数据">
              <router-link :to="gameRoute(item)" class="mh-btn mh-btn--primary mh-btn--sm">去完成一次测试</router-link>
            </el-empty>
          </div>

          <el-table v-else :data="lists[item.type]" stripe style="width: 100%">
            <el-table-column label="测试时间" min-width="170">
              <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="成绩摘要" min-width="220">
              <template #default="{ row }">
                <span class="summary-cell">{{ summaryOf(item.type, row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="170" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleView(row.id, item.type)">查看详情</el-button>
                <el-button type="danger" link @click="handleDelete(row.id, item.type)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <section class="mh-statement">
        <h4>关于数据</h4>
        <p>1. 每条记录包含成绩、指标与完成时间，保存在浏览器的 localStorage 中，键名前缀为「{{ EVENT.storagePrefix }}」。</p>
        <p>2. 清除浏览器数据、更换浏览器或使用无痕模式都会导致记录消失，这属于预期行为。</p>
        <p>3. 记录仅用于个人回看与科普分析，不构成任何心理评估结论。</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EVENT, GAMES, RECORD_TYPES } from '../config/event'
import PageHead from '../components/common/PageHead.vue'
import { STORAGE_BY_TYPE, clearAllRecords } from '../utils/localStorage'
import { formatDateTime, gradeForgetting, gradeReactionTime, gradeSchulte } from '../utils/analysis'

const router = useRouter()
const activeTab = ref('reactionEasy')

const lists = reactive(
  RECORD_TYPES.reduce((acc, item) => {
    acc[item.type] = []
    return acc
  }, {})
)

const total = computed(() => Object.values(lists).reduce((sum, list) => sum + list.length, 0))

const gameCount = (gameKey) =>
  RECORD_TYPES.filter((t) => t.game === gameKey).reduce((sum, t) => sum + lists[t.type].length, 0)

const loadData = (type) => {
  const store = STORAGE_BY_TYPE[type]
  if (!store) return
  lists[type] = store
    .getList()
    .slice()
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
}

const loadAllData = () => RECORD_TYPES.forEach((item) => loadData(item.type))

/** 每类挑战的摘要文案：用统一算法模块生成，避免各页面口径不一致 */
const summaryOf = (type, row) => {
  switch (type) {
    case 'reactionEasy': {
      const g = gradeReactionTime(row.average)
      return `平均 ${row.average ?? '--'} ms · ${g.text}`
    }
    case 'reactionHard': {
      const seconds = row.average ? row.average / 1000 : 0
      const g = gradeSchulte(seconds)
      const err = row.totalErrors ? ` · 点错 ${row.totalErrors} 次` : ''
      return `平均 ${seconds ? seconds.toFixed(2) : '--'} s · ${g.text}${err}`
    }
    case 'memoryEasy':
    case 'memoryHard': {
      const g = gradeForgetting(row.kValue || 0)
      return `k = ${row.kValue ?? '--'} · 2 分钟保持 ${row.rates?.[3] ?? '--'}% · ${g.text}`
    }
    case 'microEasy':
    case 'microHard': {
      return `正确率 ${row.accuracy ?? '--'}%（${row.correctCount ?? 0}/${row.totalRounds ?? 0}）`
    }
    default:
      return '--'
  }
}

const gameRoute = (item) => {
  const game = GAMES.find((g) => g.key === item.game)
  if (!game) return '/game'
  return item.mode === '简单' ? game.easy.route : game.hard.route
}

const handleDelete = (id, type) => {
  ElMessageBox.confirm('删除后无法恢复，确认删除这条记录吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      STORAGE_BY_TYPE[type].removeById(id)
      loadData(type)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

const handleView = (id, type) => {
  const game = RECORD_TYPES.find((t) => t.type === type)?.game
  const route = GAMES.find((g) => g.key === game)?.detailRoute
  if (!route) return
  router.push({ path: route, query: { recordId: id, type } })
}

const handleClearAll = () => {
  ElMessageBox.confirm('将清空全部挑战记录，且无法恢复，确认继续吗？', '危险操作', {
    confirmButtonText: '确认清空',
    cancelButtonText: '取消',
    type: 'error',
  })
    .then(() => {
      clearAllRecords()
      loadAllData()
      ElMessage.success('已清空全部记录')
    })
    .catch(() => {})
}

onMounted(loadAllData)
</script>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.tabs {
  border-radius: var(--mh-radius-sm);
  overflow: hidden;
}

.empty {
  padding: 20px 0;
}

.summary-cell {
  font-size: 13px;
  color: var(--mh-ink-2);
}

:deep(.el-tabs--border-card) {
  border-color: var(--mh-line);
  box-shadow: var(--mh-shadow-sm);
}

:deep(.el-tabs__header) {
  background-color: var(--mh-surface-2);
}

:deep(.el-tabs__item.is-active) {
  color: var(--mh-primary) !important;
  font-weight: 700;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--mh-surface-2);
  --el-table-row-hover-bg-color: #f2faf7;
}

@media (max-width: 768px) {
  :deep(.el-tabs__item) {
    padding: 0 12px;
    font-size: 13px;
  }
}
</style>
