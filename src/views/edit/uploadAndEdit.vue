<script setup>
import {ElMessage} from "element-plus";
import {isJsonFile} from "@/utils/check.js";
import operatorTable from "@/static/json/character_table_simple.json";
import {useCreateOrEditWorkFileData} from "@/store/createOrEditWorkFileData.js";
import axios from "@/utils/axios.js"
import {tipMessage} from "@/utils/messageHanding.js";
import {cloneDeep} from "lodash";
import InfrastructureTable from "@/custom/setInfrastructure/InfrastructureTable.vue";
import OperatorCards from "@/custom/setOperators/OperatorCards.vue";
import NecessaryMarking from "@/custom/MiniParts/NecessaryMarking.vue";
import {editState} from "@/static/state/editState.js";
import MarkdownEditor from "@/components/markdown/MarkdownEditor.vue";
import {useDraggable} from 'vue-draggable-plus'
import Compressor from 'compressorjs';


const createOrEditWorkFileData = useCreateOrEditWorkFileData();

//作业数据对象
const workFile = reactive({
  id: '', //作业ID
  name: '', //作业名称
  type: '', //作业类型
  layout: '', //作业采用的基建布局
  description: '', //作业描述
  descriptionPictures: [], //作业描述图片
  storageType: '', //作业内容存储类型
  fileContent: '', //作业文件数据
  enableRequestElite: false, //是否启用干员精英化要求
  enableRequestInfrastructure: false, //是否启用基建布局等级要求
  fileRequest: {
    requestElite: [], //作业需求的干员精英化要求
    requestInfrastructure: []
  }
}) //作业需求的基建布局等级要求

const defaultRequestInfrastructure = [
  {name: 'central', level: 5},
  {name: 'meeting', level: 3},
  {name: 'factory', level: 3},
  {name: 'contact', level: 3},
  {name: 'training', level: 3},

  {name: 'trading', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},
  {name: 'trading', level: 3},
  {name: 'manufacture', level: 3},
  {name: 'power', level: 3},

  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5},
  {name: 'dormitory', level: 5}
]

const activeNames = ref([]); // 控制折叠面板的展开和折叠

const fileName = ref('') //获取到的文件名

//动态调整允许上传的作业文件类型
const approvalUploadType = computed(() => {
  if (workFile.type !== 'MAA') {
    return '.json,.jpeg,.jpg,.png,.webp'
  } else {
    return '.json'
  }
})

const approvalPictureType = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

const validateWorkFileType = async (file) => {
  if (workFile.type !== 'MAA') {
    const isJson = await isJsonFile(file, workFile.type);
    return isJson || approvalPictureType.includes(file.type);
  } else {
    return await isJsonFile(file);
  }
};

const determineSize = (file) => {
  // 如果没有文件被选中，不合格
  if (!file) {
    return false;
  }

  // 文件大小限制为2MB以内
  const maxSizeInBytes = 2 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    ElMessage.error('上传的文件大小不能超过2MB');
    return false;
  }

  return true
}

/**
 * 检测上传的图片后缀名的文件是否真的是图片文件
 */
const isValidImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      // 验证图片头 PNG, JPEG, JPG, WEBP
      const validHeaders = ['89504e47', 'ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', '52494646'];
      resolve(validHeaders.includes(header));
    };
    reader.readAsArrayBuffer(file);
  });
};

const handleWorkFileUploadChange = async (event) => {
  const file = event.target.files[0]
  if (determineSize(file)) {
    const isValid = await validateWorkFileType(file);

    if (isValid) {
      await handleWorkFileUpload(file);
    } else {
      ElMessage.error(workFile.type !== 'MAA' ? '上传的文件必须为JSON、PNG、JPEG、JPG或WEBP格式' : '上传的文件必须符合JSON格式');
    }
  }
};

