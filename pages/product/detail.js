//index.js  
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    bannerApp: true,
    productId: 0,
    itemData: {},
    bannerItem: [],
    buynum: 1,
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
    token: '',
    kjPer: '',
    kjUser: [],
    kjType: '',
    myBk: false
  },

  onReady:function(){},
  // 传值
  onLoad: function(option) {
    var that = this;
    /*wx.showLoading({
      title: '加载中',
      mask:true
    })*/
    app.getUserInfo(function(userInfo){
      console.log(userInfo);
      app.globalData.userInfo = userInfo;
      that.setData({
        productId: option.productId,
        token: option.token,
        openid: userInfo.openid
      });
      that.loadProductDetail(); //加载商品详情
    })
    //wx.showShareMenu({withShareTicket: true})
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
          WxParse.wxParse('content', 'html', content, that, 3);
          that.setData({
            itemData: pro,
            kjPer: (100 - Math.round((pro.price - pro.kjPrice) / (pro.price - pro.kj_lowprice) * 10000) / 100.00) + "%",
            kjOne: pro.log ? pro.log[0] : {},
            kjUser: pro.log ? pro.log : [],
            kjType:pro.kjType,
            myBk:pro.myBk,
            bannerItem: pro.img_arr,
            // commodityAttr: res.data.commodityAttr,
            // attrValueList: res.data.attrValueList,
          });
          that.countdown(pro.et_time);
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
        } else {
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
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
  // 砍价剩余时间  
  countdown: function (time) {
    var that = this;
    var totalSecond = time - Date.parse(new Date()) / 1000;

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
  helpTa: function(e) { //帮他砍
    var that = this;
    var title = "";
    var openid = that.data.token;
    //var formId = e.detail.formId;
    if (e.target.dataset.type == 'helpMe') {
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
          
          //if (e.detail.target.dataset.type == 'helpTa'){
              // var item = {
              //   keyword1: {
              //     value: that.data.itemData.name,
              //     color: '#dd2727',
              //   },
              //   keyword2: {
              //     value: '已有' + (that.data.kjUser.length + 1) + '人砍价',
              //     color: '#dd2727',
              //   },
              //   keyword3: {
              //     value: dateTime,
              //     color: '#dd2727',
              //   },
              //   keyword4: {
              //     value: that.data.itemData.price,
              //     color: '#dd2727',
              //   },
              //   keyword5: {
              //     value: that.data.itemData.kjPrice,
              //     color: '#dd2727',
              //   }
              // };
              // wx.request({
              //   url: app.d.ceshiUrl + '/Api/Kanjia/sendMsg',
              //   method: 'POST',
              //   data: {
              //     tpl: app.d.tpl.tpl_3,
              //     //openid: that.data.token,
              //     openid: 'oiQMA0XPD0UabCltWyO-T9yTYNdc',
              //     page: '/pages/product/bargain?productId=' + that.data.itemData.id,
              //     formId: formId,
              //     keyword: JSON.stringify(item),
              //     //bigField:'keyword4.DATA'
              //   },
              //   header: {
              //     'Content-Type': 'application/x-www-form-urlencoded'
              //   },
              //   success: function (res) {
              //     console.log(res);
              //   },
              //   fail: function (res) {
              //     console.log(res);
              //   }
              // })
          //}

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