// /**
//  * Author: GT-GuiZhou
//  * Date: 2018/10/8
//  * Email: 735311619@qq.com
//  * WebSite: http://wehttp.guotao.pro
//  * Desc: 在校大三学生，会ThinkPHP、Vue、小程序，有微信支付以及支付宝支付经验，求工作，求团队带。谢谢各位大佬~(*╹▽╹*)
//  */

module.exports = {
  domain: null,
  cookie: null,
  requestQueue: [],
  lock: false,

  get(url, fn = null, header = null) {
    return this.request(url, 'GET', null, fn, header)
  },

  delete(url, fn = null, header = null) {
    return this.request(url, 'DELETE', null, fn, header)
  },

  head(url, fn = null, header = null) {
    return this.request(url, 'HEAD', null, fn, header)
  },

  post(url, data = null, fn = null, header = null) {
    return this.request(url, 'POST', data, fn, header)
  },

  put(url, data = null, fn = null, header = null) {
    return this.request(url, 'PUT', data, fn, header)
  },

  patch(url, data = null, fn = null, header = null) {
    return this.request(url, 'PATCH', data, fn, header)
  },

  upload(url, filePath, fn = null, name = 'file', data = null,  header = null) {
    return this.request(url, 'UPLOAD', data, fn, header, {filePath, name})
  },

  // 全局请求前置方法
  before: null,

  // 全局后置方法
  after: null,

  // 全局请求成功处理方法
  success: null,

  // 全局请求失败处理方法
  fail: null,

  /**
   * fn: 当他为方法时，默认其为成功处理方法，当为对象时可以在里面定义{success:fn,fail:fn,finally:fn,before:fn,after:fn}等处理方法
   * plus: opt附加属性
   * lock: 是当第一个请求响应中没有cookie时，给第二个请求方法调用的解锁变量
   */
  request(url, method, data = null, fn = null, header = null,plus = {}, lock = true) {
    // 在没有cookie锁住，先让请求进入队列，等待第一个请求执行完毕（如果没有第一个请求响应中没有cookie那么会继续调用第二个请求）
    if(!this.cookie){ // 这只是最简单的锁，有极小的概率会出现锁失效的BUG，有更好的解决方案的朋友，劳烦指教。
      // lock是为了能够让第一个请求不被放入队列
      if (this.lock && lock){
        this.requestQueue.push({
          url, method, data, fn, header, plus
        })
        return
      } else {
        this.lock = true
      }
    }

    let opt = plus?plus:{}

    opt.header = header ? header : {}
    opt.data = data
    opt.header['Cookie'] = this.cookie
    opt.method = method
    opt.url = url.indexOf('http') == 0 ? url : this.domain + url
    opt.success = res => { // 这里必须使用箭头方法，否则回导致自定义的回调方法使用箭头方法时作用域被改变
      this.callbackHandle(res, fn)
    }
    opt.fail = res => {
      this.callbackHandle(res, fn)
    }

    opt.complete = res => {
      // upload是上传文件请求方法，该请求方法不存在响应头
      if (res.errMsg.indexOf('upload') < 0 && res.header['Set-Cookie'] ) {
        this.cookie = res.header['Set-Cookie']
        // console.log(res.header['Set-Cookie'].toLowerCase().indexOf('session'))
        // console.log(res.header['Set-Cookie'].toLowerCase())
        if (this.requestQueue.length > 0 && res.header['Set-Cookie'].toLowerCase().indexOf('sessid') < 0) {
          console.warn('弹出此警告只是为了提醒您，由于wehttp的自动管理会话原理，wehttp并没有在您的第一个请求中检测到类似会话的cookie信息，如果您的会话出现异常，请确保在第一次请求中服务器正确返回会话cookie')
        }

        this.requestQueue.forEach(item => {
          this.request(item.url, item.method, item.data, item.fn, item.header, item.plus) // 第一个请求获得cookie以后，将请求队列中的请求重新执行
        })
      } else {
        // 这就说明第一个请求没有响应cookie，继续执行第二个请求
        if (!this.cookie && this.requestQueue.length > 0){
          let two = this.requestQueue.shift() // 弹出队列
          this.request(two.url, two.method, two.data, two.fn, two.header, two.plus, false)
        }
      }
    }

    // 未定义方法时为空对象
    fn = fn == null ? {} : fn
    // 当fn为方法,默认为success处理方法
    if (typeof fn == 'function') {
      fn = {
        success: fn
      }
    }

    this.fnHandle(fn, 'before', opt) // 前置方法

    if(method == 'UPLOAD'){
      return wx.uploadFile(opt)
    } else {
      return wx.request(opt)
    }

    // request是异步的，不能再这调用后置方法
    // this.fnHandle(fn, 'after', _res)
  },

  // 这个方法主要用来判断
  // 1.如果fn定义了方法，就调用fn的
  //   否则
  // 2.如果this定义了全局方法就调用全局方法
  // res是响应结果或请求opt(具体请参考微信请求opt),key是方法名称
  fnHandle(fn, key, res) {
    // 传参success方法
    // if ('success' in fn) {
    //   fn.success(res)
    // }
    // // 全局success方法
    // if (this.success) {
    //   this.success(res)
    // }
    // 传参success方法
    if (key in fn) {
      fn[key](res)
    }

    // 全局success方法
    if (this[key]) {
      this[key](res)
    }

    // 由于有全局处理一说，所以无法用try catch，因为不知道有全局方法就先调用全局方法了，而参数也可以传递fail方法
    // 异常操作
    // if(key == 'fail' && !(key in fn) && !this[key]){
    //     throw res
    // }

  },

  //  回调方法处理
  callbackHandle(res, fn) {

    // 当用户使用对象定义了success、fail、finally任意一个方法时
    if (typeof fn == 'object') {
      if (res.statusCode == 200) {
        // 请求成功时
        this.fnHandle(fn, 'success', res)
      } else {
        // 请求失败时
        this.fnHandle(fn, 'fail', res)
      }

      // 后置方法
      this.fnHandle(fn, 'after', res)
    }

  }
}
