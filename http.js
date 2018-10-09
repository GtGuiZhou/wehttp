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
  get(url, fn = null, header = null) {
    this.request(url, 'GET', null, fn, header)
  },

  delete(url, fn = null, header = null) {
    this.request(url, 'DELETE', null, fn, header)
  },

  head(url, fn = null, header = null) {
    this.request(url, 'HEAD', null, fn, header)
  },

  post(url, data = null, fn = null, header = null) {
    this.request(url, 'POST', data, fn, header)
  },

  put(url, data = null, fn = null, header = null) {
    this.request(url, 'PUT', data, fn, header)
  },

  patch(url, data = null, fn = null, header = null) {
    this.request(url, 'PATCH', data, fn, header)
  },

  // 全局请求前置方法
  before: null,

  // 全局后置方法
  after: null,

  // 全局请求成功处理方法
  success: null,

  // 全局请求失败处理方法
  fail: null,

  // 全局请求最后处理方法
  finaly: null,

  /**
   * fn: 当他为方法时，默认其为成功处理方法，当为对象时可以在里面定义{success:fn,fail:fn,finally:fn,before:fn,after:fn}等处理方法
   */
  request(url, method, data = null, fn = null, header = null) {
    let opt = {}
    opt.header = header ? header : {}
    opt.data = data
    opt.header['Cookie'] = this.cookie
    opt.method = method
    opt.url = url.indexOf('http') == 0 ? url : this.domain + url
    opt.success = res => { // 这里必须使用箭头方法，否则回导致自定义的回调方法使用箭头方法时作用域被改变
      this.callbackHandle(res, fn)
    }

    // 未定义方法时为空对象
    fn = fn == null ? {} : fn
    // 当fn为方法,默认为success处理方法
    if (typeof fn == 'function') {
      fn = {
        success: fn
      }
    }

    this.fnHandle(fn, 'before', opt)
    wx.request(opt)
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
    if (res.header['Set-Cookie']) {
      this.cookie = res.header['Set-Cookie']
    }

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
