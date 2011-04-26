
goog.provide('goog.dom.query'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.functions'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.dom.query =(function() { 
  var cssCaseBug =(goog.userAgent.WEBKIT &&((goog.dom.getDocument().compatMode) == 'BackCompat')); 
  var childNodesName = ! ! goog.dom.getDocument().firstChild['children']? 'children': 'childNodes'; 
  var specials = '>~+'; 
  var caseSensitive = false; 
  var getQueryParts = function(query) { 
    if(specials.indexOf(query.slice(- 1)) >= 0) { 
      query += ' * '; 
    } else { 
      query += ' '; 
    } 
    var ts = function(s, e) { 
      return goog.string.trim(query.slice(s, e)); 
    }; 
    var queryParts =[]; 
    var inBrackets = - 1, inParens = - 1, inMatchFor = - 1, inPseudo = - 1, inClass = - 1, inId = - 1, inTag = - 1, lc = '', cc = '', pStart; 
    var x = 0, ql = query.length, currentPart = null, cp = null; 
    var endTag = function() { 
      if(inTag >= 0) { 
        var tv =(inTag == x) ? null: ts(inTag, x); 
        if(specials.indexOf(tv) < 0) { 
          currentPart.tag = tv; 
        } else { 
          currentPart.oper = tv; 
        } 
        inTag = - 1; 
      } 
    }; 
    var endId = function() { 
      if(inId >= 0) { 
        currentPart.id = ts(inId, x).replace(/\\/g, ''); 
        inId = - 1; 
      } 
    }; 
    var endClass = function() { 
      if(inClass >= 0) { 
        currentPart.classes.push(ts(inClass + 1, x).replace(/\\/g, '')); 
        inClass = - 1; 
      } 
    }; 
    var endAll = function() { 
      endId(); 
      endTag(); 
      endClass(); 
    }; 
    var endPart = function() { 
      endAll(); 
      if(inPseudo >= 0) { 
        currentPart.pseudos.push({ name: ts(inPseudo + 1, x) }); 
      } 
      currentPart.loops = currentPart.pseudos.length || currentPart.attrs.length || currentPart.classes.length; 
      currentPart.oquery = currentPart.query = ts(pStart, x); 
      currentPart.otag = currentPart.tag =(currentPart.oper) ? null:(currentPart.tag || '*'); 
      if(currentPart.tag) { 
        currentPart.tag = currentPart.tag.toUpperCase(); 
      } 
      if(queryParts.length &&(queryParts[queryParts.length - 1].oper)) { 
        currentPart.infixOper = queryParts.pop(); 
        currentPart.query = currentPart.infixOper.query + ' ' + currentPart.query; 
      } 
      queryParts.push(currentPart); 
      currentPart = null; 
    }; 
    for(; lc = cc, cc = query.charAt(x), x < ql; x ++) { 
      if(lc == '\\') { 
        continue; 
      } 
      if(! currentPart) { 
        pStart = x; 
        currentPart = { 
          query: null, 
          pseudos:[], 
          attrs:[], 
          classes:[], 
          tag: null, 
          oper: null, 
          id: null, 
          getTag: function() { 
            return(caseSensitive) ? this.otag: this.tag; 
          } 
        }; 
        inTag = x; 
      } 
      if(inBrackets >= 0) { 
        if(cc == ']') { 
          if(! cp.attr) { 
            cp.attr = ts(inBrackets + 1, x); 
          } else { 
            cp.matchFor = ts((inMatchFor || inBrackets + 1), x); 
          } 
          var cmf = cp.matchFor; 
          if(cmf) { 
            if((cmf.charAt(0) == '"') ||(cmf.charAt(0) == "'")) { 
              cp.matchFor = cmf.slice(1, - 1); 
            } 
          } 
          currentPart.attrs.push(cp); 
          cp = null; 
          inBrackets = inMatchFor = - 1; 
        } else if(cc == '=') { 
          var addToCc =('|~^$*'.indexOf(lc) >= 0) ? lc: ''; 
          cp.type = addToCc + cc; 
          cp.attr = ts(inBrackets + 1, x - addToCc.length); 
          inMatchFor = x + 1; 
        } 
      } else if(inParens >= 0) { 
        if(cc == ')') { 
          if(inPseudo >= 0) { 
            cp.value = ts(inParens + 1, x); 
          } 
          inPseudo = inParens = - 1; 
        } 
      } else if(cc == '#') { 
        endAll(); 
        inId = x + 1; 
      } else if(cc == '.') { 
        endAll(); 
        inClass = x; 
      } else if(cc == ':') { 
        endAll(); 
        inPseudo = x; 
      } else if(cc == '[') { 
        endAll(); 
        inBrackets = x; 
        cp = { }; 
      } else if(cc == '(') { 
        if(inPseudo >= 0) { 
          cp = { 
            name: ts(inPseudo + 1, x), 
            value: null 
          }; 
          currentPart.pseudos.push(cp); 
        } 
        inParens = x; 
      } else if((cc == ' ') &&(lc != cc)) { 
        endPart(); 
      } 
    } 
    return queryParts; 
  }; 
  var agree = function(first, second) { 
    if(! first) { 
      return second; 
    } 
    if(! second) { 
      return first; 
    } 
    return function() { 
      return first.apply(window, arguments) && second.apply(window, arguments); 
    }; 
  }; 
  function getArr(i, opt_arr) { 
    var r = opt_arr ||[]; 
    if(i) { 
      r.push(i); 
    } 
    return r; 
  } 
  ; 
  var isElement = function(n) { 
    return(1 == n.nodeType); 
  }; 
  var blank = ''; 
  var getAttr = function(elem, attr) { 
    if(! elem) { 
      return blank; 
    } 
    if(attr == 'class') { 
      return elem.className || blank; 
    } 
    if(attr == 'for') { 
      return elem.htmlFor || blank; 
    } 
    if(attr == 'style') { 
      return elem.style.cssText || blank; 
    } 
    return(caseSensitive ? elem.getAttribute(attr): elem.getAttribute(attr, 2)) || blank; 
  }; 
  var attrs = { 
    '*=': function(attr, value) { 
      return function(elem) { 
        return(getAttr(elem, attr).indexOf(value) >= 0); 
      }; 
    }, 
    '^=': function(attr, value) { 
      return function(elem) { 
        return(getAttr(elem, attr).indexOf(value) == 0); 
      }; 
    }, 
    '$=': function(attr, value) { 
      var tval = ' ' + value; 
      return function(elem) { 
        var ea = ' ' + getAttr(elem, attr); 
        return(ea.lastIndexOf(value) ==(ea.length - value.length)); 
      }; 
    }, 
    '~=': function(attr, value) { 
      var tval = ' ' + value + ' '; 
      return function(elem) { 
        var ea = ' ' + getAttr(elem, attr) + ' '; 
        return(ea.indexOf(tval) >= 0); 
      }; 
    }, 
    '|=': function(attr, value) { 
      value = ' ' + value; 
      return function(elem) { 
        var ea = ' ' + getAttr(elem, attr); 
        return((ea == value) ||(ea.indexOf(value + '-') == 0)); 
      }; 
    }, 
    '=': function(attr, value) { 
      return function(elem) { 
        return(getAttr(elem, attr) == value); 
      }; 
    } 
  }; 
  var noNextElementSibling =(typeof goog.dom.getDocument().firstChild.nextElementSibling == 'undefined'); 
  var nSibling = ! noNextElementSibling ? 'nextElementSibling': 'nextSibling'; 
  var pSibling = ! noNextElementSibling ? 'previousElementSibling': 'previousSibling'; 
  var simpleNodeTest =(noNextElementSibling ? isElement: goog.functions.TRUE); 
  var _lookLeft = function(node) { 
    while(node = node[pSibling]) { 
      if(simpleNodeTest(node)) { 
        return false; 
      } 
    } 
    return true; 
  }; 
  var _lookRight = function(node) { 
    while(node = node[nSibling]) { 
      if(simpleNodeTest(node)) { 
        return false; 
      } 
    } 
    return true; 
  }; 
  var getNodeIndex = function(node) { 
    var root = node.parentNode; 
    var i = 0, tret = root[childNodesName], ci =(node['_i']|| - 1), cl =(root['_l']|| - 1); 
    if(! tret) { 
      return - 1; 
    } 
    var l = tret.length; 
    if(cl == l && ci >= 0 && cl >= 0) { 
      return ci; 
    } 
    root['_l']= l; 
    ci = - 1; 
    var te = root['firstElementChild']|| root['firstChild']; 
    for(; te; te = te[nSibling]) { 
      if(simpleNodeTest(te)) { 
        te['_i']= ++ i; 
        if(node === te) { 
          ci = i; 
        } 
      } 
    } 
    return ci; 
  }; 
  var isEven = function(elem) { 
    return !((getNodeIndex(elem)) % 2); 
  }; 
  var isOdd = function(elem) { 
    return(getNodeIndex(elem)) % 2; 
  }; 
  var pseudos = { 
    'checked': function(name, condition) { 
      return function(elem) { 
        return elem.checked || elem.attributes['checked']; 
      }; 
    }, 
    'first-child': function() { 
      return _lookLeft; 
    }, 
    'last-child': function() { 
      return _lookRight; 
    }, 
    'only-child': function(name, condition) { 
      return function(node) { 
        if(! _lookLeft(node)) { 
          return false; 
        } 
        if(! _lookRight(node)) { 
          return false; 
        } 
        return true; 
      }; 
    }, 
    'empty': function(name, condition) { 
      return function(elem) { 
        var cn = elem.childNodes; 
        var cnl = elem.childNodes.length; 
        for(var x = cnl - 1; x >= 0; x --) { 
          var nt = cn[x].nodeType; 
          if((nt === 1) ||(nt == 3)) { 
            return false; 
          } 
        } 
        return true; 
      }; 
    }, 
    'contains': function(name, condition) { 
      var cz = condition.charAt(0); 
      if(cz == '"' || cz == "'") { 
        condition = condition.slice(1, - 1); 
      } 
      return function(elem) { 
        return(elem.innerHTML.indexOf(condition) >= 0); 
      }; 
    }, 
    'not': function(name, condition) { 
      var p = getQueryParts(condition)[0]; 
      var ignores = { el: 1 }; 
      if(p.tag != '*') { 
        ignores.tag = 1; 
      } 
      if(! p.classes.length) { 
        ignores.classes = 1; 
      } 
      var ntf = getSimpleFilterFunc(p, ignores); 
      return function(elem) { 
        return ! ntf(elem); 
      }; 
    }, 
    'nth-child': function(name, condition) { 
      function pi(n) { 
        return parseInt(n, 10); 
      } 
      if(condition == 'odd') { 
        return isOdd; 
      } else if(condition == 'even') { 
        return isEven; 
      } 
      if(condition.indexOf('n') != - 1) { 
        var tparts = condition.split('n', 2); 
        var pred = tparts[0]?((tparts[0]== '-') ? - 1: pi(tparts[0])): 1; 
        var idx = tparts[1]? pi(tparts[1]): 0; 
        var lb = 0, ub = - 1; 
        if(pred > 0) { 
          if(idx < 0) { 
            idx =(idx % pred) &&(pred +(idx % pred)); 
          } else if(idx > 0) { 
            if(idx >= pred) { 
              lb = idx - idx % pred; 
            } 
            idx = idx % pred; 
          } 
        } else if(pred < 0) { 
          pred *= - 1; 
          if(idx > 0) { 
            ub = idx; 
            idx = idx % pred; 
          } 
        } 
        if(pred > 0) { 
          return function(elem) { 
            var i = getNodeIndex(elem); 
            return(i >= lb) &&(ub < 0 || i <= ub) &&((i % pred) == idx); 
          }; 
        } else { 
          condition = idx; 
        } 
      } 
      var ncount = pi(condition); 
      return function(elem) { 
        return(getNodeIndex(elem) == ncount); 
      }; 
    } 
  }; 
  var defaultGetter =(goog.userAgent.IE) ? function(cond) { 
    var clc = cond.toLowerCase(); 
    if(clc == 'class') { 
      cond = 'className'; 
    } 
    return function(elem) { 
      return caseSensitive ? elem.getAttribute(cond): elem[cond]|| elem[clc]; 
    }; 
  }: function(cond) { 
    return function(elem) { 
      return elem && elem.getAttribute && elem.hasAttribute(cond); 
    }; 
  }; 
  var getSimpleFilterFunc = function(query, ignores) { 
    if(! query) { 
      return goog.functions.TRUE; 
    } 
    ignores = ignores || { }; 
    var ff = null; 
    if(! ignores.el) { 
      ff = agree(ff, isElement); 
    } 
    if(! ignores.tag) { 
      if(query.tag != '*') { 
        ff = agree(ff, function(elem) { 
          return(elem &&(elem.tagName == query.getTag())); 
        }); 
      } 
    } 
    if(! ignores.classes) { 
      goog.array.forEach(query.classes, function(cname, idx, arr) { 
        var re = new RegExp('(?:^|\\s)' + cname + '(?:\\s|$)'); 
        ff = agree(ff, function(elem) { 
          return re.test(elem.className); 
        }); 
        ff.count = idx; 
      }); 
    } 
    if(! ignores.pseudos) { 
      goog.array.forEach(query.pseudos, function(pseudo) { 
        var pn = pseudo.name; 
        if(pseudos[pn]) { 
          ff = agree(ff, pseudos[pn](pn, pseudo.value)); 
        } 
      }); 
    } 
    if(! ignores.attrs) { 
      goog.array.forEach(query.attrs, function(attr) { 
        var matcher; 
        var a = attr.attr; 
        if(attr.type && attrs[attr.type]) { 
          matcher = attrs[attr.type](a, attr.matchFor); 
        } else if(a.length) { 
          matcher = defaultGetter(a); 
        } 
        if(matcher) { 
          ff = agree(ff, matcher); 
        } 
      }); 
    } 
    if(! ignores.id) { 
      if(query.id) { 
        ff = agree(ff, function(elem) { 
          return(! ! elem &&(elem.id == query.id)); 
        }); 
      } 
    } 
    if(! ff) { 
      if(!('default' in ignores)) { 
        ff = goog.functions.TRUE; 
      } 
    } 
    return ff; 
  }; 
  var nextSiblingIterator = function(filterFunc) { 
    return function(node, ret, bag) { 
      while(node = node[nSibling]) { 
        if(noNextElementSibling &&(! isElement(node))) { 
          continue; 
        } 
        if((! bag || _isUnique(node, bag)) && filterFunc(node)) { 
          ret.push(node); 
        } 
        break; 
      } 
      return ret; 
    }; 
  }; 
  var nextSiblingsIterator = function(filterFunc) { 
    return function(root, ret, bag) { 
      var te = root[nSibling]; 
      while(te) { 
        if(simpleNodeTest(te)) { 
          if(bag && ! _isUnique(te, bag)) { 
            break; 
          } 
          if(filterFunc(te)) { 
            ret.push(te); 
          } 
        } 
        te = te[nSibling]; 
      } 
      return ret; 
    }; 
  }; 
  var _childElements = function(filterFunc) { 
    filterFunc = filterFunc || goog.functions.TRUE; 
    return function(root, ret, bag) { 
      var te, x = 0, tret = root[childNodesName]; 
      while(te = tret[x ++]) { 
        if(simpleNodeTest(te) &&(! bag || _isUnique(te, bag)) &&(filterFunc(te, x))) { 
          ret.push(te); 
        } 
      } 
      return ret; 
    }; 
  }; 
  var _isDescendant = function(node, root) { 
    var pn = node.parentNode; 
    while(pn) { 
      if(pn == root) { 
        break; 
      } 
      pn = pn.parentNode; 
    } 
    return ! ! pn; 
  }; 
  var _getElementsFuncCache = { }; 
  var getElementsFunc = function(query) { 
    var retFunc = _getElementsFuncCache[query.query]; 
    if(retFunc) { 
      return retFunc; 
    } 
    var io = query.infixOper; 
    var oper =(io ? io.oper: ''); 
    var filterFunc = getSimpleFilterFunc(query, { el: 1 }); 
    var qt = query.tag; 
    var wildcardTag =('*' == qt); 
    var ecs = goog.dom.getDocument()['getElementsByClassName']; 
    if(! oper) { 
      if(query.id) { 
        filterFunc =(! query.loops && wildcardTag) ? goog.functions.TRUE: getSimpleFilterFunc(query, { 
          el: 1, 
          id: 1 
        }); 
        retFunc = function(root, arr) { 
          var te = goog.dom.getDomHelper(root).getElement(query.id); 
          if(! te || ! filterFunc(te)) { 
            return; 
          } 
          if(9 == root.nodeType) { 
            return getArr(te, arr); 
          } else { 
            if(_isDescendant(te, root)) { 
              return getArr(te, arr); 
            } 
          } 
        }; 
      } else if(ecs && /\{\s*\[native code\]\s*\}/.test(String(ecs)) && query.classes.length && ! cssCaseBug) { 
        filterFunc = getSimpleFilterFunc(query, { 
          el: 1, 
          classes: 1, 
          id: 1 
        }); 
        var classesString = query.classes.join(' '); 
        retFunc = function(root, arr) { 
          var ret = getArr(0, arr), te, x = 0; 
          var tret = root.getElementsByClassName(classesString); 
          while((te = tret[x ++])) { 
            if(filterFunc(te, root)) { 
              ret.push(te); 
            } 
          } 
          return ret; 
        }; 
      } else if(! wildcardTag && ! query.loops) { 
        retFunc = function(root, arr) { 
          var ret = getArr(0, arr), te, x = 0; 
          var tret = root.getElementsByTagName(query.getTag()); 
          while((te = tret[x ++])) { 
            ret.push(te); 
          } 
          return ret; 
        }; 
      } else { 
        filterFunc = getSimpleFilterFunc(query, { 
          el: 1, 
          tag: 1, 
          id: 1 
        }); 
        retFunc = function(root, arr) { 
          var ret = getArr(0, arr), te, x = 0; 
          var tret = root.getElementsByTagName(query.getTag()); 
          while(te = tret[x ++]) { 
            if(filterFunc(te, root)) { 
              ret.push(te); 
            } 
          } 
          return ret; 
        }; 
      } 
    } else { 
      var skipFilters = { el: 1 }; 
      if(wildcardTag) { 
        skipFilters.tag = 1; 
      } 
      filterFunc = getSimpleFilterFunc(query, skipFilters); 
      if('+' == oper) { 
        retFunc = nextSiblingIterator(filterFunc); 
      } else if('~' == oper) { 
        retFunc = nextSiblingsIterator(filterFunc); 
      } else if('>' == oper) { 
        retFunc = _childElements(filterFunc); 
      } 
    } 
    return _getElementsFuncCache[query.query]= retFunc; 
  }; 
  var filterDown = function(root, queryParts) { 
    var candidates = getArr(root), qp, x, te, qpl = queryParts.length, bag, ret; 
    for(var i = 0; i < qpl; i ++) { 
      ret =[]; 
      qp = queryParts[i]; 
      x = candidates.length - 1; 
      if(x > 0) { 
        bag = { }; 
        ret.nozip = true; 
      } 
      var gef = getElementsFunc(qp); 
      for(var j = 0; te = candidates[j]; j ++) { 
        gef(te, ret, bag); 
      } 
      if(! ret.length) { 
        break; 
      } 
      candidates = ret; 
    } 
    return ret; 
  }; 
  var _queryFuncCacheDOM = { }, _queryFuncCacheQSA = { }; 
  var getStepQueryFunc = function(query) { 
    var qparts = getQueryParts(goog.string.trim(query)); 
    if(qparts.length == 1) { 
      var tef = getElementsFunc(qparts[0]); 
      return function(root) { 
        var r = tef(root,[]); 
        if(r) { 
          r.nozip = true; 
        } 
        return r; 
      }; 
    } 
    return function(root) { 
      return filterDown(root, qparts); 
    }; 
  }; 
  var qsa = 'querySelectorAll'; 
  var qsaAvail =(! ! goog.dom.getDocument()[qsa]&&(! goog.userAgent.WEBKIT || goog.userAgent.isVersion('526'))); 
  var getQueryFunc = function(query, opt_forceDOM) { 
    if(qsaAvail) { 
      var qsaCached = _queryFuncCacheQSA[query]; 
      if(qsaCached && ! opt_forceDOM) { 
        return qsaCached; 
      } 
    } 
    var domCached = _queryFuncCacheDOM[query]; 
    if(domCached) { 
      return domCached; 
    } 
    var qcz = query.charAt(0); 
    var nospace =(- 1 == query.indexOf(' ')); 
    if((query.indexOf('#') >= 0) &&(nospace)) { 
      opt_forceDOM = true; 
    } 
    var useQSA =(qsaAvail &&(! opt_forceDOM) &&(specials.indexOf(qcz) == - 1) &&(! goog.userAgent.IE ||(query.indexOf(':') == - 1)) &&(!(cssCaseBug &&(query.indexOf('.') >= 0))) &&(query.indexOf(':contains') == - 1) &&(query.indexOf('|=') == - 1)); 
    if(useQSA) { 
      var tq =(specials.indexOf(query.charAt(query.length - 1)) >= 0) ?(query + ' *'): query; 
      return _queryFuncCacheQSA[query]= function(root) { 
        try { 
          if(!((9 == root.nodeType) || nospace)) { 
            throw ''; 
          } 
          var r = root[qsa](tq); 
          if(goog.userAgent.IE) { 
            r.commentStrip = true; 
          } else { 
            r.nozip = true; 
          } 
          return r; 
        } catch(e) { 
          return getQueryFunc(query, true)(root); 
        } 
      }; 
    } else { 
      var parts = query.split(/\s*,\s*/); 
      return _queryFuncCacheDOM[query]=((parts.length < 2) ? getStepQueryFunc(query): function(root) { 
        var pindex = 0, ret =[], tp; 
        while(tp = parts[pindex ++]) { 
          ret = ret.concat(getStepQueryFunc(tp)(root)); 
        } 
        return ret; 
      }); 
    } 
  }; 
  var _zipIdx = 0; 
  var _nodeUID = goog.userAgent.IE ? function(node) { 
    if(caseSensitive) { 
      return node.getAttribute('_uid') || node.setAttribute('_uid', ++ _zipIdx) || _zipIdx; 
    } else { 
      return node.uniqueID; 
    } 
  }: function(node) { 
    return(node['_uid']||(node['_uid']= ++ _zipIdx)); 
  }; 
  var _isUnique = function(node, bag) { 
    if(! bag) { 
      return 1; 
    } 
    var id = _nodeUID(node); 
    if(! bag[id]) { 
      return bag[id]= 1; 
    } 
    return 0; 
  }; 
  var _zipIdxName = '_zipIdx'; 
  var _zip = function(arr) { 
    if(arr && arr.nozip) { 
      return arr; 
    } 
    var ret =[]; 
    if(! arr || ! arr.length) { 
      return ret; 
    } 
    if(arr[0]) { 
      ret.push(arr[0]); 
    } 
    if(arr.length < 2) { 
      return ret; 
    } 
    _zipIdx ++; 
    if(goog.userAgent.IE && caseSensitive) { 
      var szidx = _zipIdx + ''; 
      arr[0].setAttribute(_zipIdxName, szidx); 
      for(var x = 1, te; te = arr[x]; x ++) { 
        if(arr[x].getAttribute(_zipIdxName) != szidx) { 
          ret.push(te); 
        } 
        te.setAttribute(_zipIdxName, szidx); 
      } 
    } else if(goog.userAgent.IE && arr.commentStrip) { 
      try { 
        for(var x = 1, te; te = arr[x]; x ++) { 
          if(isElement(te)) { 
            ret.push(te); 
          } 
        } 
      } catch(e) { } 
    } else { 
      if(arr[0]) { 
        arr[0][_zipIdxName]= _zipIdx; 
      } 
      for(var x = 1, te; te = arr[x]; x ++) { 
        if(arr[x][_zipIdxName]!= _zipIdx) { 
          ret.push(te); 
        } 
        te[_zipIdxName]= _zipIdx; 
      } 
    } 
    return ret; 
  }; 
  var query = function(query, root) { 
    if(! query) { 
      return[]; 
    } 
    if(query.constructor == Array) { 
      return(query); 
    } 
    if(! goog.isString(query)) { 
      return[query]; 
    } 
    if(goog.isString(root)) { 
      root = goog.dom.getElement(root); 
      if(! root) { 
        return[]; 
      } 
    } 
    root = root || goog.dom.getDocument(); 
    var od = root.ownerDocument || root.documentElement; 
    caseSensitive = root.contentType && root.contentType == 'application/xml' || goog.userAgent.OPERA &&(root.doctype || od.toString() == '[object XMLDocument]') || ! ! od &&(goog.userAgent.IE ? od.xml:(root.xmlVersion || od.xmlVersion)); 
    var r = getQueryFunc(query)(root); 
    if(r && r.nozip) { 
      return r; 
    } 
    return _zip(r); 
  }; 
  query.pseudos = pseudos; 
  return query; 
})(); 
goog.exportSymbol('goog.dom.query', goog.dom.query); 
goog.exportSymbol('goog.dom.query.pseudos', goog.dom.query.pseudos); 
