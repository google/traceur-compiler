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
  this.optdata = null;

  this.optnext = this.optind = 2;
  this.nextchar = 0;

  this.opts_ = {};
  for (var i = 0; i < opts.length; i++) {
    var opt = opts[i], data = null, m;
    if (Array.isArray(opt)) {
      data = opt[1] || null;
      opt = opt[0];
    }
    if (!(m = opt.match(/^([\w\-]+)(:{0,2})?$/))) {
      throw new Error('invalid option initializer: ' + opt);
    }
    this.opts_['--' + m[1]] = {name: m[1], arg: m[2], data: data};
  }
}

Getopt.prototype.getopt = function(argv) {
  var m, arg, optInf;
  this.opt = this.optarg = this.optopt = this.optdata = null;
  if (this.optnext >= argv.length) {
    return false;
  }
  arg = argv[this.optind = this.optnext];
  if (!this.nextchar && /^-[^\-]/.test(arg)) {
    this.nextchar = 1;
  }
  if (this.nextchar) {
    this.opt = arg[this.nextchar] || null;
    this.optarg = arg.slice(++this.nextchar) || null;
  } else if (m = arg.match(/^--([\w\-]+)(?:=(.*))?$/)) {
    this.opt = m[1];
    this.optarg = m[2] === undefined ? null : m[2];
  } else {
    this.optnext++;
    this.opt = '=';
    this.optarg = arg;
    return true;
  }

  if (optInf = this.opts_['--' + this.opt]) {
    this.optdata = optInf.data;
    switch (optInf.arg) {
      default: // no arg
        if (!this.nextchar && this.optarg) {
          this.optopt = this.opt;
          this.opt = '!';
        }
        this.optarg = null;
        break;
      case ':': // required arg
        if (!this.optarg) {
          if (++this.optnext >= argv.length) {
            // missing arg
            this.optopt = this.opt;
            this.opt = ':';
            break;
          }
          this.optarg = argv[this.optnext];
        }
        // fall through
      case '::': // optional arg
        if (this.optarg) {
          this.nextchar = 0;
        }
        break;
    }
  } else {
    this.optopt = this.opt;
    this.opt = '?';
  }

  if (this.nextchar && this.nextchar >= arg.length) {
    this.nextchar = 0;
  }
  this.optnext += !this.nextchar;

  return true;
};

exports.Getopt = Getopt;
