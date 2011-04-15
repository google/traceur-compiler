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

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeWriter = traceur.codegeneration.ParseTreeWriter;

  /**
   * Writes all the files in the project to a stream.
   */
  function ProjectWriter() {}

  /**
   * @param {traceur.util.ObjectMap} results
   * @return {string}
   */
  ProjectWriter.write = function(results) {
    var sb = [];
    results.keys().forEach(function(file) {
      sb.push('// ' + file.name,
              ParseTreeWriter.write(results.get(file)));
    });
    return sb.join('\n') + '\n';
  }

  return {
    ProjectWriter: ProjectWriter
  };
});
