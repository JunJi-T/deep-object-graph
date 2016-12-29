'use strict';

import { set, has, merge, pick, mergeWith, isObject, isPlainObject } from 'lodash';

/**
 * 
 * Converts flat SQL joined results into a object graph.
 *
 * @param {Array} - Array of objects. Object are row results with delimited key name from sql table.
 * @returns {Array}
 */

let globalOptionKeys = ['primaryKeyField', 'delimiter', 'specialKeyArray'];

export default
class DeepObjectGraph {

    constructor(options) {
        // TODO cleaner/better way to init options.
        // TODO option validation.
        this.options = {};

        this.options.primaryKeyField = has(options, 'primaryKeyField') ? options.primaryKeyField : 'id';
        this.options.delimiter = has(options, 'delimiter') ? options.delimiter : '.';
        this.options.specialKeyArray = has(options, 'specialKeyArray') ? options.specialKeyArray : [];
    }

    setOptions(options) {
        options = pick(options, globalOptionKeys);
        
        // TODO option validation.
        this.options = merge(this.options, options);
    }

    getOptions() {
        return this.options;
    }

    convert(data) {
        data = data.map(obj => this._convertDelimitedKeysToObjects(obj));

        let merged = [];

        while (data.length > 0) {
            let currentObj = data.shift();
            
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

    _findMatchAndMerge(object, arrayOrObject) {
        let returnArrayOrObject = null;

        if (isPlainObject(arrayOrObject)) {
            if (!!arrayOrObject[this.options.primaryKeyField] && object[this.options.primaryKeyField] !== arrayOrObject[this.options.primaryKeyField]) {
                // ID does not match. Wrap in array for further processing below.
                arrayOrObject = [arrayOrObject];
            } else {
                returnArrayOrObject = this._customMerge(object, arrayOrObject);
            }
        }

        if (Array.isArray(arrayOrObject)) {
            // Match objects by distinct `id` field. 
            let matchObj = arrayOrObject.find((obj) => {
                // Check for keys mismatch.
                if (!!obj[this.options.primaryKeyField]) {
                    return obj[this.options.primaryKeyField] === object[this.options.primaryKeyField];
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

    _customMerge(currentObj, sourceObj) {
        let mergedObject = {};

        mergedObject = mergeWith(currentObj, sourceObj, (objValue, srcValue, key) => {
            // Put special keys (usually a table name) automatically in array form.
            if (this.options.specialKeyArray.includes(key) && isPlainObject(srcValue) && !objValue) {
                return [srcValue];
            }
            
            if (Array.isArray(objValue) && Array.isArray(srcValue)) {
                // Both incoming values are array, manually merge each one from current to src.
                let tempArray = srcValue;

                objValue.forEach((obj) => {
                    if (isPlainObject(obj)) {
                        tempArray = this._findMatchAndMerge(obj, tempArray);
                    }
                });

                return tempArray;
            }

            if (isPlainObject(objValue)) {  
                return this._findMatchAndMerge(objValue, srcValue);
            }

            if (!!objValue && !!srcValue && objValue != srcValue) {
                if (!isObject(objValue) && !isObject(srcValue)) {
                    return [srcValue, objValue];
                } else if (Array.isArray(srcValue) && !srcValue.includes(objValue)) {
                    srcValue.push(objValue);
                    return srcValue;
                }
            }
        });
        
        return mergedObject;
    }

    _convertDelimitedKeysToObjects(data) {
        let copy = {}

        for (let key in data) {
            set(copy, key.split(this.options.delimiter), data[key]);
        }
        
        return copy;
    }
}
