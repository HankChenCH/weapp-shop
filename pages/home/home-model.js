import Base from '../../utils/Base';

export default class Home extends Base 
{
  constructor() {
    super()
  }

  getBannerData(id, callback) {
    this.request({
      url: 'banner/' + id,
      sCallback: function (data) {
        callback && callback(data.items)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }

  getThemeData(callback) {
    this.request({
      url: 'theme/essence',
      sCallback: function (data) {
        callback && callback(data)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }

  getRecentProductsData(callback) {
    this.request({
      url: 'product/recent',
      sCallback: function (data) {
        callback && callback(data)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }
}