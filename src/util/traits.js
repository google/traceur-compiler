// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// See http://code.google.com/p/es-lab/wiki/Traits
// for background on traits and a description of this library


/**
 * The traceur runtime (trait).
 */
traceur.runtime.trait = (function() {

  var call = Function.prototype.call;

  /**
   * An ad hoc version of bind that only binds the 'this' parameter.
   */
  var bindThis =
      function(fun, self) { return Function.prototype.bind.call(fun, self); }

  var hasOwnProperty = bindThis(call, Object.prototype.hasOwnProperty);
  var slice = bindThis(call, Array.prototype.slice);
  var forEach = bindThis(call, Array.prototype.forEach);
  var freeze = Object.freeze;
  var getPrototypeOf = Object.getPrototypeOf;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var defineProperty = Object.defineProperty;
  var defineProperties = Object.defineProperties;
  var Object_create = Object.create;
  var getOwnProperties = Object.getOwnProperties;

  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error('Conflicting property: ' + name);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeRequiredPropDesc(name) {
    return freeze({
      value: undefined,
      enumerable: false,
      required: true
    });
  }

  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    return freeze({
      get: conflict,
      set: conflict,
      enumerable: false,
      conflict: true
    });
  }

  /**
   * Are x and y not observably distinguishable?
   */
  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return x !== x && y !== y;
    }
  }

  // Note: isSameDesc should return true if both
  // desc1 and desc2 represent a 'required' property
  // (otherwise two composed required properties would be turned into
  // a conflict)
  function isSameDesc(desc1, desc2) {
    // for conflicting properties, don't compare values because
    // the conflicting property values are never equal
    if (desc1.conflict && desc2.conflict) {
      return true;
    } else {
      return (desc1.get === desc2.get &&
              desc1.set === desc2.set &&
              identical(desc1.value, desc2.value) &&
              desc1.enumerable === desc2.enumerable &&
              desc1.required === desc2.required &&
              desc1.conflict === desc2.conflict);
    }
  }

  function freezeAndBind(meth, self) {
    return freeze(bindThis(meth, self));
  }

  /* makeSet(['foo', ...]) => { foo: true, ...}
   *
   * makeSet returns an object whose own properties represent a set.
   *
   * Each string in the names array is added to the set.
   *
   * To test whether an element is in the set, perform:
   *   hasOwnProperty(set, element)
   */
  function makeSet(names) {
    var set = {};
    forEach(names, function(name) {
      set[name] = true;
    });
    return freeze(set);
  }

  // == singleton object to be used as the placeholder for a required
  // property ==

  var required = freeze({
    toString: function() { return '<Trait.required>'; }
  });

  // == The public API methods ==

  /**
   * var newTrait = trait({ foo:required, ... })
   *
   * @param {Object} object an object record (in principle an object literal).
   * @return {Object} a new trait describing all of the own
   *     properties of the object (both enumerable and non-enumerable).
   *
   * As a general rule, 'trait' should be invoked with an object
   * literal, since the object merely serves as a record
   * descriptor. Both its identity and its prototype chain are
   * irrelevant.
   *
   * Data properties bound to function objects in the argument will be
   * flagged as 'method' properties. The prototype of these function
   * objects is frozen.
   *
   * Data properties bound to the 'required' singleton exported by
   * this module will be marked as 'required' properties.
   *
   * The <tt>trait</tt> function is pure if no other code can witness
   * the side-effects of freezing the prototypes of the methods. If
   * <tt>trait</tt> is invoked with an object literal whose methods
   * are represented as in-place anonymous functions, this should
   * normally be the case.
   */
  function trait(obj) {
    var map = {};
    forEach(getOwnPropertyNames(obj), function(name) {
      var pd = getOwnPropertyDescriptor(obj, name);
      if (pd.value === required) {
        pd = makeRequiredPropDesc(name);
      } else if (typeof pd.value === 'function') {
        pd.method = true;
        if ('prototype' in pd.value) {
          freeze(pd.value.prototype);
        }
      } else {
        if (pd.get && pd.get.prototype) { freeze(pd.get.prototype); }
        if (pd.set && pd.set.prototype) { freeze(pd.set.prototype); }
      }
      map[name] = pd;
    });
    return map;
  }

  /**
   * var newTrait = compose(trait_1, trait_2, ..., trait_N)
   *
   * @param {Object} trait_i a trait object.
   * @return {Object} a new trait containing the combined own properties of
   *          all the trait_i.
   *
   * If two or more traits have own properties with the same name, the new
   * trait will contain a 'conflict' property for that name. 'compose' is
   * a commutative and associative operation, and the order of its
   * arguments is not significant.
   *
   * If 'compose' is invoked with < 2 arguments, then:
   *   compose(trait_1) returns a trait equivalent to trait_1
   *   compose() returns an empty trait
   */
  function compose(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};

    forEach(traits, function(trait) {
      forEach(getOwnPropertyNames(trait), function(name) {
        var pd = trait[name];
        if (hasOwnProperty(newTrait, name) &&
            !newTrait[name].required) {

          // a non-required property with the same name was previously
          // defined this is not a conflict if pd represents a
          // 'required' property itself:
          if (pd.required) {
            // skip this property, the required property is
            // now present
            return;
          }

          if (!isSameDesc(newTrait[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as
            // conflicting property
            newTrait[name] = makeConflictingPropDesc(name);
          } // else,
          // properties are not in conflict if they refer to the same value

        } else {
          newTrait[name] = pd;
        }
      });
    });

    return freeze(newTrait);
  }

  /* var newTrait = exclude(['name', ...], trait)
   *
   * @param names a list of strings denoting property names.
   * @param trait a trait some properties of which should be excluded.
   * @returns a new trait with the same own properties as the original trait,
   *          except that all property names appearing in the first argument
   *          are replaced by required property descriptors.
   *
   * Note: exclude(A, exclude(B,t)) is equivalent to exclude(A U B, t)
   */
  function exclude(names, trait) {
    var exclusions = makeSet(names);
    var newTrait = {};

    forEach(getOwnPropertyNames(trait), function(name) {
      // required properties are not excluded but ignored
      if (!hasOwnProperty(exclusions, name) || trait[name].required) {
        newTrait[name] = trait[name];
      } else {
        // excluded properties are replaced by required properties
        newTrait[name] = makeRequiredPropDesc(name);
      }
    });

    return freeze(newTrait);
  }

  /**
   * var newTrait = override(trait_1, trait_2, ..., trait_N)
   *
   * @return {Object} a new trait with all of the combined properties of the
   *          argument traits.  In contrast to 'compose', 'override'
   *          immediately resolves all conflicts resulting from this
   *          composition by overriding the properties of later
   *          traits. Trait priority is from left to right. I.e. the
   *          properties of the leftmost trait are never overridden.
   *
   *  override is associative:
   *    override(t1,t2,t3) is equivalent to override(t1, override(t2, t3)) or
   *    to override(override(t1, t2), t3)
   *  override is not commutative: override(t1,t2) is not equivalent
   *    to override(t2,t1)
   *
   * override() returns an empty trait
   * override(trait_1) returns a trait equivalent to trait_1
   */
  function override(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    forEach(traits, function(trait) {
      forEach(getOwnPropertyNames(trait), function(name) {
        var pd = trait[name];
        // add this trait's property to the composite trait only if
        // - the trait does not yet have this property
        // - or, the trait does have the property, but it's a required property
        if (!hasOwnProperty(newTrait, name) || newTrait[name].required) {
          newTrait[name] = pd;
        }
      });
    });
    return freeze(newTrait);
  }

  /**
   * var newTrait = override(dominantTrait, recessiveTrait)
   *
   * @return {Object} a new trait with all of the properties of dominantTrait
   *          and all of the properties of recessiveTrait not in dominantTrait.
   *
   * Note: override is associative:
   *   override(t1, override(t2, t3)) is equivalent to
   *   override(override(t1, t2), t3)
   */
  /*function override(frontT, backT) {
    var newTrait = {};
    // first copy all of backT's properties into newTrait
    forEach(getOwnPropertyNames(backT), function (name) {
      newTrait[name] = backT[name];
    });
    // now override all these properties with frontT's properties
    forEach(getOwnPropertyNames(frontT), function (name) {
      var pd = frontT[name];
      // frontT's required property does not override the provided property
      if (!(pd.required && hasOwnProperty(newTrait, name))) {
        newTrait[name] = pd;
      }
    });

    return freeze(newTrait);
  }*/

  /**
   * var newTrait = rename(map, trait)
   *
   * @param {Object} map an object whose own properties serve as a mapping from
            old names to new names.
   * @param {Object} trait a trait object.
   * @return {Object} a new trait with the same properties as the original
   *         trait, except that all properties whose name is an own property
   *         of map will be renamed to map[name], and a 'required' property
   *         for name will be added instead.
   *
   * rename( {a: 'b'} , t) eqv compose(exclude(['a'],t),
   *                                 { a: { required: true },
   *                                   b: t[a] }).
   *
   * For each renamed property, a required property is generated.  If
   * the map renames two properties to the same name, a conflict is
   * generated.  If the map renames a property to an existing
   * unrenamed property, a conflict is generated.
   *
   * Note: rename(A, rename(B, t)) is equivalent to rename(\n ->
   * A(B(n)), t) Note: rename({...},exclude([...], t)) is not eqv to
   * exclude([...],rename({...}, t))
   */
  function rename(map, trait) {
    var renamedTrait = {};
    forEach(getOwnPropertyNames(trait), function(name) {
      // required props are never renamed
      if (hasOwnProperty(map, name) && !trait[name].required) {
        var alias = map[name]; // alias defined in map
        if (hasOwnProperty(renamedTrait, alias) &&
            !renamedTrait[alias].required) {
          // could happen if 2 props are mapped to the same alias
          renamedTrait[alias] = makeConflictingPropDesc(alias);
        } else {
          // add the property under an alias
          renamedTrait[alias] = trait[name];
        }
        // add a required property under the original name
        // but only if a property under the original name does not exist
        // such a prop could exist if an earlier prop in the trait was
        // previously aliased to this name
        if (!hasOwnProperty(renamedTrait, name)) {
          renamedTrait[name] = makeRequiredPropDesc(name);
        }
      } else { // no alias defined
        if (hasOwnProperty(renamedTrait, name)) {
          // could happen if another prop was previously aliased to name
          if (!trait[name].required) {
            renamedTrait[name] = makeConflictingPropDesc(name);
          }
          // else required property overridden by a previously aliased
          // property and otherwise ignored
        } else {
          renamedTrait[name] = trait[name];
        }
      }
    });

    return freeze(renamedTrait);
  }

  /**
   * var newTrait = resolve({ oldName: 'newName', excludeName:
   * undefined, ... }, trait)
   *
   * This is a convenience function combining renaming and
   * exclusion. It can be implemented as <tt>rename(map,
   * exclude(exclusions, trait))</tt> where map is the subset of
   * mappings from oldName to newName and exclusions is an array of
   * all the keys that map to undefined (or another falsy value).
   *
   * @param {Object} resolutions an object whose own properties serve as a
            mapping from old names to new names, or to undefined if
            the property should be excluded.
   * @param {Object} trait a trait object.
   * @return {Object} a resolved trait with the same own properties as the
   * original trait.
   *
   * In a resolved trait, all own properties whose name is an own property
   * of resolutions will be renamed to resolutions[name] if it is truthy,
   * or their value is changed into a required property descriptor if
   * resolutions[name] is falsy.
   *
   * Note, it's important to _first_ exclude, _then_ rename, since exclude
   * and rename are not associative, for example:
   * rename( {a: 'b'} , exclude(['b'], trait({ a:1,b:2 }))) eqv trait({b:1})
   * exclude(['b'], rename({a: 'b'}, trait({ a:1,b:2 }))) eqv
   * trait({b:Trait.required}).
   *
   * writing resolve({a:'b', b: undefined},trait({a:1,b:2})) makes it
   * clear that what is meant is to simply drop the old 'b' and rename
   * 'a' to 'b'
   */
  function resolve(resolutions, trait) {
    var renames = {};
    var exclusions = [];
    // preprocess renamed and excluded properties
    for (var name in resolutions) {
      if (hasOwnProperty(resolutions, name)) {
        if (resolutions[name]) { // old name -> new name
          renames[name] = resolutions[name];
        } else { // name -> undefined
          exclusions.push(name);
        }
      }
    }
    return rename(renames, exclude(exclusions, trait));
  }

  /**
   * var obj = create(proto, trait)
   *
   * @param {Object} proto denotes the prototype of the completed object.
   * @param {Object} trait a trait object to be turned into a complete object.
   * @return {Object} an object with all of the properties described by the
   *         trait.
   * @throws 'Missing required property' the trait still contains a
   *         required property.
   * @throws 'Remaining conflicting property' if the trait still
   *         contains a conflicting property.
   *
   * Trait.create is like Object.create, except that it generates
   * high-integrity or final objects. In addition to creating a new object
   * from a trait, it also ensures that:
   *    - an exception is thrown if 'trait' still contains required properties
   *    - an exception is thrown if 'trait' still contains conflicting
   *      properties
   *    - the object is and all of its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is bound to the composed object.
   *
   *  Use Object.create instead of Trait.create if you want to create
   *  abstract or malleable objects. Keep in mind that for such objects:
   *    - no exception is thrown if 'trait' still contains required properties
   *      (the properties are simply dropped from the composite object)
   *    - no exception is thrown if 'trait' still contains conflicting
   *      properties (these properties remain as conflicting
   *      properties in the composite object)
   *    - neither the object nor its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is left unbound.
   */
  function create(proto, trait) {
    var self = Object_create(proto);
    var properties = {};

    forEach(getOwnPropertyNames(trait), function(name) {
      var pd = trait[name];
      // check for remaining 'required' properties
      // Note: it's OK for the prototype to provide the properties
      if (pd.required) {
        if (!(name in proto)) {
          throw new Error('Missing required property: ' + name);
        }
      } else if (pd.conflict) { // check for remaining conflicting properties
        throw new Error('Remaining conflicting property: ' + name);
      } else if ('value' in pd) { // data property
        // freeze all function properties and their prototype
        if (pd.method) { // the property is meant to be used as a method
          // bind 'this' in trait method to the composite object
          properties[name] = {
            value: freezeAndBind(pd.value, self),
            enumerable: pd.enumerable,
            configurable: pd.configurable,
            writable: pd.writable
          };
        } else {
          properties[name] = pd;
        }
      } else { // accessor property
        properties[name] = {
          get: pd.get ? freezeAndBind(pd.get, self) : undefined,
          set: pd.set ? freezeAndBind(pd.set, self) : undefined,
          enumerable: pd.enumerable,
          configurable: pd.configurable
        };
      }
    });

    defineProperties(self, properties);
    return freeze(self);
  }

  /** A shorthand for create(Object.prototype, trait({...}), options) */
  function object(record, options) {
    return create(Object.prototype, trait(record), options);
  }

  /**
   * Tests whether two traits are equivalent. T1 is equivalent to T2 iff
   * both describe the same set of property names and for all property
   * names n, T1[n] is equivalent to T2[n]. Two property descriptors are
   * equivalent if they have the same value, accessors and attributes.
   *
   * @param {Object} trait1 a trait object.
   * @param {Object} trait2 a trait object.
   * @return {boolean} a boolean indicating whether the two argument traits are
   *         equivalent.
   */
  function eqv(trait1, trait2) {
    var names1 = getOwnPropertyNames(trait1);
    var names2 = getOwnPropertyNames(trait2);
    var name;
    if (names1.length !== names2.length) {
      return false;
    }
    for (var i = 0; i < names1.length; i++) {
      name = names1[i];
      if (!trait2[name] || !isSameDesc(trait1[name], trait2[name])) {
        return false;
      }
    }
    return true;
  }

  // if this code is ran in ES3 without an Object.create function, this
  // library will define it on Object:
  if (!Object.create) {
    Object.create = Object_create;
  }
  // ES5 does not by default provide Object.getOwnProperties
  // if it's not defined, the Traits library defines this utility
  // function on Object
  if (!Object.getOwnProperties) {
    Object.getOwnProperties = getOwnProperties;
  }

  // expose the public API of this module
  function Trait(record) {
    // calling Trait as a function creates a new atomic trait
    return trait(record);
  }
  Trait.required = freeze(required);
  Trait.compose = freeze(compose);
  Trait.resolve = freeze(resolve);
  Trait.override = freeze(override);
  Trait.create = freeze(create);
  Trait.eqv = freeze(eqv);
  Trait.object = freeze(object); // not essential, cf. create + trait
  return freeze(Trait);

})();
