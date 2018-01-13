var app = getApp();

Page({
  data: {
    imgUrls: [{
      'photo': '/test/banner_01.jpg'
    }, {
      'photo': '/test/banner_02.jpg'
    }, {
      'photo': '/test/banner_01.jpg'
    }],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    circular: true,
    productData: [],
    proCat: [],
    page: 2,
    index: 2,
    brand: [],
    // 滑动
    imgUrl: [],
    kbs: [],
    lastcat: [],
    course: [],
  },

  //点击加载更多
  getMore: function (e) {
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Index/getlist',
      method: 'post',
      data: { page: page },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        var prolist = res.data.prolist;
        if (prolist == '') {
          wx.showToast({
            title: '没有更多数据！',
            duration: 2000
          });
          return false;
        }
        //that.initProductData(data);
        that.setData({
          page: page + 1,
          productData: that.data.productData.concat(prolist)
        });
        //endInitData
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
  },

  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },

  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Index/index',
      method: 'post',
      data: {},
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        var ggtop = res.data.ggtop;
        var procat = res.data.procat;
        var prolist = res.data.prolist;
        var brand = res.data.brand;
        var course = res.data.course;
        //that.initProductData(data);
        that.setData({
          imgUrls: ggtop ? ggtop : that.getData('imgUrls'),
          proCat: procat,
          productData: prolist,
          brand: brand,
          course: course
        });
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
  onShareAppMessage: function () {
    return {
      title: '壹砍价',
      path: '/pages/index/index',
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
  onPullDownRefresh: function(){
    //下拉刷新
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Index/index',
      method: 'post',
      data: {},
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        console.log(res);
        var ggtop = res.data.ggtop;
        var procat = res.data.procat;
        var prolist = res.data.prolist;
        var brand = res.data.brand;
        var course = res.data.course;
        //that.initProductData(data);
        that.setData({
          imgUrls: ggtop ? ggtop : that.getData('imgUrls'),
          proCat: procat,
          productData: prolist,
          brand: brand,
          course: course
        });
        //endInitData
      },
      fail: function (e) {
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  }

});