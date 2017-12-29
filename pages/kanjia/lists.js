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
    kanjia: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Kanjia/lists',
      method: 'post',
      data: {},
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        app.getUserInfo(function (userInfo) {
          //更新数据
          that.setData({
            userInfo: userInfo,
            loadingHidden: true
          })
        });

        if(res.data.status == 1){
          that.setData({
            kanjia: res.data.pro,
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