//storageType的值依赖于后端StorageType枚举类的值
const handleWorkFileUpload = async (file) => {
  const fileType = file.type;

  if (fileType === 'application/json') {
    workFile.fileContent = await file.text();
    workFile.storageType = 'text';
  } else if (fileType !== 'image/webp') {
    const isValid = await isValidImage(file);
    if (!isValid) {
      ElMessage.error('文件内容不是有效的图片');
      return;
    }

    new Compressor(file, {
      quality: 0.6,
      convertSize: Infinity,
      mimeType: 'image/webp',
      success(result) {
        const reader = new FileReader();
        reader.onload = () => {
          workFile.fileContent = reader.result;
          workFile.storageType = 'pictureKey';
        };
        reader.readAsDataURL(result);
      },
      error(err) {
        ElMessage.error('图片压缩失败：' + err.message);
      },
    });
  } else {
    const reader = new FileReader();
    reader.onload = () => {
      workFile.fileContent = reader.result;
      workFile.storageType = 'pictureKey';
    };
    reader.readAsDataURL(file);
  }

  if (fileName.value !== '') {
    fileName.value = ''; // 更新动画
    setTimeout(() => fileName.value = file.name, 800); // 更新获取到的文件名，延迟一些时间（该时间与淡出淡入的动画时间保持一致），给予动画能够完整渲染
  } else {
    fileName.value = file.name; // 文件名显示栏本就为空，不需要留有淡出的动画时长
  }

  if (workFile.name === '') {
    const extension = file.name.split('.').pop();
    workFile.name = file.name.replace(new RegExp(`\\.${extension}$`), '');
  }
  ElMessage.success(`${fileType.toUpperCase().split('/')[1]}文件上传成功`);
};

const handleDescriptionPicturesUploadChange = async (event) => {
  const pictures = Array.from(event.target.files);
  for (let i = 0; i < pictures.length; i++) {
    const picture = pictures[i];
    if (!approvalPictureType.includes(picture.type)) {
      ElMessage.error(`选中的第 ${i + 1} 个文件格式不合法`);
      continue;
    }

    if (determineSize(picture)) {
      const isValid = await isValidImage(picture);
      if (!isValid) {
        ElMessage.error(`第 ${i + 1} 个文件内容不是有效的图片`);
        continue;
      }

      new Compressor(picture, {
        quality: 0.6,
        convertSize: Infinity,
        mimeType: 'image/webp',
        success(result) {
          const reader = new FileReader();
          reader.onload = () => {
            // 将新的图片追加到数组末尾
            workFile.descriptionPictures.push(reader.result);
            // 移除最早添加的图片
            while (workFile.descriptionPictures.length > 5) {
              workFile.descriptionPictures.shift();
            }
          };
          reader.readAsDataURL(result);
        },
        error(err) {
          console.error(err.message);
          ElMessage.error('图片压缩失败');
        },
      });
    } else {
      ElMessage.error(`第 ${i + 1} 张图片过大`);
    }
  }
};


onMounted(() => {
  document.querySelector('#workFile-upload').addEventListener('change', handleWorkFileUploadChange);
  document.querySelector('#description-picture-upload').addEventListener('change', handleDescriptionPicturesUploadChange);
});

//图片移除
const removePicture = (index) => {
  workFile.descriptionPictures.splice(index, 1);
};

//图片预览拖拽
const picturesPreview = ref()
const draggable = useDraggable(picturesPreview, toRefs(workFile).descriptionPictures, {
  animation: 150
})

//匹配检测
watchEffect(() => {
  if (workFile.storageType === 'pictureKey' && workFile.type === 'MAA') {
    workFile.fileContent = '';
    fileName.value = '';
    ElMessage.info('作业类型和作业格式不匹配');
  }
});

//手动移除已解析的文件
function removeFileName() {
  fileName.value = '' //更新动画
  workFile.fileContent = ''
  ElMessage('已移除')
}

//设置干员精英化要求
const operatorList = ref([]) //干员列表
const selectedOperator = ref('') //用户选中的干员
function suggestOperatorNames(queryString, cb) {
  //根据名称查询干员对象
  const results = queryString ?
      operatorList.value.filter(operator => operator.value.indexOf(queryString) > -1)
      : operatorList.value
  cb(results)
}

