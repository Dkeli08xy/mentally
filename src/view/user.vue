<!-- src\view\user.vue -->
<template>
  <div class="game-page-wrapper">
  <div class="history-container">
    <div class="header-bar">
      <router-link to="/home">
        <el-button type="default" size="small" icon="el-icon-arrow-left">返回首页</el-button>
      </router-link>
      <h1 class="page-title">心理测试历史记录</h1>
      <el-button 
        type="warning" 
        size="small" 
        icon="el-icon-delete"
        @click="handleClearAll"
      >
      一键清空所有测试记录
      </el-button>
    </div>

    <el-tabs v-model="activeTab" type="border-card" class="game-tabs">
      <!-- 简单反应时 -->
      <el-tab-pane label="简单反应时" name="reactionEasy">
        <div class="tab-content">
          <div v-if="reactionEasyList.length === 0" class="empty-data">
            <el-empty description="暂无测试数据" />
          </div>
          <el-table v-else :data="reactionEasyList" stripe style="width: 100%">
            <el-table-column prop="createTime" label="测试时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="handleDelete(row.id, 'reactionEasy')">删除</el-button>
                <el-button type="primary" size="small" @click="handleView(row.id, 'reactionEasy')">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 困难反应时 -->
      <el-tab-pane label="困难反应时" name="reactionHard">
        <div class="tab-content">
          <div v-if="reactionHardList.length === 0" class="empty-data">
            <el-empty description="暂无测试数据" />
          </div>
          <el-table v-else :data="reactionHardList" stripe style="width: 100%">
            <el-table-column prop="createTime" label="测试时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="handleDelete(row.id, 'reactionHard')">删除</el-button>
                <el-button type="primary" size="small" @click="handleView(row.id, 'reactionHard')">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 简单记忆衰减 -->
      <el-tab-pane label="简单记忆衰减" name="memoryEasy">
        <div class="tab-content">
          <div v-if="memoryEasyList.length === 0" class="empty-data">
            <el-empty description="暂无测试数据" />
          </div>
          <el-table v-else :data="memoryEasyList" stripe style="width: 100%">
            <el-table-column prop="createTime" label="测试时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="handleDelete(row.id, 'memoryEasy')">删除</el-button>
                <el-button type="primary" size="small" @click="handleView(row.id, 'memoryEasy')">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 困难记忆衰减 -->
      <el-tab-pane label="困难记忆衰减" name="memoryHard">
        <div class="tab-content">
          <div v-if="memoryHardList.length === 0" class="empty-data">
            <el-empty description="暂无测试数据" />
          </div>
          <el-table v-else :data="memoryHardList" stripe style="width: 100%">
            <el-table-column prop="createTime" label="测试时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="handleDelete(row.id, 'memoryHard')">删除</el-button>
                <el-button type="primary" size="small" @click="handleView(row.id, 'memoryHard')">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 简单微表情判断 -->
      <el-tab-pane label="简单微表情判断" name="microEasy">
        <div class="tab-content">
          <div v-if="microEasyList.length === 0" class="empty-data">
            <el-empty description="暂无测试数据" />
          </div>
          <el-table v-else :data="microEasyList" stripe style="width: 100%">
            <el-table-column prop="createTime" label="测试时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="handleDelete(row.id, 'microEasy')">删除</el-button>
                <el-button type="primary" size="small" @click="handleView(row.id, 'microEasy')">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 困难微表情判断 -->
      <el-tab-pane label="困难微表情判断" name="microHard">
        <div class="tab-content">
          <div v-if="microHardList.length === 0" class="empty-data">
            <el-empty description="暂无测试数据" />
          </div>
          <el-table v-else :data="microHardList" stripe style="width: 100%">
            <el-table-column prop="createTime" label="测试时间" min-width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="handleDelete(row.id, 'microHard')">删除</el-button>
                <el-button type="primary" size="small" @click="handleView(row.id, 'microHard')">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  ReactionTimeEasyStorage,
  ReactionTimeHardStorage,
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage
} from '../utils/localStorage'

const router = useRouter()

const activeTab = ref('reactionEasy')

const reactionEasyList = ref([])
const reactionHardList = ref([])
const memoryEasyList = ref([])
const memoryHardList = ref([])
const microEasyList = ref([])
const microHardList = ref([])

