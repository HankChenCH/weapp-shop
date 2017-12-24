// home.js
import Home from './home-model'
import Theme from '../theme/theme-model'
import My from '../my/my-model.js';
import * as ws from '../../websocket/ws.js'

var my = new My();
const home = new Home();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    essenceThemes: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // home.getRecentProductsData((data) => {
    //   this.setData({
    //     productsArr: data
    //   })
    // })
    this._getHomeData()
    
    ws.on('weapp/theme/syncRank', () => {
      // console.log('onSyncThemeRank')
      this._getHomeData()
    })

    ws.on('weapp/theme/syncProduct', (res) => {
      const { essenceThemes } = this.data
      essenceThemes.map(item => {
        if(item.id !== parseInt(res.id)) { 
          return item
        }

        Theme.getThemeData(res.id, () => {

        })
      })
    })
  },

  _getHomeData: function () {
    home.getThemeData((data) => {
      const essenceThemes = data.map(item => {
        const products = item.products.map((p, pk) => {
          if (pk < 6) {
            return {
              ...p,
              name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name
            }
          } 
        })

        return {
          ...item,
          products
        }
      })
      this.setData({
        essenceThemes: essenceThemes
      })
    })
  },

  onProductsItemTap: function (event) {
    let id = home.getEventData(event, 'id')
    wx.navigateTo({
      url: '../product/product?id=' + id,
    })
  },

  onSearchTap: function (event) {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  onThemeTap: function (event) {
    let id = home.getEventData(event, 'id')
    wx.navigateTo({
      url: '../theme/theme?id=' + id,
    })
  },

  onCategoryTap: function (event) {
    wx.navigateTo({
      url: '../category/category',
    })
  },

  onOrderTap: function (event) {
    wx.navigateTo({
      url: '../order-list/order-list?status=1',
    })
  }
})