function selectOperator() {
  //TODO:选择干员
  //遍历operatorList，找到其中对象的name属性与selectedOperator相同的第一个不包含在workFile.fileRequest.requestElite中的对象，将之添加到workFile.fileRequest.requestElite中
  const isOperatorExist = operatorList.value.some(operator => operator.value === selectedOperator.value)
  const isOperatorNotSelected = !workFile.fileRequest.requestElite.some(eliteOperator => eliteOperator.value === selectedOperator.value)
  if (isOperatorExist && isOperatorNotSelected) {
    workFile.fileRequest.requestElite.push(operatorList.value.find(operator => operator.value === selectedOperator.value))
  } else
    ElMessage.error('不可以选择重复的干员') //先写着，后面添加了动态干员列表调整再删
  selectedOperator.value = '' //触发select事件后，清空选择框中的干员
}

function removeAllOperators() {
  //TODO:移除所有干员
  workFile.fileRequest.requestElite = []
  ElMessage.info('已移除所有干员')
}

function loadAllOperators() {
  //TODO:获取所有干员对象
  for (const key in operatorTable) {
    // 检查每个键对应的对象是否包含name和charId字段
    if (operatorTable[key].name && operatorTable[key].charId) {
      operatorList.value.push({
        value: operatorTable[key].name, // value是固定属性，用于显示在列表推荐中
        charId: operatorTable[key].charId, // charId用于获取干员头像
        rarity: operatorTable[key].rarity, // rarity用于限制干员可设置的精英化等级
        elite: 0 // 默认精英等级零
      });
    }
  }
}

//暂存作业
const stagedWorkFile = ref({});
const isStagingDisabled = ref(false);

async function addToStagingWorkFile() {
  isStagingDisabled.value = true
  // 从workFile提取所需属性
  const stagingWorkFile = {
    name: workFile.name,
    type: workFile.type,
    layout: workFile.layout,
    description: workFile.description,
    descriptionPictures: JSON.stringify(cloneDeep(workFile.descriptionPictures)),
    storageType: workFile.storageType,
    fileContent: workFile.fileContent,
    fileRequest: JSON.stringify({
      requestElite: workFile.enableRequestElite ? workFile.fileRequest.requestElite : [],
      requestInfrastructure: workFile.enableRequestInfrastructure ? workFile.fileRequest.requestInfrastructure : []
    })
  };

  if (createOrEditWorkFileData.state === editState.stagingWorkFileEdit) {
    stagingWorkFile.id = workFile.id;
  }

  // 如果处于编辑作业状态，则暂存按钮调用保存接口，如果不是（出了其它编辑状态再说），则调用创建暂存作业接口
  const endpoint = createOrEditWorkFileData.state === editState.stagingWorkFileEdit ? '/stagingWorkFile/update' : '/stagingWorkFile/create'

  try {
    const response = await axios.post(endpoint, stagingWorkFile);
    tipMessage(response)

    // 如果暂存/保存成功，备份当前workFile
    if (response.data.operateResult.operateCode === 200) {
      stagedWorkFile.value = cloneDeep(workFile);
    }
  } catch (error) {
    ElMessage.error('暂存失败' + error.message);
  } finally {
    isStagingDisabled.value = false
  }
}

function handleStaging() {
  // 检查备份的数据是否和当前的workFile数据一致
  if (JSON.stringify(stagedWorkFile.value) === JSON.stringify(workFile)) {
    if (createOrEditWorkFileData.state === editState.workFileEdit || createOrEditWorkFileData.state === editState.stagingWorkFileEdit) {
      ElMessage.info('该作业已经被保存过啦');
    } else {
      ElMessage.info('该作业已被暂存');
    }

  } else {
    addToStagingWorkFile();
  }
}

//提交作业
const submissionBackup = ref({});
const isUploadDisabled = ref(false);

