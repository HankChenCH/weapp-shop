import Base from '../../utils/Base'

export default class Theme extends Base
{
  constructor() {
    super()
  }

  getThemeData(id,callback){
    this.request({
      url: 'theme/' + id,
      sCallback: function (data) {
        callback && callback(data)
      },
      fCallback: function (res) {
        console.log(res)
      }
    })
  }

}