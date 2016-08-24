// +----------------------------------------------------------------------
// | 说明: 四.seacity jquery静态方法及插件
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){

    /**
     * 倒计时 目前只支持（时）（分）（秒）
     * @HTML {Dom} <标签 data-timestamp='时间戳'> <time class="hour"></time> <time class="minute"></time> <time class="second"></time> </标签>
     * @param {function} 回调函数,参数：当前dom对象
     * @return {}
     */
    $.fn.countDown = function(callback){
        var callback = callback || new Function();
        var timestamp = [];
        this.each(function(index,el){
            //大于0的时间戳可倒计时
            timestamp.push( $(this).data('timestamp'));
            if( timestamp[index] >0 ){
                if( $(this).data('isCountDown') ){
                    return ;
                }
                $(this).data('isCountDown',true);
                create(timestamp[index],$(this),callback);
            }else{
                $(this).find('.hour,.minute,.second').text('00');
            }
        })
        function create(timestamp,$el){
            var clear = setInterval(function(){
                timestamp --;
                var s = timestamp % 60; //秒
                var m = Math.floor(timestamp / 60) % 60; //分
                var h = Math.floor(timestamp / 3600); //时
                //补0处理 7 -> 07
                h = h <= 9 ? "0" + h : h;
                m = m <= 9 ? "0" + m : m;
                s = s <= 9 ? "0" + s : s;
                //显示
                $el.find('.hour').text(h);
                $el.find('.minute').text(m);
                $el.find('.second').text(s);
                if(timestamp <= 0){
                    clearInterval(clear);
                    callback.call($el.get(0));
                    return ;
                }
            },1000)
        }
    }
}(window.Zepto || window.jQuery)
