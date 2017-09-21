/**
 * Created by Cooper on 2017/9/20.
 */
'use strict';

const co = require('co');


class Ware {
    constructor() {
        this._middlewares = [];
    }

    _work(middlewares, input = {}, output = {}) {
        const self = this;
        return co(function* () {
            if (middlewares.length === 0) return [input, output];
            const next = middlewares.shift();
            if (next(input, output).constructor.name === 'Promise') {
                [input, output] = yield next(input, output)
            } else {
                [input, output] = next(input, output);
            }
            return self._work(middlewares, input, output);
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
        return this._work(this._middlewares, args[0], args[1])
    }
}

module.exports = Ware