async function submitWorkFile() {
  isUploadDisabled.value = true;
  try {
    const workFileData = {
      name: workFile.name,
      type: workFile.type,
      layout: workFile.layout,
      description: workFile.description,
      descriptionPictures: JSON.stringify(cloneDeep(workFile.descriptionPictures)),
      storageType: workFile.storageType,
      fileContent: workFile.fileContent,
      fileRequest: JSON.stringify({
        requestElite: workFile.enableRequestElite ? workFile.fileRequest.requestElite : [],
        requestInfrastructure: workFile.enableRequestInfrastructure ? workFile.fileRequest.requestInfrastructure : []
      })
    };

    if (createOrEditWorkFileData.state === editState.workFileEdit) {
      workFileData.id = workFile.id;
    }

    const endpoint = createOrEditWorkFileData.state === editState.workFileEdit ? '/workFile/update' : '/workFile/create';
    const response = await axios.post(endpoint, workFileData);

    tipMessage(response);

    if (response.data.operateResult?.operateCode === 200) {
      submissionBackup.value = cloneDeep(workFile);
    }
  } catch (error) {
    ElMessage.error('提交失败' + error.message);
  } finally {
    isUploadDisabled.value = false;
  }
}


function handleUpload() {
  // 检查备份的数据是否和当前的workFile数据一致
  if (submissionBackup.value.fileContent === workFile.fileContent) {
    ElMessage('该作业已被提交');
  } else {
    submitWorkFile();
  }
}

//重置表单
const resetVisible = ref(false);
const initialWorkFile = ref({});
const initialFileName = ref('')

function resetFormData() {
  Object.assign(workFile, cloneDeep(initialWorkFile.value));
  fileName.value = initialFileName.value;
  resetVisible.value = false;
  // 若有必要，重新展开可选项
  workFile.enableRequestElite = workFile.fileRequest.requestElite?.length > 0;
  // workFile.enableRequestInfrastructure = workFile.fileRequest.requestInfrastructure.length > 0;
  ElMessage.info('重置完成');
}

//作业可提交状态
const isSubmitDisabled = ref(false)
watchEffect(() => {
  isSubmitDisabled.value = workFile.name === '' || workFile.type === '' || workFile.layout === '' || workFile.fileContent === ''
})

onMounted(() => {
  // 加载所有干员对象
  loadAllOperators()

  // 检查createOrEditWorkFileData中的state是否为编辑状态
  if (createOrEditWorkFileData.state === editState.workFileEdit || createOrEditWorkFileData.state === editState.stagingWorkFileEdit) {
    // console.log(createOrEditWorkFileData.transferWorkFile)

    // 将createOrEditWorkFileData中的transferWorkFile属性赋值给workFile
    Object.keys(createOrEditWorkFileData.transferWorkFile).forEach(key => {
      // console.log('1-'+key)
      if (workFile.hasOwnProperty(key)) {
        // console.log('2-'+key)
        if (key === 'fileRequest') {
          // 处理嵌套对象
          Object.keys(createOrEditWorkFileData.transferWorkFile.fileRequest).forEach(nestedKey => {
            if (workFile.fileRequest.hasOwnProperty(nestedKey)) {
              if (Array.isArray(createOrEditWorkFileData.transferWorkFile.fileRequest[nestedKey])) {
                // 如果是数组，则进行深拷贝
                workFile.fileRequest[nestedKey] = cloneDeep(createOrEditWorkFileData.transferWorkFile.fileRequest[nestedKey])
              } else {
                // 如果不是数组，直接赋值
                workFile.fileRequest[nestedKey] = createOrEditWorkFileData.transferWorkFile.fileRequest[nestedKey];
              }
            }
          });
        } else {
          // 直接赋值非嵌套属性
          workFile[key] = createOrEditWorkFileData.transferWorkFile[key];
          // console.log(workFile[key])
        }
      }
    });
    // 设置fileName
    fileName.value = `已读取 ${createOrEditWorkFileData.transferWorkFile.name} 作业文件中的内容`;
  }


  // 检查requestElite和requestInfrastructure是否非空，相应地设置enableRequestElite和enableRequestInfrastructure
  workFile.enableRequestElite = createOrEditWorkFileData.transferWorkFile.fileRequest?.requestElite?.length > 0;
  workFile.enableRequestInfrastructure = createOrEditWorkFileData.transferWorkFile.fileRequest?.requestInfrastructure?.length > 0;

  // 若createOrEditWorkFileData中的requestInfrastructure为空数组，则为workFile对象分配默认的基建布局数据
  if (workFile.fileRequest.requestInfrastructure.length === 0)
    Object.assign(workFile.fileRequest.requestInfrastructure, defaultRequestInfrastructure)

  // 备份初始workFile数据和fileName
  initialWorkFile.value = cloneDeep(workFile);
  initialFileName.value = fileName.value;

  // 若requestElite或requestInfrastructure不为空数组，则将activeNames的value设为'1'（展开可选列表）
  if (workFile.enableRequestElite || workFile.enableRequestInfrastructure) {
    activeNames.value.push('1')
  }

  // console.log(workFile)
})

