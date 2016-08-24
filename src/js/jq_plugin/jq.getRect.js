// +----------------------------------------------------------------------
// | 说明: 四.seacity jquery静态方法及插件
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){

    //获取元素当前位置信息
    $.fn.getRect = function(){
        if(this.length) {
            var elem = this.get ? this.get(0) : elem;
            var box = $.extend({}, elem.getBoundingClientRect()), s;
            if (typeof box.width == 'undefined') {
                box.width = box.right - box.left;
                box.height = box.bottom - box.top;
            }
            return box;
        }
    }
}(window.Zepto || window.jQuery)
