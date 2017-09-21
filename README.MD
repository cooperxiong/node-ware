node-ware
=========

[![NPM Version][npm-image]][npm-url]

Middleware for nodejs, like decorator.

Middleware functions for node-ware are functions that have access to the input object and the output object. When the run() is invoked, the middlewares will get executed in the order of their use calls or their order in the array, and return a Promise contains the final input and output if resolved.

## Installation

```bash
npm i node-ware
```

## Usage

```js
const Ware = require('node-ware');
let ware = new Ware();

function addA(input, output) {
    input.a = 'a';
    return [input, output]
}

function addB(input, output) {
    output.b = 'b';
    return [input, output]
}

ware.use(addA);
ware.use(addB);
ware.run().then(([input, output]) => {
    console.log(input, output);
}).catch(err => {
    console.log(err);
});
```

## A complete example

A ware for request, which makes it easier and cleaner to add some functions like logger, timer and storer during the request.

```js
const co = require('co');
const fs = require('fs');
const log = require('pino')();
const Ware = require('./index');
const request = require('request');

let wrequest = new Ware();

let proxy = function (input) {
    input.proxy = "http://8.8.8.8:8080";
    return input
};

let time = function () {
    return {time: new Date()}
};

let rp = function (input) {
    return new Promise(function (resolve, reject) {
        request(input, function (err, res) {
            if (err) {
                reject(err)
            } else {
                setTimeout(() => {
                    resolve([, res])
                }, 1000)
            }
        })
    })
};

let timeEnd = function () {
    return {timeEnd: new Date()}
};

let logger = function (input) {
    log.info(`${input.description} start at ${input.time.toISOString()} end at ${input.timeEnd.toISOString()} takes ${input.timeEnd - input.time} ms`);
};

let storer = function (input, output) {
    fs.writeFile(input.description + '.txt', output.body, (err) => {
        if (err) throw err;
        console.log('The file ' + input.description + '.txt has been saved!');
    });
};

wrequest
    .use(time)
    .use(rp)
    .use(timeEnd)
    .use(() => ([, {message: "OK"}]))
    .use(logger)
    .use(storer);

co(function* () {

    console.log(wrequest.hold());

    let [input1, res1] = yield wrequest
        .pre(() => ({description: 'req1'}))
        .run({url: "http://example.com/"});

    console.log(wrequest.hold()); // Anonymous functions were removed after running

    let [, res2] = yield wrequest
        .pre(() => ({description: 'req2'}))
        .run({url: "http://example.com/"});

    console.log(input1, res1.statusCode, res1.message, res2.statusCode, res2.message);

}).catch(err => {
    console.log(err);
});

```

console's output as follows

```bash
[ [Function: time],
  [Function: rp],
  [Function: timeEnd],
  [Function],
  [Function: logger],
  [Function: storer] ]

{"pid":89464,"hostname":"Cooper-X","level":30,"time":1506002581239,"msg":"req1 start at 2017-09-21T14:02:59.244Z end at 2017-09-21T14:03:01.235Z takes 1991 ms","v":1}

[ [Function: time],
  [Function: rp],
  [Function: timeEnd],
  [Function: logger],
  [Function: storer] ]

The file req1.txt has been saved!

{"pid":89464,"hostname":"Cooper-X","level":30,"time":1506002583225,"msg":"req2 start at 2017-09-21T14:03:01.244Z end at 2017-09-21T14:03:03.225Z takes 1981 ms","v":1}

{ url: 'http://example.com/',
  description: 'req1',
  time: 2017-09-21T14:02:59.244Z,
  timeEnd: 2017-09-21T14:03:01.235Z } 200 'OK' 200 undefined

The file req2.txt has been saved!

```

## Tests

```bash
no scripts
```

## Contributing

...

[npm-image]: https://img.shields.io/npm/v/node-ware.svg
[npm-url]: https://www.npmjs.com/package/node-ware