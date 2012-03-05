// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('outputgeneration', function() {
  'use strict';
 
  var sourceMap = {};
  
  // Use comma expression to use global eval.
  var global = ('global', eval)('this');
  
  function regUp(str, p1) {
    return p1.toUpperCase();
  }

  // Copy the global properties set by third party source-map to traceur global
  Object.keys(global.sourceMapModule).forEach(function(prop) {
    var camel = prop.replace(/-(.)/g, regUp);
    var module = global.sourceMapModule[prop];
    if (typeof module === 'function') {
      camel = camel.replace(/^(.)/, regUp);
    }
    sourceMap[camel] = module;
  });
    
  return sourceMap;
  
});