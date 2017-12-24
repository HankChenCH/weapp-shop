import Config from '../utils/Config.js'
import { Base64 } from '../utils/Base64.js'

const eventListener = []
let hreatbeatTimer

export function connect(token) {
  const ip = JSON.parse(Base64.decode(token.split('.')[1])).user.ip
    wx.connectSocket({
      url: Config.wsUrl + '?token=' + token + '&ip=' + ip,
      success: function () {
        console.log('connect success')
        wx.onSocketOpen(function (res) {
          console.log('ws open')
          if (!hreatbeatTimer) {
            hreatbeatTimer = setInterval(() => wx.sendSocketMessage({
              data: JSON.stringify({event: 'hreakbeatCheck'}),
            }), 25000)
          }

          wx.onSocketMessage(function (res) {
            const message = JSON.parse(res.data)
            console.log(eventListener[message.event])
            // if (eventListener[message.event] instanceof Function) {
              eventListener[message.event](message)
            // }
          })
  
        })
      }
    })
}

export function on(event, cb) {
  if (eventListener[event] instanceof Function) {
    console.error('this event already has listener function,please checkout!')
    return;
  }

  eventListener[event] = cb
}

export function sendMsg(data) {
  const sendBody = { ...data, event: 'msg' }
  wx.sendSocketMessage({
    data: JSON.stringify(sendBody),
  })
}

export function trigger(event, data) {
  const sendBody = { ...data, event: event }
  wx.sendSocketMessage({
    data: JSON.stringify(sendBody),
  })
}

export function close() {
  if (hreatbeatTimer) {
    clearInterval(hreatbeatTimer)
  }

  wx.onSocketClose(function (res) {
    console.log('WebSocket 已关闭！')
  })
}