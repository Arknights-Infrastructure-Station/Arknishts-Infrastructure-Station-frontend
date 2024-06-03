<script setup>
const props = defineProps({
  operatorsList: []
});

// 设置精英化阶段的方法
const setEliteStage = (operator, elite) => {
  operator.elite = elite;
  if (!operator.own) {
    operator.own = true;
  }
};

// 切换干员拥有状态的方法
const toggleOwnership = (operator) => {
  operator.own = !operator.own;
};

// 鼠标按下时高亮边框的方法
const highlightBorder = (event) => {
  event.target.closest('.operator-card').classList.add('mousedown');
};

// 重置边框颜色的方法
const resetBorderColor = (event) => {
  event.target.closest('.operator-card').classList.remove('mousedown');
};
</script>

<template>
  <el-backtop :right="100" :bottom="100" />
  <!-- 卡片阵列的外层容器 -->
  <el-card class="array-card">
    <!-- 卡片阵列 -->
    <transition-group
        class="operator-cards"
        name="fade-scaling"
        tag="div"
    >
      <!-- 循环遍历operatorsList数组，为每个干员创建一个卡片 -->
      <el-card
          v-for="(operator,index) in operatorsList"
          :key="operator.charId"
          :class="{ owned: operator.own }"
          class="operator-card"
          shadow="hover"
          @mousedown.native="highlightBorder"
          @mouseup.native="resetBorderColor"
          @mouseleave.native="resetBorderColor"
          @click.native="toggleOwnership(operator)"
      >
        <!-- 卡片内容 -->
        <!-- 干员稀有度显示 -->
        <div class="rarity">
          <span v-for="star in operator.rarity" :key="star" class="star">&#9733;</span>
        </div>
        <!-- 干员头像显示 -->
        <div :class="`bg-${operator.charId}`" class="operator-image"/>
        <!-- 干员名称显示 -->
        <div class="operator-name">
          {{ operator.name }}
        </div>
        <!-- 干员精英等级显示 -->
        <div class="operator-elite">
          <el-text :class="`elite-state${operator.elite}`" tag="sub">{{ "精英 " + operator.elite }}</el-text>
        </div>
        <!-- 精英化阶段选项 -->
        <div class="elite-options">
          <span
              v-for="elite in [0, 1, 2]"
              v-if="operator.rarity>=4"
              :key="`1-${elite}`"
              :class="`bg-elite${elite}`"
              :style="`left: ${elite*51}px`"
              @click.stop="setEliteStage(operator, elite)"
          />
          <span
              v-for="elite in [0, 1]"
              v-else-if="operator.rarity===3"
              :key="`2-${elite}`"
              :class="`bg-elite${elite}`"
              :style="`left: ${elite*51}px`"
              @click.stop="setEliteStage(operator, elite)"
          />
          <span
              v-for="elite in [0]"
              v-else
              :key="`3-${elite}`"
              :class="`bg-elite${elite}`"
              :style="`left: ${elite*51}px`"
              @click.stop="setEliteStage(operator, elite)"
          />
        </div>
      </el-card>
    </transition-group>
  </el-card>
</template>

<style scoped>
/* 基础卡片样式 */
.array-card {
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

/* 操作卡片容器样式 */
.operator-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

/* 单个操作卡片样式 */
.operator-card {
  padding: 3px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  width: 180px;
  height: 150px;
  border-bottom-color: #c7c7c7; /* 默认边框颜色 */
}

/*卡片进出动画*/
.fade-scaling-enter-active,
.fade-scaling-leave-active {
  transition: all 0.4s;
}

.fade-scaling-enter-from,
.fade-scaling-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* 确保离开的项目被移除出了布局流，以便正确地计算移动时的动画效果 */
.fade-scaling-leave-active {
  position: absolute;
}

/* 鼠标悬停效果 */
.operator-card:hover,
.elite-options span:hover {
  transform: translateY(-5px); /* 向上移动 */
}

/* 操作卡片被拥有时的样式 */
.operator-card.owned {
  border-bottom-color: green; /* 拥有时的边框颜色 */
}

/* 操作卡片被按下时的样式 */
.operator-card.mousedown {
  border-bottom-color: yellow; /* 按下时的边框颜色 */
}

/* 操作卡片的图片样式 */
.operator-image {
  transform: scale(.30);
  position: absolute;
  top: -50px;
  left: -45px;
}

/* 操作者名称样式 */
.operator-name {
  position: absolute;
  top: 75px;
  left: 18px;
}

/* 精英选项样式 */
.elite-options {
  position: absolute;
  left: -88px;
}

.elite-options span {
  position: absolute;
  transform: scale(.18);
  cursor: pointer;
  top: -5px;
  transition: transform 0.3s ease;
}

/* 精英选项悬停效果 */
.elite-options span:hover {
  transform: scale(.20);
}

/* 稀有度样式 */
.rarity {
  position: absolute;
  top: 20px;
  left: 90px;
}

/* 稀有度星星样式 */
.rarity .star {
  color: #ffe719;
}

/* 精英等级样式 */
.operator-elite {
  position: absolute;
  top: 45px;
  left: 92px;
  width: 60px;
}

.elite-state0 {
  color: #888888;
}

.elite-state1 {
  color: #444444;
}

.elite-state2 {
  color: #000000;
}
</style>
