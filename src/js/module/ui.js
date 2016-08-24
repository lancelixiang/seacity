﻿
// +----------------------------------------------------------------------
// | 说明: 五.seacity JS通用UI库
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){

    /**
     * 公共UI控件
     * @param
     * @return void
     */
    var UI = function(){
        //
        var parent = this;
    }
    UI.pt = UI.prototype;
    /**
     * tips提示
     * @param {options}
     * @return void
     */
    UI.pt.tips = function(settings){
        // 默认模板
        var _tipsTpl=
            '<div class="ui-tips ui-tips-<%=type%>">'+
                '<div class="ui-tips-cnt">'+
                    '<i></i><%=content%>'+
                '</div>'+
            '</div>';

        // 默认参数
        var defaults={
            content:'',
            stayTime:1500,
            type:'info',
            callback:function(){}
        }
        var args = arguments;
        // 构造函数
        var Tips   = function (el,option,isFromTpl) {
            var self=this;
            this.element=$(el);
            this._isFromTpl=isFromTpl;
            this.marginLeft=-$(el).width()/2 + 'px';
            this.marginTop = -$(el).height()/2 + 'px';
            this.option=$.extend(defaults,option);
            $(el).css({
                "-webkit-transform":"scale(0.3)",
                "margin-left":self.marginLeft,
                "margin-top":self.marginTop
            });
            setTimeout(function(){
                $(el).css({
                    "-webkit-transition":"transform .3s"
                });
                self.show();
            },20);

        }
        Tips.prototype={
            show:function(){
                var self=this;
                this.element.css({
                    "-webkit-transform":"scale(1)"
                });
                if(self.option.stayTime>0){
                    setTimeout(function(){
                        self.hide();
                    },self.option.stayTime)
                }
            },
            hide :function () {
                var self=this;
                setTimeout(function(){
                    self.option.callback(self);
                    self._isFromTpl&&self.element.remove();
                },500)
            }
        }
        function model(option) {
            var param = {};
            //参数形式
            if(typeof option == 'string'){
                param.content = args[0];
                param.callback = args[1] || new Function();
            }
            //对象形式
            if(typeof option == 'object'){
                param = option;
            }
            //参数合并
            var context = $.extend({}, defaults,param);
            var $this = $($.tpl(_tipsTpl,context)).appendTo("body");
            var  isFromTpl=true;
            var tips = new Tips($this,context,isFromTpl);
            return tips;
        }
        model(settings);
    }
    /**
     * 对话框
     * @param {options}
     * @return void
     */
    UI.pt.alert = function(settings){
        // 默认模板
        var _alertTpl=
            '<div class="ui-alert">'+
                '<div class="ui-alert-cnt">'+
                    '<div class="ui-alert-bd">'+
                            '<div>'+
                                '<h4><%=title%></h4>'+
                                '<div class="content"><%=content%></div>' +
                            '</div>'+
                        '</div>'+
                    '<div class="ui-alert-ft ui-btn-group color-blue ft-28">'+
                    '<% for (var i = 0; i < button.length; i++) { %>' +
                        '<% if (i == select) { %>' +
                            '<div type="button" class="ui-alert-button" data-role="button"  class="select" id="alertButton<%=i%>"><%=button[i]%></div>' +
                        '<% } else { %>' +
                            '<div type="button" class="ui-alert-button" data-role="button" id="alertButton<%=i%>"><%=button[i]%></div>' +
                        '<% } %>' +
                    '<% } %>' +
                    '</div>'+
                '</div>'+
            '</div>';
        // 默认参数
        var defaults={
            title:'',
            content:'',
            button:['确认'],
            select:0,
            allowScroll:false,
            callback:function(){},//底部按钮回调函数
            close:new Function() //关闭回调函数
        }
        // 构造函数  el：dom对象  option 参数  isFromTpl是否已经模板解析
        var Alert  = function (el,option,isFromTpl) {
            this.option=$.extend(defaults,option);
            this.element=$(el);
            this._isFromTpl=isFromTpl;
            this.button=$(el).find('[data-role="button"]');
            this._bindEvent();
            this.toggle();
        }
        Alert.prototype={
            _bindEvent:function(){
                var self=this;
                self.button.click(function(){
                    var index=$(self.button).index($(this));
                    self.option.callback(self,index);
                });
            },
            toggle:function(){
                if(this.element.hasClass("show")){
                    this.hide();
                }else{
                    this.show();
                }
            },
            show:function(){
                var self=this;
                self.element.addClass("show");
                this.option.allowScroll && self.element.on("touchmove" , _stop);
            },
            hide :function () {
                var self=this;
                self.option.close(self);
                self.element.removeClass("show");
                self.element.off("touchmove" , _stop);
                //self._isFromTpl&&self.element.remove();
            }
        }
        // 禁止冒泡
        function _stop(){
            return false;
        }
        function model(option) {
            //参数合并
            var context = $.extend({}, defaults,typeof option == 'object' && option);
            var $this = $($.tpl(_alertTpl,context)).appendTo("body");
            var  isFromTpl=true;
            var alert = new Alert($this,context,isFromTpl);
            return alert;
        }
        return model(settings);
    }
    /**
     * 原msg.js中的全局msg方法，合并到ui对象下
     * @param {String} content : 提示的文本
     * @param {Number} type 0(default):加载 1：成功 2：错误 3：警告 4：问题
     * @return void
     */
    UI.pt.msg = function(content,type){
        var defaults = {
            content:'正在加载，请稍候...',
            type:0
        }
        var Msg = function(content,type){
            defaults.content = content || defaults.content;
            defaults.type = type || defaults.type;
            this.show();
        }
        Msg.prototype = {
            hide:function(){
                "use strict";
                var ct;
                $(".msg-mask, .msg-box").addClass("opacity");
                clearTimeout($(".msg-box").data("ct"));
                ct = setTimeout(function () {
                    $(".msg-mask, .msg-box").remove();
                }, 500);
                $(".msg-box").data("ct", ct);
            },
            show:function(){
                var self = this;
                var type_arr = ["msg-loading", "msg-success", "msg-error", "msg-warning", "msg-question"];
                var ct = null;
                var $msg = null;
                clearTimeout($(".msg-box").data("ct"));
                $(".msg-mask, .msg-box").remove();
                $msg = $("<div />").addClass("msg-box opacity").append($("<span />").addClass("msg-icon")).append($("<span />").addClass("text"));
                $("body").append($("<div />").addClass("msg-mask opacity").add($msg));
                $msg.find('.msg-icon').attr("class", "msg-icon " + type_arr[defaults.type]).next().text(defaults.content);
                $msg.width(28 + $msg.find(".text").width());
                $(".msg-mask").add($msg).removeClass("opacity");
                if (defaults.type === 0) {
                    ct = setTimeout(function () {
                        $msg.css({
                            "transition": ".6s","-webkit-transition": ".6s"
                        });
                        $msg.find('.text').text('请耐心等候...');
                        $msg.width(110);
                        ct = setTimeout(function () {
                            $msg.find('.text').text("操作失败，请重试!", 3);
                            $msg.width(140);
                            ct = setTimeout(function () {
                                self.hide();
                            }, 3000);
                            $msg.data("ct", ct);
                        }, 10000);
                        $msg.data("ct", ct);
                    }, 3000);
                    $msg.data("ct", ct);
                } else {
                    $(".msg-mask").click(function () {
                        self.hide();
                    });
                }
            }
        }
        var model = function(){
            return new Msg(content,type);
        }
        return model();
    }
    /**
     * select
     * @param {options}
     * @return void
     */
    UI.pt.select = function(){
        //console.log('select')
    }

    window.ui = new UI();
}(window.Zepto || window.jQuery)


