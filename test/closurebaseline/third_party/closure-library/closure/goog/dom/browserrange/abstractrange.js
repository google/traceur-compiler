
goog.provide('goog.dom.browserrange.AbstractRange'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.RangeEndpoint'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.TextRangeIterator'); 
goog.require('goog.iter'); 
goog.require('goog.string'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.userAgent'); 
goog.dom.browserrange.AbstractRange = function() { }; 
goog.dom.browserrange.AbstractRange.prototype.clone = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getBrowserRange = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getContainer = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getStartNode = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getStartOffset = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getEndNode = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getEndOffset = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.compareBrowserRangeEndpoints = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.containsRange = function(abstractRange, opt_allowPartial) { 
  var checkPartial = opt_allowPartial && ! abstractRange.isCollapsed(); 
  var range = abstractRange.getBrowserRange(); 
  var start = goog.dom.RangeEndpoint.START, end = goog.dom.RangeEndpoint.END; 
  try { 
    if(checkPartial) { 
      return this.compareBrowserRangeEndpoints(range, end, start) >= 0 && this.compareBrowserRangeEndpoints(range, start, end) <= 0; 
    } else { 
      return this.compareBrowserRangeEndpoints(range, end, end) >= 0 && this.compareBrowserRangeEndpoints(range, start, start) <= 0; 
    } 
  } catch(e) { 
    if(! goog.userAgent.IE) { 
      throw e; 
    } 
    return false; 
  } 
}; 
goog.dom.browserrange.AbstractRange.prototype.containsNode = function(node, opt_allowPartial) { 
  return this.containsRange(goog.dom.browserrange.createRangeFromNodeContents(node), opt_allowPartial); 
}; 
goog.dom.browserrange.AbstractRange.prototype.isCollapsed = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getText = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.getHtmlFragment = function() { 
  var output = new goog.string.StringBuffer(); 
  goog.iter.forEach(this, function(node, ignore, it) { 
    if(node.nodeType == goog.dom.NodeType.TEXT) { 
      output.append(goog.string.htmlEscape(node.nodeValue.substring(it.getStartTextOffset(), it.getEndTextOffset()))); 
    } else if(node.nodeType == goog.dom.NodeType.ELEMENT) { 
      if(it.isEndTag()) { 
        if(goog.dom.canHaveChildren(node)) { 
          output.append('</' + node.tagName + '>'); 
        } 
      } else { 
        var shallow = node.cloneNode(false); 
        var html = goog.dom.getOuterHtml(shallow); 
        if(goog.userAgent.IE && node.tagName == goog.dom.TagName.LI) { 
          output.append(html); 
        } else { 
          var index = html.lastIndexOf('<'); 
          output.append(index ? html.substr(0, index): html); 
        } 
      } 
    } 
  }, this); 
  return output.toString(); 
}; 
goog.dom.browserrange.AbstractRange.prototype.getValidHtml = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.__iterator__ = function(opt_keys) { 
  return new goog.dom.TextRangeIterator(this.getStartNode(), this.getStartOffset(), this.getEndNode(), this.getEndOffset()); 
}; 
goog.dom.browserrange.AbstractRange.prototype.select = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.removeContents = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.surroundContents = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.insertNode = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.surroundWithNodes = goog.abstractMethod; 
goog.dom.browserrange.AbstractRange.prototype.collapse = goog.abstractMethod; 
