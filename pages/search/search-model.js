import Base from '../../utils/Base.js';

export default class Search extends Base {
  constructor() {
    super()
    this._storageKeyName = 'user_search_list'
  }

  execSetStorageSync(data) {
    wx.setStorageSync(this._storageKeyName, data)
  }

  fetchUserSearchHistory() {
    let data = wx.getStorageSync(this._storageKeyName)
    if (!data) {
      wx.setStorageSync(this._storageKeyName, []);
      return [];
    }

    return data;
  }

  fetchAllSearchHistory(callback) {
    this.request({
      url: 'search/all',
      sCallback: function (result) {
        callback && callback(result)
      },
      fCallback: function () {

      }
    })
  }

  fetchProductsByKeyword(keyword, page, callback) {
    this.request({
      url: 'product/search?keyword=' + keyword + '&page=' + page + '&size=10',
      sCallback: function (result) {
        if(result.errorCode){
          result.data = [];
        }
        callback && callback(result.data)
      }
    })
  }

  addSearchHistory(keyword) {
    let searchList = this.fetchUserSearchHistory();
    let index = searchList.indexOf(keyword);
    if(index >= 0){
      searchList.unshift(searchList[index]);
      searchList.splice(index+1,1);
    }else{
      if (searchList.length === 5) {
        searchList.pop();
      }
      searchList.unshift(keyword);
    }

    this.execSetStorageSync(searchList);
  }
}