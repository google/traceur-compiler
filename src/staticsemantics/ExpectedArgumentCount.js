// Copyright 2015 Traceur Authors.
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

'use strong';

/**
 * This matches the ExpectedArgumentCount spec algorithm.
 * @param {FormalParameterList} tree
 * @return {number}
 */
export default function expectedArgumentCount(tree) {
  let n = tree.parameters.length - 1;
  for (; n >= 0; n--) {
    let parameter = tree.parameters[n].parameter;
    if (!parameter.isRestParameter() && parameter.initializer === null) {
      break;
    }
  }
  return n + 1;
}
