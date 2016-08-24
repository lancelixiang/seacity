
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
/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)


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

/*===========================
Device/OS Detection
===========================*/
/* global $:true */
;(function ($) {
    "use strict";
    var device = {};
    var ua = navigator.userAgent;

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;
    
    // Android
    if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
    }

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);
        
    // Minimal UI
    if (device.os && device.os === 'ios') {
        var osVersionArr = device.osVersion.split('.');
        device.minimalUi = !device.webView &&
                            (ipod || iphone) &&
                            (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
                            $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
    }

    // Check for status bar and fullscreen app mode
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    device.statusBar = false;
    if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
        device.statusBar = true;
    }
    else {
        device.statusBar = false;
    }

    // Classes
    var classNames = [];

    // Pixel Ratio
    device.pixelRatio = window.devicePixelRatio || 1;
    classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
    if (device.pixelRatio >= 2) {
        classNames.push('retina');
    }

    // OS classes
    if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
            var major = parseInt(device.osVersion.split('.')[0], 10);
            for (var i = major - 1; i >= 6; i--) {
                classNames.push('ios-gt-' + i);
            }
        }
        
    }
    // Status bar classes
    if (device.statusBar) {
        classNames.push('with-statusbar-overlay');
    }
    else {
        $('html').removeClass('with-statusbar-overlay');
    }

    // Add html classes
    if (classNames.length > 0) $('html').addClass(classNames.join(' '));

    $.device = device;
})($);

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
/* global $:true */
/* global WebKitCSSMatrix:true */

(function($) {
  "use strict";

  $.fn.transitionEnd = function(callback) {
    var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i, dom = this;

    function fireCallBack(e) {
      /*jshint validthis:true */
      if (e.target !== this) return;
      callback.call(this, e);
      for (i = 0; i < events.length; i++) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i++) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  };

  $.support = (function() {
    var support = {
      touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
    };
    return support;
  })();

  $.touchEvents = {
    start: $.support.touch ? 'touchstart' : 'mousedown',
    move: $.support.touch ? 'touchmove' : 'mousemove',
    end: $.support.touch ? 'touchend' : 'mouseup'
  };

  $.getTouchPosition = function(e) {
    e = e.originalEvent || e; //jquery wrap the originevent
    if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
      return {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      };
    } else {
      return {
        x: e.pageX,
        y: e.pageY
      };
    }
  };

  $.fn.scrollHeight = function() {
    return this[0].scrollHeight;
  };

  $.fn.transform = function(transform) {
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
    }
    return this;
  };
  $.fn.transition = function(duration) {
    if (typeof duration !== 'string') {
      duration = duration + 'ms';
    }
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
    }
    return this;
  };

  $.getTranslate = function (el, axis) {
    var matrix, curTransform, curStyle, transformMatrix;

    // automatic axis detection
    if (typeof axis === 'undefined') {
      axis = 'x';
    }

    curStyle = window.getComputedStyle(el, null);
    if (window.WebKitCSSMatrix) {
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
    }
    else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m41;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[12]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m42;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[13]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[5]);
    }

    return curTransform || 0;
  };
  $.requestAnimationFrame = function (callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
    else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
    else {
      return window.setTimeout(callback, 1000 / 60);
    }
  };

  $.cancelAnimationFrame = function (id) {
    if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
    else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
    else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
    else {
      return window.clearTimeout(id);
    }  
  };

  $.fn.join = function(arg) {
    return this.toArray().join(arg);
  }
})($);

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

