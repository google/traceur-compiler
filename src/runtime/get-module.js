// Copyright 2013 Traceur Authors.
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

import {resolveUrl} from '../util/url.js';

/**
 * This is the current code unit object being evaluated.
 */
var currentCodeUnit;

export var standardModuleUrlRegExp = /^@\w+$/;

/**
 * This is used to find the module for a require url ModuleExpression.
 * @param {string} url
 * @return {Object} A module instance object for the given url in the current
 *     code loader.
 */
export function getModuleInstanceByUrl(url) {
  if (standardModuleUrlRegExp.test(url))
    return $traceurRuntime.modules[url] || null;

  url = resolveUrl(currentCodeUnit.url, url);
  for (var i = 0; i < currentCodeUnit.dependencies.length; i++) {
    if (currentCodeUnit.dependencies[i].url == url) {
      return currentCodeUnit.dependencies[i].result;
    }
  }

  return null;
}

export function getCurrentCodeUnit() {
  return currentCodeUnit;
}

export function setCurrentCodeUnit(codeUnit) {
  currentCodeUnit = codeUnit;
}
