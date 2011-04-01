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

(function() {
  'use strict';

  traceur.Compiler = function() {
  };
  
  traceur.Compiler.prototype.compile = function(script) {
    var errors = [];
    
    // parse
    var parser = new traceur.Parser();
    var result = parser.parse(script, errors);
  
    if (errors.length > 0) {
      return { result: null, errors: errors };
    }
    
    // transform
    
    return { result: result, errors: errors };
  };
  
  traceur.Parser = function() {
  };
  
  traceur.Parser.prototype.parse = function(script, errors) {
    return script;
  };

})();