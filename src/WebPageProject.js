// Copyright 2011 Traceur Authors.
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

import {Compiler} from './codegeneration/Compiler';
import {ErrorReporter} from './util/ErrorReporter';
import {Project} from './semantics/symbols/Project';
import {SourceFile} from './syntax/SourceFile';
import {TreeWriter} from './outputgeneration/TreeWriter';

export class WebPageProject extends Project {
  constructor(url) {
    super(url);
    this.numPending_ = 0;
    this.numberInlined_ = 0;
  }

  asyncLoad_(url, fncOfContent, onScriptsReady) {
    this.numPending_++;
    this.loadResource(url, (content) => {
      if (content)
        fncOfContent(content);
      else
        console.warn('Failed to load', url);

      if (--this.numPending_ <= 0)
        onScriptsReady();
    });
  }

  /** over-ride-able
   * @param {string} url Uniform Resource Locator
   * @param {function(string) | null} callback
   */
  loadResource(url, fncOfContentOrNull) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.addEventListener('load', (e) => {
      if (xhr.status == 200 || xhr.status == 0)
        fncOfContentOrNull(xhr.responseText);
    });
    var onFailure = () => {
      fncOfContentOrNull(null);
    };
    xhr.addEventListener('error', onFailure, false);
    xhr.addEventListener('abort', onFailure, false);
    xhr.send();
  }

  addFileFromScriptElement(scriptElement, name, content) {
    var file = new SourceFile(name, content);
    file.scriptElement = scriptElement;
    this.addFile(file);
  }

  /**
   * Invent a name for inline script tags:
   * @return {string} the page URL, drop .html, add eg "_1.js"
   */
  nextInlineScriptName_() {
    this.numberInlined_ += 1;
    if (!this.inlineScriptNameBase_) {
      var segments = this.url.split('.');
      segments.pop();
      this.inlineScriptNameBase_ = segments.join('.');
    }
    return this.inlineScriptNameBase_ + '_' + this.numberInlined_ + '.js';
  }

  addFilesFromScriptElements(scriptElements, onScriptsReady) {
    for (var i = 0, length = scriptElements.length; i < length; i++) {
      var scriptElement = scriptElements[i];
      if (!scriptElement.src) {
        var name = this.nextInlineScriptName_();
        var content =  scriptElement.textContent;
        this.addFileFromScriptElement(scriptElement, name, content);
      } else {
        var name = scriptElement.src;
        this.asyncLoad_(
            name,
            this.addFileFromScriptElement.bind(this, scriptElement, name),
            onScriptsReady
        );
      }
    }
    // in case we did not load any scripts async
    if (this.numPending_ <= 0)
      onScriptsReady();
  }

  get reporter() {
    if (!this.reporter_) {
      this.reporter_ =  new ErrorReporter();
    }
    return this.reporter_;
  }

  get compiler() {
    if (!this.compiler_) {
      this.compiler_ = new Compiler(this.reporter, this);
    }
    return this.compiler_;
  }

  compile() {
    var trees = this.compiler.compile_();
    if (this.reporter.hadError()) {
      console.warn('Traceur compilation errors', this.reporter);
      return;
    }
    return trees;
  }

  putFile(file) {
    var scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-traceur-src-url', file.name);
    scriptElement.textContent = file.generatedSource;

    var parent = file.scriptElement.parentNode;
    parent.insertBefore(scriptElement, file.scriptElement || null);
  }

  putFiles(files) {
    files.forEach(this.putFile, this);
  }

  runInWebPage(trees) {
    var files = this.generateSourceFromTrees(trees);
    this.putFiles(files);
  }

  generateSourceFromTrees(trees) {
    return trees.keys().map((file) => {
        var tree = trees.get(file);
        var opts = {showLineNumbers: false};
        file.generatedSource = TreeWriter.write(tree, opts);
        return file;
    });
  }

  run(done = () => {}) {
    document.addEventListener('DOMContentLoaded', () => {
      var selector = 'script[type="text/traceur"]';
      var scripts = document.querySelectorAll(selector);

      if (!scripts.length) {
        done();
        return;  // nothing to do
      }

      /* TODO: add traceur runtime library here
      scriptsToRun.push(
        { scriptElement: null,
          parentNode: scripts[0].parentNode,
          name: 'Runtime Library',
          contents: runtime });
      */

      this.addFilesFromScriptElements(scripts, () => {
        var trees = this.compile();
        this.runInWebPage(trees);
        done();
      });
    }, false);
  }
}