onUnmounted(() => {
  //将干员列表清空
  operatorList.value = []

  //重置useCreateOrEditWorkFileData状态
  createOrEditWorkFileData.resetState()
})
</script>

<template>
  <el-dialog
      v-model="resetVisible"
      draggable
      title="重置"
      width="500px">
    <span>您确认要初始化作业表单中的所有内容吗？（若表单初始就为空，则会重置为空；若一开始就有数据，则会重置至一开始的样子）</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetVisible = false">取消</el-button>
        <el-button type="danger" @click="resetFormData">确认重置</el-button>
      </div>
    </template>
  </el-dialog>

  <div class="page-content-container">
    <h3 v-if="createOrEditWorkFileData.state===editState.create" style="text-align: center">上传作业</h3>
    <h3 v-if="createOrEditWorkFileData.state===editState.workFileEdit||createOrEditWorkFileData.state===editState.stagingWorkFileEdit"
        style="text-align: center">编辑作业</h3>
    <el-form :model="workFile" label-width="180px">
      <!--必填项目-->
      <el-form-item>
        <template #label>
          <NecessaryMarking/>
          作业名称
        </template>
        <el-input
            v-model="workFile.name"
            maxlength="50"
            show-word-limit
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          <NecessaryMarking/>
          作业类型
        </template>
        <el-segmented v-model="workFile.type" :options="['MAA','Mower','其它']" size="default"/>
      </el-form-item>
      <el-form-item>
        <template #label>
          <NecessaryMarking/>
          采用的基建布局
        </template>
        <el-segmented v-model="workFile.layout" :options="['243','153','333','252','342','其它']" size="default"/>
      </el-form-item>
      <el-form-item label="作业描述">
        <markdown-editor v-model="workFile.description"/>
      </el-form-item>
      <el-form-item label="作业描述图片">
        <input id="description-picture-upload" accept=".jpeg,.jpg,.png,.webp" multiple style="display: none;"
               type="file">
        <el-tooltip
            class="box-item"
            content="允许JPEG、JPG、PNG、WEBP图片格式，最多允许上传5张图片，每张图片的大小不得大于2M"
            effect="light"
            placement="right"
        >
          <label class="el-button" for="description-picture-upload">
            上传作业描述图片
          </label>
        </el-tooltip>
      </el-form-item>
      <transition name="float-io">
        <el-form-item v-show="workFile.descriptionPictures&&workFile.descriptionPictures.length>0" label="描述图片预览">
          <transition-group
              ref="picturesPreview"
              class="description-pictures-preview"
              name="float-io"
              tag="div"
          >
            <div v-for="(url, index) in workFile.descriptionPictures" :key="index" class="picture-container">
              <el-image
                  :preview-src-list="workFile.descriptionPictures"
                  :src="url"
                  class="description-pictures"
                  fit="cover"
                  lazy
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon>
                      <Picture/>
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <el-button
                  class="remove-button"
                  icon="Delete"
                  plain
                  size="small"
                  type="danger"
                  @click="removePicture(index)"
              />
            </div>
          </transition-group>
        </el-form-item>
      </transition>

      <!--上传作业文件-->
      <el-form-item>
        <template #label>
          <NecessaryMarking/>
          上传作业文件
        </template>
        <input id="workFile-upload" :accept="approvalUploadType" style="display: none;" type="file">
        <el-tooltip
            class="box-item"
            content="若您想上传图片格式的作业文件，请先选中作业类型项中的非“MAA”选项"
            effect="light"
            placement="right"
        >
          <label class="file-upload" for="workFile-upload">
            上传作业文件
          </label>
        </el-tooltip>
        <transition name="fade-in-out-right">
          <div v-if="fileName!==''" class="show-file-name">
            {{ fileName }}
            <span class="remove-icon" @click="removeFileName">
            ×
          </span>
          </div>
        </transition>
      </el-form-item>

      <!--可选项目-->
      <el-collapse v-model="activeNames">
        <el-collapse-item name="1">
          <template #title>
            <el-divider border-style="dashed">
              可选参数
            </el-divider>
          </template>

          <!--干员精英化要求-->
          <el-form-item label="是否启用干员精英化要求">
            <el-switch
                v-model="workFile.enableRequestElite"
            />
            <el-tooltip
                content="对于启用自定义适配模式的用户，若您设置的干员精英化要求与其相异，则该份作业不会被显示"
                effect="light"
                placement="right">
              <el-icon size="17px" style="margin-left: 5px">
                <question-filled/>
              </el-icon>
            </el-tooltip>
          </el-form-item>

          <transition name="float-io">
            <el-form-item v-if="workFile.enableRequestElite" label="干员精英化要求">
              <div class="elite-bar-text">
                <el-autocomplete
                    v-model="selectedOperator"
                    :fetch-suggestions="suggestOperatorNames"
                    placeholder="通过干员名称搜索干员"
                    style="width: 170px"
                    @select="selectOperator"
                >
                  <template #loading>
                    <el-icon class="is-loading">
                      <svg class="circular" viewBox="0 0 20 20">
                        <g
                            class="path loading-path"
                            stroke-width="0"
                            style="animation: none; stroke: none"
                        >
                          <circle class="dot1" r="3.375" rx="0" ry="0"/>
                          <circle class="dot2" r="3.375" rx="0" ry="0"/>
                          <circle class="dot4" r="3.375" rx="0" ry="0"/>
                          <circle class="dot3" r="3.375" rx="0" ry="0"/>
                        </g>
                      </svg>
                    </el-icon>
                  </template>
                </el-autocomplete>
                <el-text style="color: #b3b2b6; margin-left: 10px" tag="i">*选中干员以设置他的精英化阶段</el-text>

                <div class="flex-grow"/>

                <!--一键清空所有干员-->
                <transition name="float-io">
                  <el-button
                      v-if="workFile.fileRequest.requestElite?.length > 0"
                      class="remove-all-operators-button"
                      plain
                      type="danger"
                      @click="removeAllOperators">
                    清空所有干员
                  </el-button>
                </transition>
              </div>
              <transition name="float-io">
                <div v-if="workFile.fileRequest.requestElite?.length > 0" class="operator-elite">
                  <OperatorCards v-model="workFile.fileRequest.requestElite" :edit-level="2"/>
                </div>
              </transition>
            </el-form-item>
          </transition>

          <!--基建布局等级要求-->
          <el-form-item label="是否启用基建布局等级要求">
            <el-switch
                v-model="workFile.enableRequestInfrastructure"
            />
            <el-tooltip
                content="对于启用自定义适配模式的用户，若您设置的基建布局等级要求与其相异，则该份作业不会被显示"
                effect="light"
                placement="right">
              <el-icon size="17px" style="margin-left: 5px">
                <question-filled/>
              </el-icon>
            </el-tooltip>
          </el-form-item>

          <transition name="float-io">
            <el-form-item v-if="workFile.enableRequestInfrastructure" label="基建布局等级要求">
              <el-text style="
              color: #b3b2b6;
              margin-left: 10px;
              position: absolute;
              top: 0;
              " tag="i">*拖拽设施以交换它们的位置
              </el-text>
              <InfrastructureTable v-model="workFile.fileRequest.requestInfrastructure" draggable/>
            </el-form-item>
          </transition>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <el-row justify="space-evenly" style="margin-top: 20px">
      <el-col :span="6" class="button-container">
        <el-button
            :disabled="isStagingDisabled||isSubmitDisabled"
            plain
            type="info"
            @click="handleStaging"
        >
          {{ createOrEditWorkFileData.state === editState.stagingWorkFileEdit ? '保存' : '暂存' }}
        </el-button>
      </el-col>
      <el-col :span="6" class="button-container">
        <el-button plain type="warning" @click="resetVisible = true">重置</el-button>
      </el-col>
      <el-col :span="6" class="button-container">
        <el-button
            :disabled="isUploadDisabled||isSubmitDisabled"
            plain
            type="primary"
            @click="handleUpload"
        >
          提交
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.button-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

