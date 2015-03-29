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

var format = require('util').format;

function addAbbrev(o) {
  var ks = [''].concat(Object.keys(o).sort()), k, kprev = '';
  for (var i = ks.length - 1; i > 0; i--) {
    var ka = k = ks[i], pre = 0;

    // find length of common prefix, clamp to min of 1.
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
  this.optdata = null;

  this.optind = 2;
  this.nextchar = 0;

  this.opts_ = Object.create(null);
  for (var i = 0; i < opts.length; i++) {
    var opt = opts[i], data = null, m;
    if (Array.isArray(opt)) {
      data = opt[1] || null;
      opt = opt[0];
    }
    if (!(m = opt.match(/^([\w\-]+)(:{0,2})$/))) {
      throw new Error('invalid option initializer: ' + opt);
    }
    this.opts_[m[1]] = {name: m[1], arg: m[2], data: data};
  }
  addAbbrev(this.opts_);
}

Getopt.prototype = {
  getopt: function(argv) {
    var m, arg, optInf;
    this.opt = this.optarg = this.optopt = this.optdata = null;
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
    } else if (m = arg.match(/^--([^=]+)(?:=(.*))?$|^--(.+)$/)) {
      // long opt
      this.opt = m[1] || m[3];
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
      this.optdata = optInf.data;
      switch (optInf.arg) {
        case '':
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
          if (this.optarg === null) {
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
          this.nextchar = 0;
          break;
      }
    } else {
      // unknown opt
      this.optopt = this.opt;
      this.opt = '?';
    }

    this.optind += !(this.nextchar %= arg.length);

    return true;
  },
  message: function() {
    switch (this.opt) {
      case ':':
        return format('missing argument for \'%s\'.', this.optopt);
      case '?':
        return format('unknown option \'%s\'.', this.optopt);
      case '!':
        return format('\'%s\' does not take an argument.', this.optopt);
      case '=':
        return format('optarg \'%s\'.', this.optarg);
      default:
        if (this.optarg === null)
          return format('opt \'%s\'.', this.opt);
        else
          return format('opt \'%s\', optarg \'%s\'.', this.opt, this.optarg);
    }
  }
}

exports.Getopt = Getopt;
