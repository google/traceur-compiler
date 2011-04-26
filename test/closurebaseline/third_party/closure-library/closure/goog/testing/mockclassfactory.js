
goog.provide('goog.testing.MockClassFactory'); 
goog.provide('goog.testing.MockClassRecord'); 
goog.require('goog.array'); 
goog.require('goog.object'); 
goog.require('goog.testing.LooseMock'); 
goog.require('goog.testing.StrictMock'); 
goog.require('goog.testing.TestCase'); 
goog.require('goog.testing.mockmatchers'); 
goog.testing.MockClassRecord = function(namespace, className, originalClass, proxy) { 
  this.namespace_ = namespace; 
  this.className_ = className; 
  this.originalClass_ = originalClass; 
  this.proxy_ = proxy; 
  this.instancesByArgs_ =[]; 
}; 
goog.testing.MockClassRecord.prototype.staticMock_ = null; 
goog.testing.MockClassRecord.prototype.getNamespace = function() { 
  return this.namespace_; 
}; 
goog.testing.MockClassRecord.prototype.getClassName = function() { 
  return this.className_; 
}; 
goog.testing.MockClassRecord.prototype.getOriginalClass = function() { 
  return this.originalClass_; 
}; 
goog.testing.MockClassRecord.prototype.getProxy = function() { 
  return this.proxy_; 
}; 
goog.testing.MockClassRecord.prototype.getStaticMock = function() { 
  return this.staticMock_; 
}; 
goog.testing.MockClassRecord.prototype.setStaticMock = function(staticMock) { 
  this.staticMock_ = staticMock; 
}; 
goog.testing.MockClassRecord.prototype.addMockInstance = function(args, mock) { 
  this.instancesByArgs_.push({ 
    args: args, 
    mock: mock 
  }); 
}; 
goog.testing.MockClassRecord.prototype.findMockInstance = function(args) { 
  for(var i = 0; i < this.instancesByArgs_.length; i ++) { 
    var instanceArgs = this.instancesByArgs_[i].args; 
    if(goog.testing.mockmatchers.flexibleArrayMatcher(instanceArgs, args)) { 
      return this.instancesByArgs_[i].mock; 
    } 
  } 
  return null; 
}; 
goog.testing.MockClassRecord.prototype.reset = function() { 
  this.namespace_[this.className_]= this.originalClass_; 
  this.instancesByArgs_ =[]; 
}; 
goog.testing.MockClassFactory = function() { 
  if(goog.testing.MockClassFactory.instance_) { 
    return goog.testing.MockClassFactory.instance_; 
  } 
  this.mockClassRecords_ = { }; 
  goog.testing.MockClassFactory.instance_ = this; 
}; 
goog.testing.MockClassFactory.instance_ = null; 
goog.testing.MockClassFactory.PROTOTYPE_FIELDS_ =['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']; 
goog.testing.MockClassFactory.prototype.getClassName_ = function(namespace, classToMock) { 
  if(namespace === goog.global) { 
    namespace = goog.testing.TestCase.getGlobals(); 
  } 
  for(var prop in namespace) { 
    if(namespace[prop]=== classToMock) { 
      return prop; 
    } 
  } 
  throw Error('Class is not a part of the given namespace'); 
}; 
goog.testing.MockClassFactory.prototype.classHasMock_ = function(className) { 
  return ! ! this.mockClassRecords_[className]; 
}; 
goog.testing.MockClassFactory.prototype.getProxyCtor_ = function(className, mockFinder) { 
  return function() { 
    this.$mock_ = mockFinder(className, arguments); 
    if(! this.$mock_) { 
      var args = Array.prototype.slice.call(arguments, 0); 
      throw Error('No mock found for ' + className + ' with arguments ' + args.join(', ')); 
    } 
  }; 
}; 
goog.testing.MockClassFactory.prototype.getProxyFunction_ = function(fnName) { 
  return function() { 
    return this.$mock_[fnName].apply(this.$mock_, arguments); 
  }; 
}; 
goog.testing.MockClassFactory.prototype.findMockInstance_ = function(className, args) { 
  return this.mockClassRecords_[className].findMockInstance(args); 
}; 
goog.testing.MockClassFactory.prototype.createProxy_ = function(namespace, classToMock, className) { 
  var proxy = this.getProxyCtor_(className, goog.bind(this.findMockInstance_, this)); 
  var protoToProxy = classToMock.prototype; 
  goog.inherits(proxy, classToMock); 
  for(var prop in protoToProxy) { 
    if(goog.isFunction(protoToProxy[prop])) { 
      proxy.prototype[prop]= this.getProxyFunction_(prop); 
    } 
  } 
  goog.array.forEach(goog.testing.MockClassFactory.PROTOTYPE_FIELDS_, function(field) { 
    if(Object.prototype.hasOwnProperty.call(protoToProxy, field)) { 
      proxy.prototype[field]= this.getProxyFunction_(field); 
    } 
  }, this); 
  this.mockClassRecords_[className]= new goog.testing.MockClassRecord(namespace, className, classToMock, proxy); 
  namespace[className]= proxy; 
  return proxy; 
}; 
goog.testing.MockClassFactory.prototype.getMockClass_ = function(namespace, classToMock, isStrict, ctorArgs) { 
  var className = this.getClassName_(namespace, classToMock); 
  ctorArgs = goog.array.slice(ctorArgs, 2); 
  if(goog.isFunction(classToMock)) { 
    var mock = isStrict ? new goog.testing.StrictMock(classToMock): new goog.testing.LooseMock(classToMock); 
    if(! this.classHasMock_(className)) { 
      this.createProxy_(namespace, classToMock, className); 
    } else { 
      var instance = this.findMockInstance_(className, ctorArgs); 
      if(instance) { 
        throw Error('Mock instance already created for ' + className + ' with arguments ' + ctorArgs.join(', ')); 
      } 
    } 
    this.mockClassRecords_[className].addMockInstance(ctorArgs, mock); 
    return mock; 
  } else { 
    throw Error('Cannot create a mock class for ' + className + ' of type ' + typeof classToMock); 
  } 
}; 
goog.testing.MockClassFactory.prototype.getStrictMockClass = function(namespace, classToMock, var_args) { 
  var args =(arguments); 
  return(this.getMockClass_(namespace, classToMock, true, args)); 
}; 
goog.testing.MockClassFactory.prototype.getLooseMockClass = function(namespace, classToMock, var_args) { 
  var args =(arguments); 
  return(this.getMockClass_(namespace, classToMock, false, args)); 
}; 
goog.testing.MockClassFactory.prototype.createStaticMock_ = function(classToMock, className, proxy, isStrict) { 
  var mock = isStrict ? new goog.testing.StrictMock(classToMock, true): new goog.testing.LooseMock(classToMock, false, true); 
  for(var prop in classToMock) { 
    if(goog.isFunction(classToMock[prop])) { 
      proxy[prop]= goog.bind(mock.$mockMethod, mock, prop); 
    } else if(classToMock[prop]!== classToMock.prototype) { 
      proxy[prop]= classToMock[prop]; 
    } 
  } 
  this.mockClassRecords_[className].setStaticMock(mock); 
  return mock; 
}; 
goog.testing.MockClassFactory.prototype.getStaticMock_ = function(namespace, classToMock, isStrict) { 
  var className = this.getClassName_(namespace, classToMock); 
  if(goog.isFunction(classToMock)) { 
    if(! this.classHasMock_(className)) { 
      var proxy = this.createProxy_(namespace, classToMock, className); 
      var mock = this.createStaticMock_(classToMock, className, proxy, isStrict); 
      return mock; 
    } 
    if(! this.mockClassRecords_[className].getStaticMock()) { 
      var proxy = this.mockClassRecords_[className].getProxy(); 
      var originalClass = this.mockClassRecords_[className].getOriginalClass(); 
      var mock = this.createStaticMock_(originalClass, className, proxy, isStrict); 
      return mock; 
    } else { 
      var mock = this.mockClassRecords_[className].getStaticMock(); 
      var mockIsStrict = mock instanceof goog.testing.StrictMock; 
      if(mockIsStrict != isStrict) { 
        var mockType = mock instanceof goog.testing.StrictMock ? 'strict': 'loose'; 
        var requestedType = isStrict ? 'strict': 'loose'; 
        throw Error('Requested a ' + requestedType + ' static mock, but a ' + mockType + ' mock already exists.'); 
      } 
      return mock; 
    } 
  } else { 
    throw Error('Cannot create a mock for the static functions of ' + className + ' of type ' + typeof classToMock); 
  } 
}; 
goog.testing.MockClassFactory.prototype.getStrictStaticMock = function(namespace, classToMock) { 
  return(this.getStaticMock_(namespace, classToMock, true)); 
}; 
goog.testing.MockClassFactory.prototype.getLooseStaticMock = function(namespace, classToMock) { 
  return(this.getStaticMock_(namespace, classToMock, false)); 
}; 
goog.testing.MockClassFactory.prototype.reset = function() { 
  goog.object.forEach(this.mockClassRecords_, function(record) { 
    record.reset(); 
  }); 
  this.mockClassRecords_ = { }; 
}; 