/*文件上传*/
.file-upload {
  padding-inline: 10px;
  border: 1px solid #6363ff;
  border-radius: 4px;
  background-color: #f3f3ff;
  color: #6363ff;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.25s, color 0.25s; /* 添加过渡效果 */
}

/* 当鼠标悬停在按钮上时的样式 */
.file-upload:hover {
  background-color: #6363ff;
  color: white;
}

/* 当按钮被按下时的样式 */
.file-upload:active {
  background-color: #0000af;
}

.picture-container {
  position: relative;
  display: inline-block;
}

.description-pictures-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  align-items: center;
  gap: 5px;
}

//作业描述图片移除按钮
.remove-button {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  width: 4px;
}

/*显示读取到的文件名*/
.show-file-name {
  width: 100%;
  color: #adadad;
}

/*文件名动画*/
.fade-in-out-right-enter-active, .fade-in-out-right-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.fade-in-out-right-enter-from {
  opacity: 0;
  transform: translateX(-25px);
}

.fade-in-out-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.fade-in-out-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.fade-in-out-right-leave-to {
  opacity: 0;
  transform: translateX(25px);
}

/*移除文件*/
.remove-icon {
  color: lightgray;
  cursor: pointer;
  padding: 8px;
  width: 100%;
}

.remove-icon:hover {
  color: gray;
  background-color: #f1f1f1;
  border-radius: 100%;
  padding-block: 4px;
  padding-top: 2px;
}

