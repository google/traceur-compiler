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

import getDependencies from '../src/node/get-dependencies.js';

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: ./tval print-deps.js paths...')
    return;
  }

  let deps = getDependencies(...process.argv.slice(2));
  for (let name of deps) {
    console.log(name);
  }
}

main();
