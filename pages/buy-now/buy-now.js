import Product from '../product/product-model'
import Order from '../order/order-model.js';
import Cart from '../cart/cart-model'
import Address from '../../utils/Address.js';
import * as WxParse from '../../wxParse/wxParse'

const product = new Product();
const cart = new Cart();
const { wxParse } = WxParse;
const order = new Order();
const address = new Address();
const ms = 1000;
let timer;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    bid: null,
    countArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    productCount: 1,
    tabs: ['抢购规则', '商品详情', '产品参数'],
    currentTabsIndex: 0,
    cartTotalCounts: 0,
    canBuy: false,
    buyNowData: {},
    buyMsg : '请求数据中...',
    addressInfo: null,
    modalVisible: false,
    firstStock: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;
    let bid = options.bid;
    this.setData({
      id: id,
      bid: bid,
    })

    product.getDetailInfo(id, (data) => {
      this.setData({
        product: data
      })
      if (data.details !== null) {
        wxParse('detail', 'html', data.details.detail, this, 'auto');
      }
    })

    product.getBuyNowInfo(bid, (data) => {
      if (!Reflect.has(data, 'serverNow')) {
        wx.switchTab({
          url: '/pages/home/home',
        })
      }
      this.setData({
        buyNowData: data
      })
      wxParse('rules', 'html', data.rules, this, 'auto');
      if (data.limit_every > 0) {
        let countArray = Array(data.limit_every > data.stock ? data.stock : data.limit_every).fill(1).map((v, i) => i + 1);
        this.setData({
          countArray: countArray
        })
      }
    })

    /*显示收获地址*/
    address.getAddress((res) => {
      this._bindAddressInfo(res);
    }, (res) => {
      this.setData({
        modalVisible: true,
      })
    });
  },

  onShow: function () {
    this._reflashStock();
    this._reflashQualification();
  },

  checkCanBuyByTime: function () {
    let { serverNow, start_time, end_time, stock } = this.data.buyNowData
    
    if (start_time > serverNow) {
      let remain = start_time - serverNow
      let h = Math.floor(remain / 60 / 60),
        m = Math.floor(remain / 60 % 60),
        s = Math.floor(remain % 60)
      this.setData({
        canBuy: false,
        buyMsg: `抢购尚未开始，离开始还有 ${h} 时 ${m} 分 ${s} 秒`,
        buyNowData: { 
          ...this.data.buyNowData,
          serverNow: serverNow + ms / 1000
        }
      })
    } else if (end_time < serverNow || stock === 0) {
      this._clearTimer()
      this.setData({
        canBuy: false,
        buyMsg: '抢购已结束'
      })
    } else {
      let remain = end_time - serverNow
      let h = Math.floor(remain / 60 / 60),
      m = Math.floor(remain / 60 % 60),
      s = Math.floor(remain % 60)
      this.setData({
        canBuy: true,
        buyMsg: `抢购进行中，离结束还有 ${h} 时 ${m} 分 ${s} 秒`,
        buyNowData: {
          ...this.data.buyNowData,
          serverNow: serverNow + ms / 1000
        }
      })
    }
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

  onBuyNow: function (event) {
    this.setData({
      canBuy: false,
      buyMsg: '小探正在努力排队抢购中...',
    })
    this._doPay()
  },

  _clearTimer: function () {
    if (timer) {
      clearInterval(timer)
    }
  },

  /*绑定地址信息*/
  _bindAddressInfo: function (addressInfo) {
    this.setData({
      addressInfo: addressInfo
    });
  },

  /*支付*/
  _doPay: function () {
    var orderInfo = {
      orderProducts: [],
    };
    orderInfo.orderProducts.push({
      product_id: this.data.product.id,
      count: this.data.productCount,
      batch_id: this.data.bid,
    });

    var that = this;
    //支付分两步，第一步是生成订单号，然后根据订单号支付
    order.doOrder(orderInfo, (data) => {
      //订单生成成功
      if (data.pass) {
        var id = data.order_id;
        that._execPay(id);
      } else {
        that._orderFail(data);  // 下单失败
      }
      that._reflashStock();
      that._reflashQualification()
    });
  },

  _orderFail: function (data) {
    var nameArr = [],
      name = '',
      str = '',
      pArr = data.pStatusArray;
    for (let i = 0; i < pArr.length; i++) {
      if (!pArr[i].haveStock) {
        name = pArr[i].name;
        if (name.length > 15) {
          name = name.substr(0, 12) + '...';
        }
        nameArr.push(name);
        if (nameArr.length >= 2) {
          break;
        }
      }
    }
    str += nameArr.join('、');
    if (nameArr.length > 2) {
      str += ' 等';
    }
    str += ' 缺货';
    wx.showModal({
      title: '下单失败',
      content: str,
      showCancel: false,
      success: function (res) {

      }
    });
  },

  _execPay: function (id) {
    var that = this;
    order.execPay(id, (statusCode) => {
      if (statusCode != 0) {
        var flag = statusCode == 2;
        wx.navigateTo({
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=buynow'
        });
      }
    });
  },

  _reflashStock: function () {
    if (!this.data.firstStock) {
      product.getBuyNowStock(this.data.bid, (data) => {
        const { buyNowData } = this.data
        this.setData({
          buyNowData: {
            stock: data,
            ...buyNowData
          }
        })
      })
    } else {
      this.setData({
        firstStock: false,
      })
    }
  },

  _reflashQualification: function () {
    product.getUserBuyNowOrder(this.data.bid, (data) => {

      this._clearTimer()

      if (data) {
        this.setData({
          canBuy: false,
          buyMsg: '您已抢购过，请留机会给别人哦！'
        })
      } else {
        timer = setInterval(this.checkCanBuyByTime, ms)
      }
    })
  },

  /*修改或者添加地址信息*/
  editAddress: function () {
    var that = this;
    address.chooseAddress((addressInfo) => {
      this._bindAddressInfo(addressInfo)
    })
  },

  showTips: function (title) {
    wx.showToast({
      title: title,
    })
  },

  _hideModal: function () {
    this.setData({
      modalVisible: false
    })
  },
})