.elite-bar-text {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;
  position: relative;
}

/*搜索框加载的动画效果*/
.circular {
  display: inline;
  height: 30px;
  width: 30px;
  animation: loading-rotate 2s linear infinite;
}

.path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-color-primary);
  stroke-linecap: round;
}

.loading-path .dot1 {
  transform: translate(3.75px, 3.75px);
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
}

.loading-path .dot2 {
  transform: translate(calc(100% - 3.75px), 3.75px);
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 0.4s;
}

.loading-path .dot3 {
  transform: translate(3.75px, calc(100% - 3.75px));
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 1.2s;
}

.loading-path .dot4 {
  transform: translate(calc(100% - 3.75px), calc(100% - 3.75px));
  fill: var(--el-color-primary);
  animation: custom-spin-move 1s infinite linear alternate;
  opacity: 0.3;
  animation-delay: 0.8s;
}

@keyframes loading-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}

@keyframes custom-spin-move {
  to {
    opacity: 1;
  }
}

/*干员头像容器*/
.operator-elite {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  gap: 7px;
  border: 1px solid #dedede;
  border-radius: 4px;
  padding: 10px;
}

.remove-all-operators-button {
  position: relative;
  right: 20px;
  margin-left: 20px;
}

.float-io-enter-active, .float-io-leave-active {
  transition: opacity 0.4s;
}

.float-io-enter-from, .float-io-leave-to {
  opacity: 0;
}

.float-io-enter-to, .float-io-leave-from {
  opacity: 1;
}
</style>