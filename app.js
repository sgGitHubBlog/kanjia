// app.js
App({
  d: {
    hostUrl: 'https://kanjia.jiajuwz.com/index.php',
    hostImg: 'https://kanjia.jiajuwz.com',
    hostVideo: 'https://kanjia.jiajuwz.com',
    userId: 1,
    appId:"",
    appKey:"",
    ceshiUrl:'https://kanjia.jiajuwz.com/index.php',
    msgList:[],
    tpl:{
      tpl_1:'CyGsQ2XQFwxESw0u286oqZL9Q4vYEkdpnpv91rYMxtU',   //支付通知
      tpl_2: 'V_929OvjhZCxLqlm7i5DFAdqbdDhqEABqYOaLSMIrQ8',  //发起砍价通知
      tpl_3: 'DZ2S6mB3h7136Xyq1lWsVpgp05EKrmBj2tVSLgYEcsk',  //砍价进度通知
    }
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    //login
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    this.getUserInfo();
  },
  getUserInfo:function(cb){
    var that = this
    if (that.globalData.userInfo){
      typeof cb == "function" && cb(that.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res) {
          var code = res.code;
          //get wx user simple info
          wx.getUserInfo({
            success: function (res) {
              console.log(res);
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo);
              //get user sessionKey
              //get sessionKey
              that.getUserSessionKey(code);
            }
          });
        }
      });
    }
  },
  getUserSessionKey:function(code){
    //用户的订单状态
    var that = this;
    wx.request({
      url: that.d.ceshiUrl + '/Api/Login/getsessionkey',
      method:'post',
      data: {
        code: code
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        console.log(res);
        var data = res.data;
        if(data.status==0){
          wx.showToast({
            title: data.err,
            duration: 2000
          });
          return false;
        }

        that.globalData.userInfo['sessionId'] = data.session_key;
        that.globalData.userInfo['openid'] = data.openid;
        that.onLoginUser();
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！err:getsessionkeys',
          duration: 2000
        });
      },
    });
  },
  onLoginUser:function(){
    var that = this;
    var user = that.globalData.userInfo;
    wx.request({
      url: that.d.ceshiUrl + '/Api/Login/authlogin',
      method:'post',
      data: {
        SessionId: user.sessionId,
        gender:user.gender,
        NickName: user.nickName,
        HeadUrl: user.avatarUrl,
        openid:user.openid
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        var data = res.data.arr;
        var status = res.data.status;
        if(status!=1){
          wx.showToast({
            title: res.data.err,
            duration: 3000
          });
          return false;
        }
        that.globalData.userInfo['id'] = data.ID;
        that.globalData.userInfo['NickName'] = data.NickName;
        that.globalData.userInfo['HeadUrl'] = data.HeadUrl;
        var userId = data.ID;
        if (!userId){
          wx.showToast({
            title: '登录失败！',
            duration: 3000
          });
          return false;
        }
        that.d.userId = userId;
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！err:authlogin',
          duration: 2000
        });
      },
    });
  },
  globalData:{
    userInfo:null
  }

});





