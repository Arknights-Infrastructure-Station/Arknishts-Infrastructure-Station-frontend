import {defineStore} from 'pinia';
import router from '@/router/index.js'
import {cloneDeep} from "lodash";
import {editState} from "@/static/state/editState.js";
import {getWebPByKey} from "@/api/callEndpoint.js";

export const useCreateOrEditWorkFileData = defineStore('createOrEditWorkFileData', {
    state: () => ({
        state: editState.create, //默认是create状态
        transferWorkFile: {
            id: '', //作业ID
            name: '', //作业名称
            type: '', //作业类型
            layout: '', //作业采用的基建布局
            description: '', //作业描述
            descriptionPictures: [], //作业描述图片
            storageType: '', //作业内容存储类型
            fileContent: '', //作业文件数据
            fileRequest: {
                requestElite: [], //作业需求的干员精英化要求
                requestInfrastructure: [] //作业需求的基建布局等级要求
            }
        }
    }),
    actions: {
        // 更新transferWorkFile的属性
        async editWorkFile(EditedWorkFileObject, state) {
            // console.log('EditedWorkFileObject=',EditedWorkFileObject)
            for (const key of Object.keys(EditedWorkFileObject)) {
                if (key === 'fileRequest') {
                    // 处理嵌套对象 fileRequest
                    Object.keys(EditedWorkFileObject.fileRequest).forEach(nestedKey => {
                        if (Array.isArray(EditedWorkFileObject.fileRequest[nestedKey])) {
                            // 如果是数组，则进行深拷贝
                            this.transferWorkFile.fileRequest[nestedKey] = cloneDeep(EditedWorkFileObject.fileRequest[nestedKey]);
                        } else {
                            // 如果不是数组，直接赋值
                            this.transferWorkFile.fileRequest[nestedKey] = EditedWorkFileObject.fileRequest[nestedKey];
                        }
                    });
                } else if (key === 'descriptionPictures' && EditedWorkFileObject.descriptionPictures !== null) {
                    //转化作业描述图片数组
                    for (let i = 0; i < EditedWorkFileObject.descriptionPictures.length; i++) {
                        this.transferWorkFile.descriptionPictures[i] = await getWebPByKey(EditedWorkFileObject.descriptionPictures[i])
                    }
                } else {
                    // 直接赋值非嵌套属性
                    this.transferWorkFile[key] = EditedWorkFileObject[key];
                }
            }
            //补转化
            if (EditedWorkFileObject.storageType === 'pictureKey') {
                //如果作业内容以图片格式存储，将之转化
                this.transferWorkFile.fileContent = await getWebPByKey(EditedWorkFileObject.fileContent)
            }

            // console.log('transferWorkFile=',this.transferWorkFile)
            this.state = state; //调用这个方法意味着进入Edit状态，将组件指定的编辑状态传递给uploadAndEdit组件
            router.push({name: 'uploadAndEdit'}) //自动进入编辑组件
        },

        // 初始化transferWorkFile的状态
        resetState() {
            this.state = editState.create;
            this.transferWorkFile = {
                id: '', //作业ID
                name: '', //作业名称
                type: '', //作业类型
                layout: '', //作业采用的基建布局
                description: '', //作业描述
                descriptionPictures: [], //作业描述图片
                storageType: '', //作业内容存储类型
                fileContent: '', //作业文件数据
                fileRequest: {
                    requestElite: [], //作业需求的干员精英化要求
                    requestInfrastructure: [] //作业需求的基建布局等级要求
                }
            };
        }
    }
});
