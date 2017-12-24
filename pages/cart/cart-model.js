import Base from '../../utils/Base'

export default class Cart extends Base 
{
  constructor() {
    super()
    this._storageKeyName = "cart"
  }

  execSetStorageSync(data) {
    wx.setStorageSync(this._storageKeyName, data)
  }

  add(item, counts) {
    let cartData = this.getCartDataFromLocal();
    let isHasInfo = this._isHasThatOne(item.id, cartData);

    if (isHasInfo.index == -1) {
      item.counts = counts;
      item.selectStatus = true;
      cartData.push(item);
    } else {
      cartData[isHasInfo.index].counts += counts;
    }

    wx.setStorageSync(this._storageKeyName, cartData);
  }

  del(ids) {
    if (!(ids instanceof Array)) {
      ids = [ids];
    }
    let cartData = this.getCartDataFromLocal();
    for (let i = 0; i < ids.length; i++) {
      let hasInfo = this._isHasThatOne(ids[i], cartData);
      if (hasInfo.index != -1) {
        cartData.splice(hasInfo.index, 1);
      }
    }

    wx.setStorageSync(this._storageKeyName, cartData);
  }

  getCartDataFromLocal(flag=false) {
    let res = wx.getStorageSync(this._storageKeyName)

    if (!res) {
      return [];
    }

    if(flag){
      let newRes = [];
      for(let i=0; i<res.length; i++){
        if(res[i].selectStatus){
          newRes.push(res[i]);
        }
      }

      res = newRes;
    }

    return res;
  }

  addCounts(id) {
    this._changeCounts(id, 1)
  }

  cutCounts(id) {
    this._changeCounts(id, -1)
  }

  _isHasThatOne(id, arr) {
    let item,
      result = { index: -1 };

    for (let i = 0; i < arr.length; i++) {
      item = arr[i];
      if (item.id == id) {
        result = {
          index: i,
          data: item
        };
        break;
      }
    }

    return result;
  }

  _changeCounts(id, counts) {
    let cartData = this.getCartDataFromLocal(),
      hasInfo = this._isHasThatOne(id, cartData);

    if (hasInfo.index != -1) {
      if (hasInfo.data.counts >= 0 && counts > 0) {
        cartData[hasInfo.index].counts += counts;
      }

      if (hasInfo.data.counts >= 1 && counts < 0) {
        cartData[hasInfo.index].counts += counts;
      }
    }

    wx.setStorageSync(this._storageKeyName, cartData)
  }

  getCartTotalCount(flag = false) {
    let data = this.getCartDataFromLocal();
    let counts = 0;

    for (let i = 0; i < data.length; i++) {
      if (flag) {
        if (data[i].selectStatus) {
          counts += data[i].counts;
        }
      } else {
        counts += data[i].counts;
      }
    }

    return counts;
  }

}