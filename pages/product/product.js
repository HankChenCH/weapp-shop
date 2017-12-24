// product.js
import Product from 'product-model'
import Cart from '../cart/cart-model'
import * as WxParse from '../../wxParse/wxParse' 

const product = new Product();
const cart = new Cart();
const { wxParse } = WxParse

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    countArray: [1,2,3,4,5,6,7,8,9,10],
    productCount: 1,
    tabs: ['商品详情', '产品参数', '售后保障'],
    currentTabsIndex: 0,
    cartTotalCounts: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    this.setData({
      id: id,
      cartTotalCounts: cart.getCartTotalCount()
    })

    product.getDetailInfo(id, (data) => {
      this.setData({
        product: data
      })
      if (data.details !== null){
        wxParse('detail', 'html', data.details.detail, this, 'auto');        
      }
    })
  },

  onPickerChange: function (event) {
    let index = event.detail.value
    let selectCount = this.data.countArray[index]
    this.setData({
      productCount: selectCount
    })
  },

  onTabsItemTap: function (event) {
    let index = product.getEventData(event, 'index')
    this.setData({
      currentTabsIndex: index
    })
  },

  onCartTap: function (event) {
    console.log('cartTap')
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  onAddingToCartTap: function (event) {
    this.addToCart();
    this.setData({
      cartTotalCounts: cart.getCartTotalCount()
    })
  },

  addToCart: function (){
    let temObj = {}
    let keys = ['id','name','main_img_url','price']

    for(let key in this.data.product){
      if(keys.indexOf(key) >= 0){
        temObj[key] = this.data.product[key]
      }
    }

    cart.add(temObj, this.data.productCount)
    
  }
})