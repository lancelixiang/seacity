
// +----------------------------------------------------------------------
// | 说明: APP专用方法
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-3-29
// +----------------------------------------------------------------------
//头部固定
function header_fixed(){
    var $header = $("header");
    if($header.css("position") === "static"){
        var emptyH  = _.isExist(window.Zepto) ?  $header.height() : $header.outerHeight();
        $("<div />").height(emptyH).insertBefore($header);
        $header.addClass("header_fixed");
    }
}

// 公共底部定位
var counts = 0;
function footer_placeholder() {
    $(".footer-placeholder").remove();
    var diff = $(window).height() - $("body").height();
    if (diff > 0) {
        $("<div />").addClass("footer-placeholder").css({
            "height": diff
        }).insertBefore("#footer");

        if (diff > 200 && counts < 5) {
            setTimeout(footer_placeholder, 1000);
            counts++;
        }
    }
}

//移动APP调用的公用方法
function app_public(){
    //移除首页底部APP下载提示
    $("#app-download").remove();
    document.cookie = "appDownload=true";
    //移除页面底部
    $("#footer").remove();
}
