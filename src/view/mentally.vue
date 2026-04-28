<!-- src\view\mentally.vue -->
<template>
  <div
   class="mentally-page">
    <div class="bg-wrapper"></div>

    <div class="page-container">
      <div class="page-header">
        <router-link to="/home" class="back-btn">
          <el-button type="default" size="small">
            <el-icon><ArrowLeft /></el-icon> 返回首页
          </el-button>
        </router-link>
        <h1 class="page-title">5·25 心理健康月活动总览</h1>
      </div>

      <div class="intro-box">
        <p>
          5·25 大学生心理健康月以“关爱自我、悦纳成长”为主题，
          通过<strong>以德育心、以智慧心、以体强心、以美润心、以劳健心</strong>五大系列活动，
          帮助学生在游戏、体验、创作与互动中获得积极心理成长。
        </p>
      </div>

      <el-tabs v-model="activeTab" type="border-card" class="main-tabs" scrollable>
        <!-- 1. 以德育心系列 -->
        <el-tab-pane label="以德育心系列" name="moral">
          <el-card class="activity-card">
            <template #header>
              <span>心灵寄语展</span>
            </template>
            <p><strong>时间：</strong>5月6日—5月25日</p>
            <p><strong>地点：</strong>教学楼、食堂</p>
            <p><strong>内容：</strong>面向教职工征集暖心寄语，制作成吊牌、展板在校园主要区域展示，传递温暖关怀，搭建师生情感桥梁。</p>
          </el-card>

          <el-card class="activity-card">
            <template #header>
              <span>综合心理作品征集</span>
            </template>
            <p><strong>时间：</strong>4月26日—5月15日</p>
            <p><strong>地点：</strong>信息楼204</p>
            <p><strong>内容：</strong>征集AI绘画、手工、书法、手抄报等心理主题作品，举办校园心理艺术展，以艺术表达促进心理健康。</p>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="以智慧心系列" name="wisdom">
          <el-card class="activity-card">
            <template #header>
              <span>马赛克填色展</span>
            </template>
            <p><strong>时间：</strong>5月13日</p>
            <p><strong>地点：</strong>校园广场</p>
            <p><strong>内容：</strong>大型马赛克墙供学生集体填色，围绕成长、陪伴、突破、接纳等主题，在创作中凝聚正向力量。</p>
          </el-card>

          <el-card class="activity-card">
            <template #header>
              <span>21天校景幸福打卡</span>
            </template>
            <p><strong>时间：</strong>4月20日—5月15日</p>
            <p><strong>地点：</strong>线上+线下</p>
            <p><strong>内容：</strong>定制校园文创明信片，21天记录幸福小事，培养积极心态，增强校园归属感。</p>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="以体强心系列" name="body">
          <el-card class="activity-card">
            <template #header>
              <span>京东校园趣味运动会</span>
            </template>
            <p><strong>时间：</strong>5月14日</p>
            <p><strong>地点：</strong>五月花广场</p>
            <p><strong>内容：</strong>联合京东校园开展趣味运动、减压游戏，让学生在运动中释放压力、放松身心、增强心理韧性。</p>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="以美润心系列" name="beauty">
          <el-card class="activity-card">
            <template #header>
              <span>彩虹心愿瓶手作工坊</span>
            </template>
            <p><strong>时间：</strong>5月14日—5月16日</p>
            <p><strong>地点：</strong>五月花广场</p>
            <p><strong>内容：</strong>学生制作心愿瓶，写下期许与祝福，在手工创作中舒缓情绪、寄托希望。</p>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="以劳健心系列" name="labor">
          <el-card class="activity-card">
            <template #header>
              <span>绿植种植打卡启动</span>
            </template>
            <p><strong>时间：</strong>5月7日</p>
            <p><strong>地点：</strong>天和广场</p>
            <p><strong>内容：</strong>发放绿植种子，学生种植并记录成长，在劳动中培养耐心、责任心，舒缓焦虑情绪。</p>
          </el-card>

          <el-card class="activity-card">
            <template #header>
              <span>教职工风铃团辅</span>
            </template>
            <p><strong>时间：</strong>5月14日</p>
            <p><strong>地点：</strong>团体辅导室</p>
            <p><strong>内容：</strong>面向教师开展手工团辅，释放工作压力，舒缓情绪，提升职业幸福感。</p>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="闭幕式暨5·25总结" name="finish">
          <el-card class="activity-card">
            <template #header>
              <span>心理情景剧校级决赛暨5·25闭幕式</span>
            </template>
            <p><strong>时间：</strong>5月21日</p>
            <p><strong>地点：</strong>求实楼报告厅</p>
            <p><strong>内容：</strong>汇集各学院优秀心理情景剧作品进行校级展演，完成5·25心理健康月总结与成果展示。</p>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import bgImg from '../assets/images/load/bg.png'

const activeTab = ref('moral')
</script>

<style scoped>
.mentally-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.mentally-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('../assets/images/load/bg.png') center top / cover fixed;
  opacity: 0.12;
  z-index: 0;
}

.page-container {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.back-btn {
  flex-shrink: 0;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.intro-box {
  background: #fff;
  padding: 18px 22px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  line-height: 1.7;
  color: #444;
  overflow: hidden;
  border: 1px solid #ebeef5;
  box-sizing: border-box;
}
.intro-box strong {
  color: #409eff;
}

.main-tabs {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

:deep(.el-tabs__header) {
  background: #f8f9fa;
  margin: 0;
}
:deep(.el-tabs__nav) {
  flex-wrap: nowrap !important;
}
:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  padding: 0 15px;
}

:deep(.el-tab-pane) {
  padding: 20px;
}

.activity-card {
  margin-bottom: 12px;
  border-radius: 12px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

:deep(.el-card__body) {
  padding: 14px 16px;
  color: #555;
  line-height: 1.7;
}

:deep(.el-card__body p) {
  margin: 6px 0;
}

@media (max-width: 768px) {
  .page-container {
    width: 100%;
    padding: 15px;
    padding: 15px 16px;
  }
  .page-title {
    font-size: 18px;
  }
  :deep(.el-tab-pane) {
    padding: 10px;
  }
  :deep(.el-tabs__item) {
    padding: 0 12px;
    font-size: 13px;
  }
}
</style>