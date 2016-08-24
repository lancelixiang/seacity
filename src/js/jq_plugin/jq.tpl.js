// +----------------------------------------------------------------------
// | 说明: 四.seacity jquery静态方法及插件
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){
    //*****静态方法部分*****/
    /**
     * TPL模板引擎
     * @return {}
     */
    $.tpl = function (str, data, env) {
        var _private = {};
        _private.cache = {};
        var fn = !/[^\w\-\.:]/.test(str)
            ? _private.cache[str] = _private.cache[str] || this.get(document.getElementById(str).innerHTML)
            : function (data, env) {
            var i, variable = [], value = [];
            for (i in data) {
                variable.push(i);
                value.push(data[i]);
            }
            return (new Function(variable, fn.code))
                .apply(env || data, value);
        };
        fn.code = fn.code || "var $parts=[]; $parts.push('"
            + str
                .replace(/\\/g, '\\\\')
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/(^|%>)[^\t]*/g, function(str) { return str.replace(/'/g, "\\'"); })
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("$parts.push('")
            + "'); return $parts.join('');";
        return data ? fn(data, env) : fn;
    }

}(window.Zepto || window.jQuery)
