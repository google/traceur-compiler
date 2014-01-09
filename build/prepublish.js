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

'use strict';

// This is used by the prepublish script in package.json. The scripts section
// in package.json uses platform specific code (cmd.exe on Windows etc) so these
// need to be as simple as possible.

var spawn = require('child_process').spawn;

// We set the NO_PREPUBLISH environment flag in the Makefile to prevent
// endless loop of makes and npm installs.
if (!process.env.NO_PREPUBLISH) {
  spawn('make', ['prepublish'], {stdio: 'inherit'}).
      on('close', function(code) {
        process.exit(code);
      });
}