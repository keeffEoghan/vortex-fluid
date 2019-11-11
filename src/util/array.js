export const iterable = (x) => (x != null) && typeof x[Symbol.iterator] === 'function';

export const range = (n) => Array(n).fill();

export const each = (f, a) => Array.prototype.forEach.call(a, f);

/**
 * Reduce an array-like object.
 * Similar to native, but with iteratee-first arguments.
 * Supports the native one-value behaviour.
 *
 * Needs a fully separate `call` because native arrays detect an `undefined` parameter.
 *
 * @param {function} f The iteratee function, given standard arguments.
 * @param {array} a The array operand.
 * @param {*} [out] The initial accumulator, if given; standard behaviour, if not.
 */
export const reduce = (f, a, out) => ((out === undefined)?
        Array.prototype.reduce.call(a, f)
    :   Array.prototype.reduce.call(a, f, out));

/**
 * Map an array-like object.
 * Similar to native, but with iteratee-first arguments; and allows the object
 * into which properties will be mapped to be defined (a new array, by default),
 * avoiding always creating new arrays.
 *
 * @param {function} f The iteratee function, given standard arguments.
 * @param {array} a The array operand.
 * @param {*} [out=[]] The initial accumulator, if given; `a`, if defined and falsey.
 */
export const map = (f, a, out = []) => reduce((out, v, i) => {
        out[i] = f(v, i, a);

        return out;
    },
    a, (out || a));

export const wrapIndex = (i, a) => ((i%a.length)+a.length)%a.length;
export const wrapGet = (i, a) => a[wrapIndex(i, a)];
