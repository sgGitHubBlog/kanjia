


var app = getApp();
// pages/order/downline.js
Page({
  data:{
    itemData:{},
    userId:0,
    paytype:'weixin',//0线下1微信
    remark:'',
    cartId:0,
    addrId:0,//收货地址//测试--
    btnDisabled:false,
    productData:[],
    address:{},
    total:0,
    vprice:0,
    vid:0,
    addemt:1,
    vou:[]
  },
  onLoad:function(options){
    var uid = app.d.userId;
    this.setData({
      cartId: options.cartId,
      userId: uid
    });
    this.loadProductDetail();
  },
  loadProductDetail:function(){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Payment/buy_cart',
      method:'post',
      data: {
        cart_id: that.data.cartId,
        uid: that.data.userId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        //that.initProductData(res.data);
        var adds = res.data.adds;
        if (adds){
          var addrId = adds.id;
          that.setData({
            address: adds,
            addrId: addrId
          });
        }
        that.setData({
          addemt: res.data.addemt,
          productData:res.data.pro,
          total: parseFloat(res.data.price) + parseFloat(res.data.pro[0].kj_postage),
          vprice: res.data.price,
          vou: res.data.vou,
        });
        //endInitData
      },
    });
  },

  remarkInput:function(e){
    this.setData({
      remark: e.detail.value,
    })
  },

 //选择优惠券
  getvou:function(e){
    var vid = e.currentTarget.dataset.id;
    var price = e.currentTarget.dataset.price;
    var zprice = this.data.vprice;
    var cprice = parseFloat(zprice) - parseFloat(price);
    this.setData({
      total: cprice,
      vid: vid
    })
  }, 

//微信支付
  createProductOrderByWX:function(e){
    this.setData({
      paytype: 'weixin',
    });
    var formId = e.detail.formId;
    this.createProductOrder(formId);
  },

  //线下支付
  createProductOrderByXX:function(e){
    this.setData({
      paytype: 'cash',
    });
    wx.showToast({
      title: "线下支付开通中，敬请期待!",
      duration: 3000
    });
    return false;
    this.createProductOrder();
  },

  //确认订单
  createProductOrder: function (formId){
    this.setData({
      btnDisabled:false,
    })
    
    //创建订单
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Payment/payment',
      method:'post',
      data: {
        uid: that.data.userId,
        cart_id: that.data.cartId,
        type:that.data.paytype,
        aid: that.data.addrId,//地址的id
        remark: that.data.remark,//用户备注
        price: that.data.total,//总价
        vid: that.data.vid,//优惠券ID
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        var data = res.data;
        if(data.status == 1){
          //创建订单成功
          if(data.arr.pay_type == 'cash'){
              wx.showToast({
                 title:"请自行联系商家进行发货!",
                 duration:3000
              });
              return false;
          }
          if(data.arr.pay_type == 'weixin'){
            //微信支付
            if (parseFloat(that.data.total) > 0){
              that.wxpay(data.arr, formId);
            }else{
              that.createOrder(data.arr, formId);
            }
          }
        }else{
          wx.showToast({
            title:"下单失败!",
            duration:2500
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:createProductOrder',
          duration: 2000
        });
      }
    });
  },
  createOrder: function (order, formId){
    wx.showToast({
      title: "购买成功!",
      duration: 2000,
    });
    //发送订单信息模板
    var msgTplUrl = app.d.ceshiUrl + '/Api/Wxpay/getmsgs';
    wx.request({
      url: msgTplUrl,
      method: 'post',
      data: {
        tplId: 'CyGsQ2XQFwxESw0u286oqZL9Q4vYEkdpnpv91rYMxtU',
        order_sn: order.order_sn,
        pay_sn: formId,   //测试该方式可以
        openid: app.globalData.userInfo.openid
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data
        console.log(res);
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
    setTimeout(function () {
      wx.navigateTo({
        url: '../user/dingdan?currentTab=1&otype=deliver',
      });
    }, 2500);
  },
  //调起微信支付
  wxpay: function (order, formId){
    var order_sn = order.order;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Wxpay/wxpay',
      data: {
        order_id:order.order_id,
        order_sn:order.order_sn,
        uid:this.data.userId,
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function(res){
        console.log(res);
        if(res.data.status==1){
          var arr = res.data.arr;
          console.log(order);
          wx.requestPayment({
            timeStamp: arr.timeStamp,
            nonceStr: arr.nonceStr,
            package: arr.package,
            signType: 'MD5',
            paySign: arr.paySign,
            success: function(res){
              console.log(formId);
              wx.showToast({
                title:"支付成功!",
                duration:2000,
              });
              //发送订单信息模板
              var msgTplUrl = app.d.ceshiUrl + '/Api/Wxpay/getmsgs';
              wx.request({
                url: msgTplUrl,
                method: 'post',
                data: {
                  tplId: 'CyGsQ2XQFwxESw0u286oqZL9Q4vYEkdpnpv91rYMxtU',
                  order_sn: order.order_sn,
                  order_id: order.order_id,
                  //pay_sn: formId,   //测试该方式可以
                  pay_sn: arr.pay_sn,
                  openid: app.globalData.userInfo.openid
                },
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  //--init data
                  console.log(res);
                },
                fail: function () {
                  // fail
                  wx.showToast({
                    title: '网络异常！',
                    duration: 2000
                  });
                }
              })
              setTimeout(function(){
                wx.navigateTo({
                  url: '../user/dingdan?currentTab=1&otype=deliver',
                });
              },2500);
            },
            fail: function(res) {
              wx.showToast({
                title:res,
                duration:3000
              })
            }
          })
        }else{
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！err:wxpay',
          duration: 2000
        });
      }
    })
  },


});