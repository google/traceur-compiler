
goog.provide('goog.ds.XmlDataSource'); 
goog.provide('goog.ds.XmlHttpDataSource'); 
goog.require('goog.Uri'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.xml'); 
goog.require('goog.ds.BasicNodeList'); 
goog.require('goog.ds.DataManager'); 
goog.require('goog.ds.LoadState'); 
goog.require('goog.ds.logger'); 
goog.require('goog.net.XhrIo'); 
goog.require('goog.string'); 
goog.ds.XmlDataSource = function(node, parent, opt_name) { 
  this.parent_ = parent; 
  this.dataName_ = opt_name ||(node ? node.nodeName: ''); 
  this.setNode_(node); 
}; 
goog.ds.XmlDataSource.ATTRIBUTE_SELECTOR_ = '@*'; 
goog.ds.XmlDataSource.prototype.setNode_ = function(node) { 
  this.node_ = node; 
  if(node != null) { 
    switch(node.nodeType) { 
      case goog.dom.NodeType.ATTRIBUTE: 
      case goog.dom.NodeType.TEXT: 
        this.value_ = node.nodeValue; 
        break; 

      case goog.dom.NodeType.ELEMENT: 
        if(node.childNodes.length == 1 && node.firstChild.nodeType == goog.dom.NodeType.TEXT) { 
          this.value_ = node.firstChild.nodeValue; 
        } 

    } 
  } 
}; 
goog.ds.XmlDataSource.prototype.createChildNodes_ = function() { 
  if(this.childNodeList_) { 
    return; 
  } 
  var childNodeList = new goog.ds.BasicNodeList(); 
  if(this.node_ != null) { 
    var childNodes = this.node_.childNodes; 
    for(var i = 0, childNode; childNode = childNodes[i]; i ++) { 
      if(childNode.nodeType != goog.dom.NodeType.TEXT || ! goog.ds.XmlDataSource.isEmptyTextNodeValue_(childNode.nodeValue)) { 
        var newNode = new goog.ds.XmlDataSource(childNode, this, childNode.nodeName); 
        childNodeList.add(newNode); 
      } 
    } 
  } 
  this.childNodeList_ = childNodeList; 
}; 
goog.ds.XmlDataSource.prototype.createAttributes_ = function() { 
  if(this.attributes_) { 
    return; 
  } 
  var attributes = new goog.ds.BasicNodeList(); 
  if(this.node_ != null && this.node_.attributes != null) { 
    var atts = this.node_.attributes; 
    for(var i = 0, att; att = atts[i]; i ++) { 
      var newNode = new goog.ds.XmlDataSource(att, this, att.nodeName); 
      attributes.add(newNode); 
    } 
  } 
  this.attributes_ = attributes; 
}; 
goog.ds.XmlDataSource.prototype.get = function() { 
  this.createChildNodes_(); 
  return this.value_; 
}; 
goog.ds.XmlDataSource.prototype.set = function(value) { 
  throw Error('Can\'t set on XmlDataSource yet'); 
}; 
goog.ds.XmlDataSource.prototype.getChildNodes = function(opt_selector) { 
  if(opt_selector && opt_selector == goog.ds.XmlDataSource.ATTRIBUTE_SELECTOR_) { 
    this.createAttributes_(); 
    return this.attributes_; 
  } else if(opt_selector == null || opt_selector == goog.ds.STR_ALL_CHILDREN_SELECTOR) { 
    this.createChildNodes_(); 
    return this.childNodeList_; 
  } else { 
    throw Error('Unsupported selector'); 
  } 
}; 
goog.ds.XmlDataSource.prototype.getChildNode = function(name) { 
  if(goog.string.startsWith(name, goog.ds.STR_ATTRIBUTE_START_)) { 
    var att = this.node_.getAttributeNode(name.substring(1)); 
    return att ? new goog.ds.XmlDataSource(att, this): null; 
  } else { 
    return this.getChildNodes().get(name); 
  } 
}; 
goog.ds.XmlDataSource.prototype.getChildNodeValue = function(name) { 
  if(goog.string.startsWith(name, goog.ds.STR_ATTRIBUTE_START_)) { 
    var node = this.node_.getAttributeNode(name.substring(1)); 
    return node ? node.nodeValue: null; 
  } else { 
    var node = this.getChildNode(name); 
    return node ? node.get(): null; 
  } 
}; 
goog.ds.XmlDataSource.prototype.getDataName = function() { 
  return this.dataName_; 
}; 
goog.ds.XmlDataSource.prototype.setDataName = function(name) { 
  this.dataName_ = name; 
}; 
goog.ds.XmlDataSource.prototype.getDataPath = function() { 
  var parentPath = ''; 
  if(this.parent_) { 
    parentPath = this.parent_.getDataPath() +(this.dataName_.indexOf(goog.ds.STR_ARRAY_START) != - 1 ? '': goog.ds.STR_PATH_SEPARATOR); 
  } 
  return parentPath + this.dataName_; 
}; 
goog.ds.XmlDataSource.prototype.load = function() { }; 
goog.ds.XmlDataSource.prototype.getLoadState = function() { 
  return this.node_ ? goog.ds.LoadState.LOADED: goog.ds.LoadState.NOT_LOADED; 
}; 
goog.ds.XmlDataSource.isEmptyTextNodeValue_ = function(str) { 
  return /^[\r\n\t ]*$/.test(str); 
}; 
goog.ds.XmlDataSource.createChildlessDocument_ = function() { 
  return goog.dom.xml.createDocument('nothing'); 
}; 
goog.ds.XmlHttpDataSource = function(uri, name) { 
  goog.ds.XmlDataSource.call(this, null, null, name); 
  if(uri) { 
    this.uri_ = new goog.Uri(uri); 
  } else { 
    this.uri_ = null; 
  } 
}; 
goog.inherits(goog.ds.XmlHttpDataSource, goog.ds.XmlDataSource); 
goog.ds.XmlHttpDataSource.prototype.loadState_ = goog.ds.LoadState.NOT_LOADED; 
goog.ds.XmlHttpDataSource.prototype.load = function() { 
  if(this.uri_) { 
    goog.ds.logger.info('Sending XML request for DataSource ' + this.getDataName() + ' to ' + this.uri_); 
    this.loadState_ = goog.ds.LoadState.LOADING; 
    goog.net.XhrIo.send(this.uri_, goog.bind(this.complete_, this)); 
  } else { 
    this.node_ = goog.ds.XmlDataSource.createChildlessDocument_(); 
    this.loadState_ = goog.ds.LoadState.NOT_LOADED; 
  } 
}; 
goog.ds.XmlHttpDataSource.prototype.getLoadState = function() { 
  return this.loadState_; 
}; 
goog.ds.XmlHttpDataSource.prototype.complete_ = function(e) { 
  var xhr =(e.target); 
  if(xhr && xhr.isSuccess()) { 
    this.success_(xhr); 
  } else { 
    this.failure_(); 
  } 
}; 
goog.ds.XmlHttpDataSource.prototype.success_ = function(xhr) { 
  goog.ds.logger.info('Got data for DataSource ' + this.getDataName()); 
  var xml = xhr.getResponseXml(); 
  if(xml && ! xml.hasChildNodes() && goog.isObject(xhr.getResponseText())) { 
    xml = goog.dom.xml.loadXml(xhr.getResponseText()); 
  } 
  if(! xml || ! xml.hasChildNodes()) { 
    this.loadState_ = goog.ds.LoadState.FAILED; 
    this.node_ = goog.ds.XmlDataSource.createChildlessDocument_(); 
  } else { 
    this.loadState_ = goog.ds.LoadState.LOADED; 
    this.node_ = xml.documentElement; 
  } 
  if(this.getDataName()) { 
    goog.ds.DataManager.getInstance().fireDataChange(this.getDataName()); 
  } 
}; 
goog.ds.XmlHttpDataSource.prototype.failure_ = function() { 
  goog.ds.logger.info('Data retrieve failed for DataSource ' + this.getDataName()); 
  this.loadState_ = goog.ds.LoadState.FAILED; 
  this.node_ = goog.ds.XmlDataSource.createChildlessDocument_(); 
  if(this.getDataName()) { 
    goog.ds.DataManager.getInstance().fireDataChange(this.getDataName()); 
  } 
}; 
