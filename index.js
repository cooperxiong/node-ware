/**
 * Created by Cooper on 2017/9/20.
 */
'use strict';

const co = require('co');


class Ware {
    constructor() {
        this._middlewares = [];
    }

    _work(input = {}, output = {}, i = 0) {
        const self = this;
        return co(function* () {
            if (self._middlewares.length === i) {
                self._middlewares = self._middlewares.filter(e => e.name); // remove anonymous functions
                return [input, output]
            }
            const next = self._middlewares[i](input, output);
            let _next, _input, _output;
            if (next && typeof next.then === 'function') {
                _next = yield next;
            } else {
                _next = next
            }
            if (!_next) {
                [_input, _output] = [,]
            } else if (typeof _next === 'object' && !_next.length) {
                [_input, _output] = [_next,]
            } else if (_next.length && _next.length === 2) {
                [_input, _output] = _next
            } else {
                throw new Error('There is no more than two return values')
            }
            return self._work(Object.assign(input, _input || {}), Object.assign(output, _output || {}), i + 1);
        })
    }

    use(middleware) {
        if (typeof middleware === 'function') {
            this._middlewares.push(middleware);
            return this
        } else {
            throw new Error('Middleware should be a function!');
        }
    }

    pre(middleware) {
        if (typeof middleware === 'function') {
            this._middlewares.unshift(middleware);
            return this
        } else {
            throw new Error('Middleware should be a function!');
        }
    }

    hold() {
        return this._middlewares
    }

    run(...args) {
        return this._work(args[0], args[1])
    }
}

module.exports = Ware;