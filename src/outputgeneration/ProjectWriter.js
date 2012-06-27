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

  var TreeWriter = traceur.outputgeneration.TreeWriter;

  /**
   * Writes all the files in the project to a stream.
   */
  function ProjectWriter() {}

  /**
   * @param {traceur.util.ObjectMap} results
   * @param {Object} opt_options to ParseTreeWriter.write
   * @return {string}
   */
  ProjectWriter.write = function(results, opt_options) {
    var sb = [];
    results.keys().forEach(function(file) {
      sb.push('// ' + file.name,
              TreeWriter.write(results.get(file), opt_options));
    });
    return sb.join('\n') + '\n';
  };

  return {
    ProjectWriter: ProjectWriter
  };
});
