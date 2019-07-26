define(function(require) {

    'use strict';
    var cncnERP = require('../core/cncnSZTA');
    //导航
   /* $('.nav-menu').on('click', 'dt', function() {
        var oSelf = $(this);
        if(oSelf.parent('dl').hasClass('nav-setting')){
            return false;
        }
        var arrowDown = oSelf.find('.icon-arrow-down');
        oSelf.siblings('dd').slideToggle(function(){
            if(arrowDown.hasClass('icon-arrow-up')){
               arrowDown.removeClass('icon-arrow-up');
            }else{
               arrowDown.addClass('icon-arrow-up');
            }
        });
        oSelf.addClass('cur').parents('dl').siblings().children('dd').slideUp();
        oSelf.parents('dl').siblings().children('dt').removeClass('cur').find('.icon-arrow-down').removeClass('icon-arrow-up');
    })*/

    $('.nav-menu a.cur').each(function(){
        var self = $(this),
            parent = self.parents('dd');
        if(parent){
            parent.siblings('dt').addClass('cur');
            parent.show();
        }
    });

    $('.nav-setting').on('click',function(){
        var _this = $(this),
            $leftBox = _this.parents('.lt-left');
        $leftBox.toggleClass('nav-open');
        if($leftBox.hasClass('nav-open')){
            setCookie('navOpen',1);
        }else{
            setCookie('navOpen',0);
        }
    });
    //提交
    window.submit_form = function(obj) {
        var $form = obj.closest('form');
        var $url = $form.attr('action');
        if ($url != '') {
            var action = obj.data('action');
            if (action == 1) {
                //return false;
            }
            obj.data('action', 1);
            if (arguments.length > 1) {
                var _func = arguments[1];
                var params = arguments[2];
                if (params) {
                    var hide_input = "";
                    for (var i in params) {
                        hide_input += "<input type='hidden' class='append_hidden_input' name='" + i + "' value='" + params[i] + "'/>";
                    }
                    $form.append(hide_input);
                }
            }
            $.post($url, $form.serialize(), function(response) {
                obj.data('action', 0);
                $('.append_hidden_input').remove();
                if (response.res == 0) {
                    cncnERP.ui.dialog.alert({
                        title: '操作提示',
                        text: response.msg,
                        width: 500
                    });
                } else {
                    var data = response.data;
                    if (typeof _func == 'function') {
                        _func.apply(window, [data, response]);
                    } else {
                        cncnERP.ui.dialog.alert({
                            title: '操作提示',
                            text: response.msg,
                            width: 500
                        });
                    }
                }
            }, 'json');
        }
    }
    //搜索
    $('.searchSubmit').click(function() {
        $(this).closest('form').submit();
    });

    //搜索选择联动
    $('.mod-search').on('change','select',function(){
        var _this = $(this),
            $searchBox = _this.siblings('input'),
            index = _this.find('option:selected').index();
        if($searchBox.length > 0){
            $searchBox.val('');
        }else{
            _this.siblings('.search-list-info').children().eq(index).show().siblings().hide();
        }
    });
    
    //返回
    $('.back').click(function() {
        window.history.back();
    });

    //分页
    $('#page_selector').on('change',function(){
        window.location.href = changeURLArg(window.location.href,'page',$(this).val());
    });

    //改变url的参数
    function changeURLArg(url,arg,arg_val){
        var pattern=arg+'=([^&]*)';
        var replaceText=arg+'='+arg_val; 
        if(url.match(pattern)){
            var tmp='/('+ arg+'=)([^&]*)/gi';
            tmp=url.replace(eval(tmp),replaceText);
            return tmp;
        }else{ 
            if(url.match('[\?]')){ 
                return url+'&'+replaceText; 
            }else{ 
                return url+'?'+replaceText; 
            } 
        }
    }

    /**
     * [setCookie 设置cookie]
     * @param {[string]} name  [cookie名称]
     * @param {[string]} value [cookie值]
     */
    function setCookie(name,value){
        var Days = 60;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+ "; path=/";
        return false;
    }
    /**
     * [getCookie 获得cookie]
     * @param {[string]} name  [cookie名称]
     */
    function getCookie(name) {
        var arr,reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr = document.cookie.match(reg)){
            return unescape(arr[2]);
        }else{
            return null;
        }
    }
    /**
     * [delCookie 删除cookie]
     * @param {[string]} name  [cookie名称]
     */
    function delCookie(name){
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null){document.cookie= name + "="+cval+";expires="+exp.toGMTString()+ "; path=/";}
    }
    //设置textarea文字限制
    window.setLimit = function(){
        $(document).find('.j-limit').each(function(){
            var _this = $(this),
                $number = _this.siblings('.word-number'),
                count = $number.html();
            _this.on('input',function(){
                $number.html(count - _this.val().length);
            });
            if(_this.val()){
                _this.trigger('input');
            }
        });
    }
    setLimit();

    //退出
    $('.logout').on('click',function(){
        var href = $(this).data('href');
        cncnERP.ui.dialog.confirm({
            title: '操作提示',
            text:'确定要退出吗?',
            ok:function(){
                window.location.href = href;
            }
        });
    });
})