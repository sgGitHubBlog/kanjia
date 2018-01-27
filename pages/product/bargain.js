//index.js  
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  firstIndex: -1,
  data: {
    bannerApp: true,
    productId: 0,
    openId: '',
    itemData: {},
    bannerItem: [],
    // 产品图片轮播
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
    commodityAttr: [],
    attrValueList: [],
    helpTaStatus: 0,
    kjJdStatus: 0,
    token: '',
    kjPer: '',
    kjUser: [],
    kjType: true,
    kjPrice: '',
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    bargain_time:''
  },
  //返回顶部
  goTop: function (e) {
    this.setData({
      scrollTop: 0
    })
  },
  scroll: function (e, res) {
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    if (e.detail.scrollTop > 500) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
  // 传值
  onLoad: function (option) {
    //this.initNavHeight();
    var that = this;
    that.setData({
      productId: option.productId,
      openId: app.globalData.userInfo.openid,
      token: app.globalData.userInfo.openid
    });
    that.loadProductDetail(); //加载商品详情
    wx.showShareMenu({withShareTicket: true});
  },
  // 商品详情加载完成后 调用  
  countdown: function () {
    var that = this;
    var totalSecond = that.data.bargain_time - Date.parse(new Date()) / 1000;

    var interval = setInterval(function () {
      // 秒数  
      var second = totalSecond;

      // 天数位  
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位  
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位  
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位  
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownDay: parseInt(dayStr),
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        wx.showToast({
          title: '活动已结束',
        });
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
  }, 
  // 商品详情数据获取
  loadProductDetail: function (callback) {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/index',
      method: 'post',
      data: {
        pro_id: that.data.productId,
        token: app.globalData.userInfo.openid
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data 
        var status = res.data.status;
        if (status == 1) {
          var pro = res.data.pro;
          var content = pro.content;
          //that.initProductData(data);
          WxParse.wxParse('content', 'html', content, that, 3);
          that.setData({
            itemData: pro,
            kjType: pro.kjType == 1 ? true:false,
            bargain_time: pro.et_time,
            bannerItem: pro.img_arr,
            commodityAttr: res.data.commodityAttr,
            attrValueList: res.data.attrValueList,
          });
          that.countdown();
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },
    });
  },

  initProductData: function (data) {
    data["LunBoProductImageUrl"] = [];

    var imgs = data.LunBoProductImage.split(';');
    for (let url of imgs) {
      url && data["LunBoProductImageUrl"].push(app.d.hostImg + url);
    }

    data.Price = data.Price / 100;
    data.VedioImagePath = app.d.hostVideo + '/' + data.VedioImagePath;
    data.videoPath = app.d.hostVideo + '/' + data.videoPath;
  },
  helpTa: function (e) { //帮他砍
    var that = this;
    var title = "";
    var formId = e.detail.formId;
    wx.request({
      url: app.d.ceshiUrl + '/Api/kanjia/simplekan',
      method: 'POST',
      data: {
        fu_id: app.globalData.userInfo.openid,
        kj_id: that.data.productId,
        mu_id: app.globalData.userInfo.openid,
        username: app.globalData.userInfo.nikeName,
        dijia: that.data.itemData.kj_lowprice,
        product_name: that.data.itemData.name,
        
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data
        if (e.currentTarget.dataset.type == 'helpMe') {
          title = "已砍";
          that.setData({
            kjType: false,
            kjJdStatus:true,
            kjPrice: that.data.itemData.price - res.data.price
          });
        }
        //发送通知消息
        console.log(res);
        var item = {
          keyword1: {
            value: app.globalData.userInfo.nickName,
            color: '#dd2727',
          },
          keyword2: {
            value: '您已经成功发起砍价，砍至' + parseFloat(that.data.itemData.kj_lowprice) + '元即为砍价成功，点击进入分享给您的好友，让TA们帮您砍价吧',
            color: '#dd2727',
          },
          keyword3: {
            value: that.data.itemData.name,
            color: '#dd2727',
          },
          keyword4: {
            value: res.data.addtime,
            color: '#dd2727',
          }
        };
        wx.request({
          url: app.d.ceshiUrl + '/Api/Kanjia/sendMsg',
          method: 'POST',
          data: {
            tpl:app.d.tpl.tpl_2,
            openid: app.globalData.userInfo.openid,
            page: '/pages/product/bargain?productId=' + that.data.productId,
            formId: formId,
            keyword: JSON.stringify(item),
            //bigField:'keyword4.DATA'
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res);
          },
          fail:function(res){
            console.log(res);
          }
        })
        if (res.data.status == 0) {
          wx.showToast({
            title: title + res.data.price,
            icon: 'success',
            duration: 2000
          });
          that.loadProductDetail();
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      }.bind(that),
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  onShareAppMessage: function (res) {
    var that = this;
    var url = "/pages/product/detail?productId=" + that.data.productId + "&token=" + app.globalData.userInfo.openid
    if (res.from === 'button') {
      url += "&k=1";
    }
    return {
      title: "帮忙砍价【" + that.data.itemData.name + "】",
      path: url,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (res) {
        // 转发失败
        console.log(res);
      }
    }
  }

});