// search.js
import Search from 'search-model.js';

const search = new Search();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchProducts: [],
    userSearchHistory: [],
    allSearchHistory: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userSearchHistory = search.fetchUserSearchHistory();
    this.setData({
      userSearchHistory: userSearchHistory
    })

    // search.fetchAllSearchHistory((data) => {
    //   this.setData({
    //     allSearchHistory: data
    //   })
    // })
  },

  onSubmitSearch: function (event) {
    let keyword = event.detail.value;
    if (keyword === ' ') {
      wx.showToast({
        title: '搜索词不能为空',
      })
      return;
    }
    this._execFetchProductsByKeyWord(keyword);
  },

  onProductsItemTap: function (event) {
    let id = search.getEventData(event, 'id')
    wx.navigateTo({
      url: '../product/product?id=' + id,
    })
  },

  onKeyWordTap: function (event) {
    let keyword = search.getEventData(event, 'keyword');
    this._execFetchProductsByKeyWord(keyword);
  },

  _execFetchProductsByKeyWord: function (keyword,page=1) {
    search.fetchProductsByKeyword(keyword, page, (data) => {

      this.setData({
        searchProducts: [...this.data.searchProducts, ...data],
        onSearchWord: keyword,
        onSearchPage: page
      })
      search.addSearchHistory(keyword);
    })
  },

  onReachBottom: function () {
    if (this.data.searchProducts.length == 0){
      return;
    }

    this._execFetchProductsByKeyWord(this.data.onSearchWord,this.data.onSearchPage + 1)
  }
})