// pages/kanjia/lists.js
var app = getApp();

Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    total: 0,
    percent:0,
    nowkj:0,
    cankj:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(app.globalData);
    var userInfo = app.globalData.userInfo;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Kanjia/index?id=' + options.id + '&fu_id=' + userInfo.openid ,
      method: 'post',
      data: {},
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status == 1) {
          var kanjia = res.data.pro;
          var user = res.data.user;
          console.log(kanjia)
          console.log(user)
          var percent = 0,nowkj = 0,cankj = 0;

          if (!user){
            percent = 0;
            nowkj = kanjia.price;
            cankj = kanjia.price - kanjia.low;

          }else{
            percent = (1-user.price / kanjia.price) *100 ;
            percent = percent.toFixed(0);
            nowkj = user.price;
            cankj = user.price - kanjia.low ;
          }
          console.log(res.data.log)
          that.setData({
            kanjia: kanjia,
            percent: percent,
            nowkj: nowkj,
            cankj: cankj,
            log: res.data.log,
          });
        }

        //endInitData
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })


  },











})
