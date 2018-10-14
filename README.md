## 文档
[中文文档](http://wehttp.guotao.pro)
## 安装
```sh
npm i wehttp
```
## 使用方式
```js
  const http = require('common/http.js')
  http.get('http://www.baidu.com', res => {
    console.log(res)
  })
```


## 浅显易懂
  实现方式简单明了，一看就懂。
## 保持会话
  内部自动保存cookie，有效防止cookie泄露
## 方便易用
  所有代码在不压缩的情况下只有200行左右，直接可以从文档中复制到项目中使用

## tip
  代码可能还有诸多未知漏洞，还望大家多多指教~
  
  祝大家天天开心(●'◡'●)！  
## 开发者日志
### 2018年10月13日 16点52分
解决了刚开始请求时会话不同的问题，主要问题是一开始有多个异步请求时，cookie并不存在，因此服务器会给在cookie不存在这段时间的请求返回cookie，因此造成了cookie变换的问题，本次修改主要为让第一个异步请求先获取cookie，其它请求先等待，随后在执行其它请求。
### 2018年10月14日 20点59分
添加了上传文件的方法，并且所有的请求方法均支持通过返回值使用abort取消请求任务，另外上传文件方法也允许使用返回值来监听当前的上传进度信息。
```js
    $task = http.get('http://www.baidu.com', res => {
      console.log(res)
    })
    $task.abort() // 取消请求任务
    
    $uploader = http.upload('http://www.baidu.com','filePath',res => {
      console.log(res)
    })
    $uploader.onProgressUpdate((res) => { // 监听上传进度
           console.log('上传进度', res.progress)
           console.log('已经上传的数据长度', res.totalBytesSent)
           console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
         })
    $uploader.abort() // 同样可以取消上传的请求任务
```

MIT Licensed | Copyright © 2018-present Gt-GuiZhou
 
