//工具函数
var utils = {
	waiting:false,//点击请求锁
	//未定义设置初始值
    underfinedSetter:function(value,defaultVal){
        return typeof(value) !== 'undefined' ? value : (typeof(defaultVal) !== 'undefined' ? defaultVal : null);
	},
	//判断是否是函数
	isFunction:function(fun){
		return fun instanceof Function;
	},
    //弹窗
    swal:function(opts){
		var _this = this,
			_time = _this.underfinedSetter(opts.timer,3000),
			_text = _this.underfinedSetter(opts.title,''),
			_type = _this.underfinedSetter(opts.type,'toast');
		var swalFun = function(type,callback){
			var _$layer = $('#'+ type +'-box');
			//有显示不弹窗
			if(!_$layer.is(':visible')){
				callback(_$layer,opts);
			}
		};
		switch(_type){
			case 'toast':
				//弱弹窗
				swalFun(_type,function($layer,opts){
					if($('body').find($layer).length > 0){
						$layer.show().find('.toast-box').html(_text);
					}else{
						$('body').append('<div class="lt-layer" id="'+ _type +'-box"><p class="toast-box">'+ _text +'</p></div>');
					}
					$layer = $('#'+ _type +'-box');
					$layer.addClass('lt-toast-show');
					setTimeout(function(){
						$layer.hide();
					},_time);
				});
				break;
			case 'confirm':
				swalFun(_type,function($layer,opts){
					var _html = _this.underfinedSetter(opts.html,''),
						_cancleText = _this.underfinedSetter(opts.cancleText,'再想想'),
						_confirmText = _this.underfinedSetter(opts.confirmText,'确定取消');
					_this._confirmFun = _this.underfinedSetter(opts.confirm);
					if($('body').find($layer).length > 0){
						$layer.show().find('.confirm-text').html(_text);
						$layer.find('layer-content').html(_html);
					}else{
						$('body').append('<div class="ui-mask" id="'+ _type +'-box"><div class="lt-layer"><div class="confirm-box"><div class="layer-header"><i class="icon-warning"></i></div><p class="confirm-text">'+ _text +'</p><div class="layer-content">'+ _html +'</div><div class="confirm-btns"><a class="btn-cancle" href="javascript:;">' + _cancleText + '</a><a class="btn-confirm" href="javascript:;">'+ _confirmText +'</a></div></div></div></div>');
						$layer = $('#'+ _type +'-box');
						//确认和取消按钮
						$('.lt-layer').on('click','.btn-cancle',function(){
							$layer.hide();
						});
						$('.lt-layer').on('click','.btn-confirm',function(){
							$layer.hide();
							if(_this.isFunction(_this._confirmFun)){
								_this._confirmFun();
							}
						});
					}
					$layer = $('#'+ _type +'-box');
					$layer.find('.lt-layer').addClass('lt-layer-show');
				
				});
				break;
			case 'alert':
				//强弹窗
				swalFun(_type,function($layer,opts){
					var _icon = _this.underfinedSetter(opts.icon,'success'),
						_html = _this.underfinedSetter(opts.html,'');
						_this._alertFun = _this.underfinedSetter(opts.confirm);
						if($('body').find($layer).length > 0){
							$layer.show().find('.confirm-text').html(_text);
							$layer.find('.layer-content').html(_html);
							$layer.find('.layer-i').attr('class','.layer-i icon-'+_icon);
						}else{
							$('body').append('<div class="ui-mask" id="'+ _type +'-box"><div class="lt-layer"><div class="confirm-box"><div class="layer-header"><i class="layer-i icon-'+ _icon +'"></i></div><p class="confirm-text">'+ _text +'</p><div class="layer-content">'+ _html +'</div><div class="confirm-btns"><a class="btn-ok" href="javascript:;">确定</a></div></div></div></div>');
							//确认和取消按钮
							$layer = $('#'+ _type +'-box');
							$('.lt-layer').on('click','.btn-ok',function(){
								$layer.hide();
								if(_this.isFunction(_this._alertFun)){
									_this._alertFun();
								}
							});
						}
						$layer = $('#'+ _type +'-box');
						$layer.find('.lt-layer').addClass('lt-layer-show');
					});
				break;
		}
    },
    //ajax的封装
	ajax:function(opts){
        var _this = this;
		if(_this.waiting){
			return false;
		}
        _this.waiting = true;
		var _request = {
			dataType:"json",
			type: "GET",
			timeout:8000,
			success: function (data){
                _this.waiting = false;
				if(data.code == 1){
					if(opts.successFun instanceof Function){
						opts.successFun(data);
					}
				}else{
					if(opts.errorFun instanceof Function){
						opts.errorFun(data);
					}else{
						_this.swal({
							title:data.msg
						});
					}
				}
			},
			error:function(){
				_this.waiting = false;
				_this.swal({
					title:'系统繁忙,请重试'
				});
			}
		};
		_request = $.extend({},_request,opts);
		$.ajax(_request);
    },
    //滚动节流
    throttle:function(func, wait, mustRun){
        var _timeout,
            _startTime = new Date();
        return function() {
            var context = this,
                args = arguments,
                curTime = new Date();
            clearTimeout(_timeout);
            // 如果达到了规定的触发时间间隔，触发 handler
            if(curTime - _startTime >= mustRun){
                func.apply(context,args);
                _startTime = curTime;
            // 没达到触发间隔，重新设定定时器
            }else{
                _timeout = setTimeout(func, wait);
            }
        };
    },
    //获取url的参数
    getKey:function(key){
		var _reg = new RegExp("(^|&)"+key+"=([^&]*)(&|$)");
		var _result = window.location.search.substr(1).match(_reg);
		return _result?decodeURIComponent(_result[2]):null;
	},
	//时间戳转换成yy-yy-dd
	dateFormat:function(date){
		var _addZero = function(value){
			return value < 10 ? '0' + value : value;
		}
		var _dateItem = new Date(parseInt(date)*1000);
		return _dateItem.getFullYear() + '-' + _addZero(_dateItem.getMonth() + 1) + '-' + _addZero(_dateItem.getDate());
	},
	//localStorage设置
	setLocalStorage:function(name,value){
	    localStorage.removeItem(name);
	    localStorage.setItem(name,value);
	},
	getLocalStorage:function(name) {
		return localStorage.getItem(name);
	},
	delLocalStorage:function(name){
	    localStorage.removeItem(name);
	}
}