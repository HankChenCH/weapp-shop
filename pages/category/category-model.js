import Base from '../../utils/Base'

export default class Category extends Base
{
  constructor() {
    super()
  }

  getCategoryType(callback){
    this.request({
      url: 'category/all',
      sCallback: function (data){
        callback && callback(data)
      }
    })
  }

  getProductsByCategory(id, callback){
    this.request({
      url: 'product/by_category?id=' + id,
      sCallback: function (data){
        callback && callback(data)
      }
    })
  }
}