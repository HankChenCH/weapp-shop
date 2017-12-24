// theme.js
import Theme from 'theme-model'
import * as ws from '../../websocket/ws.js'

const theme = new Theme()

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    let name = options.name
    this.setData({
      id: id,
      name: name
    })

    this._getThemeData(id)

    ws.on('weapp/theme/syncProduct', (res) => {
      // console.log(res)
      this._getThemeData(res.id)
    })
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.name,
    })
  },

  _getThemeData: function (id) {
    theme.getThemeData(id, (data) => {
      this.setData({
        themeInfo: data
      })
    })
  },

  onProductsItemTap: function (event) {
    let id = theme.getEventData(event, 'id')
    wx.navigateTo({
      url: '../product/product?id=' + id,
    })
  },

})