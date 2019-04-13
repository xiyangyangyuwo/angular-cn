import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';

import { environment } from 'environments/environment';

@Component({
    selector: 'image-upload-component',
    templateUrl: 'image-upload.component.html'
})
export class ImageUploadComponent implements OnInit {

    /*图片上传接口url*/
    imageUploadUrl: string ;
    /*图片上传接口--传给后端的图片名称*/
    imageUploadName = 'file';
    /*删除服务器上图片的Url*/
    deleteImageUrl: string ;

    @Output()
    uploadSuccess = new EventEmitter<any>(); /*上传成功通知*/

    @Output()
    deleteSuccess = new EventEmitter<any>(); /*删除成功通知*/

    @Input('imageSize')
    imageSize: number; /*限制图片大小*/

    @Input('imageNumber')
    imageNumber: number; /*限制图片数量*/

    @Input('showUploadList')
    showUploadList: any; /*是否显示上传列表（初始上传时希望显示文件上传列表，当修改上传图片时不希望显示文件上传列表）*/

    @Input('listType')
    listType = 'picture'; /*上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card*/

    @Input('buttonText')
    buttonText = '上传图片'; /*上传按钮的内容*/

    fileListImg = []; /*上传的图片对象列表*/
    fileListImgTemp = []; /*临时存放图片url数组*/

    constructor(private http: _HttpClient, private message: NzMessageService) {
        if (environment.env == 'test') {
            /*图片上传接口url--测试服*/
             this.imageUploadUrl = 'http://wechat.acai123.cn/web/img/img/qiniu/productImageUpload';
             /*删除服务器上图片的Url--测试服*/
             this.deleteImageUrl = 'http://wechat.acai123.cn/web/img/img/qiniu/productImageDelete';
        }
        if (environment.env == 'prod') {
            /*图片上传接口url--正式服*/
            this.imageUploadUrl = 'http://wechat.acai123.com/web/img/img/qiniu/productImageUpload';
            /*删除服务器上图片的Url--正式服*/
            this.deleteImageUrl = 'http://wechat.acai123.com/web/img/img/qiniu/productImageDelete';
        }
    }

    ngOnInit() {
        if(this.showUploadList == 'false'){
            this.showUploadList = false;
        }else {
            this.showUploadList = true;
        }
    }

    /*图片上传之前对大小,类型,数量的检查*/
    beforeUploadCheck = (file: File) => {
        const imageType = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/gif';
        if (! imageType) {
            this.message.error('上传的图片类型不符合要求，图片类型必须为jpeg，jpg，png，gif格式！');
            return false;
        }
        if (file.size > this.imageSize * 1024) {
            this.message.error(`图片大小不能超过${this.imageSize}kb`);
            return false;
        }
        if (this.fileListImg.length >= this.imageNumber) {
            this.message.error(`图片数量不能超过${this.imageNumber}`);
            return false;
        }
        return true;
    }

    /*开始、上传进度、完成、失败,移除上传图片时都会调用这个函数。*/
    handleChange(info): void {
        /*console.log(info);*/
        if (info.file.status == 'done') {
            if (info.file.response.resStatus.status == '200') {
                this.message.success('图片上传成功');
                for(let temp = 0; temp < this.fileListImg.length; temp++){
                    this.fileListImgTemp[temp] = this.fileListImg[temp].response.data;
                }
                this.onUploadSuccess();
            }
        }
    }

    /*预览图片*/
    /*handlePreview = (file) => {

    }*/

    /*移除图片*/
    handleRemove = (file) => {
        /*console.log(file);*/
        if (file.response) {
            this.http.delete(this.deleteImageUrl, {fileName: file.response.data}).subscribe((res: any) => {
                if (res.resStatus.status === '200') {
                    this.message.success('图片删除成功');
                    this.onDeleteSuccess();
                }
            });
        }
        return true;
    }

    /*当上传成功时候的回调函数*/
    onUploadSuccess() {
        /*当上传成功时将回传的url数组传给父组件*/
        this.uploadSuccess.emit({ imgUrlArray: this.fileListImgTemp});
        /*若不显示文件上传列表，则表明在修改上传的图片，因为此时不希望显示文件上传列表*/
        if (!this.showUploadList) {
            this.fileListImg = [];
            this.fileListImgTemp = [];
        }
    }

    /*当删除成功时候的回调函数*/
    onDeleteSuccess() {
        /*当上传成功时将回传的url数组传给父组件*/
        this.deleteSuccess.emit();
    }

}