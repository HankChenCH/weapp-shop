import Address from '../../utils/Address.js';
import Order from '../order/order-model.js';
import My from 'my-model.js';

var address=new Address();
var order=new Order();
var my=new My();

Page({
    data: {
        pageIndex:1,
        isLoadedAll:false,
        loadingHidden:false,
        addressInfo:null,
        unPayCount: 0,
        unPackageCount: 0,
        deliveryCount: 0
    },
    onLoad:function(){
        this._loadData();
        this._getAddressInfo();
    },

    onShow:function(){
        //更新订单,相当自动下拉刷新,只有  非第一次打开 “我的”页面，且有新的订单时 才调用。
        var newOrderFlag=order.hasNewOrder();
        if(this.data.loadingHidden &&newOrderFlag){
            this.onPullDownRefresh();
        }
    },

    _loadData:function(){
        var that=this;
        my.getUserInfo((data)=>{
            that.setData({
                userInfo:data
            });

        });

        this._getOrderCounts();
        order.execSetStorageSync(false);  //更新标志位
    },

    /**地址信息**/
    _getAddressInfo:function(){
        var that=this;
        address.getAddress((addressInfo)=>{
            that._bindAddressInfo(addressInfo);
        });
    },

    /*修改或者添加地址信息*/
    editAddress:function(){
        var that=this;
        address.chooseAddress((addressInfo) => {
          this._bindAddressInfo(addressInfo)
        })
    },

    handleAboutTap: function () {
      wx.showModal({
        title: '关于探小店',
        content: "探小店成立于2017年11月11日11时11分，我们致力于寻找新奇有趣的商品，作为分享平台提供给客户选择。\n感谢中山B&H工作室提供技术支持。",
        showCancel: false
      })
    },

    /*绑定地址信息*/
    _bindAddressInfo:function(addressInfo){
        this.setData({
            addressInfo: addressInfo
        });
    },

    _getOrderCounts: function () {
      order.getUserCounts((data) => {
        this.setData({
          unPayCount: data.unpay || 0,
          unPackageCount: data.package || 0,
          deliveryCount: data.delivery || 0,
          isLoadedAll: true,
          loadingHidden: true,
        })
      })
    },

    /*显示订单的具体信息*/
    showOrderDetailInfo:function(event){
        var id=order.getEventData(event,'id');
        wx.navigateTo({
            url:'../order/order?from=order&id='+id
        });
    },

    /*未支付订单再次支付*/
    rePay:function(event){
        var id=order.getEventData(event,'id'),
            index=order.getEventData(event,'index');

        //online 上线实例，屏蔽支付功能
        if(order.onPay) {
            this._execPay(id,index);
        }else {
            this.showTips('支付提示','本产品仅用于演示，支付系统已屏蔽');
        }
    },

    /*支付*/
    _execPay:function(id,index){
        var that=this;
        order.execPay(id,(statusCode)=>{
            if(statusCode>0){
                var flag=statusCode==2;

                //更新订单显示状态
                if(flag){
                    that.data.orderArr[index].status=2;
                    that.setData({
                        orderArr: that.data.orderArr
                    });
                }

                //跳转到 成功页面
                wx.navigateTo({
                    url: '../pay-result/pay-result?id='+id+'&flag='+flag+'&from=my'
                });
            }else{
                that.showTips('支付失败','商品已下架或库存不足');
            }
        });
    },

    /*下拉刷新页面*/
    onPullDownRefresh: function(){
        var that=this;
        this.data.orderArr=[];  //订单初始化
        this._getOrderCounts(()=>{
            that.data.isLoadedAll=false;  //是否加载完全
            that.data.pageIndex=1;
            wx.stopPullDownRefresh();
            order.execSetStorageSync(false);  //更新标志位
        });
    },


    onReachBottom:function(){
        if(!this.data.isLoadedAll) {
            this.data.pageIndex++;
            this._getOrderCounts();
        }
    },

    /*
     * 提示窗口
     * params:
     * title - {string}标题
     * content - {string}内容
     * flag - {bool}是否跳转到 "我的页面"
     */
    showTips:function(title,content){
        wx.showModal({
            title: title,
            content: content,
            showCancel:false,
            success: function(res) {

            }
        });
    },

})