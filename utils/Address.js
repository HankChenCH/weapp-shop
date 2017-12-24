import Base from 'Base'
import Config from 'Config'

export default class Address extends Base {
  constructor() {
    super()
  }

  getAddress(callback,ecallback) {
    var that = this;
    var param = {
      url: 'address',
      sCallback: function (res) {
        if (res) {
          res.totalDetail = that.setAddressInfo(res);
          callback && callback(res);
        }
      },
      fCallback: function (res) {
        ecallback && ecallback(res);
      }
    };
    this.request(param);
  }

  getAddressInfo(callback, fcallback) {
    let that = this
    this.request({
      url: 'address',
      sCallback: function (res) {
        if (res) {
          res.totalDetail = that.setAddressInfo(res);
          callback && callback(res);
        }
      },
      fCallback: function () {
        fcallback && fcallback()
      }
    })
  }

  setAddressInfo(res) {
    let province = res.provinceName || res.province || '',
      city = res.cityName || res.city || '',
      county = res.countyName || res.country || '',
      detail = res.detailInfo || res.detail || ''

    let totalDetail = city + county + detail

    if (!this.isCenterCity(province)) {
      totalDetail = province + totalDetail
    }

    return totalDetail
  }

  isCenterCity(name) {
    let centerCity = ['北京市', '上海市', '重庆市', '天津市'],
      flag = centerCity.indexOf(name) >= 0
    return flag
  }

  submitAddress(data, callback) {
    data = this._setUpAddress(data);
    this.request({
      url: 'address',
      method: 'post',
      data: data,
      sCallback: function (res) {
        callback && callback(true, res)
      },
      eCallback: function (res) {
        callback && callback(false, res)
      }
    })
  }

  chooseAddress(sCallback) {
    wx.chooseAddress({
      success: function (res) {
        var addressInfo = {
          name: res.userName,
          mobile: res.telNumber,
          totalDetail: address.setAddressInfo(res)
        };
        if (res.telNumber) {
          sCallback && sCallback(addressInfo);
          //保存地址
          this.submitAddress(res, (flag) => {
            if (!flag) {
              wx.showModal({
                title: '操作提示',
                content: '地址信息更新失败！',
                showCancel: false,
              });
            }
          });
        }
      },
      fail: function (res) {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.address']) {
              wx.showModal({
                title: '重启地址授权提示',
                content: '尊敬的顾客大大，由于你10分钟内拒绝过地址授权，目前只能通过进入程序 右上角->关于探小店->右上角->设置 里设置地址授权，感谢您的合作，谢谢！',
                showCancel: false
              })
            }
          }
        })
      }
    })
  }

  _setUpAddress(res) {
    let formData = {
      name: res.userName,
      mobile: res.telNumber,
      province: res.provinceName,
      city: res.cityName,
      country: res.countyName,
      detail: res.detailInfo
    }
    return formData
  }
}