
goog.provide('goog.fs.Error'); 
goog.provide('goog.fs.Error.ErrorCode'); 
goog.require('goog.debug.Error'); 
goog.require('goog.string'); 
goog.fs.Error = function(code, action) { 
  goog.base(this, goog.string.subs('Error %s: %s', action, goog.fs.Error.getDebugMessage(code))); 
  this.code =(code); 
}; 
goog.inherits(goog.fs.Error, goog.debug.Error); 
goog.fs.Error.ErrorCode = { 
  NOT_FOUND: 1, 
  SECURITY: 2, 
  ABORT: 3, 
  NOT_READABLE: 4, 
  ENCODING: 5, 
  NO_MODIFICATION_ALLOWED: 6, 
  INVALID_STATE: 7, 
  SYNTAX: 8, 
  INVALID_MODIFICATION: 9, 
  QUOTA_EXCEEDED: 10, 
  TYPE_MISMATCH: 11, 
  PATH_EXISTS: 12 
}; 
goog.fs.Error.getDebugMessage = function(errorCode) { 
  switch(errorCode) { 
    case goog.fs.Error.ErrorCode.NOT_FOUND: 
      return 'File or directory not found'; 

    case goog.fs.Error.ErrorCode.SECURITY: 
      return 'Insecure or disallowed operation'; 

    case goog.fs.Error.ErrorCode.ABORT: 
      return 'Operation aborted'; 

    case goog.fs.Error.ErrorCode.NOT_READABLE: 
      return 'File or directory not readable'; 

    case goog.fs.Error.ErrorCode.ENCODING: 
      return 'Invalid encoding'; 

    case goog.fs.Error.ErrorCode.NO_MODIFICATION_ALLOWED: 
      return 'Cannot modify file or directory'; 

    case goog.fs.Error.ErrorCode.INVALID_STATE: 
      return 'Invalid state'; 

    case goog.fs.Error.ErrorCode.SYNTAX: 
      return 'Invalid line-ending specifier'; 

    case goog.fs.Error.ErrorCode.INVALID_MODIFICATION: 
      return 'Invalid modification'; 

    case goog.fs.Error.ErrorCode.QUOTA_EXCEEDED: 
      return 'Quota exceeded'; 

    case goog.fs.Error.ErrorCode.TYPE_MISMATCH: 
      return 'Invalid filetype'; 

    case goog.fs.Error.ErrorCode.PATH_EXISTS: 
      return 'File or directory already exists at specified path'; 

    default: 
      return 'Unrecognized error'; 

  } 
}; 
