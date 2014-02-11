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


// MODIFICATION:
// Renamed Trait/trait to Role/role
// reason: easier to reason =)


var Role = (function(){

  // == Ancillary functions ==

  var SUPPORTS_DEFINEPROP = (function() {
    try {
      var test = {};
      Object.defineProperty(test, 'x', {get: function() { return 0; } } );
      return test.x === 0;
    } catch(e) {
      return false;
    }
  })();

  // IE8 implements Object.defineProperty and Object.getOwnPropertyDescriptor
  // only for DOM objects. These methods don't work on plain objects.
  // Hence, we need a more elaborate feature-test to see whether the
  // browser truly supports these methods:
  function supportsGOPD() {
    try {
      if (Object.getOwnPropertyDescriptor) {
        var test = {x:0};
        return !!Object.getOwnPropertyDescriptor(test,'x');
      }
    } catch(e) {}
    return false;
  };
  function supportsDP() {
    try {
      if (Object.defineProperty) {
        var test = {};
        Object.defineProperty(test,'x',{value:0});
        return test.x === 0;
      }
    } catch(e) {}
    return false;
  };

  var call = Function.prototype.call;

  /**
   * An ad hoc version of bind that only binds the 'this' parameter.
   */
  var bindThis = Function.prototype.bind ?
    function(fun, self) { return Function.prototype.bind.call(fun, self); } :
    function(fun, self) {
      function funcBound(var_args) {
        return fun.apply(self, arguments);
      }
      return funcBound;
    };

  var hasOwnProperty = bindThis(call, Object.prototype.hasOwnProperty);
  var slice = bindThis(call, Array.prototype.slice);

  // feature testing such that roles.js runs on both ES3 and ES5
  var forEach = Array.prototype.forEach ?
      bindThis(call, Array.prototype.forEach) :
      function(arr, fun) {
        for (var i = 0, len = arr.length; i < len; i++) { fun(arr[i]); }
      };

  var freeze = Object.freeze || function(obj) { return obj; };
  var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return Object.prototype;
  };
  var getOwnPropertyNames = Object.getOwnPropertyNames ||
      function(obj) {
        var props = [];
        for (var p in obj) { if (hasOwnProperty(obj,p)) { props.push(p); } }
        return props;
      };
  var getOwnPropertyDescriptor = supportsGOPD() ?
      Object.getOwnPropertyDescriptor :
      function(obj, name) {
        return {
          value: obj[name],
          enumerable: true,
          writable: true,
          configurable: true
        };
      };
  var defineProperty = supportsDP() ? Object.defineProperty :
      function(obj, name, pd) {
        obj[name] = pd.value;
      };
  var defineProperties = Object.defineProperties ||
      function(obj, propMap) {
        for (var name in propMap) {
          if (hasOwnProperty(propMap, name)) {
            defineProperty(obj, name, propMap[name]);
          }
        }
      };
  var Object_create = Object.create ||
      function(proto, propMap) {
        var self;
        function dummy() {};
        dummy.prototype = proto || Object.prototype;
        self = new dummy();
        if (propMap) {
          defineProperties(self, propMap);
        }
        return self;
      };
  var getOwnProperties = Object.getOwnProperties ||
      function(obj) {
        var map = {};
        forEach(getOwnPropertyNames(obj), function (name) {
          map[name] = getOwnPropertyDescriptor(obj, name);
        });
        return map;
      };

  // end of ES3 - ES5 compatibility functions

  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeRequiredPropDesc(name) {
    return freeze({
      value: undefined,
      enumerable: false,
      required: true,

      writable: true
    });
  }

  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    if (SUPPORTS_DEFINEPROP) {
      return freeze({
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true,
      });
    } else {
      return freeze({
        value: conflict,
        enumerable: false,
        conflict: true,
      });
    }
  }

  /**
   * Are x and y not observably distinguishable?
   */
  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1/x === 1/y;
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
      return (   desc1.get === desc2.get
              && desc1.set === desc2.set
              && identical(desc1.value, desc2.value)
              && desc1.enumerable === desc2.enumerable
              && desc1.required === desc2.required
              && desc1.conflict === desc2.conflict);
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
    forEach(names, function (name) {
      set[name] = true;
    });
    return freeze(set);
  }

  // == singleton object to be used as the placeholder for a required
  // property ==

  var required = freeze({
    toString: function() { return '<Role.required>'; }
  });

  // == The public API methods ==

  /**
   * var newRole = role({ foo:required, ... })
   *
   * @param object an object record (in principle an object literal)
   * @returns a new role describing all of the own properties of the object
   *          (both enumerable and non-enumerable)
   *
   * As a general rule, 'role' should be invoked with an object
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
   * The <tt>role</tt> function is pure if no other code can witness
   * the side-effects of freezing the prototypes of the methods. If
   * <tt>role</tt> is invoked with an object literal whose methods
   * are represented as in-place anonymous functions, this should
   * normally be the case.
   */
  function role(obj) {
    var map = {};
    forEach(getOwnPropertyNames(obj), function (name) {
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
   * var newRole = compose(role_1, role_2, ..., role_N)
   *
   * @param role_i a role object
   * @returns a new role containing the combined own properties of
   *          all the role_i.
   *
   * If two or more roles have own properties with the same name, the new
   * role will contain a 'conflict' property for that name. 'compose' is
   * a commutative and associative operation, and the order of its
   * arguments is not significant.
   *
   * If 'compose' is invoked with < 2 arguments, then:
   *   compose(role_1) returns a role equivalent to role_1
   *   compose() returns an empty role
   */
  function compose(var_args) {
    var roles = slice(arguments, 0);
    var newRole = {};

    forEach(roles, function (role) {
      forEach(getOwnPropertyNames(role), function (name) {
        var pd = role[name];
        if (hasOwnProperty(newRole, name) &&
            !newRole[name].required) {

          // a non-required property with the same name was previously
          // defined this is not a conflict if pd represents a
          // 'required' property itself:
          if (pd.required) {
            return; // skip this property, the required property is
   	            // now present
          }

          if (!isSameDesc(newRole[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another role => mark as
	    // conflicting property
            newRole[name] = makeConflictingPropDesc(name);
          } // else,
          // properties are not in conflict if they refer to the same value

        } else {
          newRole[name] = pd;
        }
      });
    });

    return freeze(newRole);
  }

  /* var newRole = exclude(['name', ...], role)
   *
   * @param names a list of strings denoting property names.
   * @param role a role some properties of which should be excluded.
   * @returns a new role with the same own properties as the original role,
   *          except that all property names appearing in the first argument
   *          are replaced by required property descriptors.
   *
   * Note: exclude(A, exclude(B,t)) is equivalent to exclude(A U B, t)
   */
  function exclude(names, role) {
    var exclusions = makeSet(names);
    var newRole = {};

    forEach(getOwnPropertyNames(role), function (name) {
      // required properties are not excluded but ignored
      if (!hasOwnProperty(exclusions, name) || role[name].required) {
        newRole[name] = role[name];
      } else {
        // excluded properties are replaced by required properties
        newRole[name] = makeRequiredPropDesc(name);
      }
    });

    return freeze(newRole);
  }

  /**
   * var newRole = override(role_1, role_2, ..., role_N)
   *
   * @returns a new role with all of the combined properties of the
   *          argument roles.  In contrast to 'compose', 'override'
   *          immediately resolves all conflicts resulting from this
   *          composition by overriding the properties of later
   *          roles. Role priority is from left to right. I.e. the
   *          properties of the leftmost role are never overridden.
   *
   *  override is associative:
   *    override(t1,t2,t3) is equivalent to override(t1, override(t2, t3)) or
   *    to override(override(t1, t2), t3)
   *  override is not commutative: override(t1,t2) is not equivalent
   *    to override(t2,t1)
   *
   * override() returns an empty role
   * override(role_1) returns a role equivalent to role_1
   */
  function override(var_args) {
    var roles = slice(arguments, 0);
    var newRole = {};
    forEach(roles, function (role) {
      forEach(getOwnPropertyNames(role), function (name) {
        var pd = role[name];
        // add this role's property to the composite role only if
        // - the role does not yet have this property
        // - or, the role does have the property, but it's a required property
        if (!hasOwnProperty(newRole, name) || newRole[name].required) {
          newRole[name] = pd;
        }
      });
    });
    return freeze(newRole);
  }

  /**
   * var newRole = override(dominantRole, recessiveRole)
   *
   * @returns a new role with all of the properties of dominantRole
   *          and all of the properties of recessiveRole not in dominantRole
   *
   * Note: override is associative:
   *   override(t1, override(t2, t3)) is equivalent to
   *   override(override(t1, t2), t3)
   */
  /*function override(frontT, backT) {
    var newRole = {};
    // first copy all of backT's properties into newRole
    forEach(getOwnPropertyNames(backT), function (name) {
      newRole[name] = backT[name];
    });
    // now override all these properties with frontT's properties
    forEach(getOwnPropertyNames(frontT), function (name) {
      var pd = frontT[name];
      // frontT's required property does not override the provided property
      if (!(pd.required && hasOwnProperty(newRole, name))) {
        newRole[name] = pd;
      }
    });

    return freeze(newRole);
  }*/

  /**
   * var newRole = rename(map, role)
   *
   * @param map an object whose own properties serve as a mapping from
            old names to new names.
   * @param role a role object
   * @returns a new role with the same properties as the original role,
   *          except that all properties whose name is an own property
   *          of map will be renamed to map[name], and a 'required' property
   *          for name will be added instead.
   *
   * rename({a: 'b'}, t) eqv compose(exclude(['a'],t),
   *                                 { a: { required: true },
   *                                   b: t[a] })
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
  function rename(map, role) {
    var renamedRole = {};
    forEach(getOwnPropertyNames(role), function (name) {
      // required props are never renamed
      if (hasOwnProperty(map, name) && !role[name].required) {
        var alias = map[name]; // alias defined in map
        if (hasOwnProperty(renamedRole, alias) &&
	    !renamedRole[alias].required) {
          // could happen if 2 props are mapped to the same alias
          renamedRole[alias] = makeConflictingPropDesc(alias);
        } else {
          // add the property under an alias
          renamedRole[alias] = role[name];
        }
        // add a required property under the original name
        // but only if a property under the original name does not exist
        // such a prop could exist if an earlier prop in the role was
        // previously aliased to this name
        if (!hasOwnProperty(renamedRole, name)) {
          renamedRole[name] = makeRequiredPropDesc(name);
        }
      } else { // no alias defined
        if (hasOwnProperty(renamedRole, name)) {
          // could happen if another prop was previously aliased to name
          if (!role[name].required) {
            renamedRole[name] = makeConflictingPropDesc(name);
          }
          // else required property overridden by a previously aliased
          // property and otherwise ignored
        } else {
          renamedRole[name] = role[name];
        }
      }
    });

    return freeze(renamedRole);
  }

  /**
   * var newRole = resolve({ oldName: 'newName', excludeName:
   * undefined, ... }, role)
   *
   * This is a convenience function combining renaming and
   * exclusion. It can be implemented as <tt>rename(map,
   * exclude(exclusions, role))</tt> where map is the subset of
   * mappings from oldName to newName and exclusions is an array of
   * all the keys that map to undefined (or another falsy value).
   *
   * @param resolutions an object whose own properties serve as a
            mapping from old names to new names, or to undefined if
            the property should be excluded
   * @param role a role object
   * @returns a resolved role with the same own properties as the
   * original role.
   *
   * In a resolved role, all own properties whose name is an own property
   * of resolutions will be renamed to resolutions[name] if it is truthy,
   * or their value is changed into a required property descriptor if
   * resolutions[name] is falsy.
   *
   * Note, it's important to _first_ exclude, _then_ rename, since exclude
   * and rename are not associative, for example:
   * rename({a: 'b'}, exclude(['b'], role({ a:1,b:2 }))) eqv role({b:1})
   * exclude(['b'], rename({a: 'b'}, role({ a:1,b:2 }))) eqv
   * role({b:Role.required})
   *
   * writing resolve({a:'b', b: undefined},role({a:1,b:2})) makes it
   * clear that what is meant is to simply drop the old 'b' and rename
   * 'a' to 'b'
   */
  function resolve(resolutions, role) {
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
    return rename(renames, exclude(exclusions, role));
  }

  /**
   * var obj = create(proto, role)
   *
   * @param proto denotes the prototype of the completed object
   * @param role a role object to be turned into a complete object
   * @returns an object with all of the properties described by the role.
   * @throws 'Missing required property' the role still contains a
   *         required property.
   * @throws 'Remaining conflicting property' if the role still
   *         contains a conflicting property.
   *
   * Role.create is like Object.create, except that it generates
   * high-integrity or final objects. In addition to creating a new object
   * from a role, it also ensures that:
   *    - an exception is thrown if 'role' still contains required properties
   *    - an exception is thrown if 'role' still contains conflicting
   *      properties
   *    - the object is and all of its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is bound to the composed object.
   *
   *  Use Object.create instead of Role.create if you want to create
   *  abstract or malleable objects. Keep in mind that for such objects:
   *    - no exception is thrown if 'role' still contains required properties
   *      (the properties are simply dropped from the composite object)
   *    - no exception is thrown if 'role' still contains conflicting
   *      properties (these properties remain as conflicting
   *      properties in the composite object)
   *    - neither the object nor its accessor and method properties are frozen
   *    - the 'this' pseudovariable in all accessors and methods of
   *      the object is left unbound.
   */
  function create(proto, role) {
    var self = Object_create(proto);
    var properties = {};

    forEach(getOwnPropertyNames(role), function (name) {
      var pd = role[name];
      // check for remaining 'required' properties
      // Note: it's OK for the prototype to provide the properties
      if (pd.required) {
        if (!(name in proto)) {
          throw new Error('Missing required property: '+name);
        }
      } else if (pd.conflict) { // check for remaining conflicting properties
        throw new Error('Remaining conflicting property: '+name);
      } else if ('value' in pd) { // data property
        // freeze all function properties and their prototype
        if (pd.method) { // the property is meant to be used as a method
          // bind 'this' in role method to the composite object
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

  /** A shorthand for create(Object.prototype, role({...}), options) */
  function object(record, options) {
    return create(Object.prototype, role(record), options);
  }

  /**
   * Tests whether two roles are equivalent. T1 is equivalent to T2 iff
   * both describe the same set of property names and for all property
   * names n, T1[n] is equivalent to T2[n]. Two property descriptors are
   * equivalent if they have the same value, accessors and attributes.
   *
   * @return a boolean indicating whether the two argument roles are
   *         equivalent.
   */
  function eqv(role1, role2) {
    var names1 = getOwnPropertyNames(role1);
    var names2 = getOwnPropertyNames(role2);
    var name;
    if (names1.length !== names2.length) {
      return false;
    }
    for (var i = 0; i < names1.length; i++) {
      name = names1[i];
      if (!role2[name] || !isSameDesc(role1[name], role2[name])) {
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
  // if it's not defined, the Roles library defines this utility
  // function on Object
  if(!Object.getOwnProperties) {
    Object.getOwnProperties = getOwnProperties;
  }

  // expose the public API of this module
  function Role(record) {
    // calling Role as a function creates a new atomic role
    return role(record);
  }
  Role.required = freeze(required);
  Role.compose = freeze(compose);
  Role.resolve = freeze(resolve);
  Role.override = freeze(override);
  Role.create = freeze(create);
  Role.eqv = freeze(eqv);
  Role.object = freeze(object); // not essential, cf. create + role
  return freeze(Role);

})();

if (typeof exports !== "undefined") { // CommonJS module support
  exports.Role = Role;
}
