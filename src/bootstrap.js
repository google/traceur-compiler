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

  function compileAll() {
    // Code to handle automatically loading and running all scripts with type
    // text/traceur after the DOMContentLoaded event has fired.
    var scriptsToRun = [];
    var numPending = 0;

    function compileScriptsIfNonePending() {
      if (numPending == 0) {
        compileScripts();
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      var scripts = document.querySelectorAll('script[type="text/traceur"]');

      if (scripts.length <= 0) {
        return; // nothing to do
      }

      /* TODO: add traceur runtime library here
      scriptsToRun.push(
        { scriptElement: null,
          parentNode: scripts[0].parentNode,
          name: 'Runtime Library',
          contents: runtime });
      */



      for (var i = 0, length = scripts.length; i < length; i++) {
        var script = scripts[i];
        var entry = {
          scriptElement: script,
          parentNode: script.parentNode,
          name: script.src,
          contents: ''
        };

        scriptsToRun.push(entry);
        if (!script.src) {
          entry.contents = script.textContent;
          entry.name = document.location + ':' + i;
        } else {
          (function(boundEntry) {
            numPending++;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', script.src);
            xhr.addEventListener('load', function(e) {
              if (xhr.status == 200 || xhr.status == 0) {
                boundEntry.contents = xhr.responseText;
              }
              numPending--;
              compileScriptsIfNonePending();
            }, false);
            var onFailure = function() {
              numPending--;
              console.warn('Failed to load', script.src);
              compileScriptsIfNonePending();
            };
            xhr.addEventListener('error', onFailure, false);
            xhr.addEventListener('abort', onFailure, false);
            xhr.send();
          })(entry);
        }
      }
      compileScriptsIfNonePending();
    }, false);

    function compileScripts() {
      var reporter = new traceur.util.ErrorReporter();
      var project = new traceur.semantics.symbols.Project();

      var fileToEntry = new traceur.util.ObjectMap();

      for (var i = 0; i < scriptsToRun.length; i++) {
        var entry = scriptsToRun[i];
        var file = new traceur.syntax.SourceFile(entry.name, entry.contents);
        project.addFile(file);
        fileToEntry.put(file, entry);
      }

      var results = traceur.codegeneration.Compiler.compile(reporter, project);
      if (reporter.hadError()) {
        console.warn('Traceur compilation errors', reporter);
        return;
      }

      results.keys().forEach(function(file) {
        var tree = results.get(file);
        var result = traceur.codegeneration.ParseTreeWriter.write(tree, false);
        var entry = fileToEntry.get(file);
        var scriptElement = document.createElement('script');
        scriptElement.setAttribute('data-traceur-src-url', entry.name);
        scriptElement.textContent = result;

        var parent = entry.parentNode;
        parent.insertBefore(scriptElement, entry.scriptElement || null);
      });
    }
  };
  compileAll();
})();
