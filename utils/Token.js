import Config from 'Config'

export default class Token 
{
  constructor() {
    this.tokenUrl = Config.baseUrl + 'token/user'
    this.verifyUrl = Config.baseUrl + 'token/verify'
  }

  verify(callback) {
    let token = wx.getStorageSync('token')
    if (!token) {
      this.getTokenFromServer(callback)
    } else {
      this._verifyFromServer(token, callback)
    }
  }

  getTokenFromServer(callback) {
    let that = this
    wx.login({
      success: function (res) {
        wx.request({
          url: that.tokenUrl,
          method: 'POST',
          data: {
            code: res.code
          },
          success: function (res) {
            wx.setStorageSync('token', res.data.token)
            callback && callback(res.data.token)
          }
        })
      }
    })
  }

  _verifyFromServer(token, callback) {
    let that = this
    wx.request({
      url: that.verifyUrl,
      method: 'POST',
      data: {
        token: token
      },
      success: function (res) {
        if (!res.data.isValid){
          that.getTokenFromServer(callback)
        }
      }
    })
  }
}