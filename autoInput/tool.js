export default {
  getInputPositon(elem) {
    if (document.selection) {
      // IE Support
      elem.focus()
      var Sel = document.selection.createRange()
      return {
        left: Sel.boundingLeft,
        top: Sel.boundingTop,
        bottom: Sel.boundingTop + Sel.boundingHeight
      }
    } else {
      var cloneDiv = '{$clone_div}'
      var cloneLeft = '{$cloneLeft}'
      var cloneFocus = '{$cloneFocus}'
      var none = '<span style="white-space:pre-wrap;"> </span>'
      var div = elem[cloneDiv] || document.createElement('div')
      var focus = elem[cloneFocus] || document.createElement('span')
      var text = elem[cloneLeft] || document.createElement('span')
      var index = this._getFocus(elem)
      var focusOffset = { left: 0, top: 0 }

      if (!elem[cloneDiv]) {
        elem[cloneDiv] = div
        elem[cloneFocus] = focus
        elem[cloneLeft] = text
        div.appendChild(text)
        div.appendChild(focus)
        document.body.appendChild(div)
        focus.innerHTML = '|'
        focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;word-wrap:break-word;word-break:break-all;'
        div.className = this._cloneStyle(elem)
        div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;word-wrap:break-word;word-break:break-all;overflow:hidden;'
      }
      div.style.left = this._offset(elem).left + 'px'
      div.style.top = this._offset(elem).top + 'px'
      var strTmp = elem.value.substring(0, index).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none)
      text.innerHTML = strTmp

      focus.style.display = 'inline-block'
      try { focusOffset = this._offset(focus) } catch (e) { console.log(e) }
      focus.style.display = 'none'
      return {
        left: focusOffset.left,
        top: focusOffset.top,
        bottom: focusOffset.bottom
      }
    }
  },

  // 克隆元素样式并返回类
  _cloneStyle(elem, cache) {
    if (!cache && elem['${cloneName}']) return elem['${cloneName}']
    var className, name
    var rstyle = /^(number|string)$/
    var rname = /^(content|outline|outlineWidth)$/
    // Opera: content; IE8:outline && outlineWidth
    var cssText = []
    var sStyle = elem.style

    for (name in sStyle) {
      if (!rname.test(name)) {
        var val = this._getStyle(elem, name)
        if (val !== '' && rstyle.test(typeof val)) { // Firefox 4
          name = name.replace(/([A-Z])/g, '-$1').toLowerCase()
          cssText.push(name)
          cssText.push(':')
          cssText.push(val)
          cssText.push(';')
        }
      }
    }
    cssText = cssText.join('')
    elem['${cloneName}'] = className = 'clone' + (new Date()).getTime()
    this._addHeadStyle('.' + className + '{' + cssText + '}')
    return className
  },

  // 向页头插入样式
  _addHeadStyle(content) {
    var style = this._style[document]
    if (!style) {
      style = this._style[document] = document.createElement('style')
      document.getElementsByTagName('head')[0].appendChild(style)
    }
    style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content))
  },
  _style: {},

  // 获取最终样式
  _getStyle(elem, name) {
    if ('getComputedStyle' in window) {
      return getComputedStyle(elem, null)[name]
    } else {
      return elem.currentStyle[name]
    }
  },

  // 获取光标在文本框的位置
  _getFocus(elem) {
    var index = 0
    if (document.selection) {
      // IE Support
      elem.focus()
      var Sel = document.selection.createRange()
      if (elem.nodeName === 'TEXTAREA') {
        // textarea
        var Sel2 = Sel.duplicate()
        Sel2.moveToElementText(elem)
        index = -1
        while (Sel2.inRange(Sel)) {
          Sel2.moveStart('character')
          index++
        }
      } else if (elem.nodeName === 'INPUT') {
        // input
        Sel.moveStart('character', -elem.value.length)
        index = Sel.text.length
      }
    } else if (elem.selectionStart || elem.selectionStart === '0') { // Firefox support
      index = elem.selectionStart
    }
    return (index)
  },
  // 获取元素在页面中位置
  _offset(elem) {
    var box = elem.getBoundingClientRect()
    var doc = elem.ownerDocument
    var body = doc.body
    var docElem = doc.documentElement
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0
    var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop
    var left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft
    return {
      left: left,
      top: top,
      right: left + box.width,
      bottom: top + box.height
    }
  }
}
