<!-- src/view/gametext.vue -->
<template>
  <div class="game-page-wrapper">
    <h1 class="page-title">游戏</h1>
  <div class="game-container">
    
    <router-link to="/home">
      <div style="position: fixed; top: 20px; left: 20px; background:#9ca3af; color:#fff; padding:8px 16px; border-radius:10px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.1); z-index:99;">返回</div>
    </router-link>
    
    <div class="game-box">
      <div class="title"><img src="../assets/images/game/反应.webp" alt="反应测试"/></div>
      <div class="btn-grid">
        <router-link to="/R_S">简单</router-link>
        <router-link to="/R_H">困难</router-link>
        <router-link to="/RM">关于反应时挑战</router-link>
        <button @click="checkReaction">总数据图</button>
      </div>
    </div>

    <div class="game-box">
      <div class="title"><img src="../assets/images/game/记忆.webp" alt="记忆测试"/></div>
      <div class="btn-grid">
        <router-link to="/M_S">简单</router-link>
        <router-link to="/M_H">困难</router-link>
        <router-link to="/MM">关于衰减曲线</router-link>
        <button @click="checkMemory">总数据图</button>
      </div>
    </div>

    <div class="game-box">
      <div class="title"><img src="../assets/images/game/表情.webp" alt="表情识别"/></div>
      <div class="btn-grid">
        <router-link to="/E_S">简单</router-link>
        <router-link to="/E_H">困难</router-link>
        <router-link to="/EM">关于微表情</router-link>
        <button @click="checkExpression">总数据图</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  ReactionTimeEasyStorage,
  ReactionTimeHardStorage,
  MemoryDecayEasyStorage,
  MemoryDecayHardStorage,
  MicroExpressionEasyStorage,
  MicroExpressionHardStorage
} from '../utils/localStorage'

const router = useRouter()

const checkReaction = () => {
  const e = ReactionTimeEasyStorage.getList()
  const h = ReactionTimeHardStorage.getList()
  e.length + h.length > 0 ? router.push('/RC') : ElMessage.warning('没有你的测试数据')
}

const checkMemory = () => {
  const e = MemoryDecayEasyStorage.getList()
  const h = MemoryDecayHardStorage.getList()
  e.length + h.length > 0 ? router.push('/MC') : ElMessage.warning('没有你的测试数据')
}

const checkExpression = () => {
  const e = MicroExpressionEasyStorage.getList()
  const h = MicroExpressionHardStorage.getList()
  e.length + h.length > 0 ? router.push('/EC') : ElMessage.warning('没有你的测试数据')
}
</script>

<style scoped>
.game-page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url("../assets/images/game/game_BJ.png") no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  z-index: -1; 
  overflow-y: auto;
}

.game-container {
  max-width: 1100px;
  margin: 60px auto;
  padding: 0 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}

.game-box {
  width: 100%;
  max-width: 280px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 22px;
  text-align: center;
}

.title img {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: block;
  margin: 0 auto;
}

.title img:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.btn-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}
.btn-grid a,
.btn-grid button {
  width: 100%;
  padding: 12px 0;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  text-align: center;
  text-decoration: none;
  color: #fff;
  background-color: #6b8bd9;
  cursor: pointer;
  transition: 0.2s;
}

.btn-grid a:hover {
  background-color: #5a78c2;
}

.btn-grid button {
  background-color: #52b7b3;
}

.page-title {
  display: block;
  margin: 20px auto 40px;
  text-align: center;
  color: #fff;
  font-size: clamp(32px, 8vw, 55px);
  font-weight: 700;
  padding: clamp(20px, 5vw, 60px) clamp(30px, 10vw, 180px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: 4px;
  width: fit-content;
  
  background-image: url(../assets/images/home/game_log.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.btn-grid button:hover {
  background-color: #439c99;
}

@media (max-width: 768px) {
  .game-container {
    padding: 0 15px;
  }
  .title img {
    max-width: 160px;
  }
}
</style>