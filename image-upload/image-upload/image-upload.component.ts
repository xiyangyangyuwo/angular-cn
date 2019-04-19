import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { HOST, IMGURL } from '../../modals';

@Component({
  selector: 'app-image-upload',
  templateUrl: 'image-upload.component.html',
  styleUrls: ['./image-upload.component.less']
})
export class ImageUploadComponent implements OnInit {

  // tslint:disable-next-line: no-input-rename
  @Input('imageMaxSize') imageMaxSize = 2048; // 限制图片大小(以kb为单位)
  // tslint:disable-next-line: no-input-rename
  @Input('imageMaxNumber') imageMaxNumber = 1;  // 限制图片数量(不超过imageNumber张)
  // tslint:disable-next-line: no-input-rename
  @Input('imageUrlList') imageUrlList = [];  // 图片url数组

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onUpdatedSuccess = new EventEmitter<any>(); // imageUrlList更新成功通知

  imageUploadUrl = HOST + '/file/upload-photo'; // 图片上传接口url
  imageUploadName = 'file'; // 图片上传接口--发到后台的文件参数名
  deleteImageUrl = HOST + '/file/photo'; // 图片删除接口的url

  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    hidePreviewIconInNonImage: true
  }; // 是否展示 uploadList, 可设为一个对象，用于单独设定 showPreviewIcon 和 showRemoveIcon
  previewImage: string | undefined = ''; // 预览图片的url
  previewVisible = false; // 预览的模态框是否可见

  imageList = []; // 上传的图片对象列表

  constructor(private http: _HttpClient, private message: NzMessageService) {}

  ngOnInit() {
    this.init();
  }

  init() {
    let index = 1;
    this.imageUrlList.forEach((imageUrl: string) => {
      this.imageList.push({
        uid: index, // 文件唯一标识
        name: 'xxx.png', // 文件名
        status: 'done', // 状态有：uploading done error removed
        url: IMGURL + imageUrl
      });
      index++;
    });
    console.log(this.imageList);
  }

  // 图片上传之前对大小,类型,数量的检查
  beforeUploadCheck = (file: UploadFile, fileList: UploadFile[]) => {
    const imageType =
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif';
    if (!imageType) {
      this.message.error(
        '上传的图片类型不符合要求，图片类型必须为jpeg，jpg，png，gif格式！',
      );
      return false;
    }
    if (file.size > this.imageMaxSize * 1024) {
      this.message.error(`图片大小不能超过${this.imageMaxSize}kb`);
      return false;
    }
    if (fileList.length > this.imageMaxNumber) {
      this.message.error(`图片数量不能超过${this.imageMaxNumber}张`);
      return false;
    }
    return true;
  }

  // 开始、上传进度、完成、失败,移除上传图片时都会调用这个函数。
  handleChange(info: any): void {
    // console.log(info);
    if (info.type === 'success') {
      info.fileList[info.fileList.length - 1].url = IMGURL + info.fileList[info.fileList.length - 1].response.data;
      this.message.success('图片上传成功');
      this.updatedSuccess();
    }
  }

  // 预览图片
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

  // 移除图片
  handleRemove = (file: UploadFile) => {
    // console.log(file);
    this.http
      .delete(this.deleteImageUrl, { imgUrl: file.url.substring(IMGURL.length) })
      .subscribe((res: any) => {
        if (res.code === 200) {
          this.message.success('图片删除成功');
          this.updatedSuccess();
        }
      });
    return true;
  }

  // 当更新成功时的回调函数（将url数组传给父组件）
  updatedSuccess() {
    this.imageUrlList = [];
    this.imageList.forEach((file: UploadFile) => {
      this.imageUrlList.push(file.url.substring(IMGURL.length));
    });
    this.onUpdatedSuccess.emit({ imageUrlList: this.imageUrlList });
  }
}
