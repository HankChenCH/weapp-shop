import Order from '../order/order-model.js';

var order = new Order();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderArr: [],
    loadingHidden: false,
    isLoadedAll: false,
    pageIndex: 1,
    status: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const status = options.status
    this._loadData(status)
  },

  _loadData: function (status) {
    this._getOrders(status, () => {
      this.setData({
        status: status
      })
    })
  },

  handleChangeStatus: function (e) {
    const status = order.getEventData(e, 'status')
    this._getOrders(status, () => {
      this.setData({
        status: status
      })
    })
  },

  /*未支付订单再次支付*/
  rePay: function (event) {
    var id = order.getEventData(event, 'id'),
      index = order.getEventData(event, 'index');

    //online 上线实例，屏蔽支付功能
    if (order.onPay) {
      this._execPay(id, index);
    } else {
      this.showTips('支付提示', '本产品仅用于演示，支付系统已屏蔽');
    }
  },

  /*显示订单的具体信息*/
  showOrderDetailInfo: function (event) {
    var id = order.getEventData(event, 'id');
    wx.navigateTo({
      url: '../order/order?from=order&id=' + id
    });
  },

  /*支付*/
  _execPay: function (id, index) {
    var that = this;
    order.execPay(id, (statusCode) => {
      if (statusCode > 0) {
        var flag = statusCode == 2;

        //更新订单显示状态
        if (flag) {
          that.data.orderArr[index].status = 2;
          that.setData({
            orderArr: that.data.orderArr
          });
        }

        //跳转到 成功页面
        wx.navigateTo({
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=my'
        });
      } else {
        that.showTips('支付失败', '商品已下架或库存不足');
      }
    });
  },

  /*下拉刷新页面*/
  onPullDownRefresh: function () {
    var that = this;
    this.data.orderArr = [];  //订单初始化
    let status = this.data.status
    this._getOrders(status, () => {
      that.data.isLoadedAll = false;  //是否加载完全
      that.data.pageIndex = 1;
      wx.stopPullDownRefresh();
      order.execSetStorageSync(false);  //更新标志位
    });
  },


  onReachBottom: function () {
    if (!this.data.isLoadedAll) {
      this.data.pageIndex++;
      this._getOrders();
    }
  },

  /*订单信息*/
  _getOrders: function (status, callback) {
    var that = this;
    order.getOrders(this.data.pageIndex, status, (res) => {
      var data = res.data;
      that.setData({
        loadingHidden: true
      });
      if (data.length > 0 && this.data.status == status && this.pageIndex > 1) {
        that.data.orderArr.push.apply(that.data.orderArr, res.data);  //数组合并
        that.setData({
          orderArr: that.data.orderArr
        });
      } else {
        that.data.isLoadedAll = true;  //已经全部加载完毕
        that.data.pageIndex = 1;
        that.setData({
          orderArr: res.data
        });
      }
      callback && callback();
    });
  },

  /*
     * 提示窗口
     * params:
     * title - {string}标题
     * content - {string}内容
     * flag - {bool}是否跳转到 "我的页面"
     */
  showTips: function (title, content) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function (res) {

      }
    });
  },
})