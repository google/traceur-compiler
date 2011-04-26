
goog.provide('goog.ui.AutoComplete.RichRemoteArrayMatcher'); 
goog.require('goog.ui.AutoComplete'); 
goog.require('goog.ui.AutoComplete.RemoteArrayMatcher'); 
goog.ui.AutoComplete.RichRemoteArrayMatcher = function(url, opt_noSimilar) { 
  goog.ui.AutoComplete.RemoteArrayMatcher.call(this, url, opt_noSimilar); 
  this.rowFilter_ = null; 
}; 
goog.inherits(goog.ui.AutoComplete.RichRemoteArrayMatcher, goog.ui.AutoComplete.RemoteArrayMatcher); 
goog.ui.AutoComplete.RichRemoteArrayMatcher.prototype.setRowFilter = function(rowFilter) { 
  this.rowFilter_ = rowFilter; 
}; 
goog.ui.AutoComplete.RichRemoteArrayMatcher.prototype.requestMatchingRows = function(token, maxMatches, matchHandler) { 
  var myMatchHandler = goog.bind(function(token, matches) { 
    try { 
      var rows =[]; 
      for(var i = 0; i < matches.length; i ++) { 
        var func =(goog.json.unsafeParse(matches[i][0])); 
        for(var j = 1; j < matches[i].length; j ++) { 
          var richRow = func(matches[i][j]); 
          rows.push(richRow); 
          if(typeof richRow.render == 'undefined') { 
            richRow.render = function(node, token) { 
              node.innerHTML = richRow.toString(); 
            }; 
          } 
          if(typeof richRow.select == 'undefined') { 
            richRow.select = function(target) { 
              target.value = richRow.toString(); 
            }; 
          } 
        } 
      } 
      if(this.rowFilter_) { 
        rows = this.rowFilter_(rows); 
      } 
      matchHandler(token, rows); 
    } catch(exception) { 
      matchHandler(token,[]); 
    } 
  }, this); 
  goog.ui.AutoComplete.RichRemoteArrayMatcher.superClass_.requestMatchingRows.call(this, token, maxMatches, myMatchHandler); 
}; 
