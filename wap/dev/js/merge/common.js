/* 通用js模块 */
var common = {
	//常量
	constValue:{
		NEARBY:'nearby',
		baseUrl:''
	},
	longitude:0,//经度
	latitude:0,//纬度
	page:1,//默认加载页数
	isLoadMore:true,//是否滚动加载
	waterFallarr:[],//瀑布流高度数组
	waterLeft:["0px"],//瀑布流left设置
	init:function(){
	},
    //列表滚动加载更多
    LoadMore:function(opts){
		var _this = this,
			_data = utils.underfinedSetter(opts),//tab参数的设置
			_$window =  utils.underfinedSetter(opts.container,$(window)),
			_$document = utils.underfinedSetter(opts.content,$(document)),
			_wHeight = _$window.height(),
            _$loading = $('#loading');
        var scrollLoad = function(){
            if(utils.waiting){
                return false;
            }
			var sHight = _$window.scrollTop();
            if(_this.isLoadMore && sHight + _wHeight > _$document.height() - 100){
				_$loading.show();
				_data.data.page = ++ _this.page;
				_this.fetchData(_data,false);
            }
        };
		//滚动加载更多
        _$window.scroll(utils.throttle(scrollLoad,500,1000));
	},
	//用于列表tab点击和滚动加载数据
	fetchData:function(opts,isInit,isScrollTop){
		var _opts =  utils.underfinedSetter(opts),//tab参数的设置
			_$loading = $('#loading'),
			_this = this,
			_isScrollTop = utils.underfinedSetter(isScrollTop,true);
			_isInit = utils.underfinedSetter(isInit,true);
		//是否初始化列表
		if(_isInit){
			if(_isScrollTop){
				$(window).scrollTop(0);
			}
			_opts.data.page = _this.page = 1;
			this.isLoadMore = true;
			_$loading.hide().find('#none-text').hide();;
		}
		var requestData = {
			page:_opts.data.page || 1
		};
		utils.ajax({
			url: _opts.url || '',
			data: $.extend({},requestData,_opts.data),
			type:utils.underfinedSetter(_opts.type,'GET'),
			successFun:function(data){
				if(_isInit){
					$('#list').html('');
				}
				if(data.data.length == 0 || (data.data.list && data.data.list.length == 0 && typeof(data.data.content) === 'undefined')){
					_this.isLoadMore = false;
					if(_this.page == 1){
						$('#list').html('<li style="width:100%;border:none;"><div class="lt-nodata-box"><img class="error-pic" src="/static/newh5/dest/img/no-data.png" alt=""><p>~ 暂无 ~</p></div></li>');
					}else{
						_$loading.find('#none-text').show();
					}
				}else{
					//优先使用获取数据函数的参数
					if(typeof(_opts.success) !== 'undefined' && _opts.success instanceof Function){
						_opts.success(data);
					}
				}
			}
		});
	},
	//筛选点击加载数据
	sortSelector:function(callback,$sortBox){
		var _$sort = utils.underfinedSetter($sortBox,$('#j-sort'));
		_$sort.on('click','li',function(){
			var _this = $(this);
			if(_this.hasClass('cur')){
				return false;
			}
			_this.addClass('cur').siblings().removeClass('cur');
			if(callback instanceof Function){
				var value =  typeof(_this.data('tab')) !== 'undefined' ? _this.data('tab') :  '';
				callback(value);
			}
		});
	},
	//tab滚动设置
	tabScroll:function($slideBox,callback){
		new Swiper($slideBox, {
			slidesPerView:"auto"
		});
		var _slideWidth = 0,
			_$slideList = $slideBox.find('ul'),
			_windowWidth = $(window).width(),
			_$last = _$slideList.find('li').last(),
			_maxWidth = _$last[0].offsetLeft + _$last.outerWidth(true) + 30 - _windowWidth;
		_$slideList.on('click','li',function(e){
			var _this = $(this);
			if(_this.hasClass('cur')){
				return false;
			}
			_this.addClass('cur').siblings().removeClass('cur');
			if(_maxWidth > 0){
				_slideWidth = -e.currentTarget.offsetLeft + _windowWidth / 2;
				if(_slideWidth > 0){
					_slideWidth = 0;
				}else if(_slideWidth < -_maxWidth){
					_slideWidth = -_maxWidth;
				}
				_$slideList.attr('style','transition-duration: 300ms; transform: translate3d('+ _slideWidth + 'px, 0px, 0px);-webkit-transition-duration: 300ms; -webkit-transform: translate3d('+ _slideWidth + 'px, 0px, 0px);');
			}
			if(callback instanceof Function){
				var value =  typeof(_this.data('tab')) !== 'undefined' ? _this.data('tab') :  '';
				callback(value);
			}
		});
	},
    //瀑布流
    waterFall:function(items,isRest){
		var _gap = 10,//间隙
			_this = this,
        	_itemWidth = items[0].offsetWidth;
        for (var i = 0; i < items.length; i++) {
			items[i].classList.remove('loading');
            if (i < 2 && isRest) {
                items[i].style.top = 0;
                items[i].style.left = _itemWidth * i + 'px';
				this.waterFallarr.push(items[i].offsetHeight);
				_this.waterLeft[1] = items[i].style.left;
            } else {
                var minHeight = this.waterFallarr[0];
                var index = 0;
                for (var j = 0; j < this.waterFallarr.length; j++) {
                    if (minHeight > this.waterFallarr[j]) {
                        minHeight = this.waterFallarr[j];
                        index = j;
                    }
                }
				items[i].style.top = this.waterFallarr[index] + _gap + 'px';
                items[i].style.left = _this.waterLeft[index];
                this.waterFallarr[index] = this.waterFallarr[index] + items[i].offsetHeight + _gap;
            }
		}
		$('#city-images').height(Math.max.apply(null, this.waterFallarr));
    },
	//获取经纬度
	getlocation:function(successFun,config){
		//经纬度缓存10分钟
		var _nowDate = new Date().getTime(),
			getLocationTime = utils.getLocalStorage('getLocationTime') || 0;
		//超过10分钟或者第一次获取
		if((getLocationTime > 0 && _nowDate - getLocationTime > 10*60*100) || getLocationTime === 0){
			utils.setLocalStorage('getLocationTime',_nowDate);
		}else if(getLocationTime > 0){
			common.longitude = utils.getLocalStorage('longitude');
			common.latitude = utils.getLocalStorage('latitude');
			if(successFun instanceof Function){
				successFun();
			}
			return false;
		}
		var ua = window.navigator.userAgent.toLowerCase(),
			_this = this;
		//微信浏览器使用微信的定位
	    if (ua.match(/MicroMessenger/i) == 'micromessenger'&&config) { 
			wx.config({
				debug: false,
				appId: config.appId,
				timestamp: config.timestamp,
				nonceStr: config.nonceStr,
				signature: config.signature,
			    jsApiList: ['getLocation'] // 必填，需要使用的JS接口列表
			});
			//微信接口获取经纬度
			wx.ready(function(){
				wx.getLocation({
					type: 'wgs84',
					success: function (res) {
						//微信经纬度换成百度经纬度
						var requestData = {
							url: "http://api.map.baidu.com/geoconv/v1/?coords=" + res.longitude + "," + res.latitude + "&from=1&to=5&ak=4qaWddT3Ght8qZeB05cdySGB",
							dataType:"jsonp",
							type: "GET",
							success: function (data){
								_this.longitude = data.result[0].x;
								_this.latitude = data.result[0].y;
								utils.setLocalStorage('longitude',_this.longitude);
								utils.setLocalStorage('latitude',_this.latitude);
								if(successFun instanceof Function){
									successFun();
								}
							},
							error:function(){
								utils.swal({
									title:'系统繁忙,请重试'
								});
							}
						};
						$.ajax(requestData);
					},
					cancel:function(){
						_this.baiduLocation(successFun);
					}
				});
			});
			wx.error(function(res){
				_this.baiduLocation(successFun);
			});
	    } else { 
	    	_this.baiduLocation(successFun);
	    } 
	},
	baiduLocation:function(successFun){
		//不在微信中使用百度定位
		var _geolocation = new BMap.Geolocation(),
			_this = this;
		_geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				_this.longitude = r.point.lng || 114.7;
				_this.latitude = r.point.lat || 23.73;
				utils.setLocalStorage('longitude',_this.longitude);
				utils.setLocalStorage('latitude',_this.latitude);
				if(successFun instanceof Function){
					successFun();
				}
			}
			else {
				utils.swal({
					title: "定位失败,请重新定位"
                });
			}        
		},function(){
			_this.longitude = 114.7;
			_this.latitude = 23.73;
			if(successFun instanceof Function){
				successFun();
			}
		},{enableHighAccuracy: true});
	},
	//使用百度api 前往位置
	goLocation:function($obj,config){
		var _this = this;
		common.getlocation(function(){
			$obj.on('click',function(){
				window.location.href = 'http://api.map.baidu.com/direction?origin=latlng:'+ _this.latitude +','+ _this.longitude +'|name:我的位置&destination=latlng:'+ $(this).data('latitude') +','+ $(this).data('longitude') +'|name:'+  $(this).data('address') +'&mode=driving&region=河源&src=webapp.baidu.openAPIdemo&output=html';
			});
		});
	},
	//使用百度api 找周边服务
	goNearby:function($obj,text,config){
		var _this = this;
		common.getlocation(function(){
			$obj.on('click',function(){
				window.location.href = 'http://api.map.baidu.com/place/search?query='+ text +'&location='+ common.latitude +','+ common.longitude +'&radius=1000&region=我的位置&output=html&src=webapp.baidu.openAPIdemo';
			});
		});
	},
	//导航分享
	navShare:function(config,info){
		var ua = window.navigator.userAgent.toLowerCase(),
			info = utils.underfinedSetter(info,{});
		if (ua.match(/MicroMessenger/i) == 'micromessenger'&&config) { 
			wx.config({
				debug: false,
				appId: config.appId,
				timestamp: config.timestamp,
				nonceStr: config.nonceStr,
				signature: config.signature,
			    jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ'] // 必填，需要使用的JS接口列表
			});
			_data = { 
				title:utils.underfinedSetter(info.title) || '河源旅游总入口|一机游河源', // 分享标题
				desc:utils.underfinedSetter(info.desc) ||  '河源旅游总入口，官方游客服务平台，它汇集了最新最全的旅游资讯！',// 分享描述
				link:window.location.href, // 分享链接
				imgUrl:utils.underfinedSetter(info.imgUrl) || this.constValue.baseUrl + '/static/newh5/dest/img/share.png', // 分享图标
				success: function () {
					utils.swal({
						title:'分享成功!'
					});
				},
				cancel: function () {
					utils.swal({
						title:'分享取消!'
					});
				}
			};
			//分享
			wx.ready(function () {      
				wx.onMenuShareTimeline(_data);
				wx.onMenuShareAppMessage(_data);
				wx.onMenuShareQQ(_data);
			});
		}
	},
	//文章分享
	contentShare:function(info){
		var $maskGuide = $('#mask-guide'),
			info = utils.underfinedSetter(info,{});
		var _info = {
			title:utils.underfinedSetter(info.title) || '河源旅游总入口|一机游河源', // 分享标题
			desc:utils.underfinedSetter(info.desc) ||  '河源旅游总入口，官方游客服务平台，它汇集了最新最全的旅游资讯！',// 分享描述
			link:window.location.href, // 分享链接
			imgUrl:utils.underfinedSetter(info.imgUrl) || this.constValue.baseUrl + '/static/newh5/dest/img/share.png', // 分享图标
		};
		$('#j-share').on('click',function(){
			$('#mask-share').removeClass('fn-switch');
		});
		$('#mask-share').on('click',function(){
			$(this).addClass('fn-switch');
		});
		$('#mask-guide').on('click',function(){
			$(this).addClass('fn-hide');
		});
		$('body').on('click','.j-share',function(){
			var type = $(this).data('type');
			switch(type){
				case 'qqzone':
				window.location.href = 'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + encodeURIComponent(_info.share_url) + '&title=' + _info.title + '&pics=' + encodeURIComponent(_info.image_url) + '&summary=' + _info.desc;
				break;
				case 'weibo':
				window.location.href = 'http://service.weibo.com/share/share.php?url=' + encodeURIComponent(_info.share_url) + '&title=' + _info.title + '&appkey=277159429&pic=' + _info.image_url;
				break;
				case 'wx':
				$maskGuide.removeClass('fn-hide');
				case 'wxzone':
				$maskGuide.removeClass('fn-hide');
			}
		});
	}

};
common.init();