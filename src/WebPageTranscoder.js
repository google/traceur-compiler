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


// Applies Traceur to all scripts in a Web page.

import {CodeLoader as Loader} from './runtime/module-loader';
import {ErrorReporter} from './util/ErrorReporter';
import {InterceptOutputLoaderHooks} from './runtime/InterceptOutputLoaderHooks';
import {WebLoader} from './runtime/WebLoader';

export class WebPageTranscoder {
  constructor(url) {
    this.url = url;
    this.numPending_ = 0;
    this.numberInlined_ = 0;
  }

  asyncLoad_(url, fncOfContent, onScriptsReady) {
    this.numPending_++;
    this.webloader.load(url, (content) => {
      if (content)
        fncOfContent(content);
      else
        console.warn('Failed to load', url);

      if (--this.numPending_ <= 0)
        onScriptsReady();
    }, (error) => {
      console.error('WebPageTranscoder FAILED to load ' + url, error);
    });
  }

  addFileFromScriptElement(scriptElement, name, content) {
    this.loader.module(content, {address: name});
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

  get loader() {
    if (!this.loader_) {
      var loaderHooks = new InterceptOutputLoaderHooks(this.reporter, this.url);
      this.loader_ = new Loader(loaderHooks);
    }
    return this.loader_;
  }

  // workaround bug: static methods of exported classes
  get webloader() {
    return new WebLoader();
  }

  putFile(file) {
    var scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-traceur-src-url', file.name);
    scriptElement.textContent = file.generatedSource;

    var parent = file.scriptElement.parentNode;
    parent.insertBefore(scriptElement, file.scriptElement || null);
  }

  run(done = () => {}) {
    document.addEventListener('DOMContentLoaded', () => {
      var selector = 'script[type="module"]';
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
        done();
      });
    }, false);
  }
}
