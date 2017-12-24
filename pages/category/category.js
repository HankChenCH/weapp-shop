// category.js
import Category from 'category-model'

const category = new Category()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentCategoryIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    category.getCategoryType((categoryData) => {
      this.setData({
        categoryTypeArr: categoryData
      })

      category.getProductsByCategory(categoryData[0].id,(data) => {
        let dataObj = {
          products: data,
          title: categoryData[0].name,
          topImgUrl: categoryData[0].img.url
        }

        this.setData({
          categoryProducts: dataObj
        })
      })
    })
  },

  onCategoryTap: function (event){
    let index = category.getEventData(event, 'index')
    category.getProductsByCategory(this.data.categoryTypeArr[index].id, (data) => {

      let dataObj = {
        products: data,
        title: this.data.categoryTypeArr[index].name,
        topImgUrl: this.data.categoryTypeArr[index].img.url
      }
      
      this.setData({
        currentCategoryIndex: index,
        categoryProducts: dataObj
      })
    })
  },

  onProductsItemTap: function (event){
    let id = category.getEventData(event, 'id')
    wx.navigateTo({
      url: '../product/product?id=' + id,
    })
  }

})