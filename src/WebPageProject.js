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


// A Project that can compile all of script elements in a page

var WebPageProject = (function() {
  'use strict';
  
  var Compiler = traceur.codegeneration.Compiler;
  var Project = traceur.semantics.symbols.Project;
  var TreeWriter = traceur.outputgeneration.TreeWriter;

  function WebPageProject(url) {
    Project.call(this, url);
    this.numPending = 0;
    this.numberInlined_ = 0;
  }

  WebPageProject.prototype =  traceur.createObject(
    Project.prototype, {

      asyncLoad_: function(url, fncOfContent) {
        this.numPending++;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', function(e) {
          if (xhr.status == 200 || xhr.status == 0)
            fncOfContent(xhr.responseText);
          
          this.numPending--;
          this.runScriptsIfNonePending_();
        }.bind(this));
        var onFailure = function() {
          this.numPending--;
          console.warn('Failed to load', url);
          this.runScriptsIfNonePending_();
        }.bind(this);
        xhr.addEventListener('error', onFailure, false);
        xhr.addEventListener('abort', onFailure, false);
        xhr.send();
      },

      addFileFromScriptElement: function(scriptElement, name, content) {
        var file = new traceur.syntax.SourceFile(name, content);
        file.scriptElement = scriptElement;
        this.addFile(file);
      },
      
      /**
        * Invent a name for inline script tags: 
        *   @return {string} the page URL, drop .html, add eg "_1.js"
      */
      nextInlineScriptName_: function() {
        this.numberInlined_ += 1;
        if (!this.inlineScriptNameBase_) {
          var segments = this.url.split('.');
          segments.pop();
          this.inlineScriptNameBase_ = segments.join('.');
        } 
        return this.inlineScriptNameBase_ + '_' + this.numberInlined_ + '.js';
      },

      addFilesFromScriptElements: function(scriptElements) {
        for (var i = 0, length = scriptElements.length; i < length; i++) {
          var scriptElement = scriptElements[i];
          if (!scriptElement.src) {
            var name = this.nextInlineScriptName_();
            var content =  scriptElement.textContent;
            this.addFileFromScriptElement(scriptElement, name, content);
          } else {
            var name = scriptElement.src;
            this.asyncLoad_(name,
              this.addFileFromScriptElement.bind(this, scriptElement, name));
          }
        }
      },

      get reporter() {
        if (!this.reporter_) {
          this.reporter_ =  new traceur.util.ErrorReporter();
        }
        return this.reporter_;
      },

      get compiler() {
        if (!this.compiler_) {
          this.compiler_ = new Compiler(this.reporter, this);
        }
        return this.compiler_;
      },

      compile: function() {
        var trees = this.compiler.compile_();
        if (this.reporter.hadError()) {
          console.warn('Traceur compilation errors', this.reporter);
          return;
        }
        return trees;
      },

      putFile: function(file) {
        var scriptElement = document.createElement('script');
        scriptElement.setAttribute('data-traceur-src-url', file.name);
        scriptElement.textContent = file.generatedSource;

        var parent = file.scriptElement.parentNode;
        parent.insertBefore(scriptElement, file.scriptElement || null);
      },

      putFiles: function(files) {
        files.forEach(this.putFile, this);
      },

      runInWebPage: function(trees) {
        var files = this.generateSourceFromTrees(trees);
        this.putFiles(files);
      },

      generateSourceFromTrees: function(trees) {
        return trees.keys().map(function(file) {
            var tree = trees.get(file);
            var opts = {showLineNumbers: false};
            file.generatedSource = TreeWriter.write(tree, opts);
            return file;
        }, this);
      },

      runScriptsIfNonePending_: function() {
        if (this.numPending) {
          return;
        }
        var trees = this.compile();
        this.runInWebPage(trees);
      },

      run: function() {
        document.addEventListener('DOMContentLoaded', function() {
            var selector = 'script[type="text/traceur"]'
            var scripts = document.querySelectorAll(selector);

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

            this.addFilesFromScriptElements(scripts);
            this.runScriptsIfNonePending_();
        }.bind(this), false);
      }
    
  });
   
   return WebPageProject;
})();
