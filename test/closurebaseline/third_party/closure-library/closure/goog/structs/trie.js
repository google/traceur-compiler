
goog.provide('goog.structs.Trie'); 
goog.require('goog.object'); 
goog.require('goog.structs'); 
goog.structs.Trie = function(opt_trie) { 
  this.childNodes_ = { }; 
  if(opt_trie) { 
    this.setAll(opt_trie); 
  } 
}; 
goog.structs.Trie.prototype.value_ = undefined; 
goog.structs.Trie.prototype.set = function(key, value) { 
  this.setOrAdd_(key, value, false); 
}; 
goog.structs.Trie.prototype.add = function(key, value) { 
  this.setOrAdd_(key, value, true); 
}; 
goog.structs.Trie.prototype.setOrAdd_ = function(key, value, opt_add) { 
  var node = this; 
  for(var characterPosition = 0; characterPosition < key.length; characterPosition ++) { 
    var currentCharacter = key.charAt(characterPosition); 
    if(! node.childNodes_[currentCharacter]) { 
      node.childNodes_[currentCharacter]= new goog.structs.Trie(); 
    } 
    node = node.childNodes_[currentCharacter]; 
  } 
  if(opt_add && node.value_ !== undefined) { 
    throw Error('The collection already contains the key "' + key + '"'); 
  } else { 
    node.value_ = value; 
  } 
}; 
goog.structs.Trie.prototype.setAll = function(trie) { 
  var keys = goog.structs.getKeys(trie); 
  var values = goog.structs.getValues(trie); 
  for(var i = 0; i < keys.length; i ++) { 
    this.set(keys[i], values[i]); 
  } 
}; 
goog.structs.Trie.prototype.get = function(key) { 
  var node = this; 
  for(var characterPosition = 0; characterPosition < key.length; characterPosition ++) { 
    var currentCharacter = key.charAt(characterPosition); 
    if(! node.childNodes_[currentCharacter]) { 
      return undefined; 
    } 
    node = node.childNodes_[currentCharacter]; 
  } 
  return node.value_; 
}; 
goog.structs.Trie.prototype.getKeyAndPrefixes = function(key, opt_keyStartIndex) { 
  var node = this; 
  var matches = { }; 
  var characterPosition = opt_keyStartIndex || 0; 
  if(node.value_ !== undefined) { 
    matches[characterPosition]= node.value_; 
  } 
  for(; characterPosition < key.length; characterPosition ++) { 
    var currentCharacter = key.charAt(characterPosition); 
    if(!(currentCharacter in node.childNodes_)) { 
      break; 
    } 
    node = node.childNodes_[currentCharacter]; 
    if(node.value_ !== undefined) { 
      matches[characterPosition]= node.value_; 
    } 
  } 
  return matches; 
}; 
goog.structs.Trie.prototype.getValues = function() { 
  var allValues =[]; 
  this.getValuesInternal_(allValues); 
  return allValues; 
}; 
goog.structs.Trie.prototype.getValuesInternal_ = function(allValues) { 
  if(this.value_ !== undefined) { 
    allValues.push(this.value_); 
  } 
  for(var childNode in this.childNodes_) { 
    this.childNodes_[childNode].getValuesInternal_(allValues); 
  } 
}; 
goog.structs.Trie.prototype.getKeys = function(opt_prefix) { 
  var allKeys =[]; 
  if(opt_prefix) { 
    var node = this; 
    for(var characterPosition = 0; characterPosition < opt_prefix.length; characterPosition ++) { 
      var currentCharacter = opt_prefix.charAt(characterPosition); 
      if(! node.childNodes_[currentCharacter]) { 
        return[]; 
      } 
      node = node.childNodes_[currentCharacter]; 
    } 
    node.getKeysInternal_(opt_prefix, allKeys); 
  } else { 
    this.getKeysInternal_('', allKeys); 
  } 
  return allKeys; 
}; 
goog.structs.Trie.prototype.getKeysInternal_ = function(keySoFar, allKeys) { 
  if(this.value_ !== undefined) { 
    allKeys.push(keySoFar); 
  } 
  for(var childNode in this.childNodes_) { 
    this.childNodes_[childNode].getKeysInternal_(keySoFar + childNode, allKeys); 
  } 
}; 
goog.structs.Trie.prototype.containsKey = function(key) { 
  return this.get(key) !== undefined; 
}; 
goog.structs.Trie.prototype.containsValue = function(value) { 
  if(this.value_ === value) { 
    return true; 
  } 
  for(var childNode in this.childNodes_) { 
    if(this.childNodes_[childNode].containsValue(value)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.structs.Trie.prototype.clear = function() { 
  this.childNodes_ = { }; 
  this.value_ = undefined; 
}; 
goog.structs.Trie.prototype.remove = function(key) { 
  var node = this; 
  var parents =[]; 
  for(var characterPosition = 0; characterPosition < key.length; characterPosition ++) { 
    var currentCharacter = key.charAt(characterPosition); 
    if(! node.childNodes_[currentCharacter]) { 
      throw Error('The collection does not have the key "' + key + '"'); 
    } 
    parents.push([node, currentCharacter]); 
    node = node.childNodes_[currentCharacter]; 
  } 
  var oldValue = node.value_; 
  delete node.value_; 
  while(parents.length > 0) { 
    var currentParentAndCharacter = parents.pop(); 
    var currentParent = currentParentAndCharacter[0]; 
    var currentCharacter = currentParentAndCharacter[1]; 
    if(goog.object.isEmpty(currentParent.childNodes_[currentCharacter].childNodes_)) { 
      delete currentParent.childNodes_[currentCharacter]; 
    } else { 
      break; 
    } 
  } 
  return oldValue; 
}; 
goog.structs.Trie.prototype.clone = function() { 
  return new goog.structs.Trie(this); 
}; 
goog.structs.Trie.prototype.getCount = function() { 
  return goog.structs.getCount(this.getValues()); 
}; 
goog.structs.Trie.prototype.isEmpty = function() { 
  return this.value_ === undefined && goog.structs.isEmpty(this.childNodes_); 
}; 
