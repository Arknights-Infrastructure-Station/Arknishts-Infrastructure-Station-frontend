<script setup>
// 接收非v-model属性
const props = defineProps({
  placeholder: String,
  type: {
    type: String,
    validator(value) {
      const allowedValues = ['text', 'password']
      return allowedValues.includes(value)
    }
  }
});

// 接收v-model属性
const inputValue = defineModel()
</script>

<template>
  <div class="input-data">
    <input :type="type" v-model="inputValue">
    <div class="underline"></div>
    <label v-if="inputValue === ''" class="nonValue">{{ placeholder }}</label>
    <label v-else class="hasValue">{{ placeholder }}</label>
  </div>
</template>


<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
  outline: none; //去除默认边框和轮廓
  box-sizing: border-box; //边框和内边距的值是包含在总宽高内的
}

.input-data {
  position: relative;
  width: 100%;
  height: 40px;
  margin-top: 30px;
}

.input-data input {
  width: 100%;
  height: 100%;
  border: none;
  font-size: 17px;
  border-bottom: 2px solid #c0c0c0;
}

.input-data input:focus ~ .nonValue {
  transform: translateY(-30px);
  font-size: 15px;
  color: #2c6fdb;
}

.input-data .nonValue {
  position: absolute;
  bottom: 10px;
  left: 0;
  color: #808080;
  pointer-events: none; //点击label穿透到输入框
  transition: 0.3s ease;
}

.input-data .hasValue{
  position: absolute;
  bottom: 10px;
  left: 0;
  pointer-events: none;
  transform: translateY(-30px);
  font-size: 15px;
  color: #2c6fdb;
}

.input-data .underline {
  position: absolute;
  bottom: 0;
  height: 2px;
  width: 100%;
  background-color: #2c6fdb;
  transform: scaleX(0);
  transition: 0.3s ease;
}

.input-data input:focus ~ .underline {
  transform: scaleX(1);
  /*
  默认情况下，transform-origin 的值是 50% 50%，这意味着变形是相对于元素的中心点进行的。
   */
}
</style>