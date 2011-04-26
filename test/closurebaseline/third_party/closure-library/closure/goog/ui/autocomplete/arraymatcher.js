
goog.provide('goog.ui.AutoComplete.ArrayMatcher'); 
goog.require('goog.iter'); 
goog.require('goog.string'); 
goog.require('goog.ui.AutoComplete'); 
goog.ui.AutoComplete.ArrayMatcher = function(rows, opt_noSimilar) { 
  this.rows_ = rows; 
  this.useSimilar_ = ! opt_noSimilar; 
}; 
goog.ui.AutoComplete.ArrayMatcher.prototype.requestMatchingRows = function(token, maxMatches, matchHandler, opt_fullString) { 
  var matches = this.getPrefixMatches(token, maxMatches); 
  if(matches.length == 0 && this.useSimilar_) { 
    matches = this.getSimilarRows(token, maxMatches); 
  } 
  matchHandler(token, matches); 
}; 
goog.ui.AutoComplete.ArrayMatcher.prototype.getPrefixMatches = function(token, maxMatches) { 
  var matches =[]; 
  if(token != '') { 
    var escapedToken = goog.string.regExpEscape(token); 
    var matcher = new RegExp('(^|\\W+)' + escapedToken, 'i'); 
    goog.iter.some(this.rows_, function(row) { 
      if(String(row).match(matcher)) { 
        matches.push(row); 
      } 
      return matches.length >= maxMatches; 
    }); 
  } 
  return matches; 
}; 
goog.ui.AutoComplete.ArrayMatcher.prototype.getSimilarRows = function(token, maxMatches) { 
  var results =[]; 
  goog.iter.forEach(this.rows_, function(row, index) { 
    var str = token.toLowerCase(); 
    var txt = String(row).toLowerCase(); 
    var score = 0; 
    if(txt.indexOf(str) != - 1) { 
      score = parseInt((txt.indexOf(str) / 4).toString(), 10); 
    } else { 
      var arr = str.split(''); 
      var lastPos = - 1; 
      var penalty = 10; 
      for(var i = 0, c; c = arr[i]; i ++) { 
        var pos = txt.indexOf(c); 
        if(pos > lastPos) { 
          var diff = pos - lastPos - 1; 
          if(diff > penalty - 5) { 
            diff = penalty - 5; 
          } 
          score += diff; 
          lastPos = pos; 
        } else { 
          score += penalty; 
          penalty += 5; 
        } 
      } 
    } 
    if(score < str.length * 6) { 
      results.push({ 
        str: row, 
        score: score, 
        index: index 
      }); 
    } 
  }); 
  results.sort(function(a, b) { 
    var diff = a.score - b.score; 
    if(diff != 0) { 
      return diff; 
    } 
    return a.index - b.index; 
  }); 
  var matches =[]; 
  for(var i = 0; i < maxMatches && i < results.length; i ++) { 
    matches.push(results[i].str); 
  } 
  return matches; 
}; 
