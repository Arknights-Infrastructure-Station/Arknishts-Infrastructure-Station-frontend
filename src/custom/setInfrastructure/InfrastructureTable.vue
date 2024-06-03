<script setup>
import {E2C} from "@/utils/infrastructure.js";
import {cloneDeep} from "lodash";

const props = defineProps({
  draggable: Boolean,
  ratio: {
    type: Number,
    default: 1
  }
});

const workFile = defineModel({type: Object, required: true})

// 通过比例计算width和height
const dynamicStyles = reactive({
  nonDraggableFacilitiesCenter: computed(() => ({
    width: `${150 * props.ratio}px`,
    height: `${45 * props.ratio}px`
  })),
  nonDraggableFacilitiesEnd: computed(() => ({
    width: `${100 * props.ratio}px`,
    height: `${45 * props.ratio}px`
  })),
  facility: computed(() => ({
    width: `${110 * props.ratio}px`,
    height: `${45 * props.ratio}px`
  }))
});

let dragStartIndex = null;
const handleDragStart = (index) => {
  dragStartIndex = index;
};

const handleDrop = (index) => {
  const temp = workFile.value[index];
  workFile.value[index] = workFile.value[dragStartIndex];
  workFile.value[dragStartIndex] = temp;
};
</script>

<template>
  <table>
    <tr>
      <td colspan="3" class="placeholder"/>
      <td :style="dynamicStyles.nonDraggableFacilitiesCenter"
          :class="{'nonDraggableFacilities-center':true,'nonDraggableFacilities-center-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[0].level=1">等级 1</el-dropdown-item>
              <el-dropdown-item @click="workFile[0].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[0].level=3">等级 3</el-dropdown-item>
              <el-dropdown-item @click="workFile[0].level=4">等级 4</el-dropdown-item>
              <el-dropdown-item @click="workFile[0].level=5">等级 5</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        控制中枢 - {{ workFile[0].level }}
      </td>
      <td class="placeholder"/>
    </tr>
    <tr>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[5].name]:true,[workFile[5].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(5)"
          @drop="handleDrop(5)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[5].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[5].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[5].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[5].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[5].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[5].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[5].name) }} - {{ workFile[5].level }}
      </td>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[6].name]:true,[workFile[6].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(6 )"
          @drop="handleDrop(6 )"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[6].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[6].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[6].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[6].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[6].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[6].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[6].name) }} - {{ workFile[6].level }}
      </td>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[7].name]:true,[workFile[7].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(7 )"
          @drop="handleDrop(7)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[7].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[7].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[7].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[7].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[7].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[7].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[7].name) }} - {{ workFile[7].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesCenter"
          :class="{'nonDraggableFacilities-center':true,'nonDraggableFacilities-center-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[14].level=1">等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[14].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[14].level=3">等级 3
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[14].level=4">等级 4
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[14].level=5">等级 5
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        宿舍 - {{ workFile[14].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesEnd"
          :class="{'nonDraggableFacilities-end':true,'nonDraggableFacilities-end-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[1].level=1">等级 1</el-dropdown-item>
              <el-dropdown-item @click="workFile[1].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[1].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        会客室 - {{ workFile[1].level }}
      </td>
    </tr>
    <tr>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[8].name]:true,[workFile[8].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(8)"
          @drop="handleDrop(8)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[8].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[8].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[8].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[8].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[8].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[8].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[8].name) }} - {{ workFile[8].level }}
      </td>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[9].name]:true,[workFile[9].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(9)"
          @drop="handleDrop(9)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[9].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[9].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[9].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[9].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[9].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[9].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[9].name) }} - {{ workFile[9].level }}
      </td>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[10].name]:true,[workFile[10].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(10)"
          @drop="handleDrop(10)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[10].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[10].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[10].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[10].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[10].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[10].level=3">等级 3
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[10].name) }} - {{ workFile[10].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesCenter"
          :class="{'nonDraggableFacilities-center':true,'nonDraggableFacilities-center-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[15].level=1">等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[15].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[15].level=3">等级 3
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[15].level=4">等级 4
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[15].level=5">等级 5
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        宿舍 - {{ workFile[15].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesEnd"
          :class="{'nonDraggableFacilities-end':true,'nonDraggableFacilities-end-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[2].level=1">等级 1</el-dropdown-item>
              <el-dropdown-item @click="workFile[2].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[2].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        加工站 - {{ workFile[2].level }}
      </td>
    </tr>
    <tr>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[11].name]:true,[workFile[11].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(11)"
          @drop="handleDrop(11)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[11].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[11].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[11].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[11].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[11].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[11].level=3">等级 3
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[11].name) }} - {{ workFile[11].level }}
      </td>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[12].name]:true,[workFile[12].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(12)"
          @drop="handleDrop(12)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[12].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[12].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[12].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[12].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[12].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[12].level=3">等级 3
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[12].name) }} - {{ workFile[12].level }}
      </td>
      <td
          :style="dynamicStyles.facility"
          :class="{[workFile[13].name]:true,[workFile[13].name+'-draggable']:draggable}"
          :draggable="draggable"
          @dragstart="handleDragStart(13)"
          @drop="handleDrop(13)"
          @dragover.prevent
      >
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[13].name='trading'">贸易站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[13].name='manufacture'">制造站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[13].name='power'">发电站
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[13].level=1" divided>等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[13].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[13].level=3">等级 3
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        {{ E2C(workFile[13].name) }} - {{ workFile[13].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesCenter"
          :class="{'nonDraggableFacilities-center':true,'nonDraggableFacilities-center-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[16].level=1">等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[16].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[16].level=3">等级 3
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[16].level=4">等级 4
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[16].level=5">等级 5
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        宿舍 - {{ workFile[16].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesEnd"
          :class="{'nonDraggableFacilities-end':true,'nonDraggableFacilities-end-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[3].level=1">等级 1</el-dropdown-item>
              <el-dropdown-item @click="workFile[3].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[3].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        办公室 - {{ workFile[3].level }}
      </td>
    </tr>
    <tr>
      <td colspan="3" class="placeholder"/>
      <td :style="dynamicStyles.nonDraggableFacilitiesCenter"
          :class="{'nonDraggableFacilities-center':true,'nonDraggableFacilities-center-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[17].level=1">等级 1
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[17].level=2">等级 2
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[17].level=3">等级 3
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[17].level=4">等级 4
              </el-dropdown-item>
              <el-dropdown-item @click="workFile[17].level=5">等级 5
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        宿舍 - {{ workFile[17].level }}
      </td>
      <td :style="dynamicStyles.nonDraggableFacilitiesEnd"
          :class="{'nonDraggableFacilities-end':true,'nonDraggableFacilities-end-draggable':draggable}">
        <el-dropdown v-if="draggable" class="top-left-dropdown">
          <el-icon>
            <MoreFilled/>
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="workFile[4].level=1">等级 1</el-dropdown-item>
              <el-dropdown-item @click="workFile[4].level=2">等级 2</el-dropdown-item>
              <el-dropdown-item @click="workFile[4].level=3">等级 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        训练室 - {{ workFile[4].level }}
      </td>
    </tr>
  </table>
</template>

<style scoped lang="scss">
/*消除下拉菜单的黑色边框*/
.el-dropdown:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset; /* 消除光标移动到下拉菜单上出现的黑色边框 */
}

table {
  margin: 0;
  border-collapse: separate;
  border-spacing: 10px;
  border: none;
}

td {
  border: 1px solid black;
  border-radius: 2px;
  position: relative;
  text-align: center;
  vertical-align: middle;
  user-select: none;
}

.top-left-dropdown {
  position: absolute;
  padding: 2px 5px;
  top: 0;
  left: 0;
}

.placeholder {
  border: none;
}

.nonDraggableFacilities-center, .nonDraggableFacilities-end {
  background-color: #a8a8a8;
}

.nonDraggableFacilities-center-draggable, .nonDraggableFacilities-end-draggable {
  box-shadow: 0 0 7px rgba(56, 55, 55, 0.5);
}

.trading {
  background-color: lightskyblue;
}

.trading-draggable {
  box-shadow: 0 0 7px rgba(22, 22, 255, 0.5); /* 添加晶莹剔透的效果 */
}

.manufacture {
  background-color: lightyellow;
}

.manufacture-draggable {
  box-shadow: 0 0 7px rgba(250, 230, 52, 0.5);
}

.power {
  background-color: lightgreen;
}

.power-draggable {
  box-shadow: 0 0 7px rgba(53, 150, 53, 0.5);
}
</style>