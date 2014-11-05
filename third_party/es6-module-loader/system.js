/*
*********************************************************************************************

  System Loader Implementation

    - Implemented to https://github.com/jorendorff/js-loaders/blob/master/browser-loader.js

    - <script type="module"> supported

*********************************************************************************************
*/

(function (global) {

  (function() {

    var isBrowser = typeof window != 'undefined';
    var Loader = global.Reflect && global.Reflect.Loader || require('./loader');
    var Promise = global.Promise || require('es6-promise').Promise;

    // Helpers
    // Absolute URL parsing, from https://gist.github.com/Yaffle/1088850
    function parseURI(url) {
      var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
      // authority = '//' + user + ':' + pass '@' + hostname + ':' port
      return (m ? {
        href     : m[0] || '',
        protocol : m[1] || '',
        authority: m[2] || '',
        host     : m[3] || '',
        hostname : m[4] || '',
        port     : m[5] || '',
        pathname : m[6] || '',
        search   : m[7] || '',
        hash     : m[8] || ''
      } : null);
    }
    function removeDotSegments(input) {
      var output = [];
      input.replace(/^(\.\.?(\/|$))+/, '')
        .replace(/\/(\.(\/|$))+/g, '/')
        .replace(/\/\.\.$/, '/../')
        .replace(/\/?[^\/]*/g, function (p) {
          if (p === '/..')
            output.pop();
          else
            output.push(p);
      });
      return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }
    function toAbsoluteURL(base, href) {

      href = parseURI(href || '');
      base = parseURI(base || '');

      return !href || !base ? null : (href.protocol || base.protocol) +
        (href.protocol || href.authority ? href.authority : base.authority) +
        removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
        (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
        href.hash;
    }

    var fetchTextFromURL;
    if (isBrowser) {
      fetchTextFromURL = function(url, fulfill, reject) {
        var xhr = new XMLHttpRequest();
        var sameDomain = true;
        if (!('withCredentials' in xhr)) {
          // check if same domain
          var domainCheck = /^(\w+:)?\/\/([^\/]+)/.exec(url);
          if (domainCheck) {
            sameDomain = domainCheck[2] === window.location.host;
            if (domainCheck[1])
              sameDomain &= domainCheck[1] === window.location.protocol;
          }
        }
        if (!sameDomain) {
          xhr = new XDomainRequest();
          xhr.onload = load;
          xhr.onerror = error;
          xhr.ontimeout = error;
        }
        function load() {
          fulfill(xhr.responseText);
        }
        function error() {
          reject(xhr.statusText + ': ' + url || 'XHR error');
        }

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || (xhr.status == 0 && xhr.responseText)) {
              load();
            } else {
              error();
            }
          }
        };
        xhr.open("GET", url, true);
        xhr.send(null);
      }
    }
    else {
      var fs;
      fetchTextFromURL = function(url, fulfill, reject) {
        fs = fs || require('fs');
        return fs.readFile(url, function(err, data) {
          if (err)
            return reject(err);
          else
            fulfill(data + '');
        });
      }
    }

    // IE8 support
    var indexOf = Array.prototype.indexOf || function(item) {
      for (var i = 0, thisLen = this.length; i < thisLen; i++) {
        if (this[i] === item) {
          return i;
        }
      }
      return -1;
    };

    // given a syntax tree, return the import list
    function getImports(moduleTree) {
      var imports = [];

      function addImport(name) {
        if (indexOf.call(imports, name) == -1)
          imports.push(name);
      }

      // tree traversal, NB should use visitor pattern here
      function traverse(object, iterator, parent, parentProperty) {
        var key, child;
        if (iterator(object, parent, parentProperty) === false)
          return;
        for (key in object) {
          if (!object.hasOwnProperty(key))
            continue;
          if (key == 'location' || key == 'type')
            continue;
          child = object[key];
          if (typeof child == 'object' && child !== null)
            traverse(child, iterator, object, key);
        }
      }

      traverse(moduleTree, function(node) {
        // import {} from 'foo';
        // export * from 'foo';
        // export { ... } from 'foo';
        // import * as x from 'foo';
        if (node.type == 'EXPORT_DECLARATION') {
          if (node.declaration.moduleSpecifier)
            addImport(node.declaration.moduleSpecifier.token.processedValue);
        }
        else if (node.type == 'IMPORT_DECLARATION')
          addImport(node.moduleSpecifier.token.processedValue);
        else if (node.type == 'MODULE_DECLARATION')
          addImport(node.expression.token.processedValue);
      });
      return imports;
    }

    var System = new Loader({
      global: isBrowser ? window : global,
      strict: true,
      normalize: function(name, parentName, parentAddress) {
        if (typeof name != 'string')
          throw new TypeError('Module name must be a string');

        var segments = name.split('/');

        if (segments.length == 0)
          throw new TypeError('No module name provided');

        // current segment
        var i = 0;
        // is the module name relative
        var rel = false;
        // number of backtracking segments
        var dotdots = 0;
        if (segments[0] == '.') {
          i++;
          if (i == segments.length)
            throw new TypeError('Illegal module name "' + name + '"');
          rel = true;
        }
        else {
          while (segments[i] == '..') {
            i++;
            if (i == segments.length)
              throw new TypeError('Illegal module name "' + name + '"');
          }
          if (i)
            rel = true;
          dotdots = i;
        }

        for (var j = i; j < segments.length; j++) {
          var segment = segments[j];
          if (segment == '' || segment == '.' || segment == '..')
            throw new TypeError('Illegal module name "' + name + '"');
        }

        if (!rel)
          return name;

        // build the full module name
        var normalizedParts = [];
        var parentParts = (parentName || '').split('/');
        var normalizedLen = parentParts.length - 1 - dotdots;

        normalizedParts = normalizedParts.concat(parentParts.splice(0, parentParts.length - 1 - dotdots));
        normalizedParts = normalizedParts.concat(segments.splice(i, segments.length - i));

        return normalizedParts.join('/');
      },
      locate: function(load) {
        var name = load.name;

        // NB no specification provided for System.paths, used ideas discussed in https://github.com/jorendorff/js-loaders/issues/25

        // most specific (longest) match wins
        var pathMatch = '', wildcard;

        // check to see if we have a paths entry
        for (var p in this.paths) {
          var pathParts = p.split('*');
          if (pathParts.length > 2)
            throw new TypeError('Only one wildcard in a path is permitted');

          // exact path match
          if (pathParts.length == 1) {
            if (name == p && p.length > pathMatch.length)
              pathMatch = p;
          }

          // wildcard path match
          else {
            if (name.substr(0, pathParts[0].length) == pathParts[0] && name.substr(name.length - pathParts[1].length) == pathParts[1]) {
              pathMatch = p;
              wildcard = name.substr(pathParts[0].length, name.length - pathParts[1].length - pathParts[0].length);
            }
          }
        }

        var outPath = this.paths[pathMatch];
        if (wildcard)
          outPath = outPath.replace('*', wildcard);

        return toAbsoluteURL(this.baseURL, outPath);
      },
      fetch: function(load) {
        return new Promise(function(resolve, reject) {
          fetchTextFromURL(toAbsoluteURL(this.baseURL, load.address), function(source) {
            resolve(source);
          }, reject);
        });
      },
    });
      // --- <Specific Traceur Parsing Code> ---

    // System.traceurOptions = {modules: 'instantiate'};

    // parse function is used to parse a load record
    // Returns an array of ModuleSpecifiers
    System.parse = function(load) {
      if (!traceur) {
        if (typeof window == 'undefined')
          traceur = require('traceur');
        else if (global.traceur)
          traceur = global.traceur;
        else
          throw new TypeError('Include Traceur for module syntax support');
      }

      console.assert(load.source, 'Non-empty source');

      var depsList;
      (function () {
        try {
          load.kind = 'declarative';

          var options = load.metadata.traceurOptions || {};
          options.modules = 'instantiate';

          var compiler = new traceur.Compiler(options);
          var tree = compiler.parse(load.source, load.address);
          depsList = getImports(tree);
          tree = compiler.transform(tree);
          source = compiler.write(tree);
          var sourceMap = compiler.getSourceMap();

          if (global.btoa && sourceMap)
            source += '\n//# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(sourceMap))) + '\n';

          __eval(source, global, load);
        }
        catch(e) {
          if (e.name == 'SyntaxError' || e.name == 'TypeError')
            e.message = 'Evaluating ' + (load.name || load.address) + '\n\t' + e.message;
          throw e;
        }
      }());
      return depsList;
    }

    if (isBrowser) {
      var href = window.location.href.split('#')[0].split('?')[0];
      System.baseURL = href.substring(0, href.lastIndexOf('/') + 1);
    }
    else {
      System.baseURL = './';
    }
    System.paths = { '*': '*' };

    // <script type="module"> support
    // allow a data-init function callback once loaded
    if (isBrowser) {
      var curScript = document.getElementsByTagName('script');
      curScript = curScript[curScript.length - 1];

      function completed() {
        document.removeEventListener( "DOMContentLoaded", completed, false );
        window.removeEventListener( "load", completed, false );
        ready();
      }

      function ready() {
        var scripts = document.getElementsByTagName('script');

        for (var i = 0; i < scripts.length; i++) {
          var script = scripts[i];
          if (script.type == 'module') {
            var source = script.innerHTML;
            System.module(source)['catch'](function(err) { setTimeout(function() { throw err; }); });
          }
        }
      }

      // DOM ready, taken from https://github.com/jquery/jquery/blob/master/src/core/ready.js#L63
      if (document.readyState === 'complete') {
        setTimeout(ready);
      }
      else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', completed, false);
        window.addEventListener('load', completed, false);
      }

      // run the data-init function on the script tag
      if (curScript.getAttribute('data-init'))
        window[curScript.getAttribute('data-init')]();
    }

    if (typeof exports === 'object')
      module.exports = System;

    global.System = System;
  })();

  // Define our eval outside of the scope of any other reference defined in this
  // file to avoid adding those references to the evaluation scope.
  function __eval(__source, __global, load) {
    // Hijack System.register to set declare function
    System.__curRegister = System.register;
    System.register = function(name, deps, declare) {
      // store the registered declaration as load.declare
      load.declare = typeof name == 'string' ? declare : deps;
    }
    eval('var __moduleName = "' + (load.name || '').replace('"', '\"') + '"; (function() { ' + __source + ' \n }).call(__global);');

    System.register = System.__curRegister;
    delete System.__curRegister;
  }

})(typeof global !== 'undefined' ? global : this);
