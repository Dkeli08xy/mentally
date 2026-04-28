<!-- src\view\Home.vue -->
<template>
  <div class="game-page-wrapper">
    <div class="home-container">
      <div class="menu-grid">
        <router-link to="/men" class="menu-card1" >
          <div class="menu-text">525&nbsp;&nbsp;介绍</div>
        </router-link>

        <router-link to="/game" class="menu-card2">
          <div class="menu-text">游&nbsp;&nbsp;戏</div>
        </router-link>

        <router-link to="/user" class="menu-card3">
          <div class="menu-text">用&nbsp;&nbsp;户</div>
        </router-link>
      </div>
    </div>
    <!-- 新增：底部居中声明 -->
    <div class="notice-wrap">
      <p>1.本活动为科普趣味体验，不做任何心理诊断与临床评估。</p>
      <p>2.全程匿名参与，不收集真实姓名、学号等敏感信息。</p>
      <p>数据仅用于历史查看与科普分析，支持自主删除记录。</p>
    </div>
  </div>
</template>

<style scoped>
.game-page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url("../assets/images/home/BJ2.png") no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  z-index: -1; 
}

.home-container {
  min-height: 100vh;
  width: 100%;
  padding: 40px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px; 
  padding: 0 20px; 
  box-sizing: border-box;
}

.menu-card1,
.menu-card2,
.menu-card3 {
  height: 250px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  font-size: 20px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-card1 {
  background: rgba(255, 255, 255, 0.5) !important;
  text-align: center;
  font-size: 50px;
  color: #079de2;
}
.menu-card2 {
  background: rgba(255, 255, 255, 0.5) !important;
  text-align: center;
  font-size: 50px;
  color: #079de2;
}
.menu-card3 {
  background: rgba(255, 255, 255, 0.5) !important;
  text-align: center;
  font-size: 50px;
  color: #079de2;
}

.menu-card1:hover,
.menu-card3:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
  background-color: #409eff;
  color: #fff;
}
.menu-card2:hover {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-3px) rotate(-1deg); }
  50% { transform: translateX(3px) rotate(1deg); }
  75% { transform: translateX(-3px) rotate(-1deg); }
  100% { transform: translateX(0); }
}

.notice-wrap {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  line-height: 1.8;
  background: rgba(0,0,0,0.25);
  padding: 12px 20px;
  border-radius: 8px;
}
.notice-wrap p {
  margin: 4px 0;
}

@media (max-width: 600px) {
  .menu-card1,
  .menu-card2,
  .menu-card3 {
    height: 150px;
    font-size: 18px;
  }
  .menu-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }
  .notice-wrap {
    font-size: 12px;
    bottom: 20px;
  }
}
@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr); 
    gap: 10px;
    padding: 0 10px;
    grid-template-columns: 1fr;
  }
  .menu-card1,
  .menu-card2,
  .menu-card3 {
    height: 120px;
    font-size: 16px;
  }
}
</style>