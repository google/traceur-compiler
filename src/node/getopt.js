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

function addAbbrev(o) {
  var ks = [''].concat(Object.keys(o).sort()), k, kprev = '';
  for (var i = ks.length - 1; i > 0; i--) {
    var ka = k = ks[i], pre = 0;

    // find length of common prefix, clamp to min of 3.
    while (kprev[pre] === k[pre]) {
      pre++;
    }
    pre = pre || 1;

    // add all unique prefixes for k.
    while (!o[ka = ka.slice(0, -1)] && ka.length > pre && ka > ks[i - 1]) {
      o[ka] = o[k];
    }
    kprev = k;
  }
}

function Getopt(opts) {
  this.opt = null;
  this.optarg = null;
  this.optopt = null;

  this.optind = 2;
  this.nextchar = 0;

  this.opts_ = Object.create(null);
  for (var i = 0; i < opts.length; i++) {
    var opt = opts[i], m;
    if (!(m = opt.match(/^([\w\-]+)(:{0,2})?$/))) {
      throw new Error('invalid option initializer: ' + opt);
    }
    this.opts_[m[1]] = {name: m[1], arg: m[2]};
  }
  addAbbrev(this.opts_);
}

Getopt.prototype = {
  getopt: function(argv) {
    var m, arg, optInf;
    this.opt = this.optarg = this.optopt = null;
    if (this.optind >= argv.length) {
      return false;
    }
    arg = argv[this.optind];
    if (!this.nextchar && /^-[^\-]/.test(arg)) {
      this.nextchar = 1;
    }
    if (this.nextchar) {
      // short opt
      this.opt = arg[this.nextchar] || null;
      this.optarg = arg.slice(++this.nextchar) || null;
    } else if (m = arg.match(/^--([\w\-]+)(?:=(.*))?$/)) {
      // long opt
      this.opt = m[1];
      this.optarg = m[2] === undefined ? null : m[2];
    } else {
      // free arg
      this.optind++;
      this.opt = '=';
      this.optarg = arg;
      return true;
    }

    if (optInf = this.opts_[this.opt]) {
      this.opt = optInf.name;
      switch (optInf.arg) {
        default:
          // no arg
          if (!this.nextchar && this.optarg) {
            // unexpected arg
            this.optopt = this.opt;
            this.opt = '!';
            break;
          }
          this.optarg = null;
          break;
        case ':':
          // required arg
          if (!this.optarg) {
            if (++this.optind >= argv.length) {
              // missing arg
              this.optopt = this.opt;
              this.opt = ':';
              break;
            }
            this.optarg = argv[this.optind];
          }
          // fall through
        case '::':
          // optional arg
          if (this.optarg) {
            this.nextchar = 0;
          }
          break;
      }
    } else {
      // unknown opt
      this.optopt = this.opt;
      this.opt = '?';
    }

    if (this.nextchar && this.nextchar >= arg.length) {
      this.nextchar = 0;
    }
    this.optind += !this.nextchar;

    return true;
  }
}

exports.Getopt = Getopt;