/*======================================================
************   Calendar   ************
======================================================*/
/* global $:true */
/*jshint unused: false*/
+function ($) {
  "use strict";
  var rtl = false;
  var defaults;
  var Calendar = function (params) {
      var p = this;
      params = params || {};
      for (var def in defaults) {
          if (typeof params[def] === 'undefined') {
              params[def] = defaults[def];
          }
      }
      p.params = params;
      p.initialized = false;

      // Inline flag
      p.inline = p.params.container ? true : false;

      // Is horizontal
      p.isH = p.params.direction === 'horizontal';

      // RTL inverter
      var inverter = p.isH ? (rtl ? -1 : 1) : 1;

      // Animating flag
      p.animating = false;

      // Should be converted to popover
      function isPopover() {
          var toPopover = false;
          if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
          if (!p.inline && p.params.input) {
              if (p.params.onlyInPopover) toPopover = true;
              else {
                  if ($.device.ios) {
                      toPopover = $.device.ipad ? true : false;
                  }
                  else {
                      if ($(window).width() >= 768) toPopover = true;
                  }
              }
          } 
          return toPopover; 
      }
      function inPopover() {
          if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
          else return false;
      }

      // Format date
      function formatDate(date) {
          date = new Date(date);
          var year = date.getFullYear();
          var month = date.getMonth();
          var month1 = month + 1;
          var day = date.getDate();
          var weekDay = date.getDay();
          return p.params.dateFormat
              .replace(/yyyy/g, year)
              .replace(/yy/g, (year + '').substring(2))
              .replace(/mm/g, month1 < 10 ? '0' + month1 : month1)
              .replace(/m/g, month1)
              .replace(/MM/g, p.params.monthNames[month])
              .replace(/M/g, p.params.monthNamesShort[month])
              .replace(/dd/g, day < 10 ? '0' + day : day)
              .replace(/d/g, day)
              .replace(/DD/g, p.params.dayNames[weekDay])
              .replace(/D/g, p.params.dayNamesShort[weekDay]);
      }


      // Value
      p.addValue = function (value) {
          if (p.params.multiple) {
              if (!p.value) p.value = [];
              var inValuesIndex;
              for (var i = 0; i < p.value.length; i++) {
                  if (new Date(value).getTime() === new Date(p.value[i]).getTime()) {
                      inValuesIndex = i;
                  }
              }
              if (typeof inValuesIndex === 'undefined') {
                  p.value.push(value);
              }
              else {
                  p.value.splice(inValuesIndex, 1);
              }
              p.updateValue();
          }
          else {
              p.value = [value];
              p.updateValue();
          }
      };
      p.setValue = function (arrValues) {
          p.value = arrValues;
          p.updateValue();   
      };
      p.updateValue = function () {
          p.wrapper.find('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
          var i, inputValue;
          for (i = 0; i < p.value.length; i++) {
              var valueDate = new Date(p.value[i]);
              p.wrapper.find('.picker-calendar-day[data-date="' + valueDate.getFullYear() + '-' + valueDate.getMonth() + '-' + valueDate.getDate() + '"]').addClass('picker-calendar-day-selected');
          }
          if (p.params.onChange) {
              p.params.onChange(p, p.value, p.value.map(formatDate));
          }
          if (p.input && p.input.length > 0) {
              if (p.params.formatValue) inputValue = p.params.formatValue(p, p.value);
              else {
                  inputValue = [];
                  for (i = 0; i < p.value.length; i++) {
                      inputValue.push(formatDate(p.value[i]));
                  }
                  inputValue = inputValue.join(', ');
              } 
              $(p.input).val(inputValue);
              $(p.input).trigger('change');
          }
      };

      // Columns Handlers
      p.initCalendarEvents = function () {
          var col;
          var allowItemClick = true;
          var isTouched, isMoved, touchStartX, touchStartY, touchCurrentX, touchCurrentY, touchStartTime, touchEndTime, startTranslate, currentTranslate, wrapperWidth, wrapperHeight, percentage, touchesDiff, isScrolling;
          function handleTouchStart (e) {
              if (isMoved || isTouched) return;
              // e.preventDefault();
              isTouched = true;
              var position = $.getTouchPosition(e);
              touchStartX = touchCurrentY = position.x;
              touchStartY = touchCurrentY = position.y;
              touchStartTime = (new Date()).getTime();
              percentage = 0;
              allowItemClick = true;
              isScrolling = undefined;
              startTranslate = currentTranslate = p.monthsTranslate;
          }
          function handleTouchMove (e) {
              if (!isTouched) return;
              var position = $.getTouchPosition(e);
              touchCurrentX = position.x;
              touchCurrentY = position.y;
              if (typeof isScrolling === 'undefined') {
                  isScrolling = !!(isScrolling || Math.abs(touchCurrentY - touchStartY) > Math.abs(touchCurrentX - touchStartX));
              }
              if (p.isH && isScrolling) {
                  isTouched = false;
                  return;
              }
              e.preventDefault();
              if (p.animating) {
                  isTouched = false;
                  return;   
              }
              allowItemClick = false;
              if (!isMoved) {
                  // First move
                  isMoved = true;
                  wrapperWidth = p.wrapper[0].offsetWidth;
                  wrapperHeight = p.wrapper[0].offsetHeight;
                  p.wrapper.transition(0);
              }
              e.preventDefault();

              touchesDiff = p.isH ? touchCurrentX - touchStartX : touchCurrentY - touchStartY;
              percentage = touchesDiff/(p.isH ? wrapperWidth : wrapperHeight);
              currentTranslate = (p.monthsTranslate * inverter + percentage) * 100;

              // Transform wrapper
              p.wrapper.transform('translate3d(' + (p.isH ? currentTranslate : 0) + '%, ' + (p.isH ? 0 : currentTranslate) + '%, 0)');

          }
          function handleTouchEnd (e) {
              if (!isTouched || !isMoved) {
                  isTouched = isMoved = false;
                  return;
              }
              isTouched = isMoved = false;
              
              touchEndTime = new Date().getTime();
              if (touchEndTime - touchStartTime < 300) {
                  if (Math.abs(touchesDiff) < 10) {
                      p.resetMonth();
                  }
                  else if (touchesDiff >= 10) {
                      if (rtl) p.nextMonth();
                      else p.prevMonth();
                  }
                  else {
                      if (rtl) p.prevMonth();
                      else p.nextMonth();   
                  }
              }
              else {
                  if (percentage <= -0.5) {
                      if (rtl) p.prevMonth();
                      else p.nextMonth();
                  }
                  else if (percentage >= 0.5) {
                      if (rtl) p.nextMonth();
                      else p.prevMonth();
                  }
                  else {
                      p.resetMonth();
                  }
              }

              // Allow click
              setTimeout(function () {
                  allowItemClick = true;
              }, 100);
          }

          function handleDayClick(e) {
              if (!allowItemClick) return;
              var day = $(e.target).parents('.picker-calendar-day');
              if (day.length === 0 && $(e.target).hasClass('picker-calendar-day')) {
                  day = $(e.target);
              }
              if (day.length === 0) return;
              if (day.hasClass('picker-calendar-day-selected') && !p.params.multiple) return;
              if (day.hasClass('picker-calendar-day-disabled')) return;
              if (day.hasClass('picker-calendar-day-next')) p.nextMonth();
              if (day.hasClass('picker-calendar-day-prev')) p.prevMonth();
              var dateYear = day.attr('data-year');
              var dateMonth = day.attr('data-month');
              var dateDay = day.attr('data-day');
              if (p.params.onDayClick) {
                  p.params.onDayClick(p, day[0], dateYear, dateMonth, dateDay);
              }
              p.addValue(new Date(dateYear, dateMonth, dateDay).getTime());
              if (p.params.closeOnSelect) p.close();
          }

          p.container.find('.picker-calendar-prev-month').on('click', p.prevMonth);
          p.container.find('.picker-calendar-next-month').on('click', p.nextMonth);
          p.container.find('.picker-calendar-prev-year').on('click', p.prevYear);
          p.container.find('.picker-calendar-next-year').on('click', p.nextYear);
          p.wrapper.on('click', handleDayClick);
          if (p.params.touchMove) {
              p.wrapper.on($.touchEvents.start, handleTouchStart);
              p.wrapper.on($.touchEvents.move, handleTouchMove);
              p.wrapper.on($.touchEvents.end, handleTouchEnd);
          }
              
          p.container[0].f7DestroyCalendarEvents = function () {
              p.container.find('.picker-calendar-prev-month').off('click', p.prevMonth);
              p.container.find('.picker-calendar-next-month').off('click', p.nextMonth);
              p.container.find('.picker-calendar-prev-year').off('click', p.prevYear);
              p.container.find('.picker-calendar-next-year').off('click', p.nextYear);
              p.wrapper.off('click', handleDayClick);
              if (p.params.touchMove) {
                  p.wrapper.off($.touchEvents.start, handleTouchStart);
                  p.wrapper.off($.touchEvents.move, handleTouchMove);
                  p.wrapper.off($.touchEvents.end, handleTouchEnd);
              }
          };
          

      };
      p.destroyCalendarEvents = function (colContainer) {
          if ('f7DestroyCalendarEvents' in p.container[0]) p.container[0].f7DestroyCalendarEvents();
      };

      // Calendar Methods
      p.daysInMonth = function (date) {
          var d = new Date(date);
          return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      };
      p.monthHTML = function (date, offset) {
          date = new Date(date);
          var year = date.getFullYear(),
              month = date.getMonth(),
              day = date.getDate();
          if (offset === 'next') {
              if (month === 11) date = new Date(year + 1, 0);
              else date = new Date(year, month + 1, 1);
          }
          if (offset === 'prev') {
              if (month === 0) date = new Date(year - 1, 11);
              else date = new Date(year, month - 1, 1);
          }
          if (offset === 'next' || offset === 'prev') {
              month = date.getMonth();
              year = date.getFullYear();
          }
          var daysInPrevMonth = p.daysInMonth(new Date(date.getFullYear(), date.getMonth()).getTime() - 10 * 24 * 60 * 60 * 1000),
              daysInMonth = p.daysInMonth(date),
              firstDayOfMonthIndex = new Date(date.getFullYear(), date.getMonth()).getDay();
          if (firstDayOfMonthIndex === 0) firstDayOfMonthIndex = 7;
          
          var dayDate, currentValues = [], i, j,
              rows = 6, cols = 7,
              monthHTML = '',
              dayIndex = 0 + (p.params.firstDay - 1),    
              today = new Date().setHours(0,0,0,0),
              minDate = p.params.minDate ? new Date(p.params.minDate).getTime() : null,
              maxDate = p.params.maxDate ? new Date(p.params.maxDate).getTime() : null;

          if (p.value && p.value.length) {
              for (i = 0; i < p.value.length; i++) {
                  currentValues.push(new Date(p.value[i]).setHours(0,0,0,0));
              }
          }
              
          for (i = 1; i <= rows; i++) {
              var rowHTML = '';
              var row = i;
              for (j = 1; j <= cols; j++) {
                  var col = j;
                  dayIndex ++;
                  var dayNumber = dayIndex - firstDayOfMonthIndex;
                  var addClass = '';
                  if (dayNumber < 0) {
                      dayNumber = daysInPrevMonth + dayNumber + 1;
                      addClass += ' picker-calendar-day-prev';
                      dayDate = new Date(month - 1 < 0 ? year - 1 : year, month - 1 < 0 ? 11 : month - 1, dayNumber).getTime();
                  }
                  else {
                      dayNumber = dayNumber + 1;
                      if (dayNumber > daysInMonth) {
                          dayNumber = dayNumber - daysInMonth;
                          addClass += ' picker-calendar-day-next';
                          dayDate = new Date(month + 1 > 11 ? year + 1 : year, month + 1 > 11 ? 0 : month + 1, dayNumber).getTime();
                      }
                      else {
                          dayDate = new Date(year, month, dayNumber).getTime();    
                      }
                  }
                  // Today
                  if (dayDate === today) addClass += ' picker-calendar-day-today';
                  // Selected
                  if (currentValues.indexOf(dayDate) >= 0) addClass += ' picker-calendar-day-selected';
                  // Weekend
                  if (p.params.weekendDays.indexOf(col - 1) >= 0) {
                      addClass += ' picker-calendar-day-weekend';
                  }
                  // Disabled
                  if ((minDate && dayDate < minDate) || (maxDate && dayDate > maxDate)) {
                      addClass += ' picker-calendar-day-disabled';   
                  }

                  dayDate = new Date(dayDate);
                  var dayYear = dayDate.getFullYear();
                  var dayMonth = dayDate.getMonth();
                  rowHTML += '<div data-year="' + dayYear + '" data-month="' + dayMonth + '" data-day="' + dayNumber + '" class="picker-calendar-day' + (addClass) + '" data-date="' + (dayYear + '-' + dayMonth + '-' + dayNumber) + '"><span>'+dayNumber+'</span></div>';
              }
              monthHTML += '<div class="picker-calendar-row">' + rowHTML + '</div>';
          }
          monthHTML = '<div class="picker-calendar-month" data-year="' + year + '" data-month="' + month + '">' + monthHTML + '</div>';
          return monthHTML;
      };
      p.animating = false;
      p.updateCurrentMonthYear = function (dir) {
          if (typeof dir === 'undefined') {
              p.currentMonth = parseInt(p.months.eq(1).attr('data-month'), 10);
              p.currentYear = parseInt(p.months.eq(1).attr('data-year'), 10);   
          }
          else {
              p.currentMonth = parseInt(p.months.eq(dir === 'next' ? (p.months.length - 1) : 0).attr('data-month'), 10);
              p.currentYear = parseInt(p.months.eq(dir === 'next' ? (p.months.length - 1) : 0).attr('data-year'), 10);
          }
          p.container.find('.current-month-value').text(p.params.monthNames[p.currentMonth]);
          p.container.find('.current-year-value').text(p.currentYear);
              
      };
      p.onMonthChangeStart = function (dir) {
          p.updateCurrentMonthYear(dir);
          p.months.removeClass('picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next');
          var currentIndex = dir === 'next' ? p.months.length - 1 : 0;

          p.months.eq(currentIndex).addClass('picker-calendar-month-current');
          p.months.eq(dir === 'next' ? currentIndex - 1 : currentIndex + 1).addClass(dir === 'next' ? 'picker-calendar-month-prev' : 'picker-calendar-month-next');

          if (p.params.onMonthYearChangeStart) {
              p.params.onMonthYearChangeStart(p, p.currentYear, p.currentMonth);
          }
      };
      p.onMonthChangeEnd = function (dir, rebuildBoth) {
          p.animating = false;
          var nextMonthHTML, prevMonthHTML, newMonthHTML;
          p.wrapper.find('.picker-calendar-month:not(.picker-calendar-month-prev):not(.picker-calendar-month-current):not(.picker-calendar-month-next)').remove();
          
          if (typeof dir === 'undefined') {
              dir = 'next';
              rebuildBoth = true;
          }
          if (!rebuildBoth) {
              newMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), dir);
          }
          else {
              p.wrapper.find('.picker-calendar-month-next, .picker-calendar-month-prev').remove();
              prevMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), 'prev');
              nextMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), 'next');
          }
          if (dir === 'next' || rebuildBoth) {
              p.wrapper.append(newMonthHTML || nextMonthHTML);
          }
          if (dir === 'prev' || rebuildBoth) {
              p.wrapper.prepend(newMonthHTML || prevMonthHTML);
          }
          p.months = p.wrapper.find('.picker-calendar-month');
          p.setMonthsTranslate(p.monthsTranslate);
          if (p.params.onMonthAdd) {
              p.params.onMonthAdd(p, dir === 'next' ? p.months.eq(p.months.length - 1)[0] : p.months.eq(0)[0]);
          }
          if (p.params.onMonthYearChangeEnd) {
              p.params.onMonthYearChangeEnd(p, p.currentYear, p.currentMonth);
          }
      };
      p.setMonthsTranslate = function (translate) {
          translate = translate || p.monthsTranslate || 0;
          if (typeof p.monthsTranslate === 'undefined') p.monthsTranslate = translate;
          p.months.removeClass('picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next');
          var prevMonthTranslate = -(translate + 1) * 100 * inverter;
          var currentMonthTranslate = -translate * 100 * inverter;
          var nextMonthTranslate = -(translate - 1) * 100 * inverter;
          p.months.eq(0).transform('translate3d(' + (p.isH ? prevMonthTranslate : 0) + '%, ' + (p.isH ? 0 : prevMonthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
          p.months.eq(1).transform('translate3d(' + (p.isH ? currentMonthTranslate : 0) + '%, ' + (p.isH ? 0 : currentMonthTranslate) + '%, 0)').addClass('picker-calendar-month-current');
          p.months.eq(2).transform('translate3d(' + (p.isH ? nextMonthTranslate : 0) + '%, ' + (p.isH ? 0 : nextMonthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
      };
      p.nextMonth = function (transition) {
          if (typeof transition === 'undefined' || typeof transition === 'object') {
              transition = '';
              if (!p.params.animate) transition = 0;
          }
          var nextMonth = parseInt(p.months.eq(p.months.length - 1).attr('data-month'), 10);
          var nextYear = parseInt(p.months.eq(p.months.length - 1).attr('data-year'), 10);
          var nextDate = new Date(nextYear, nextMonth);
          var nextDateTime = nextDate.getTime();
          var transitionEndCallback = p.animating ? false : true;
          if (p.params.maxDate) {
              if (nextDateTime > new Date(p.params.maxDate).getTime()) {
                  return p.resetMonth();
              }
          }
          p.monthsTranslate --;
          if (nextMonth === p.currentMonth) {
              var nextMonthTranslate = -(p.monthsTranslate) * 100 * inverter;
              var nextMonthHTML = $(p.monthHTML(nextDateTime, 'next')).transform('translate3d(' + (p.isH ? nextMonthTranslate : 0) + '%, ' + (p.isH ? 0 : nextMonthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
              p.wrapper.append(nextMonthHTML[0]);
              p.months = p.wrapper.find('.picker-calendar-month');
              if (p.params.onMonthAdd) {
                  p.params.onMonthAdd(p, p.months.eq(p.months.length - 1)[0]);
              }
          }
          p.animating = true;
          p.onMonthChangeStart('next');
          var translate = (p.monthsTranslate * 100) * inverter;

          p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
          if (transitionEndCallback) {
              p.wrapper.transitionEnd(function () {
                  p.onMonthChangeEnd('next');
              });
          }
          if (!p.params.animate) {
              p.onMonthChangeEnd('next');
          }
      };
      p.prevMonth = function (transition) {
          if (typeof transition === 'undefined' || typeof transition === 'object') {
              transition = '';
              if (!p.params.animate) transition = 0;
          }
          var prevMonth = parseInt(p.months.eq(0).attr('data-month'), 10);
          var prevYear = parseInt(p.months.eq(0).attr('data-year'), 10);
          var prevDate = new Date(prevYear, prevMonth + 1, -1);
          var prevDateTime = prevDate.getTime();
          var transitionEndCallback = p.animating ? false : true;
          if (p.params.minDate) {
              if (prevDateTime < new Date(p.params.minDate).getTime()) {
                  return p.resetMonth();
              }
          }
          p.monthsTranslate ++;
          if (prevMonth === p.currentMonth) {
              var prevMonthTranslate = -(p.monthsTranslate) * 100 * inverter;
              var prevMonthHTML = $(p.monthHTML(prevDateTime, 'prev')).transform('translate3d(' + (p.isH ? prevMonthTranslate : 0) + '%, ' + (p.isH ? 0 : prevMonthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
              p.wrapper.prepend(prevMonthHTML[0]);
              p.months = p.wrapper.find('.picker-calendar-month');
              if (p.params.onMonthAdd) {
                  p.params.onMonthAdd(p, p.months.eq(0)[0]);
              }
          }
          p.animating = true;
          p.onMonthChangeStart('prev');
          var translate = (p.monthsTranslate * 100) * inverter;
          p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
          if (transitionEndCallback) {
              p.wrapper.transitionEnd(function () {
                  p.onMonthChangeEnd('prev');
              });
          }
          if (!p.params.animate) {
              p.onMonthChangeEnd('prev');
          }
      };
      p.resetMonth = function (transition) {
          if (typeof transition === 'undefined') transition = '';
          var translate = (p.monthsTranslate * 100) * inverter;
          p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
      };
      p.setYearMonth = function (year, month, transition) {
          if (typeof year === 'undefined') year = p.currentYear;
          if (typeof month === 'undefined') month = p.currentMonth;
          if (typeof transition === 'undefined' || typeof transition === 'object') {
              transition = '';
              if (!p.params.animate) transition = 0;
          }
          var targetDate;
          if (year < p.currentYear) {
              targetDate = new Date(year, month + 1, -1).getTime();
          }
          else {
              targetDate = new Date(year, month).getTime();
          }
          if (p.params.maxDate && targetDate > new Date(p.params.maxDate).getTime()) {
              return false;
          }
          if (p.params.minDate && targetDate < new Date(p.params.minDate).getTime()) {
              return false;
          }
          var currentDate = new Date(p.currentYear, p.currentMonth).getTime();
          var dir = targetDate > currentDate ? 'next' : 'prev';
          var newMonthHTML = p.monthHTML(new Date(year, month));
          p.monthsTranslate = p.monthsTranslate || 0;
          var prevTranslate = p.monthsTranslate;
          var monthTranslate, wrapperTranslate;
          var transitionEndCallback = p.animating ? false : true;
          if (targetDate > currentDate) {
              // To next
              p.monthsTranslate --;
              if (!p.animating) p.months.eq(p.months.length - 1).remove();
              p.wrapper.append(newMonthHTML);
              p.months = p.wrapper.find('.picker-calendar-month');
              monthTranslate = -(prevTranslate - 1) * 100 * inverter;
              p.months.eq(p.months.length - 1).transform('translate3d(' + (p.isH ? monthTranslate : 0) + '%, ' + (p.isH ? 0 : monthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
          }
          else {
              // To prev
              p.monthsTranslate ++;
              if (!p.animating) p.months.eq(0).remove();
              p.wrapper.prepend(newMonthHTML);
              p.months = p.wrapper.find('.picker-calendar-month');
              monthTranslate = -(prevTranslate + 1) * 100 * inverter;
              p.months.eq(0).transform('translate3d(' + (p.isH ? monthTranslate : 0) + '%, ' + (p.isH ? 0 : monthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
          }
          if (p.params.onMonthAdd) {
              p.params.onMonthAdd(p, dir === 'next' ? p.months.eq(p.months.length - 1)[0] : p.months.eq(0)[0]);
          }
          p.animating = true;
          p.onMonthChangeStart(dir);
          wrapperTranslate = (p.monthsTranslate * 100) * inverter;
          p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? wrapperTranslate : 0) + '%, ' + (p.isH ? 0 : wrapperTranslate) + '%, 0)');
          if (transitionEndCallback) {
             p.wrapper.transitionEnd(function () {
                  p.onMonthChangeEnd(dir, true);
              }); 
          }
          if (!p.params.animate) {
              p.onMonthChangeEnd(dir);
          }
      };
      p.nextYear = function () {
          p.setYearMonth(p.currentYear + 1);
      };
      p.prevYear = function () {
          p.setYearMonth(p.currentYear - 1);
      };
      

      // HTML Layout
      p.layout = function () {
          var pickerHTML = '';
          var pickerClass = '';
          var i;
          
          var layoutDate = p.value && p.value.length ? p.value[0] : new Date().setHours(0,0,0,0);
          var prevMonthHTML = p.monthHTML(layoutDate, 'prev');
          var currentMonthHTML = p.monthHTML(layoutDate);
          var nextMonthHTML = p.monthHTML(layoutDate, 'next');
          var monthsHTML = '<div class="picker-calendar-months"><div class="picker-calendar-months-wrapper">' + (prevMonthHTML + currentMonthHTML + nextMonthHTML) + '</div></div>';
          // Week days header
          var weekHeaderHTML = '';
          if (p.params.weekHeader) {
              for (i = 0; i < 7; i++) {
                  var weekDayIndex = (i + p.params.firstDay > 6) ? (i - 7 + p.params.firstDay) : (i + p.params.firstDay);
                  var dayName = p.params.dayNamesShort[weekDayIndex];
                  weekHeaderHTML += '<div class="picker-calendar-week-day ' + ((p.params.weekendDays.indexOf(weekDayIndex) >= 0) ? 'picker-calendar-week-day-weekend' : '') + '"> ' + dayName + '</div>';
                  
              }
              weekHeaderHTML = '<div class="picker-calendar-week-days">' + weekHeaderHTML + '</div>';
          }
          pickerClass = 'nt-picker-calendar ' + (p.params.cssClass || '');
          if(!p.inline) pickerClass = 'nt-picker-modal ' + pickerClass;
          var toolbarHTML = p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText) : '';
          if (p.params.toolbar) {
              toolbarHTML = p.params.toolbarTemplate
                  .replace(/{{closeText}}/g, p.params.toolbarCloseText)
                  .replace(/{{monthPicker}}/g, (p.params.monthPicker ? p.params.monthPickerTemplate : ''))
                  .replace(/{{yearPicker}}/g, (p.params.yearPicker ? p.params.yearPickerTemplate : ''));
          }

          pickerHTML =
              '<div class="' + (pickerClass) + '">' +
                  toolbarHTML +
                  '<div class="picker-modal-inner">' +
                      weekHeaderHTML +
                      monthsHTML +
                  '</div>' +
              '</div>';
              
              
          p.pickerHTML = pickerHTML;    
      };

      // Input Events
      function openOnInput(e) {
          e.preventDefault();
          if (p.opened) return;
          p.open();
          if (p.params.scrollToInput && !isPopover()) {
              var pageContent = p.input.parents('.page-content');
              if (pageContent.length === 0) return;

              var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                  paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                  pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                  pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                  newPaddingBottom;

              var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
              if (inputTop > pageHeight) {
                  var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                  if (scrollTop + pageHeight > pageScrollHeight) {
                      newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                      if (pageHeight === pageScrollHeight) {
                          newPaddingBottom = p.container.height();
                      }
                      pageContent.css({'padding-bottom': (newPaddingBottom) + 'px'});
                  }
                  pageContent.scrollTop(scrollTop, 300);
              }
          }
      }
      function closeOnHTMLClick(e) {
          if (inPopover()) return;
          if (p.input && p.input.length > 0) {
              if (e.target !== p.input[0] && $(e.target).parents('.nt-picker-modal').length === 0) p.close();
          }
          else {
              if ($(e.target).parents('.nt-picker-modal').length === 0) p.close();
          }
      }

      if (p.params.input) {
          p.input = $(p.params.input);
          if (p.input.length > 0) {
              if (p.params.inputReadOnly) p.input.prop('readOnly', true);
              if (!p.inline) {
                  p.input.on('click', openOnInput);    
              }
              if (p.params.inputReadOnly) {
                  p.input.on('focus mousedown', function (e) {
                      e.preventDefault();
                  });
              }
          }
              
      }
      
      //iphone 上无法正确触发 click，会导致点击外面无法关闭
      if (!p.inline) $(document).on('click touchend', closeOnHTMLClick);

      // Open
      function onPickerClose() {
          p.opened = false;
          if (p.input && p.input.length > 0) p.input.parents('.page-content').css({'padding-bottom': ''});
          if (p.params.onClose) p.params.onClose(p);

          // Destroy events
          p.destroyCalendarEvents();
      }

      p.opened = false;
      p.open = function () {
          var toPopover = isPopover() && false;
          var updateValue = false;
          if (!p.opened) {
              // Set date value
              if (!p.value) {
                  if (p.params.value) {
                      p.value = p.params.value;
                      updateValue = true;
                  }
              }

              // Layout
              p.layout();

              // Append
              if (toPopover) {
                  p.pickerHTML = '<div class="popover popover-picker-calendar"><div class="popover-inner">' + p.pickerHTML + '</div></div>';
                  p.popover = $.popover(p.pickerHTML, p.params.input, true);
                  p.container = $(p.popover).find('.nt-picker-modal');
                  $(p.popover).on('close', function () {
                      onPickerClose();
                  });
              }
              else if (p.inline) {
                  p.container = $(p.pickerHTML);
                  p.container.addClass('picker-modal-inline');
                  $(p.params.container).append(p.container);
              }
              else {
                  p.container = $($.openPicker(p.pickerHTML));
                  $(p.container)
                  .on('close', function () {
                      onPickerClose();
                  });
              }

              // Store calendar instance
              p.container[0].f7Calendar = p;
              p.wrapper = p.container.find('.picker-calendar-months-wrapper');

              // Months
              p.months = p.wrapper.find('.picker-calendar-month');

              // Update current month and year
              p.updateCurrentMonthYear();

              // Set initial translate
              p.monthsTranslate = 0;
              p.setMonthsTranslate();

              // Init events
              p.initCalendarEvents();

              // Update input value
              if (updateValue) p.updateValue();
              
          }

          // Set flag
          p.opened = true;
          p.initialized = true;
          if (p.params.onMonthAdd) {
              p.months.each(function () {
                  p.params.onMonthAdd(p, this);
              });
          }
          if (p.params.onOpen) p.params.onOpen(p);
      };

      // Close
      p.close = function () {
          if (!p.opened || p.inline) return;
          p.animating = false;  //有可能还有动画没做完，因此animating设置还没改。
          if (inPopover()) {
              $.closePicker(p.popover);
              return;
          }
          else {
              $.closePicker(p.container);
              return;
          }
      };

      // Destroy
      p.destroy = function () {
          p.close();
          if (p.params.input && p.input.length > 0) {
              p.input.off('click focus', openOnInput);
              p.input.data("calendar", null);
          }
          $('html').off('click', closeOnHTMLClick);
      };

      if (p.inline) {
          p.open();
      }

      return p;
  };

  var format = function(d) {
    return d < 10 ? "0"+d : d;
  }


  $.fn.calendar = function (params, args) {
      params = params || {};
      return this.each(function() {
        var $this = $(this);
        if(!$this[0]) return;
        var p = {};
        if($this[0].tagName.toUpperCase() === "INPUT") {
          p.input = $this;
        } else {
          p.container = $this;
        }

        var calendar = $this.data("calendar");

        if(!calendar) {
          if(!params.value && $this.val()) params.value = [$this.val()];
          //默认显示今天
          if(!params.value) {
            var today = new Date();
            params.value = [today.getFullYear() + "-" + format(today.getMonth() + 1) + "-" + format(today.getDate())];
          }
          calendar = $this.data("calendar", new Calendar($.extend(p, params)));
        }

        if(typeof params === typeof "a") {
          calendar[params].call(calendar, args);
        }
      });
  };

  defaults = $.fn.calendar.prototype.defaults = {
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    firstDay: 1, // First day of the week, Monday
    weekendDays: [0, 6], // Sunday and Saturday
    multiple: false,
    dateFormat: 'yyyy-mm-dd',
    direction: 'horizontal', // or 'vertical'
    minDate: null,
    maxDate: null,
    touchMove: true,
    animate: true,
    closeOnSelect: true,
    monthPicker: true,
    monthPickerTemplate: 
        '<div class="picker-calendar-month-picker">' +
            '<a href="javascript:;" class="link icon-only picker-calendar-prev-month"><i class="icon icon-fenxiang"></i></a>' +
            '<div class="current-month-value"></div>' +
            '<a href="javascript:;" class="link icon-only picker-calendar-next-month"><i class="icon icon-31fanhui2"></i></a>' +
        '</div>',
    yearPicker: true,
    yearPickerTemplate: 
        '<div class="picker-calendar-year-picker">' +
            '<a href="javascript:;" class="link icon-only picker-calendar-prev-year"><i class="icon icon-fenxiang"></i></a>' +
            '<span class="current-year-value"></span>' +
            '<a href="javascript:;" class="link icon-only picker-calendar-next-year"><i class="icon icon-31fanhui2"></i></a>' +
        '</div>',
    weekHeader: true,
    // Common settings
    scrollToInput: true,
    inputReadOnly: true,
    convertToPopover: true,
    onlyInPopover: false,
    toolbar: true,
    toolbarCloseText: 'Done',
    toolbarTemplate: 
        '<div class="toolbar">' +
            '<div class="toolbar-inner">' +
                '{{yearPicker}}' +
                '{{monthPicker}}' +
                // '<a href="#" class="link close-picker">{{closeText}}</a>' +
            '</div>' +
        '</div>',
    /* Callbacks
    onMonthAdd
    onChange
    onOpen
    onClose
    onDayClick
    onMonthYearChangeStart
    onMonthYearChangeEnd
    */
  };

}($);

//1.激活ios不兼容CSS的active
;$(function(){
    document.body.addEventListener('touchstart', function () {});
});

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

/*======================================================
************   Picker   ************
======================================================*/
/* global $:true */
/* jshint unused:false */
/* jshint multistr:true */
+ function($) {
  "use strict";
  var Picker = function (params) {
      var p = this;
      var defaults = {
          updateValuesOnMomentum: false,
          updateValuesOnTouchmove: true,
          rotateEffect: false,
          momentumRatio: 7,
          freeMode: false,
          // Common settings
          scrollToInput: true,
          inputReadOnly: true,
          toolbar: true,
          toolbarCloseText: '完成',
          title: '请选择',
          toolbarTemplate: '<div class="toolbar">\
          <div class="toolbar-inner">\
          <a href="javascript:;" class="picker-button close-picker">{{closeText}}</a>\
          <h1 class="title">{{title}}</h1>\
          </div>\
          </div>',
      };
      params = params || {};
      for (var def in defaults) {
          if (typeof params[def] === 'undefined') {
              params[def] = defaults[def];
          }
      }
      p.params = params;
      p.cols = [];
      p.initialized = false;
      
      // Inline flag
      p.inline = p.params.container ? true : false;

      // 3D Transforms origin bug, only on safari
      var originBug = $.device.ios || (navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && navigator.userAgent.toLowerCase().indexOf('chrome') < 0) && !$.device.android;

      // Should be converted to popover
      function isPopover() {
          var toPopover = false;
          if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
          if (!p.inline && p.params.input) {
              if (p.params.onlyInPopover) toPopover = true;
              else {
                  if ($.device.ios) {
                      toPopover = $.device.ipad ? true : false;
                  }
                  else {
                      if ($(window).width() >= 768) toPopover = true;
                  }
              }
          } 
          return toPopover; 
      }
      function inPopover() {
          if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
          else return false;
      }

      // Value
      p.setValue = function (arrValues, transition) {
          //console.log(arrValues)
          var valueIndex = 0;
          for (var i = 0; i < p.cols.length; i++) {
              if (p.cols[i] && !p.cols[i].divider) {
                  console.log(arrValues[valueIndex])
                  p.cols[i].setValue(arrValues[valueIndex], transition);
                  valueIndex++;
              }
          }
      };
      p.updateValue = function () {
          var newValue = [];
          var newDisplayValue = [];
          for (var i = 0; i < p.cols.length; i++) {
              if (!p.cols[i].divider) {
                  newValue.push(p.cols[i].value);
                  newDisplayValue.push(p.cols[i].displayValue);
              }
          }
          if (newValue.indexOf(undefined) >= 0) {
              return;
          }
          p.value = newValue;
          p.displayValue = newDisplayValue;
          if (p.params.onChange) {
              p.params.onChange(p, p.value, p.displayValue);
          }
          if (p.input && p.input.length > 0) {
              $(p.input).val(p.params.formatValue ? p.params.formatValue(p, p.value, p.displayValue) : p.value.join(' '));
              $(p.input).trigger('change');
          }
      };

      // Columns Handlers
      p.initPickerCol = function (colElement, updateItems) {
          var colContainer = $(colElement);
          var colIndex = colContainer.index();
          var col = p.cols[colIndex];
          if (col.divider) return;
          col.container = colContainer;
          col.wrapper = col.container.find('.picker-items-col-wrapper');
          col.items = col.wrapper.find('.picker-item');
          
          var i, j;
          var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
          col.replaceValues = function (values, displayValues) {
              col.destroyEvents();
              col.values = values;
              col.displayValues = displayValues;
              var newItemsHTML = p.columnHTML(col, true);
              col.wrapper.html(newItemsHTML);
              col.items = col.wrapper.find('.picker-item');
              col.calcSize();
              col.setValue(col.values[0], 0, true);
              col.initEvents();
          };
          col.calcSize = function () {
              if (p.params.rotateEffect) {
                  col.container.removeClass('picker-items-col-absolute');
                  if (!col.width) col.container.css({width:''});
              }
              var colWidth, colHeight;
              colWidth = 0;
              colHeight = col.container[0].offsetHeight;
              wrapperHeight = col.wrapper[0].offsetHeight;
              itemHeight = col.items[0].offsetHeight;
              itemsHeight = itemHeight * col.items.length;
              minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
              maxTranslate = colHeight / 2 - itemHeight / 2;    
              if (col.width) {
                  colWidth = col.width;
                  if (parseInt(colWidth, 10) === colWidth) colWidth = colWidth + 'px';
                  col.container.css({width: colWidth});
              }
              if (p.params.rotateEffect) {
                  if (!col.width) {
                      col.items.each(function () {
                          var item = $(this);
                          item.css({width:'auto'});
                          colWidth = Math.max(colWidth, item[0].offsetWidth);
                          item.css({width:''});
                      });
                      col.container.css({width: (colWidth + 2) + 'px'});
                  }
                  col.container.addClass('picker-items-col-absolute');
              }
          };
          col.calcSize();
          
          col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)').transition(0);


          var activeIndex = 0;
          var animationFrameId;

          // Set Value Function
          col.setValue = function (newValue, transition, valueCallbacks) {
              if (typeof transition === 'undefined') transition = '';
              var newActiveIndex = col.wrapper.find('.picker-item[data-picker-value="' + newValue + '"]').index();
              if(typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                  return;
              }
              var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
              // Update wrapper
              col.wrapper.transition(transition);
              col.wrapper.transform('translate3d(0,' + (newTranslate) + 'px,0)');
                  
              // Watch items
              if (p.params.updateValuesOnMomentum && col.activeIndex && col.activeIndex !== newActiveIndex ) {
                  $.cancelAnimationFrame(animationFrameId);
                  col.wrapper.transitionEnd(function(){
                      $.cancelAnimationFrame(animationFrameId);
                  });
                  updateDuringScroll();
              }

              // Update items
              col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
          };

          col.updateItems = function (activeIndex, translate, transition, valueCallbacks) {
              if (typeof translate === 'undefined') {
                  translate = $.getTranslate(col.wrapper[0], 'y');
              }
              if(typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate)/itemHeight);
              if (activeIndex < 0) activeIndex = 0;
              if (activeIndex >= col.items.length) activeIndex = col.items.length - 1;
              var previousActiveIndex = col.activeIndex;
              col.activeIndex = activeIndex;
              /*
              col.wrapper.find('.picker-selected, .picker-after-selected, .picker-before-selected').removeClass('picker-selected picker-after-selected picker-before-selected');

              col.items.transition(transition);
              var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');
              var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
              var nextItems = selectedItem.nextAll().addClass('picker-after-selected');
              */
              //去掉 .picker-after-selected, .picker-before-selected 以提高性能
              col.wrapper.find('.picker-selected').removeClass('picker-selected');
              if (p.params.rotateEffect) {
                col.items.transition(transition);
              }
              var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');

              if (valueCallbacks || typeof valueCallbacks === 'undefined') {
                  // Update values
                  col.value = selectedItem.attr('data-picker-value');
                  col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
                  // On change callback
                  if (previousActiveIndex !== activeIndex) {
                      if (col.onChange) {
                          col.onChange(p, col.value, col.displayValue);
                      }
                      p.updateValue();
                  }
              }
                  
              // Set 3D rotate effect
              if (!p.params.rotateEffect) {
                  return;
              }
              var percentage = (translate - (Math.floor((translate - maxTranslate)/itemHeight) * itemHeight + maxTranslate)) / itemHeight;
              
              col.items.each(function () {
                  var item = $(this);
                  var itemOffsetTop = item.index() * itemHeight;
                  var translateOffset = maxTranslate - translate;
                  var itemOffset = itemOffsetTop - translateOffset;
                  var percentage = itemOffset / itemHeight;

                  var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;
                  
                  var angle = (-18*percentage);
                  if (angle > 180) angle = 180;
                  if (angle < -180) angle = -180;
                  // Far class
                  if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');
                  else item.removeClass('picker-item-far');
                  // Set transform
                  item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
              });
          };

          function updateDuringScroll() {
              animationFrameId = $.requestAnimationFrame(function () {
                  col.updateItems(undefined, undefined, 0);
                  updateDuringScroll();
              });
          }

          // Update items on init
          if (updateItems) col.updateItems(0, maxTranslate, 0);

          var allowItemClick = true;
          var isTouched, isMoved, touchStartY, touchCurrentY, touchStartTime, touchEndTime, startTranslate, returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;
          function handleTouchStart (e) {
              if (isMoved || isTouched) return;
              e.preventDefault();
              isTouched = true;
              var position = $.getTouchPosition(e);
              touchStartY = touchCurrentY = position.y;
              touchStartTime = (new Date()).getTime();
              
              allowItemClick = true;
              startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
          }
          function handleTouchMove (e) {
              if (!isTouched) return;
              e.preventDefault();
              allowItemClick = false;
              var position = $.getTouchPosition(e);
              touchCurrentY = position.y;
              if (!isMoved) {
                  // First move
                  $.cancelAnimationFrame(animationFrameId);
                  isMoved = true;
                  startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
                  col.wrapper.transition(0);
              }
              e.preventDefault();

              var diff = touchCurrentY - touchStartY;
              currentTranslate = startTranslate + diff;
              returnTo = undefined;

              // Normalize translate
              if (currentTranslate < minTranslate) {
                  currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
                  returnTo = 'min';
              }
              if (currentTranslate > maxTranslate) {
                  currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
                  returnTo = 'max';
              }
              // Transform wrapper
              col.wrapper.transform('translate3d(0,' + currentTranslate + 'px,0)');

              // Update items
              col.updateItems(undefined, currentTranslate, 0, p.params.updateValuesOnTouchmove);
              
              // Calc velocity
              velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
              velocityTime = (new Date()).getTime();
              prevTranslate = currentTranslate;
          }
          function handleTouchEnd (e) {
              if (!isTouched || !isMoved) {
                  isTouched = isMoved = false;
                  return;
              }
              isTouched = isMoved = false;
              col.wrapper.transition('');
              if (returnTo) {
                  if (returnTo === 'min') {
                      col.wrapper.transform('translate3d(0,' + minTranslate + 'px,0)');
                  }
                  else col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)');
              }
              touchEndTime = new Date().getTime();
              var velocity, newTranslate;
              if (touchEndTime - touchStartTime > 300) {
                  newTranslate = currentTranslate;
              }
              else {
                  velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                  newTranslate = currentTranslate + velocityTranslate * p.params.momentumRatio;
              }

              newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);

              // Active Index
              var activeIndex = -Math.floor((newTranslate - maxTranslate)/itemHeight);

              // Normalize translate
              if (!p.params.freeMode) newTranslate = -activeIndex * itemHeight + maxTranslate;

              // Transform wrapper
              col.wrapper.transform('translate3d(0,' + (parseInt(newTranslate,10)) + 'px,0)');

              // Update items
              col.updateItems(activeIndex, newTranslate, '', true);

              // Watch items
              if (p.params.updateValuesOnMomentum) {
                  updateDuringScroll();
                  col.wrapper.transitionEnd(function(){
                      $.cancelAnimationFrame(animationFrameId);
                  });
              }

              // Allow click
              setTimeout(function () {
                  allowItemClick = true;
              }, 100);
          }

          function handleClick(e) {
              if (!allowItemClick) return;
              $.cancelAnimationFrame(animationFrameId);
              /*jshint validthis:true */
              var value = $(this).attr('data-picker-value');
              col.setValue(value);
          }

          col.initEvents = function (detach) {
              var method = detach ? 'off' : 'on';
              col.container[method]($.touchEvents.start, handleTouchStart);
              col.container[method]($.touchEvents.move, handleTouchMove);
              col.container[method]($.touchEvents.end, handleTouchEnd);
              col.items[method]('click', handleClick);
          };
          col.destroyEvents = function () {
              col.initEvents(true);
          };

          col.container[0].f7DestroyPickerCol = function () {
              col.destroyEvents();
          };

          col.initEvents();

      };
      p.destroyPickerCol = function (colContainer) {
          colContainer = $(colContainer);
          if ('f7DestroyPickerCol' in colContainer[0]) colContainer[0].f7DestroyPickerCol();
      };
      // Resize cols
      function resizeCols() {
          if (!p.opened) return;
          for (var i = 0; i < p.cols.length; i++) {
              if (!p.cols[i].divider) {
                  p.cols[i].calcSize();
                  p.cols[i].setValue(p.cols[i].value, 0, false);
              }
          }
      }
      $(window).on('resize', resizeCols);

      // HTML Layout
      p.columnHTML = function (col, onlyItems) {
          var columnItemsHTML = '';
          var columnHTML = '';
          if (col.divider) {
              columnHTML += '<div class="picker-items-col picker-items-col-divider ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '">' + col.content + '</div>';
          }
          else {
              for (var j = 0; j < col.values.length; j++) {
                  columnItemsHTML += '<div class="picker-item" data-picker-value="' + col.values[j] + '">' + (col.displayValues ? col.displayValues[j] : col.values[j]) + '</div>';
              }
              columnHTML += '<div class="picker-items-col ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '"><div class="picker-items-col-wrapper">' + columnItemsHTML + '</div></div>';
          }
          return onlyItems ? columnItemsHTML : columnHTML;
      };
      p.layout = function () {
          var pickerHTML = '';
          var pickerClass = '';
          var i;
          p.cols = [];
          var colsHTML = '';
          for (i = 0; i < p.params.cols.length; i++) {
              var col = p.params.cols[i];
              colsHTML += p.columnHTML(p.params.cols[i]);
              p.cols.push(col);
          }
          pickerClass = 'nt-picker-modal picker-columns ' + (p.params.cssClass || '') + (p.params.rotateEffect ? ' picker-3d' : '') + (p.params.cols.length === 1 ? ' picker-columns-single' : '');
          pickerHTML =
              '<div class="' + (pickerClass) + '">' +
                  (p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText).replace(/{{title}}/g, p.params.title) : '') +
                  '<div class="picker-modal-inner picker-items">' +
                      colsHTML +
                      '<div class="picker-center-highlight"></div>' +
                  '</div>' +
              '</div>';
              
          p.pickerHTML = pickerHTML;    
      };

      // Input Events
      function openOnInput(e) {
          e.preventDefault();
          if (p.opened) return;
          p.open();
          if (p.params.scrollToInput && !isPopover()) {
              var pageContent = p.input.parents('.content');
              if (pageContent.length === 0) return;

              var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                  paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                  pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                  pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                  newPaddingBottom;
              var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
              if (inputTop > pageHeight) {
                  var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                  if (scrollTop + pageHeight > pageScrollHeight) {
                      newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                      if (pageHeight === pageScrollHeight) {
                          newPaddingBottom = p.container.height();
                      }
                      pageContent.css({'padding-bottom': (newPaddingBottom) + 'px'});
                  }
                  pageContent.scrollTop(scrollTop, 300);
              }
          }
      }
      function closeOnHTMLClick(e) {
          if (inPopover()) return;
          if (p.input && p.input.length > 0) {
              if (e.target !== p.input[0] && $(e.target).parents('.nt-picker-modal').length === 0) p.close();
          }
          else {
              if ($(e.target).parents('.nt-picker-modal').length === 0) p.close();
          }
      }

      if (p.params.input) {
          p.input = $(p.params.input);
          if (p.input.length > 0) {
              if (p.params.inputReadOnly) p.input.prop('readOnly', true);
              if (!p.inline) {
                  p.input.on('click', openOnInput);    
              }
              if (p.params.inputReadOnly) {
                  p.input.on('focus mousedown', function (e) {
                      e.preventDefault();
                  });
              }
          }
              
      }
      
      if (!p.inline) $('html').on('click', closeOnHTMLClick);

      // Open
      function onPickerClose() {
          p.opened = false;
          if (p.input && p.input.length > 0) p.input.parents('.page-content').css({'padding-bottom': ''});
          if (p.params.onClose) p.params.onClose(p);

          // Destroy events
          p.container.find('.picker-items-col').each(function () {
              p.destroyPickerCol(this);
          });
      }

      p.opened = false;
      p.open = function () {
          var toPopover = isPopover();

          if (!p.opened) {

              // Layout
              p.layout();

              // Append
              if (toPopover) {
                  p.pickerHTML = '<div class="popover popover-picker-columns"><div class="popover-inner">' + p.pickerHTML + '</div></div>';
                  p.popover = $.popover(p.pickerHTML, p.params.input, true);
                  p.container = $(p.popover).find('.nt-picker-modal');
                  $(p.popover).on('close', function () {
                      onPickerClose();
                  });
              }
              else if (p.inline) {
                  p.container = $(p.pickerHTML);
                  p.container.addClass('picker-modal-inline');
                  $(p.params.container).append(p.container);
              }
              else {
                  p.container = $($.openPicker(p.pickerHTML));
                  $(p.container)
                  .on('close', function () {
                      onPickerClose();
                  });
              }

              // Store picker instance
              p.container[0].f7Picker = p;

              // Init Events
              p.container.find('.picker-items-col').each(function () {
                  var updateItems = true;
                  if ((!p.initialized && p.params.value) || (p.initialized && p.value)) updateItems = false;
                  p.initPickerCol(this, updateItems);
              });
              
              // Set value
              if (!p.initialized) {
                  if (p.params.value) {
                      p.setValue(p.params.value, 0);
                  }
              }
              else {
                  if (p.value) p.setValue(p.value, 0);
              }
          }

          // Set flag
          p.opened = true;
          p.initialized = true;

          if (p.params.onOpen) p.params.onOpen(p);
      };

      // Close
      p.close = function (force) {
          if (!p.opened || p.inline) return;
          if (inPopover()) {
              $.closePicker(p.popover);
              return;
          }
          else {
              $.closePicker(p.container);
              return;
          }
      };

      // Destroy
      p.destroy = function () {
          p.close();
          if (p.params.input && p.input.length > 0) {
              p.input.off('click focus', openOnInput);
          }
          $('html').off('click', closeOnHTMLClick);
          $(window).off('resize', resizeCols);
      };

      if (p.inline) {
          p.open();
      }

      return p;
  };

  $(document).on("click", ".close-picker", function() {
    var pickerToClose = $('.nt-picker-modal.nt-picker-modal-visible');
    if (pickerToClose.length > 0) {
      $.closePicker(pickerToClose);
    }
  });

  //修复picker会滚动页面的bug
  $(document).on($.touchEvents.move, ".picker-modal-inner", function(e) {
    e.preventDefault();
  });


  $.openPicker = function(tpl, className, callback) {

    if(typeof className === "function") {
      callback = className;
      className = undefined;
    }

    $.closePicker();

    var container = $("<div class='nt-picker-container "+ (className || "") + "'></div>").appendTo(document.body);
    container.show();

    container.addClass("nt-picker-container-visible");

    //关于布局的问题，如果直接放在body上，则做动画的时候会撑开body高度而导致滚动条变化。
    var dialog = $(tpl).appendTo(container);
    
    dialog.width(); //通过取一次CSS值，强制浏览器不能把上下两行代码合并执行，因为合并之后会导致无法出现动画。

    dialog.addClass("nt-picker-modal-visible");

    callback && container.on("close", callback);

    return dialog;
  }

  $.updatePicker = function(tpl) {
    var container = $(".nt-picker-container-visible");
    if(!container[0]) return false;

    container.html("");

    var dialog = $(tpl).appendTo(container);

    dialog.addClass("nt-picker-modal-visible");

    return dialog;
  }

  $.closePicker = function(container, callback) {
    if(typeof container === "function") callback = container;
    $(".nt-picker-modal-visible").removeClass("nt-picker-modal-visible").transitionEnd(function() {
      $(this).parent().remove();
      callback && callback();
    }).trigger("close");
  };

  $.fn.picker = function(params) {
    var args = arguments;
    return this.each(function() {
      if(!this) return;
      var $this = $(this);
      
      var picker = $this.data("picker");
      if(!picker) {
        params = params || {};
        var inputValue = $this.val();
        if(params.value === undefined && inputValue !== "") {
          params.value = params.cols.length > 1 ? inputValue.split(" ") : [inputValue];
        }
        var p = $.extend({input: this}, params);
        picker = new Picker(p);
        $this.data("picker", picker);
      }
      if(typeof params === typeof "a") {
        picker[params].apply(picker, Array.prototype.slice.call(args, 1));
      }
    });
  };
}($);

﻿
// +----------------------------------------------------------------------
// | 说明: 五.seacity JS通用UI库
// +----------------------------------------------------------------------
// | 最后修改时间: 2016-6-15
// +----------------------------------------------------------------------
;!function($){

    /**
     * 公共UI控件
     * @param
     * @return void
     */
    var UI = function(){
        //
        var parent = this;
    }
    UI.pt = UI.prototype;
    /**
     * tips提示
     * @param {options}
     * @return void
     */
    UI.pt.tips = function(settings){
        // 默认模板
        var _tipsTpl=
            '<div class="ui-tips ui-tips-<%=type%>">'+
                '<div class="ui-tips-cnt">'+
                    '<i></i><%=content%>'+
                '</div>'+
            '</div>';

        // 默认参数
        var defaults={
            content:'',
            stayTime:1500,
            type:'info',
            callback:function(){}
        }
        var args = arguments;
        // 构造函数
        var Tips   = function (el,option,isFromTpl) {
            var self=this;
            this.element=$(el);
            this._isFromTpl=isFromTpl;
            this.marginLeft=-$(el).width()/2 + 'px';
            this.marginTop = -$(el).height()/2 + 'px';
            this.option=$.extend(defaults,option);
            $(el).css({
                "-webkit-transform":"scale(0.3)",
                "margin-left":self.marginLeft,
                "margin-top":self.marginTop
            });
            setTimeout(function(){
                $(el).css({
                    "-webkit-transition":"transform .3s"
                });
                self.show();
            },20);

        }
        Tips.prototype={
            show:function(){
                var self=this;
                this.element.css({
                    "-webkit-transform":"scale(1)"
                });
                if(self.option.stayTime>0){
                    setTimeout(function(){
                        self.hide();
                    },self.option.stayTime)
                }
            },
            hide :function () {
                var self=this;
                setTimeout(function(){
                    self.option.callback(self);
                    self._isFromTpl&&self.element.remove();
                },500)
            }
        }
        function model(option) {
            var param = {};
            //参数形式
            if(typeof option == 'string'){
                param.content = args[0];
                param.callback = args[1] || new Function();
            }
            //对象形式
            if(typeof option == 'object'){
                param = option;
            }
            //参数合并
            var context = $.extend({}, defaults,param);
            var $this = $($.tpl(_tipsTpl,context)).appendTo("body");
            var  isFromTpl=true;
            var tips = new Tips($this,context,isFromTpl);
            return tips;
        }
        model(settings);
    }
    /**
     * 对话框
     * @param {options}
     * @return void
     */
    UI.pt.alert = function(settings){
        // 默认模板
        var _alertTpl=
            '<div class="ui-alert">'+
                '<div class="ui-alert-cnt">'+
                    '<div class="ui-alert-bd">'+
                            '<div>'+
                                '<h4><%=title%></h4>'+
                                '<div class="content"><%=content%></div>' +
                            '</div>'+
                        '</div>'+
                    '<div class="ui-alert-ft ui-btn-group color-blue ft-28">'+
                    '<% for (var i = 0; i < button.length; i++) { %>' +
                        '<% if (i == select) { %>' +
                            '<div type="button" class="ui-alert-button" data-role="button"  class="select" id="alertButton<%=i%>"><%=button[i]%></div>' +
                        '<% } else { %>' +
                            '<div type="button" class="ui-alert-button" data-role="button" id="alertButton<%=i%>"><%=button[i]%></div>' +
                        '<% } %>' +
                    '<% } %>' +
                    '</div>'+
                '</div>'+
            '</div>';
        // 默认参数
        var defaults={
            title:'',
            content:'',
            button:['确认'],
            select:0,
            allowScroll:false,
            callback:function(){},//底部按钮回调函数
            close:new Function() //关闭回调函数
        }
        // 构造函数  el：dom对象  option 参数  isFromTpl是否已经模板解析
        var Alert  = function (el,option,isFromTpl) {
            this.option=$.extend(defaults,option);
            this.element=$(el);
            this._isFromTpl=isFromTpl;
            this.button=$(el).find('[data-role="button"]');
            this._bindEvent();
            this.toggle();
        }
        Alert.prototype={
            _bindEvent:function(){
                var self=this;
                self.button.click(function(){
                    var index=$(self.button).index($(this));
                    self.option.callback(self,index);
                });
            },
            toggle:function(){
                if(this.element.hasClass("show")){
                    this.hide();
                }else{
                    this.show();
                }
            },
            show:function(){
                var self=this;
                self.element.addClass("show");
                this.option.allowScroll && self.element.on("touchmove" , _stop);
            },
            hide :function () {
                var self=this;
                self.option.close(self);
                self.element.removeClass("show");
                self.element.off("touchmove" , _stop);
                //self._isFromTpl&&self.element.remove();
            }
        }
        // 禁止冒泡
        function _stop(){
            return false;
        }
        function model(option) {
            //参数合并
            var context = $.extend({}, defaults,typeof option == 'object' && option);
            var $this = $($.tpl(_alertTpl,context)).appendTo("body");
            var  isFromTpl=true;
            var alert = new Alert($this,context,isFromTpl);
            return alert;
        }
        return model(settings);
    }
    /**
     * 原msg.js中的全局msg方法，合并到ui对象下
     * @param {String} content : 提示的文本
     * @param {Number} type 0(default):加载 1：成功 2：错误 3：警告 4：问题
     * @return void
     */
    UI.pt.msg = function(content,type){
        var defaults = {
            content:'正在加载，请稍候...',
            type:0
        }
        var Msg = function(content,type){
            defaults.content = content || defaults.content;
            defaults.type = type || defaults.type;
            this.show();
        }
        Msg.prototype = {
            hide:function(){
                "use strict";
                var ct;
                $(".msg-mask, .msg-box").addClass("opacity");
                clearTimeout($(".msg-box").data("ct"));
                ct = setTimeout(function () {
                    $(".msg-mask, .msg-box").remove();
                }, 500);
                $(".msg-box").data("ct", ct);
            },
            show:function(){
                var self = this;
                var type_arr = ["msg-loading", "msg-success", "msg-error", "msg-warning", "msg-question"];
                var ct = null;
                var $msg = null;
                clearTimeout($(".msg-box").data("ct"));
                $(".msg-mask, .msg-box").remove();
                $msg = $("<div />").addClass("msg-box opacity").append($("<span />").addClass("msg-icon")).append($("<span />").addClass("text"));
                $("body").append($("<div />").addClass("msg-mask opacity").add($msg));
                $msg.find('.msg-icon').attr("class", "msg-icon " + type_arr[defaults.type]).next().text(defaults.content);
                $msg.width(28 + $msg.find(".text").width());
                $(".msg-mask").add($msg).removeClass("opacity");
                if (defaults.type === 0) {
                    ct = setTimeout(function () {
                        $msg.css({
                            "transition": ".6s","-webkit-transition": ".6s"
                        });
                        $msg.find('.text').text('请耐心等候...');
                        $msg.width(110);
                        ct = setTimeout(function () {
                            $msg.find('.text').text("操作失败，请重试!", 3);
                            $msg.width(140);
                            ct = setTimeout(function () {
                                self.hide();
                            }, 3000);
                            $msg.data("ct", ct);
                        }, 10000);
                        $msg.data("ct", ct);
                    }, 3000);
                    $msg.data("ct", ct);
                } else {
                    $(".msg-mask").click(function () {
                        self.hide();
                    });
                }
            }
        }
        var model = function(){
            return new Msg(content,type);
        }
        return model();
    }
    /**
     * select
     * @param {options}
     * @return void
     */
    UI.pt.select = function(){
        //console.log('select')
    }

    window.ui = new UI();
}(window.Zepto || window.jQuery)


