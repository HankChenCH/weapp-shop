import Config from 'Config'
import Token from 'Token'

export default class Base {
  constructor() {
    this.baseUrl = Config.baseUrl;
  }

  request(params, noRefetch=false) {
    const url = this.baseUrl + params.url;
    let that = this

    if (!params.method) {
      params.method = 'GET';
    }

    wx.request({
      url: url,
      method: params.method,
      data: params.data,
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: function (res) {
        let code = res.statusCode.toString()
        let startChar = code.charAt(0)

        if (startChar == '2') {
          params.sCallback && params.sCallback(res.data);
        } else {
          if (code == '401') {
            if(!noRefetch){
              that._refetch(params)              
            }
          }
          if (code == '404' || code == '400'){
            wx.showToast({
              title: res.data.msg,
            })
            params.fCallback && params.fCallback(res);
          } else if (!noRefetch){
            params.sCallback && params.sCallback(res.data);
          }
        }
      },
      fail: function (res) {
        params.fCallback && params.fCallback(res);
      }
    })
  }

  _refetch(params) {
    let token = new Token()
    token.getTokenFromServer((token) => {
      this.request(params,true)
    })
  }

  getEventData(event, key) {
    return event.currentTarget.dataset[key]
  }
}