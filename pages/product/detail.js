//index.js  
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  firstIndex: -1,
  data: {
    bannerApp: true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换  
    productId: 0,
    itemData: {},
    bannerItem: [],
    buynum: 1,
    // 产品图片轮播
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
    commodityAttr: [],
    attrValueList: [],
    token: '',
    kjPer: '',
    kjUser: [],
    kjType: ''
  },

  // 传值
  onLoad: function(option) {
    //this.initNavHeight();
    var that = this;
    that.setData({
      productId: option.productId,
      token: option.token
    });
    that.loadProductDetail(); //加载商品详情
    wx.showShareMenu({withShareTicket: true})
  },
  // 商品详情数据获取
  loadProductDetail: function(callback) {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/bkindex',
      method: 'post',
      data: {
        pro_id: that.data.productId,
        token: app.globalData.userInfo.openid,  //自己
        openid: that.data.token   //帮砍对象
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        //--init data 
        console.log(res);
        var status = res.data.status;
        if (status == 1) {
          var pro = res.data.pro;
          var content = pro.content;
          //that.initProductData(data);
          WxParse.wxParse('content', 'html', content, that, 3);
          that.setData({
            itemData: pro,
            kjPer: (100 - Math.round(pro.kjPrice / (pro.price - pro.kj_lowprice) * 10000) / 100.00) + "%",
            kjOne: pro.log ? pro.log[0] : {},
            kjUser: pro.log ? pro.log : [],
            kjType:pro.kjType,
            bannerItem: pro.img_arr,
            // commodityAttr: res.data.commodityAttr,
            // attrValueList: res.data.attrValueList,
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
          setTimeout(function(){
            wx.switchTab({
              url: '/pages/index/index'
            })
          },2000)
        }
      },
      error: function(e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },
    });
  },
  initProductData: function(data) {
    data["LunBoProductImageUrl"] = [];

    var imgs = data.LunBoProductImage.split(';');
    for (let url of imgs) {
      url && data["LunBoProductImageUrl"].push(app.d.hostImg + url);
    }

    data.Price = data.Price / 100;
    data.VedioImagePath = app.d.hostVideo + '/' + data.VedioImagePath;
    data.videoPath = app.d.hostVideo + '/' + data.videoPath;
  },
  helpTa: function(e) { //帮他砍
    var that = this;
    var title = "";
    var openid = that.data.token;
    if (e.currentTarget.dataset.type == 'helpMe') {
      title = "已砍";
      openid = app.globalData.userInfo.openid;
      that.setData({
        kjType: true
      });
    } else {
      title = '帮Ta砍';
    }
    wx.request({
      url: app.d.ceshiUrl + '/Api/kanjia/simplekan',
      method: 'post',
      data: {
        fu_id: openid,
        kj_id: that.data.productId,
        mu_id: app.globalData.userInfo.openid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        // //--init data
        if (res.data.status == 0) {
          that.loadProductDetail();
          wx.showToast({
            title: title + res.data.price,
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      }.bind(that),
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  //砍价排行榜弹窗
  showKjUserList: function(e) {

    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    this.animation = animation
    animation.translateY(300).step();

    this.setData({
      animationData: animation.export()
    })

    this.setData({
      showKjModalStatus: true
    });
    // if (e.currentTarget.dataset.status == 1) {
    //   this.setData({
    //     showModalStatus: true
    //   });
    // }
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showKjModalStatus: false
        });
      }
    }.bind(this), 200)
  },
  bindChange: function(e) { //滑动切换tab 
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },
  initNavHeight: function() { ////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed: function() {
    this.setData({
      bannerApp: false,
    })
  },
  swichNav: function(e) { //点击tab切换
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  onShareAppMessage: function(res) {
    var that = this;
    var url = "/pages/product/detail?productId=" + that.data.productId + "&token=" + app.globalData.userInfo.openid
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // 
      url += "&k=1";
    }
    return {
      title: "帮忙砍价【" + that.data.itemData.name + "】",
      path: url,
      success: function(res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(res) {
        // 转发失败
        console.log(res);
      }
    }
  }

});