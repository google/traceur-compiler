/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
/*globals require exports module define*/ 
 
(function (global, factory) { 
    // https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
    if (typeof exports === 'object') {  // Node. 
      var util = require('./util');
      var binarySearch = require('./binary-search');
      var ArraySet = require('./array-set').ArraySet;
      var base64VLQ = require('./base64-vlq');
      module.exports = factory(util, binarySearch, ArraySet, base64VLQ);
    } else if (typeof define === 'function' && define.amd) {
      define(['source-map/util', 'source-map/binary-search', 'source-map/array-set', 'source-map/base64-vlq'], factory);
    } else {// Browser globals
      var sourceMapModule = global.sourceMapModule = global.sourceMapModule || {};
      var util = sourceMapModule['util'];
      var binarySearch = sourceMapModule['binary-search'];
      var ArraySet = sourceMapModule['array-set'];
      var base64VLQ = sourceMapModule['base64-vlq'];
      sourceMapModule['source-map-consumer'] = factory(util, binarySearch, ArraySet, base64VLQ);
    }
}(this, function (util, binarySearch, ArraySet, base64VLQ) {

  // TODO:  bug 673487
  //
  // Sometime in the future, if we decide we need to be able to query where in
  // the generated source a peice of the original code came from, we may want to
  // add a slot `_originalMappings` which would be an object keyed by the
  // original source and whose value would be an array of mappings ordered by
  // original line/col rather than generated (which is what we have now in
  // `_generatedMappings`).

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: The generated file this source map is associated with.
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap);
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    var names = util.getArg(sourceMap, 'names');
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file');

    if (version !== this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    this._names = ArraySet.fromArray(names);
    this._sources = ArraySet.fromArray(sources);
    this._generatedMappings = [];
    this._parseMappings(mappings, sourceRoot);
  }

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (an ordered list in this._generatedMappings).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            // Original source.
            temp = base64VLQ.decode(str);
            if (aSourceRoot) {
              mapping.source = util.join(aSourceRoot, this._sources.at(previousSource + temp.value));
            }
            else {
              mapping.source = this._sources.at(previousSource + temp.value);
            }
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              // Original name.
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this._generatedMappings.push(mapping);
        }
      }
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      // To return the original position, we must first find the mapping for the
      // given generated position and then return the original position it
      // points to. Because the mappings are sorted by generated line/column, we
      // can use binary search to find the best mapping.

      // To perform a binary search on the mappings, we must be able to compare
      // two mappings.
      function compare(mappingA, mappingB) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        return cmp === 0
          ? mappingA.generatedColumn - mappingB.generatedColumn
          : cmp;
      }

      // This is the mock of the mapping we are looking for: the needle in the
      // haystack of mappings.
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      if (needle.generatedLine <= 0) {
        throw new TypeError('Line must be greater than or equal to 1.');
      }
      if (needle.generatedColumn < 0) {
        throw new TypeError('Column must be greater than or equal to 0.');
      }

      var mapping = binarySearch.search(needle, this._generatedMappings, compare);

      if (mapping) {
        return {
          source: util.getArg(mapping, 'source', null),
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };

    };

  return SourceMapConsumer;

}));
