import Token from 'utils/Token'
import My from 'pages/my/my-model.js'
import * as ws from 'websocket/ws.js'

App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    let token  = new Token();
    let my = new My();
    token.verify((token) => ws.connect(token));
    my.getUserInfo();
  },

  onShow: function () {
    const token = wx.getStorageSync('token');
    if (token) {
      ws.connect(token);
    }
  },

  onHide: function () {
    ws.close()
  }
})
