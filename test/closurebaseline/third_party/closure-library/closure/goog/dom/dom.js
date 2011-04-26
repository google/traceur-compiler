
goog.provide('goog.dom'); 
goog.provide('goog.dom.DomHelper'); 
goog.provide('goog.dom.NodeType'); 
goog.require('goog.array'); 
goog.require('goog.dom.BrowserFeature'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Size'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.dom.ASSUME_QUIRKS_MODE = false; 
goog.dom.ASSUME_STANDARDS_MODE = false; 
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE; 
goog.dom.NodeType = { 
  ELEMENT: 1, 
  ATTRIBUTE: 2, 
  TEXT: 3, 
  CDATA_SECTION: 4, 
  ENTITY_REFERENCE: 5, 
  ENTITY: 6, 
  PROCESSING_INSTRUCTION: 7, 
  COMMENT: 8, 
  DOCUMENT: 9, 
  DOCUMENT_TYPE: 10, 
  DOCUMENT_FRAGMENT: 11, 
  NOTATION: 12 
}; 
goog.dom.getDomHelper = function(opt_element) { 
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)):(goog.dom.defaultDomHelper_ ||(goog.dom.defaultDomHelper_ = new goog.dom.DomHelper())); 
}; 
goog.dom.defaultDomHelper_; 
goog.dom.getDocument = function() { 
  return document; 
}; 
goog.dom.getElement = function(element) { 
  return goog.isString(element) ? document.getElementById(element): element; 
}; 
goog.dom.$ = goog.dom.getElement; 
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) { 
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el); 
}; 
goog.dom.getElementsByClass = function(className, opt_el) { 
  var parent = opt_el || document; 
  if(goog.dom.canUseQuerySelector_(parent)) { 
    return parent.querySelectorAll('.' + className); 
  } else if(parent.getElementsByClassName) { 
    return parent.getElementsByClassName(className); 
  } 
  return goog.dom.getElementsByTagNameAndClass_(document, '*', className, opt_el); 
}; 
goog.dom.getElementByClass = function(className, opt_el) { 
  var parent = opt_el || document; 
  var retVal = null; 
  if(goog.dom.canUseQuerySelector_(parent)) { 
    retVal = parent.querySelector('.' + className); 
  } else { 
    retVal = goog.dom.getElementsByClass(className, opt_el)[0]; 
  } 
  return retVal || null; 
}; 
goog.dom.canUseQuerySelector_ = function(parent) { 
  return parent.querySelectorAll && parent.querySelector &&(! goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) || goog.userAgent.isVersion('528')); 
}; 
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) { 
  var parent = opt_el || doc; 
  var tagName =(opt_tag && opt_tag != '*') ? opt_tag.toUpperCase(): ''; 
  if(goog.dom.canUseQuerySelector_(parent) &&(tagName || opt_class)) { 
    var query = tagName +(opt_class ? '.' + opt_class: ''); 
    return parent.querySelectorAll(query); 
  } 
  if(opt_class && parent.getElementsByClassName) { 
    var els = parent.getElementsByClassName(opt_class); 
    if(tagName) { 
      var arrayLike = { }; 
      var len = 0; 
      for(var i = 0, el; el = els[i]; i ++) { 
        if(tagName == el.nodeName) { 
          arrayLike[len ++]= el; 
        } 
      } 
      arrayLike.length = len; 
      return arrayLike; 
    } else { 
      return els; 
    } 
  } 
  var els = parent.getElementsByTagName(tagName || '*'); 
  if(opt_class) { 
    var arrayLike = { }; 
    var len = 0; 
    for(var i = 0, el; el = els[i]; i ++) { 
      var className = el.className; 
      if(typeof className.split == 'function' && goog.array.contains(className.split(/\s+/), opt_class)) { 
        arrayLike[len ++]= el; 
      } 
    } 
    arrayLike.length = len; 
    return arrayLike; 
  } else { 
    return els; 
  } 
}; 
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass; 
goog.dom.setProperties = function(element, properties) { 
  goog.object.forEach(properties, function(val, key) { 
    if(key == 'style') { 
      element.style.cssText = val; 
    } else if(key == 'class') { 
      element.className = val; 
    } else if(key == 'for') { 
      element.htmlFor = val; 
    } else if(key in goog.dom.DIRECT_ATTRIBUTE_MAP_) { 
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val); 
    } else { 
      element[key]= val; 
    } 
  }); 
}; 
goog.dom.DIRECT_ATTRIBUTE_MAP_ = { 
  'cellpadding': 'cellPadding', 
  'cellspacing': 'cellSpacing', 
  'colspan': 'colSpan', 
  'rowspan': 'rowSpan', 
  'valign': 'vAlign', 
  'height': 'height', 
  'width': 'width', 
  'usemap': 'useMap', 
  'frameborder': 'frameBorder', 
  'maxlength': 'maxLength', 
  'type': 'type' 
}; 
goog.dom.getViewportSize = function(opt_window) { 
  return goog.dom.getViewportSize_(opt_window || window); 
}; 
goog.dom.getViewportSize_ = function(win) { 
  var doc = win.document; 
  if(goog.userAgent.WEBKIT && ! goog.userAgent.isVersion('500') && ! goog.userAgent.MOBILE) { 
    if(typeof win.innerHeight == 'undefined') { 
      win = window; 
    } 
    var innerHeight = win.innerHeight; 
    var scrollHeight = win.document.documentElement.scrollHeight; 
    if(win == win.top) { 
      if(scrollHeight < innerHeight) { 
        innerHeight -= 15; 
      } 
    } 
    return new goog.math.Size(win.innerWidth, innerHeight); 
  } 
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement: doc.body; 
  return new goog.math.Size(el.clientWidth, el.clientHeight); 
}; 
goog.dom.getDocumentHeight = function() { 
  return goog.dom.getDocumentHeight_(window); 
}; 
goog.dom.getDocumentHeight_ = function(win) { 
  var doc = win.document; 
  var height = 0; 
  if(doc) { 
    var vh = goog.dom.getViewportSize_(win).height; 
    var body = doc.body; 
    var docEl = doc.documentElement; 
    if(goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) { 
      height = docEl.scrollHeight != vh ? docEl.scrollHeight: docEl.offsetHeight; 
    } else { 
      var sh = docEl.scrollHeight; 
      var oh = docEl.offsetHeight; 
      if(docEl.clientHeight != oh) { 
        sh = body.scrollHeight; 
        oh = body.offsetHeight; 
      } 
      if(sh > vh) { 
        height = sh > oh ? sh: oh; 
      } else { 
        height = sh < oh ? sh: oh; 
      } 
    } 
  } 
  return height; 
}; 
goog.dom.getPageScroll = function(opt_window) { 
  var win = opt_window || goog.global || window; 
  return goog.dom.getDomHelper(win.document).getDocumentScroll(); 
}; 
goog.dom.getDocumentScroll = function() { 
  return goog.dom.getDocumentScroll_(document); 
}; 
goog.dom.getDocumentScroll_ = function(doc) { 
  var el = goog.dom.getDocumentScrollElement_(doc); 
  var win = goog.dom.getWindow_(doc); 
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop); 
}; 
goog.dom.getDocumentScrollElement = function() { 
  return goog.dom.getDocumentScrollElement_(document); 
}; 
goog.dom.getDocumentScrollElement_ = function(doc) { 
  return ! goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ? doc.documentElement: doc.body; 
}; 
goog.dom.getWindow = function(opt_doc) { 
  return opt_doc ? goog.dom.getWindow_(opt_doc): window; 
}; 
goog.dom.getWindow_ = function(doc) { 
  return doc.parentWindow || doc.defaultView; 
}; 
goog.dom.createDom = function(tagName, opt_attributes, var_args) { 
  return goog.dom.createDom_(document, arguments); 
}; 
goog.dom.createDom_ = function(doc, args) { 
  var tagName = args[0]; 
  var attributes = args[1]; 
  if(! goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes &&(attributes.name || attributes.type)) { 
    var tagNameArr =['<', tagName]; 
    if(attributes.name) { 
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"'); 
    } 
    if(attributes.type) { 
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"'); 
      var clone = { }; 
      goog.object.extend(clone, attributes); 
      attributes = clone; 
      delete attributes.type; 
    } 
    tagNameArr.push('>'); 
    tagName = tagNameArr.join(''); 
  } 
  var element = doc.createElement(tagName); 
  if(attributes) { 
    if(goog.isString(attributes)) { 
      element.className = attributes; 
    } else if(goog.isArray(attributes)) { 
      goog.dom.classes.add.apply(null,[element].concat(attributes)); 
    } else { 
      goog.dom.setProperties(element, attributes); 
    } 
  } 
  if(args.length > 2) { 
    goog.dom.append_(doc, element, args, 2); 
  } 
  return element; 
}; 
goog.dom.append_ = function(doc, parent, args, startIndex) { 
  function childHandler(child) { 
    if(child) { 
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child): child); 
    } 
  } 
  for(var i = startIndex; i < args.length; i ++) { 
    var arg = args[i]; 
    if(goog.isArrayLike(arg) && ! goog.dom.isNodeLike(arg)) { 
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.clone(arg): arg, childHandler); 
    } else { 
      childHandler(arg); 
    } 
  } 
}; 
goog.dom.$dom = goog.dom.createDom; 
goog.dom.createElement = function(name) { 
  return document.createElement(name); 
}; 
goog.dom.createTextNode = function(content) { 
  return document.createTextNode(content); 
}; 
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) { 
  return goog.dom.createTable_(document, rows, columns, ! ! opt_fillWithNbsp); 
}; 
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) { 
  var rowHtml =['<tr>']; 
  for(var i = 0; i < columns; i ++) { 
    rowHtml.push(fillWithNbsp ? '<td>&nbsp;</td>': '<td></td>'); 
  } 
  rowHtml.push('</tr>'); 
  rowHtml = rowHtml.join(''); 
  var totalHtml =['<table>']; 
  for(i = 0; i < rows; i ++) { 
    totalHtml.push(rowHtml); 
  } 
  totalHtml.push('</table>'); 
  var elem = doc.createElement(goog.dom.TagName.DIV); 
  elem.innerHTML = totalHtml.join(''); 
  return(elem.removeChild(elem.firstChild)); 
}; 
goog.dom.htmlToDocumentFragment = function(htmlString) { 
  return goog.dom.htmlToDocumentFragment_(document, htmlString); 
}; 
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) { 
  var tempDiv = doc.createElement('div'); 
  if(goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) { 
    tempDiv.innerHTML = '<br>' + htmlString; 
    tempDiv.removeChild(tempDiv.firstChild); 
  } else { 
    tempDiv.innerHTML = htmlString; 
  } 
  if(tempDiv.childNodes.length == 1) { 
    return(tempDiv.removeChild(tempDiv.firstChild)); 
  } else { 
    var fragment = doc.createDocumentFragment(); 
    while(tempDiv.firstChild) { 
      fragment.appendChild(tempDiv.firstChild); 
    } 
    return fragment; 
  } 
}; 
goog.dom.getCompatMode = function() { 
  return goog.dom.isCss1CompatMode() ? 'CSS1Compat': 'BackCompat'; 
}; 
goog.dom.isCss1CompatMode = function() { 
  return goog.dom.isCss1CompatMode_(document); 
}; 
goog.dom.isCss1CompatMode_ = function(doc) { 
  if(goog.dom.COMPAT_MODE_KNOWN_) { 
    return goog.dom.ASSUME_STANDARDS_MODE; 
  } 
  return doc.compatMode == 'CSS1Compat'; 
}; 
goog.dom.canHaveChildren = function(node) { 
  if(node.nodeType != goog.dom.NodeType.ELEMENT) { 
    return false; 
  } 
  switch(node.tagName) { 
    case goog.dom.TagName.APPLET: 
    case goog.dom.TagName.AREA: 
    case goog.dom.TagName.BASE: 
    case goog.dom.TagName.BR: 
    case goog.dom.TagName.COL: 
    case goog.dom.TagName.FRAME: 
    case goog.dom.TagName.HR: 
    case goog.dom.TagName.IMG: 
    case goog.dom.TagName.INPUT: 
    case goog.dom.TagName.IFRAME: 
    case goog.dom.TagName.ISINDEX: 
    case goog.dom.TagName.LINK: 
    case goog.dom.TagName.NOFRAMES: 
    case goog.dom.TagName.NOSCRIPT: 
    case goog.dom.TagName.META: 
    case goog.dom.TagName.OBJECT: 
    case goog.dom.TagName.PARAM: 
    case goog.dom.TagName.SCRIPT: 
    case goog.dom.TagName.STYLE: 
      return false; 

  } 
  return true; 
}; 
goog.dom.appendChild = function(parent, child) { 
  parent.appendChild(child); 
}; 
goog.dom.append = function(parent, var_args) { 
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1); 
}; 
goog.dom.removeChildren = function(node) { 
  var child; 
  while((child = node.firstChild)) { 
    node.removeChild(child); 
  } 
}; 
goog.dom.insertSiblingBefore = function(newNode, refNode) { 
  if(refNode.parentNode) { 
    refNode.parentNode.insertBefore(newNode, refNode); 
  } 
}; 
goog.dom.insertSiblingAfter = function(newNode, refNode) { 
  if(refNode.parentNode) { 
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling); 
  } 
}; 
goog.dom.insertChildAt = function(parent, child, index) { 
  parent.insertBefore(child, parent.childNodes[index]|| null); 
}; 
goog.dom.removeNode = function(node) { 
  return node && node.parentNode ? node.parentNode.removeChild(node): null; 
}; 
goog.dom.replaceNode = function(newNode, oldNode) { 
  var parent = oldNode.parentNode; 
  if(parent) { 
    parent.replaceChild(newNode, oldNode); 
  } 
}; 
goog.dom.flattenElement = function(element) { 
  var child, parent = element.parentNode; 
  if(parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) { 
    if(element.removeNode) { 
      return(element.removeNode(false)); 
    } else { 
      while((child = element.firstChild)) { 
        parent.insertBefore(child, element); 
      } 
      return(goog.dom.removeNode(element)); 
    } 
  } 
}; 
goog.dom.getChildren = function(element) { 
  if(goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) { 
    return element.children; 
  } 
  return goog.array.filter(element.childNodes, function(node) { 
    return node.nodeType == goog.dom.NodeType.ELEMENT; 
  }); 
}; 
goog.dom.getFirstElementChild = function(node) { 
  if(node.firstElementChild != undefined) { 
    return(node).firstElementChild; 
  } 
  return goog.dom.getNextElementNode_(node.firstChild, true); 
}; 
goog.dom.getLastElementChild = function(node) { 
  if(node.lastElementChild != undefined) { 
    return(node).lastElementChild; 
  } 
  return goog.dom.getNextElementNode_(node.lastChild, false); 
}; 
goog.dom.getNextElementSibling = function(node) { 
  if(node.nextElementSibling != undefined) { 
    return(node).nextElementSibling; 
  } 
  return goog.dom.getNextElementNode_(node.nextSibling, true); 
}; 
goog.dom.getPreviousElementSibling = function(node) { 
  if(node.previousElementSibling != undefined) { 
    return(node).previousElementSibling; 
  } 
  return goog.dom.getNextElementNode_(node.previousSibling, false); 
}; 
goog.dom.getNextElementNode_ = function(node, forward) { 
  while(node && node.nodeType != goog.dom.NodeType.ELEMENT) { 
    node = forward ? node.nextSibling: node.previousSibling; 
  } 
  return(node); 
}; 
goog.dom.getNextNode = function(node) { 
  if(! node) { 
    return null; 
  } 
  if(node.firstChild) { 
    return node.firstChild; 
  } 
  while(node && ! node.nextSibling) { 
    node = node.parentNode; 
  } 
  return node ? node.nextSibling: null; 
}; 
goog.dom.getPreviousNode = function(node) { 
  if(! node) { 
    return null; 
  } 
  if(! node.previousSibling) { 
    return node.parentNode; 
  } 
  node = node.previousSibling; 
  while(node && node.lastChild) { 
    node = node.lastChild; 
  } 
  return node; 
}; 
goog.dom.isNodeLike = function(obj) { 
  return goog.isObject(obj) && obj.nodeType > 0; 
}; 
goog.dom.isWindow = function(obj) { 
  return goog.isObject(obj) && obj['window']== obj; 
}; 
goog.dom.contains = function(parent, descendant) { 
  if(parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) { 
    return parent == descendant || parent.contains(descendant); 
  } 
  if(typeof parent.compareDocumentPosition != 'undefined') { 
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16); 
  } 
  while(descendant && parent != descendant) { 
    descendant = descendant.parentNode; 
  } 
  return descendant == parent; 
}; 
goog.dom.compareNodeOrder = function(node1, node2) { 
  if(node1 == node2) { 
    return 0; 
  } 
  if(node1.compareDocumentPosition) { 
    return node1.compareDocumentPosition(node2) & 2 ? 1: - 1; 
  } 
  if('sourceIndex' in node1 ||(node1.parentNode && 'sourceIndex' in node1.parentNode)) { 
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT; 
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT; 
    if(isElement1 && isElement2) { 
      return node1.sourceIndex - node2.sourceIndex; 
    } else { 
      var parent1 = node1.parentNode; 
      var parent2 = node2.parentNode; 
      if(parent1 == parent2) { 
        return goog.dom.compareSiblingOrder_(node1, node2); 
      } 
      if(! isElement1 && goog.dom.contains(parent1, node2)) { 
        return - 1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2); 
      } 
      if(! isElement2 && goog.dom.contains(parent2, node1)) { 
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1); 
      } 
      return(isElement1 ? node1.sourceIndex: parent1.sourceIndex) -(isElement2 ? node2.sourceIndex: parent2.sourceIndex); 
    } 
  } 
  var doc = goog.dom.getOwnerDocument(node1); 
  var range1, range2; 
  range1 = doc.createRange(); 
  range1.selectNode(node1); 
  range1.collapse(true); 
  range2 = doc.createRange(); 
  range2.selectNode(node2); 
  range2.collapse(true); 
  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END, range2); 
}; 
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) { 
  var parent = textNode.parentNode; 
  if(parent == node) { 
    return - 1; 
  } 
  var sibling = node; 
  while(sibling.parentNode != parent) { 
    sibling = sibling.parentNode; 
  } 
  return goog.dom.compareSiblingOrder_(sibling, textNode); 
}; 
goog.dom.compareSiblingOrder_ = function(node1, node2) { 
  var s = node2; 
  while((s = s.previousSibling)) { 
    if(s == node1) { 
      return - 1; 
    } 
  } 
  return 1; 
}; 
goog.dom.findCommonAncestor = function(var_args) { 
  var i, count = arguments.length; 
  if(! count) { 
    return null; 
  } else if(count == 1) { 
    return arguments[0]; 
  } 
  var paths =[]; 
  var minLength = Infinity; 
  for(i = 0; i < count; i ++) { 
    var ancestors =[]; 
    var node = arguments[i]; 
    while(node) { 
      ancestors.unshift(node); 
      node = node.parentNode; 
    } 
    paths.push(ancestors); 
    minLength = Math.min(minLength, ancestors.length); 
  } 
  var output = null; 
  for(i = 0; i < minLength; i ++) { 
    var first = paths[0][i]; 
    for(var j = 1; j < count; j ++) { 
      if(first != paths[j][i]) { 
        return output; 
      } 
    } 
    output = first; 
  } 
  return output; 
}; 
goog.dom.getOwnerDocument = function(node) { 
  return(node.nodeType == goog.dom.NodeType.DOCUMENT ? node: node.ownerDocument || node.document); 
}; 
goog.dom.getFrameContentDocument = function(frame) { 
  var doc; 
  if(goog.userAgent.WEBKIT) { 
    doc =(frame.document || frame.contentWindow.document); 
  } else { 
    doc =(frame.contentDocument || frame.contentWindow.document); 
  } 
  return doc; 
}; 
goog.dom.getFrameContentWindow = function(frame) { 
  return frame.contentWindow || goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame)); 
}; 
goog.dom.setTextContent = function(element, text) { 
  if('textContent' in element) { 
    element.textContent = text; 
  } else if(element.firstChild && element.firstChild.nodeType == goog.dom.NodeType.TEXT) { 
    while(element.lastChild != element.firstChild) { 
      element.removeChild(element.lastChild); 
    } 
    element.firstChild.data = text; 
  } else { 
    goog.dom.removeChildren(element); 
    var doc = goog.dom.getOwnerDocument(element); 
    element.appendChild(doc.createTextNode(text)); 
  } 
}; 
goog.dom.getOuterHtml = function(element) { 
  if('outerHTML' in element) { 
    return element.outerHTML; 
  } else { 
    var doc = goog.dom.getOwnerDocument(element); 
    var div = doc.createElement('div'); 
    div.appendChild(element.cloneNode(true)); 
    return div.innerHTML; 
  } 
}; 
goog.dom.findNode = function(root, p) { 
  var rv =[]; 
  var found = goog.dom.findNodes_(root, p, rv, true); 
  return found ? rv[0]: undefined; 
}; 
goog.dom.findNodes = function(root, p) { 
  var rv =[]; 
  goog.dom.findNodes_(root, p, rv, false); 
  return rv; 
}; 
goog.dom.findNodes_ = function(root, p, rv, findOne) { 
  if(root != null) { 
    for(var i = 0, child; child = root.childNodes[i]; i ++) { 
      if(p(child)) { 
        rv.push(child); 
        if(findOne) { 
          return true; 
        } 
      } 
      if(goog.dom.findNodes_(child, p, rv, findOne)) { 
        return true; 
      } 
    } 
  } 
  return false; 
}; 
goog.dom.TAGS_TO_IGNORE_ = { 
  'SCRIPT': 1, 
  'STYLE': 1, 
  'HEAD': 1, 
  'IFRAME': 1, 
  'OBJECT': 1 
}; 
goog.dom.PREDEFINED_TAG_VALUES_ = { 
  'IMG': ' ', 
  'BR': '\n' 
}; 
goog.dom.isFocusableTabIndex = function(element) { 
  var attrNode = element.getAttributeNode('tabindex'); 
  if(attrNode && attrNode.specified) { 
    var index = element.tabIndex; 
    return goog.isNumber(index) && index >= 0; 
  } 
  return false; 
}; 
goog.dom.setFocusableTabIndex = function(element, enable) { 
  if(enable) { 
    element.tabIndex = 0; 
  } else { 
    element.removeAttribute('tabIndex'); 
  } 
}; 
goog.dom.getTextContent = function(node) { 
  var textContent; 
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT &&('innerText' in node)) { 
    textContent = goog.string.canonicalizeNewlines(node.innerText); 
  } else { 
    var buf =[]; 
    goog.dom.getTextContent_(node, buf, true); 
    textContent = buf.join(''); 
  } 
  textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, ''); 
  textContent = textContent.replace(/\u200B/g, ''); 
  if(! goog.userAgent.IE) { 
    textContent = textContent.replace(/ +/g, ' '); 
  } 
  if(textContent != ' ') { 
    textContent = textContent.replace(/^\s*/, ''); 
  } 
  return textContent; 
}; 
goog.dom.getRawTextContent = function(node) { 
  var buf =[]; 
  goog.dom.getTextContent_(node, buf, false); 
  return buf.join(''); 
}; 
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) { 
  if(node.nodeName in goog.dom.TAGS_TO_IGNORE_) { } else if(node.nodeType == goog.dom.NodeType.TEXT) { 
    if(normalizeWhitespace) { 
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, '')); 
    } else { 
      buf.push(node.nodeValue); 
    } 
  } else if(node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) { 
    buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]); 
  } else { 
    var child = node.firstChild; 
    while(child) { 
      goog.dom.getTextContent_(child, buf, normalizeWhitespace); 
      child = child.nextSibling; 
    } 
  } 
}; 
goog.dom.getNodeTextLength = function(node) { 
  return goog.dom.getTextContent(node).length; 
}; 
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) { 
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body; 
  var buf =[]; 
  while(node && node != root) { 
    var cur = node; 
    while((cur = cur.previousSibling)) { 
      buf.unshift(goog.dom.getTextContent(cur)); 
    } 
    node = node.parentNode; 
  } 
  return goog.string.trimLeft(buf.join('')).replace(/ +/g, ' ').length; 
}; 
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) { 
  var stack =[parent], pos = 0, cur; 
  while(stack.length > 0 && pos < offset) { 
    cur = stack.pop(); 
    if(cur.nodeName in goog.dom.TAGS_TO_IGNORE_) { } else if(cur.nodeType == goog.dom.NodeType.TEXT) { 
      var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' '); 
      pos += text.length; 
    } else if(cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) { 
      pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length; 
    } else { 
      for(var i = cur.childNodes.length - 1; i >= 0; i --) { 
        stack.push(cur.childNodes[i]); 
      } 
    } 
  } 
  if(goog.isObject(opt_result)) { 
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1: 0; 
    opt_result.node = cur; 
  } 
  return cur; 
}; 
goog.dom.isNodeList = function(val) { 
  if(val && typeof val.length == 'number') { 
    if(goog.isObject(val)) { 
      return typeof val.item == 'function' || typeof val.item == 'string'; 
    } else if(goog.isFunction(val)) { 
      return typeof val.item == 'function'; 
    } 
  } 
  return false; 
}; 
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) { 
  var tagName = opt_tag ? opt_tag.toUpperCase(): null; 
  return goog.dom.getAncestor(element, function(node) { 
    return(! tagName || node.nodeName == tagName) &&(! opt_class || goog.dom.classes.has(node, opt_class)); 
  }, true); 
}; 
goog.dom.getAncestorByClass = function(element, opt_class) { 
  return goog.dom.getAncestorByTagNameAndClass(element, null, opt_class); 
}; 
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) { 
  if(! opt_includeNode) { 
    element = element.parentNode; 
  } 
  var ignoreSearchSteps = opt_maxSearchSteps == null; 
  var steps = 0; 
  while(element &&(ignoreSearchSteps || steps <= opt_maxSearchSteps)) { 
    if(matcher(element)) { 
      return element; 
    } 
    element = element.parentNode; 
    steps ++; 
  } 
  return null; 
}; 
goog.dom.DomHelper = function(opt_document) { 
  this.document_ = opt_document || goog.global.document || document; 
}; 
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper; 
goog.dom.DomHelper.prototype.setDocument = function(document) { 
  this.document_ = document; 
}; 
goog.dom.DomHelper.prototype.getDocument = function() { 
  return this.document_; 
}; 
goog.dom.DomHelper.prototype.getElement = function(element) { 
  if(goog.isString(element)) { 
    return this.document_.getElementById(element); 
  } else { 
    return element; 
  } 
}; 
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement; 
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) { 
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el); 
}; 
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) { 
  var doc = opt_el || this.document_; 
  return goog.dom.getElementsByClass(className, doc); 
}; 
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) { 
  var doc = opt_el || this.document_; 
  return goog.dom.getElementByClass(className, doc); 
}; 
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass; 
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties; 
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) { 
  return goog.dom.getViewportSize(opt_window || this.getWindow()); 
}; 
goog.dom.DomHelper.prototype.getDocumentHeight = function() { 
  return goog.dom.getDocumentHeight_(this.getWindow()); 
}; 
goog.dom.Appendable; 
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) { 
  return goog.dom.createDom_(this.document_, arguments); 
}; 
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom; 
goog.dom.DomHelper.prototype.createElement = function(name) { 
  return this.document_.createElement(name); 
}; 
goog.dom.DomHelper.prototype.createTextNode = function(content) { 
  return this.document_.createTextNode(content); 
}; 
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) { 
  return goog.dom.createTable_(this.document_, rows, columns, ! ! opt_fillWithNbsp); 
}; 
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) { 
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString); 
}; 
goog.dom.DomHelper.prototype.getCompatMode = function() { 
  return this.isCss1CompatMode() ? 'CSS1Compat': 'BackCompat'; 
}; 
goog.dom.DomHelper.prototype.isCss1CompatMode = function() { 
  return goog.dom.isCss1CompatMode_(this.document_); 
}; 
goog.dom.DomHelper.prototype.getWindow = function() { 
  return goog.dom.getWindow_(this.document_); 
}; 
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() { 
  return goog.dom.getDocumentScrollElement_(this.document_); 
}; 
goog.dom.DomHelper.prototype.getDocumentScroll = function() { 
  return goog.dom.getDocumentScroll_(this.document_); 
}; 
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild; 
goog.dom.DomHelper.prototype.append = goog.dom.append; 
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren; 
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore; 
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter; 
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode; 
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode; 
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement; 
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild; 
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild; 
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling; 
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling; 
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode; 
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode; 
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike; 
goog.dom.DomHelper.prototype.contains = goog.dom.contains; 
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument; 
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument; 
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow; 
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent; 
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode; 
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes; 
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent; 
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength; 
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset; 
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass; 
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass; 
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor; 
