// +----------------------------------------------------------------------
// | 说明: 四.seacity jquery静态方法及插件
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){

    //元素相对窗口位置信息
    $.fn.getPosition = function(){
        var box,s,doc;
        var elem = this.get ? this.get(0) : elem;
        if(box=$(elem).getRect()){
            if( s=$( doc = elem.ownerDocument ).scrollLeft() ){
                box.left+=s,box.right+=s;
            }
            if(s=$(doc).scrollTop()){
                box.top+=s,box.bottom+=s;
            }
            return box;
        }
    }
}(window.Zepto || window.jQuery)
