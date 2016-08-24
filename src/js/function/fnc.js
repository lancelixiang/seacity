// +----------------------------------------------------------------------
// | 说明: 二.seacity JS内置对象扩展方法
// +----------------------------------------------------------------------
// | 最后修改时间:  2016-6-15
// +----------------------------------------------------------------------
;!function(){

    /**
     * 时间字符串格式化  eg:2015-8-8 -> 2015-08-08
     * @return {string}
     */
    String.prototype.pattern = function(){
        var t = this.valueOf();
        if( ! _.isExist(t) ){
            return '';
        }
        var obj = $.parseDate(t);
        obj.m = obj.m +1;
        var y = obj.y;
        var m = (obj.m >=0 && obj.m<=9) ? ('0' + obj.m) : obj.m.toString();
        var d = (obj.d >=0 && obj.d<=9) ? ('0' + obj.d) : obj.d.toString();
        return y + '-' + m + '-' + d ;
    }
    /**
     * 时间格式化
     * @param {Sring} eg : new Date(1466755939974).pattern('yyyy/MM/dd')
     * @return {string}
     */
    Date.prototype.pattern=function(fmt) {
        var o = {
            "M+" : this.getMonth()+1, //月份
            "d+" : this.getDate(), //日
            "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
            "H+" : this.getHours(), //小时
            "m+" : this.getMinutes(), //分
            "s+" : this.getSeconds(), //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S" : this.getMilliseconds() //毫秒
        };
        var week = {
            "0" : "/u65e5",
            "1" : "/u4e00",
            "2" : "/u4e8c",
            "3" : "/u4e09",
            "4" : "/u56db",
            "5" : "/u4e94",
            "6" : "/u516d"
        };
        if(/(y+)/.test(fmt)){
            fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        if(/(E+)/.test(fmt)){
            fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
        }
        for(var k in o){
            if(new RegExp("("+ k +")").test(fmt)){
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    }

}(window);

// +----------------------------------------------------------------------
// | 说明: 三.seacity 全局方法
// +----------------------------------------------------------------------
// | 最后修改时间:  2016-6-15
// +----------------------------------------------------------------------
;!function(){
    /**
     * 无四舍五入,保留N小数
     * @param {Number}
     * @param {index} 保留几位小数  默认值default = 2
     * @return {String}
     */
    this.cutToFixed = function(num,index){
        var num = (typeof num === 'number') ? num : parseFloat(num);
        if( num.toString().indexOf('e') >= 0 && num.toString().indexOf('-') >= 0) {
            num = num.toFixed(10);
        }
        if( num == '-0.0000000000'){
            num = '0.00';
        }
        var index =  typeof index === 'undefined' ?  2 : index;
        var numStr = num + "";
        var numArr = numStr.split(".");
        if(index==0){
            return numArr[0];
        }
        if(numArr[1]!=null&&numArr[1].length > 0){//有小数的情况
            if(numArr[1].length > index){//小数位多于需要保留的位数
                numArr[1] = numArr[1].substr(0,index);
            }else{//小数位小于需要保留的位数
                var i = index - numArr[1].length;
                var point_0 = "";
                for (var int = 0; int < i; int++) {
                    point_0 += "0";
                }
                numArr[1] += point_0;
            }
        }else{//没有小数的情况
            var point_0 = "";
            for (var int = 0; int < index; int++) {
                point_0 += "0";
            }
            numArr[1] = point_0;
        }
        return numArr[0] + "." +numArr[1];
    }
    /**
     * 数字三位逗号隔开 eg: 123456 -> 123,456
     * @return {String}
     */
    this.addCommas = function(nStr){
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    /**
     * 判断一个值是否是正整数
     * @return true:是  false:否
     */
    this.checkNumIsPositiveInteger=function (val) {
        var r = /^[0-9]*[1-9][0-9]*$/　;
        return r.test(val);
    }
    //循环
    this.reload = function(time,callback){
        var callback = callback || new Function();
        setInterval(function(){
            callback();
        },time)
    }
    /**
     * 常用数据验证对象
     * @return {Boolean}
     */
    this._ = {
        //是否手机号
        isMobile : function (a) {
            if (a.length > 11) {
                return false
            }
            if (/^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$/.test(a)) {
                return true
            } else {
                return false
            }
        },
        //是否邮箱
        isMail : function (a) {
            if (/^\w+([-+.]\w+)*@\w+([-.]\\w+)*\.\w+([-.]\w+)*$/.test(a)) {
                return true
            } else {
                return false
            }
        },
        //是否数字
        isNumber : function (a) {
            if (/^\d+$/.test(a)) {
                return true
            } else {
                return false
            }
        },
        //是否为整数
        isInteger : function (a) {
            if (/^[-\+]?\d+$/.test(a)) {
                return true
            } else {
                return false
            }
        },
        //是否小数
        isDouble : function (a) {
            if (/^[-\+]?\d+(\.\d+)?$/.test(a)) {
                return true
            } else {
                return false
            }
        },
        //是否为有效地址
        isUrl : function (a) {
            if (/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\’:+!]*([^<>\"\"])*$/.test(a)) {
                return true
            } else {
                return false
            }
        },
        //是否为密码
        isPassword : function (a) {
            if (!/^\d+$/.test(a) && !/^[A-Za-z]+$/.test(a) && /[a-zA-Z0-9]{6,16}/.test(a) && (a.length >= 6 && a.length <= 20)) {
                return true
            } else {
                return false
            }
        },
        //是否为函数
        isFunction : function (a) {
            if (typeof(a) === "function") {
                return true
            } else {
                return false
            }
        },
        //是否为空
        isExist : function (a) {
            if (a === undefined || a === null || a === "" || a === {}
                || a.length <= 0) {
                return false
            } else {
                return true
            }
        }
    }

}.call(window);