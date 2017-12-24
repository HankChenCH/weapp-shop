/**
 * Created by jimmy on 17/03/09.
 */

import Base from '../../utils/Base.js'

export default class Order extends Base{

    constructor(){
        super();
        this._storageKeyName='newOrder';
        this.onPay = true;
    }

    /*下订单*/
    doOrder(param,callback){
        var that=this;
        var allParams = {
            url: 'order',
            method:'POST',
            data: param,
            sCallback: function (data) {
                that.execSetStorageSync(true);
                callback && callback(data);
            },
            eCallback:function(){
                }
            };
        this.request(allParams);
    }

    /*
    * 拉起微信支付
    * params:
    * norderNumber - {int} 订单id
    * return：
    * callback - {obj} 回调方法 ，返回参数 可能值 0:商品缺货等原因导致订单不能支付;  1: 支付失败或者支付取消； 2:支付成功；
    * */
    execPay(ids,callback){
        let data;
        if (ids instanceof Array) {
          data = { id: ids[0], bid: ids[1] };
        } else {
          data = { id: ids };
        }

        var allParams = {
            url: 'pay/pre_order',
            method:'POST',
            data:data,
            sCallback: function (data) {
                var timeStamp= data.timeStamp;
                if(timeStamp) { //可以支付
                    wx.requestPayment({
                        'timeStamp': timeStamp.toString(),
                        'nonceStr': data.nonceStr,
                        'package': data.package,
                        'signType': data.signType,
                        'paySign': data.paySign,
                        success: function () {
                            callback && callback(2);
                        },
                        fail: function () {
                            callback && callback(1);
                        }
                    });
                }else{
                    callback && callback(1);
                }
            }
        };
        this.request(allParams);
    }

    /*获得所有订单,pageIndex 从1开始*/
    getOrders(pageIndex, status, callback){
        var allParams = {
            url: 'order/by_user',
            data:{page:pageIndex,status:status},
            method:'get',
            sCallback: function (data) {
                callback && callback(data);  //1 未支付  2，已支付  3，已发货，4已支付，但库存不足
             }
        };
        this.request(allParams);
    }

    /*获得订单的具体内容*/
    getOrderInfoById(id,callback){
        var that=this;
        var allParams = {
            url: 'order/'+id,
            sCallback: function (data) {
                callback &&callback(data);
            },
            eCallback:function(){

            }
        };
        this.request(allParams);
    }

    /*获取快递费用以及包邮规则*/
    getExpressLimit(callback) {
        var that = this;
        var allParams = {
            url: 'express/all',
            sCallback: function (data){
                callback && callback(data);
            },
            ecallback:function(){

            }
        }
        this.request(allParams);
    }

    getUserCounts(callback){
      this.request({
        url: 'order/counts',
        sCallback: function (data){
          callback && callback(data)
        }
      })
    }

    /*本地缓存 保存／更新*/
    execSetStorageSync(data){
        wx.setStorageSync(this._storageKeyName,data);
    };

    /*是否有新的订单*/
    hasNewOrder(){
       var flag = wx.getStorageSync(this._storageKeyName);
       return flag==true;
    }

}