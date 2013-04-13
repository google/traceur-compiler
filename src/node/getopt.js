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

function Getopt(opts) {
  this.opt = null;
  this.optarg = null;
  this.optopt = null;

  this.optind = 1;
  this.optnext = this.optind + 1;

  this.opts_ = {};
  var opt, data;
  for (var i = 0; i < opts.length; i++) {
    opt = opts[i];
    data = null;
    if (Array.isArray(opt)) {
      data = opt[1];
      opt = opt[0];
    }
    var m = opt.match(/^([\w\-]+)(=)?$/);
    this.opts_['--' + m[1]] = {name: m[1], arg: m[2], data: data};
  }
}

Getopt.prototype.getopt = function(argv) {
  var m, optInf;
  if (this.optnext >= argv.length) {
    this.opt = this.optarg = this.optopt = null;
    return false;
  }

  this.optind = this.optnext;
  if (!(m = argv[this.optind].match(/^--([\w\-]+)(?:=(.*))?$/))) {
    this.optnext++;
    this.opt = '=';
    this.optarg = argv[this.optind];
    this.optopt = null;
    return true;
  }

  var name = m[1];
  this.optarg = m[2];
  if (optInf = this.opts_['--' + name]) {
    if (optInf.arg && !this.optarg) {
      if (++this.optnext >= argv.length) {
        this.opt = ':';
        this.optarg = null;
        this.optopt = name;
        return true;
      }
      this.optarg = argv[this.optnext];
    }
    this.optnext++;

    this.opt = name;
    this.optopt = null;
    return true;
  }

  this.optnext++;
  this.opt = '?';
  this.optopt = name;
  return true;
};

exports.Getopt = Getopt;
