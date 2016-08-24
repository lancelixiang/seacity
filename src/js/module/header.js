// +----------------------------------------------------------------------
// | 说明: 注入公共头部，关注，底部及微信分享图片
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-3-29
// +----------------------------------------------------------------------
$(function() {
    "use strict";
    // 注入公共头部
    var $header = $("#header");
    if ($header.length) {
        var $e0, $e1, $e2, arr_text, text;
        $e0 = $("<a />").addClass("ft-40 icon-back");
        //取标题
        arr_text = $("title").text().split("--");
        text = arr_text[arr_text.length - 1];
        $e1 = $("<span />").addClass("color-white").text(text);
        $e2 = $("<a />").addClass("icon");
        var iconData = $header.data('icon') || {};
        if( _.isExist(iconData) ){
            $e2.addClass(iconData.icon).attr('href',iconData.right);
            $e0.attr('href',iconData.left);
        }
        if(!_.isExist(iconData.left) ){
            $e0.click(function() {
                window.history.back();
            });
        }
        $("header").addClass("ui-header bg-blue").append($e0.add($e1).add($e2));
    }


    // 注入公共底部
    var $footer = $("#footer");
    if ($footer.length) {
        var $code, $navs, $nav0, $nav1, $nav2, $split, $phone400, $copy, $comp_name;
        $code = $("<div />").addClass("code fl")
            .append($("<a />").attr("href", "javascript:void(0);").append($("<img />").attr("src","/static/images/public/small-code.jpg")))
            .append($("<p />").addClass("ui-align-center color-gray").text("关注\"豪\"礼"));
        $nav0 = $("<a />").addClass("color-dark").attr("href","/").text("首页");
        $nav1 = $("<a />").addClass("color-dark").attr("href", "/account/").text("会员中心");
        $nav2 = $("<a />").addClass("color-dark").attr("onclick","document.cookie='pc=true;domain=seacity.com'").attr("href","http://www.seacity.com").text("电脑版");
        $split = $("<span />").text("|");
        $navs = $("<div />").addClass("navs").append($nav0.add($split).add($nav1).add($split.clone()).add($nav2));
        $phone400 = $("<div />").addClass("phone400 color-dark-orange").append($("<span />").addClass("icon").add($("<i />").text("4006-665-665")));
        $copy = $("<p />").addClass("size-small color-gray").html("copyright 2015 | <a href='http://www.miibeian.gov.cn' style='color:#999;'>粤ICP备15067951号-1</a>");
        $comp_name = $("<p />").addClass("size-small color-gray").text("深圳天玑汇富互联网金融服务有限公司");
        $footer.addClass("ui-footer bg-main").prepend($("<div />").addClass("wrapper").prepend($code.add($navs).add($phone400).add($copy).add($comp_name)));
        footer_placeholder();
    }

});
