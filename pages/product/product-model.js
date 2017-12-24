import Base from '../../utils/Base'

export default class Product extends Base
{
  constructor() {
    super()
  }

  getDetailInfo(id,callback){
    this.request({
      url: 'product/' + id,
      sCallback: function(res) { 
        callback && callback(res)
      },
      fCallback: function(res) {
        console.log(res)
      }
    })
  }

  getBuyNowInfo(id,callback){
    this.request({
      url: 'buynow/' + id,
      sCallback: function (res) {
        callback && callback(res)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }

  getUserBuyNowOrder(id, callback){
    this.request({
      url: 'order/buynow/' + id,
      sCallback: function(res) {
        callback && callback(res)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }

  getBuyNowStock(bid, callback){
    this.request({
      url: 'buynow/' + bid + '/stock',
      sCallback: function(res) {
        callback && callback(res)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }
}