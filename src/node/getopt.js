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

function Getopt(argv, opts) {
  this.argv_ = argv;
  this.opt = this.optarg = null;
  this.optind = 1;
  this.optnext = this.optind + 1;

  this.opts_ = {};
  for (var i = 0; i < opts.length; i++) {
    var m = opts[i].match(/^([\w\-]+)(=)?$/);
    this.opts_['--' + m[1]] = {name: m[1], arg: m[2]};
  }
}

Getopt.prototype.getopt = function() {
  var m, optInf;
  if (this.optnext >= this.argv_.length) {
    return false;
  }

  m = this.argv_[this.optind = this.optnext].match(/^--([\w\-]+)(?:=(.*))?$/);
  if (m && (optInf = this.opts_['--' + m[1]])) {
    this.opt = optInf.name;
    if (optInf.arg && !(this.optarg = m[2])) {
      if (++this.optnext >= this.argv_.length) {
        throw new Error('arg expected');
      }
      this.optarg = this.argv_[this.optnext];
    }
    this.optnext++;
    return true;
  }
  this.opt = this.optarg = null;
  return false;
};

exports.Getopt = Getopt;