const storageMap = {
  reactionEasy: ReactionTimeEasyStorage,
  reactionHard: ReactionTimeHardStorage,
  memoryEasy: MemoryDecayEasyStorage,
  memoryHard: MemoryDecayHardStorage,
  microEasy: MicroExpressionEasyStorage,
  microHard: MicroExpressionHardStorage
}

const listMap = {
  reactionEasy: reactionEasyList,
  reactionHard: reactionHardList,
  memoryEasy: memoryEasyList,
  memoryHard: memoryHardList,
  microEasy: microEasyList,
  microHard: microHardList
}

const formatDateTime = (isoString) => {
  if (!isoString) return '--'
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadData = (type) => {
  const storage = storageMap[type]
  if (!storage) return
  const list = storage.getList()
  const sortedList = [...list].sort((a, b) => {
    return new Date(b.createTime) - new Date(a.createTime)
  })
  listMap[type].value = sortedList
}

const loadAllData = () => {
  loadData('reactionEasy')
  loadData('reactionHard')
  loadData('memoryEasy')
  loadData('memoryHard')
  loadData('microEasy')
  loadData('microHard')
}

const handleDelete = (id, type) => {
  ElMessageBox.confirm(
    '此操作将永久删除该测试记录, 是否继续?',
    '提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const storage = storageMap[type]
    if (!storage) return
    storage.removeById(id)
    loadData(type)
    ElMessage({
      type: 'success',
      message: '删除成功!'
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

const handleView = (id, type) => {
  let path = ''
  if (type.startsWith('reaction')) {
    path = '/RSC'
  } else if (type.startsWith('memory')) {
    path = '/MSC'
  } else if (type.startsWith('micro')) {
    path = '/EEC'
  }

  router.push({
    path: path,
    query: {
      recordId: id,
      type: type
    }
  })
}

const handleClearAll = () => {
  ElMessageBox.confirm(
    '此操作将永久清空【所有】心理测试历史记录，无法恢复，是否继续？',
    '危险操作确认',
    {
      confirmButtonText: '确认清空',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    ReactionTimeEasyStorage.clear()
    ReactionTimeHardStorage.clear()
    MemoryDecayEasyStorage.clear()
    MemoryDecayHardStorage.clear()
    MicroExpressionEasyStorage.clear()
    MicroExpressionHardStorage.clear()
    
    loadAllData()
    
    ElMessage({
      type: 'success',
      message: '所有测试数据已清空！'
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消清空操作'
    })
  })
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.game-page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url("../assets/images/load/user_user.png") no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  z-index: -1; 
}
.history-container {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  height: calc(100vh - 32px);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
}

.header-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 0;
}

.page-title {
  flex: 1;
  text-align: center;
  margin: 0;
  color: #2c3e50;
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 600;
  white-space: nowrap;
}

.game-tabs {
  min-height: calc(100vh - 180px);
  border-radius: 10px;
  overflow: hidden;
  background: transparent !important;
}

.tab-content {
  padding: 12px 0;
}
.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 20px;
}

:deep(.el-table) {
  font-size: 14px;
  --el-table-row-hover-bg-color: rgba(255,255,255,0.2);
  background: transparent !important;
}
:deep(.el-table tr),
:deep(.el-table td),
:deep(.el-table th) {
  background: transparent !important;
}

:deep(.el-tabs--border-card) {
  border: none;
  border-radius: 10px;
  box-shadow: none;
  background: transparent !important;
}

:deep(.el-tabs__header) {
  background-color: transparent !important;
  border-radius: 10px 10px 0 0;
  margin: 0;
  border-bottom: 1px solid #eee;
}

:deep(.el-tabs__nav-wrap) {
  overflow-x: auto;
  padding: 0 8px;
}
:deep(.el-tabs__nav) {
  flex-wrap: wrap;
}

:deep(.el-tabs__item) {
  font-size: clamp(13px, 2vw, 14px);
  font-weight: 500;
  padding: 0 16px;
  height: 44px;
  line-height: 44px;
  white-space: nowrap;
  background: transparent !important;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .history-container {
    width: 100%;
    padding: 12px 8px;
  }

  .header-bar {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .page-title {
    order: -1;
    width: 100%;
    margin-bottom: 8px;
  }

  :deep(.el-table .el-button + .el-button) {
    margin-left: 6px;
  }
}

@media (max-width: 480px) {
  :deep(.el-tabs__item) {
    padding: 0 10px;
    font-size: 12px;
  }
  
  .empty-data {
    min-height: 220px;
  }
}
</style>