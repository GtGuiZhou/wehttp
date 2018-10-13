## 文档
[中文文档](http://wehttp.guotao.pro)
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
  所有代码在不压缩的情况下只有100行左右，直接可以从文档中复制到项目中使用
  
## BUG修复
### 2018年10月13日 16点52分
解决了刚开始请求时会话不同的问题，主要问题是一开始有多个异步请求时，cookie并不存在，因此服务器会给在cookie不存在这段时间的请求返回cookie，因此造成了cookie变换的问题，本次修改主要为让第一个异步请求先获取cookie，其它请求先等待，随后在执行其它请求。

MIT Licensed | Copyright © 2018-present Gt-GuiZhou
 
