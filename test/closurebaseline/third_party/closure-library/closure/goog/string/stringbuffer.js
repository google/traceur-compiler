
goog.provide('goog.string.StringBuffer'); 
goog.require('goog.userAgent.jscript'); 
goog.string.StringBuffer = function(opt_a1, var_args) { 
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ?[]: ''; 
  if(opt_a1 != null) { 
    this.append.apply(this, arguments); 
  } 
}; 
goog.string.StringBuffer.prototype.set = function(s) { 
  this.clear(); 
  this.append(s); 
}; 
if(goog.userAgent.jscript.HAS_JSCRIPT) { 
  goog.string.StringBuffer.prototype.bufferLength_ = 0; 
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) { 
    if(opt_a2 == null) { 
      this.buffer_[this.bufferLength_ ++]= a1; 
    } else { 
      this.buffer_.push.apply((this.buffer_), arguments); 
      this.bufferLength_ = this.buffer_.length; 
    } 
    return this; 
  }; 
} else { 
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) { 
    this.buffer_ += a1; 
    if(opt_a2 != null) { 
      for(var i = 1; i < arguments.length; i ++) { 
        this.buffer_ += arguments[i]; 
      } 
    } 
    return this; 
  }; 
} 
goog.string.StringBuffer.prototype.clear = function() { 
  if(goog.userAgent.jscript.HAS_JSCRIPT) { 
    this.buffer_.length = 0; 
    this.bufferLength_ = 0; 
  } else { 
    this.buffer_ = ''; 
  } 
}; 
goog.string.StringBuffer.prototype.getLength = function() { 
  return this.toString().length; 
}; 
goog.string.StringBuffer.prototype.toString = function() { 
  if(goog.userAgent.jscript.HAS_JSCRIPT) { 
    var str = this.buffer_.join(''); 
    this.clear(); 
    if(str) { 
      this.append(str); 
    } 
    return str; 
  } else { 
    return(this.buffer_); 
  } 
}; 
