'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 
 * Converts flat SQL joined results into a object graph.
 *
 * @param {Array} - Array of objects. Object are row results with delimited key name from sql table.
 * @returns {Array}
 */

var globalOptionKeys = ['primaryKeyField', 'delimiter', 'specialKeyArray'];

var DeepObjectGraph = function () {
    function DeepObjectGraph(options) {
        _classCallCheck(this, DeepObjectGraph);

        // TODO cleaner/better way to init options.
        // TODO option validation.
        this.options = {};

        this.options.primaryKeyField = (0, _lodash.has)(options, 'primaryKeyField') ? options.primaryKeyField : 'id';
        this.options.delimiter = (0, _lodash.has)(options, 'delimiter') ? options.delimiter : '.';
        this.options.specialKeyArray = (0, _lodash.has)(options, 'specialKeyArray') ? options.specialKeyArray : [];
    }

    _createClass(DeepObjectGraph, [{
        key: 'setOptions',
        value: function setOptions(options) {
            options = (0, _lodash.pick)(options, globalOptionKeys);

            // TODO option validation.
            this.options = (0, _lodash.merge)(this.options, options);
        }
    }, {
        key: 'getOptions',
        value: function getOptions() {
            return this.options;
        }
    }, {
        key: 'convert',
        value: function convert(data) {
            var _this = this;

            data = data.map(function (obj) {
                return _this._convertDelimitedKeysToObjects(obj);
            });

            var merged = [];

            while (data.length > 0) {
                var currentObj = data.shift();

                merged = this._findMatchAndMerge(currentObj, merged);
            }

            return merged;
        }

        /**
         * findMatchAndMerge
         *
         * @param {Object} - plain object.
         * @param {Array|Object} - Can be of array or plain object type.
         * @returns {Array|Object}
         */

    }, {
        key: '_findMatchAndMerge',
        value: function _findMatchAndMerge(object, arrayOrObject) {
            var _this2 = this;

            var returnArrayOrObject = null;

            if ((0, _lodash.isPlainObject)(arrayOrObject)) {
                if (!!arrayOrObject[this.options.primaryKeyField] && object[this.options.primaryKeyField] !== arrayOrObject[this.options.primaryKeyField]) {
                    // ID does not match. Wrap in array for further processing below.
                    arrayOrObject = [arrayOrObject];
                } else {
                    returnArrayOrObject = this._customMerge(object, arrayOrObject);
                }
            }

            if (Array.isArray(arrayOrObject)) {
                // Match objects by distinct `id` field. 
                var matchObj = arrayOrObject.find(function (obj) {
                    // Check for keys mismatch.
                    if (!!obj[_this2.options.primaryKeyField]) {
                        return obj[_this2.options.primaryKeyField] === object[_this2.options.primaryKeyField];
                    }
                });

                if (!!matchObj) {
                    arrayOrObject[arrayOrObject.indexOf(matchObj)] = this._customMerge(object, matchObj);
                } else {
                    arrayOrObject.push(this._customMerge({}, object));
                }

                returnArrayOrObject = arrayOrObject;
            }

            return returnArrayOrObject;
        }
    }, {
        key: '_customMerge',
        value: function _customMerge(currentObj, sourceObj) {
            var _this3 = this;

            var mergedObject = {};

            mergedObject = (0, _lodash.mergeWith)(currentObj, sourceObj, function (objValue, srcValue, key) {
                // Put special keys (usually a table name) automatically in array form.
                if (_this3.options.specialKeyArray.includes(key) && (0, _lodash.isPlainObject)(srcValue) && !objValue) {
                    return [srcValue];
                }

                if (Array.isArray(objValue) && Array.isArray(srcValue)) {
                    var _ret = function () {
                        // Both incoming values are array, manually merge each one from current to src.
                        var tempArray = srcValue;

                        objValue.forEach(function (obj) {
                            if ((0, _lodash.isPlainObject)(obj)) {
                                tempArray = _this3._findMatchAndMerge(obj, tempArray);
                            }
                        });

                        return {
                            v: tempArray
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }

                if ((0, _lodash.isPlainObject)(objValue)) {
                    return _this3._findMatchAndMerge(objValue, srcValue);
                }

                if (!!objValue && !!srcValue && objValue != srcValue) {
                    if (!(0, _lodash.isObject)(objValue) && !(0, _lodash.isObject)(srcValue)) {
                        return [srcValue, objValue];
                    } else if (Array.isArray(srcValue)) {
                        srcValue.push(objValue);
                        return srcValue;
                    }
                }
            });

            return mergedObject;
        }
    }, {
        key: '_convertDelimitedKeysToObjects',
        value: function _convertDelimitedKeysToObjects(data) {
            var copy = {};

            for (var key in data) {
                (0, _lodash.set)(copy, key.split(this.options.delimiter), data[key]);
            }

            return copy;
        }
    }]);

    return DeepObjectGraph;
}();

exports.default = DeepObjectGraph;