// Copyright 2012 Traceur Authors.
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

export class WebLoader {
  /**
   * @return {Function} A function that aborts the async loading.
   */
  load(url, callback, errback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (xhr.status == 200 || xhr.status == 0) {
        callback(xhr.responseText);
      } else {
        errback();
      }
      xhr = null;
    };
    xhr.onerror = function() {
      errback();
    };
    xhr.open('GET', url, true);
    xhr.send();
    return () => xhr && xhr.abort();
  }

  loadSync(url) {
    var xhr = new XMLHttpRequest();
    xhr.onerror = function(e) {
      throw new Error(xhr.statusText);
    };
    xhr.open('GET', url, false);
    xhr.send();
    if (xhr.status == 200 || xhr.status == 0)
      return xhr.responseText;
  }
}
