import * as ws from '../../websocket/ws.js';
import Order from '../order/order-model.js';

const order = new Order();

Page({
        data: {

        },
        onLoad: function (options){
            this.setData({
                payResult:options.flag,
                id:options.id,
                from:options.from
            });

            if ((options.from === 'buynow' || options.from === 'order') && options.flag === 'true') {
              order.getOrderInfoById(options.id, (res) => {
                ws.trigger('weapp/pay/notice', { orderInfo: res })
              })
            }
        },
        viewOrder:function(){
            if(this.data.from=='my' || this.data.from=='buynow'){
                wx.redirectTo({
                    url: '../order/order?from=order&id=' + this.data.id
                });
            }else{
                //返回上一级
                wx.navigateBack({
                    delta: 1
                })
            }
        }
    }
)