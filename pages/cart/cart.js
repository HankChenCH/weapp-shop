// pages/cart/cart.js
import Cart from 'cart-model'

const cart = new Cart();

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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '购物车',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let cartData = cart.getCartDataFromLocal()
    let cal = this._calcTotalAccountAndCounts(cartData)

    this.setData({
      selectedCounts: cal.selectedCounts,
      selectedTypeCounts: cal.selectedTypeCounts,
      account: cal.account,
      cartData: cartData
    })
  },

  onHide: function () {
    cart.execSetStorageSync(this.data.cartData)
  },

  submitOrder: function (event) {
    wx.navigateTo({
      url: '../order/order?account=' + this.data.account + '&from=cart',
    })
  },

  toggleSelect: function (event) {

    let index = cart.getEventData(event, 'index')
    let status = cart.getEventData(event, 'status')

    this.data.cartData[index].selectStatus = !status

    this._resetCartData()
  },

  toggleSelectAll: function (event) {
    let status = cart.getEventData(event, 'status') == 'true'
    let len = this.data.cartData.length

    for (let i = 0; i < len; i++) {
      this.data.cartData[i].selectStatus = !status
    }

    this._resetCartData();
  },

  changeCounts: function (event) {
    let id = cart.getEventData(event, 'id');
    let index = cart.getEventData(event, 'index');
    let changeType = cart.getEventData(event, 'type');
    let count = 0

    if (changeType == 'add') {
      count = 1;
      cart.addCounts(id);
    } else {
      count = -1;
      cart.cutCounts(id);
    }

    this.data.cartData[index].counts += count;
    this._resetCartData();
  },

  onDelTap: function (event) {
    let id = cart.getEventData(event, 'id')
    let index = cart.getEventData(event, 'index')
    this.data.cartData.splice(index, 1)
    this._resetCartData()
    cart.del(id)
  },

  _resetCartData: function () {
    let newData = this._calcTotalAccountAndCounts(this.data.cartData)
    this.setData({
      selectedCounts: newData.selectedCounts,
      selectedTypeCounts: newData.selectedTypeCounts,
      account: newData.account,
      cartData: this.data.cartData
    })
  },

  _calcTotalAccountAndCounts: function (data) {
    let len = data.length,
      account = 0,
      selectedCounts = 0,
      selectedTypeCounts = 0

    let multiple = 100

    for (let i = 0; i < len; i++) {
      if (data[i].selectStatus) {
        account += data[i].counts * multiple * data[i].price * multiple
        selectedCounts += data[i].counts
        selectedTypeCounts++
      }
    }

    return {
      selectedCounts: selectedCounts,
      selectedTypeCounts: selectedTypeCounts,
      account: account / (multiple * multiple)
    }
  }
})