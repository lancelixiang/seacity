// +----------------------------------------------------------------------
// | 说明: 四.seacity jquery静态方法及插件
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){
    //*****静态方法部分*****/
    /**
     * 解析时间，分割出年、月、日、星期
     * @param {string} 时间:eg 2016-03-06
     * @return {object}  返回 y：年    m:月(注(0~11) eg:2为3月) d:日 (1~31)  w:星期(1~6,0:星期日)
     */
    $.parseDate = function(s_date){
        if(typeof s_date === "string"){
            var arr_date = s_date.split("-");
            var my_date = s_date&&new Date(arr_date[0],arr_date[1]-1,arr_date[2]) || new Date();
        }else if(typeof s_date === "object"){
            var my_date = new Date(s_date);
        }else{
            var my_date = new Date();
        }
        return obj = {
            y : my_date.getFullYear(),
            m : my_date.getMonth(),
            d : my_date.getDate(),
            w : my_date.getDay()
        }
    }
}(window.Zepto || window.jQuery)
