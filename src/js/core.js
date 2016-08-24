
//
// +----------------------------------------------------------------------
// | 说明: 一.页面自适应 全局变量 design:设计尺寸 全局方法 resp()
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-7-04
// +----------------------------------------------------------------------
;!function(){
    //设计尺寸 单位(px)
    window.design = 750;
    //页面自适应处理
    window.resp = function(){
        var deviceWidth = document.documentElement.clientWidth;
        //实际屏幕宽度因数
        var factor = (435/design) * 100;
        if(deviceWidth > design) deviceWidth = design;
        document.documentElement.style.fontSize = ( (deviceWidth / design)*100 < factor ? (deviceWidth / design)*100 : factor ) + 'px';
    }
    resp();
    //页面宽高变动
    window.onresize = function() {
        resp();
    }
}();
;var tj = {
    version:'1.2.0'
}