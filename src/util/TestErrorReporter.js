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

import {
  ErrorReporter,
  format
} from './ErrorReporter';

/**
 * An error reporter that is used with the tests. It doesn't output anything
 * to the console but it does keep track of reported errors
 */
export class TestErrorReporter extends ErrorReporter {
  /**
   * @param {RegExp} pathRe Regular expression used for normalizing paths in
   *     the actual errors.
   */
  constructor(pathRe = undefined) {
    this.errors = [];
    this.pathRe = pathRe;
  }

  reportMessageInternal(location, message) {
    this.errors.push(format(location, message));
  }

  hasMatchingError(expected) {
    var m;
    if (!this.pathRe || !(m = this.pathRe.exec(expected)))
      return this.errors.some((error) => error.indexOf(expected) !== -1);

    var expectedPath = m[1];
    var expectedNonPath = expected.replace(expectedPath, '<PATH>');

    return this.errors.some((error) => {
      var m = this.pathRe.exec(error);
      if (!m)
        return false;

      var actualPath = m[1];
      var actualNonPath = error.replace(actualPath, '<PATH>');

      if (actualNonPath.indexOf(expectedNonPath) === -1)
        return false;

      actualPath = actualPath.replace(/\\/g, '/');

      return actualPath.indexOf(expectedPath) !== -1;
    });
  }
}
