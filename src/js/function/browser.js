
;!function(){

    //浏览器相关
    /**
     * 返回浏览器上一页
     * @return {void}
     */
    this.history_go = function (){
        var history_len = window.history.length;
        if (history_len > 0) {
            history.go(-1);
        } else {
            location.href = 'http://www.seacity.com';
        }
    }
    /**
     * 获取url参数
     * @return {Object}
     */
    this.getUrlParam = function (src) {
        var url = src || location.search;
        var theRequest = {};
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }
    /**
     * 浏览器版本及平台检测
     * @return {Object}
     */
    this.browser = {
        //浏览器平台检测
        platform : function () {
            var a = navigator.userAgent;
            return {
                mobile : !!a.match(/AppleWebKit.*Mobile.*/) || !!a.match(/AppleWebKit/),
                trident : a.indexOf("Trident") > -1,
                presto : a.indexOf("Presto") > -1,
                webKit : a.indexOf("AppleWebKit") > -1,
                gecko : a.indexOf("Gecko") > -1 && a.indexOf("KHTML") == -1,
                ios : !!a.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                ios9: a.indexOf('9_') > -1 && a.indexOf('iPhone') > -1,
                android : a.indexOf("Android") > -1 || a.indexOf("Linux") > -1,
                iPad : a.indexOf("iPad") > -1,
                iPhone : a.indexOf("iPhone") > -1 || a.indexOf("Mac") > -1,
                webApp : a.indexOf("Safari") == -1,
                weixin : a.indexOf("MicroMessenger") > -1,
                weibo:a.indexOf('Weibo')>-1,
                Mac:a.indexOf('Macintosh')>-1
            }
        }()
    }

}.call(window);
