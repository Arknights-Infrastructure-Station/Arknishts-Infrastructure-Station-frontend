<script setup>
import {ElMessage} from "element-plus";

const props = defineProps({
  length: {
    type: Number,
    default: 4 // 默认4个输入框，可通过设置length值更改
  }
});

const verificationCodeFromFather = defineModel({type: String, default: '', required: true})

const inputBoxes = props.length;
const verificationArray = ref(Array(inputBoxes).fill(''));

// 当输入内容时更新验证码
const handleInput = (index, event) => {
  let value = event.target.value;

  // 移除非数字字符
  const numericValue = value.replace(/[^0-9]/g, '');
  if (value !== numericValue) {
    // 若有非数字字符，显示提示消息
    ElMessage.warning('验证码是数字哦')
  }
  event.target.value = numericValue;

  const oldValue = verificationArray.value[index - 1]

  // 更新数组中的值，在方框中已有值的情况下，若检测到旧值在左边（索引到的下标为0，则将下标为1的新值返回去，反之亦然）
  if (numericValue.length >= 2) {
    if (numericValue.indexOf(oldValue) === 0) {
      verificationArray.value[index - 1] = numericValue.charAt(1)
      event.target.value = numericValue.charAt(1)
    } else {
      verificationArray.value[index - 1] = numericValue.charAt(0)
      event.target.value = numericValue.charAt(0)
    }
  } else {
    verificationArray.value[index - 1] = numericValue
  }
  // console.log(`value=${value}`)

  // 拼接数组中的值形成验证码（虽然使用的是双向绑定，但这里其实是子组件单向向父组件传递数据）
  verificationCodeFromFather.value = verificationArray.value.join('')

  if (value && index < inputBoxes) {
    // 移动到下一个输入框
    const nextInput = event.target.nextElementSibling;
    if (nextInput && nextInput.tagName === 'INPUT') {
      nextInput.focus();
    }
  }
};
// 处理键盘事件以在输入框之间切换焦点
const handleKeydown = (index, event) => {
  if (event.key === 'ArrowLeft' && index > 1) {
    event.target.previousElementSibling.focus();
  } else if (event.key === 'ArrowRight' && index < inputBoxes) {
    event.target.nextElementSibling.focus();
  }
};
</script>

<template>
  <el-tooltip
      effect="light"
      content="在输入方框中，新输入的内容会直接覆盖已有的内容；按左右方向键可以调整输入焦点"
      placement="bottom">
    <div
        class="verification-code-container"
    >
      <input
          v-for="index in inputBoxes"
          :key="index"
          class="code-box"
          type="text"
          maxlength="2"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
      />
    </div>
  </el-tooltip>

</template>

<style scoped>
.verification-code-container {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.code-box {
  margin: 10px 0;
  width: 20px;
  height: 25px;
  text-align: center;
  border: 2px solid grey;
  border-radius: 4px;
  transition: 0.3s;
}

.code-box:focus {
  border-color: #26caff;
  width: 23px;
  height: 28px;
  outline: none; /* 移除默认的焦点轮廓 */
}
</style>