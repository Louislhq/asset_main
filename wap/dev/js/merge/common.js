/* 通用js模块 */
var common = {
	page:1,//默认加载页数
	isLoadMore:true,//是否滚动加载
	init:function(){
		//只允许输入数字
		$('.v-number').on('input',function(){
			this.value = this.value.replace(/\D/g, '');
		});
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
						$('#list').html('<li style="width:100%;border:none;"><div class="lt-nodata-box"><img class="error-pic" src="/h5/dest/img/none.png" alt=""><p>当前暂无任何信息</p></div></li>');
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
};
common.init();