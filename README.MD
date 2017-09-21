node-ware
=========

middleware for nodejs

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

```js

const co = require('co');
const fs = require('fs');
const log = require('pino')();
const Ware = require('node-ware');
const request = require('request');

let wrequest = new Ware();

let proxy = function (input) {
    input.proxy = "http://8.8.8.8:8080";
    return input
};

let logger = function (input) {
    log.info(`${input.description} start at ${input.time.toISOString()} end at ${input.timeEnd.toISOString()} takes ${input.timeEnd - input.time} ms`);
    return input
};

let time = function (input) {
    input.time = new Date();
    return input
};

let timeEnd = function (input) {
    input.timeEnd = new Date();
    return input
};

let rp = function (input, output) {
    return new Promise(function (resolve, reject) {
        request(input, function (err, res) {
            if (err) {
                reject(err)
            } else {
                setTimeout(() => {
                    resolve([input, output = res])
                }, 1000)
            }
        })
    })
};

function store(input, output) {
    fs.writeFile(input.description + '.txt', output.body, (err) => {
        if (err) throw err;
        console.log('The file ' + input.description + '.txt has been saved!');
    });
}

wrequest
    .use(time)
    .use(() => console.log('test ======='))
    .use(rp)
    .use(timeEnd)
    .use(logger)
    .use(store);

co(function* () {

    console.log(wrequest.hold());

    let [, res1] = yield wrequest
        .pre((input) => Object.assign(input, {description: 'req1'}))
        .run({url: "http://example.com/"});

    console.log(wrequest.hold());

    let [, res2] = yield wrequest
        .pre((input) => Object.assign(input, {description: 'req2'}))
        .run({url: "http://example.com/"});

    console.log(res1.statusCode, res2.statusCode);

}).catch(err => {
    console.log(err);
});

```

console's output as follows

```bash
[ [Function: time],
  [Function],
  [Function: rp],
  [Function: timeEnd],
  [Function: logger],
  [Function: store] ]
  
test =======

{"pid":2632,"hostname":"Cooper","level":30,"time":1505979099084,"msg":"req1 start at 2017-09-21T07:31:37.879Z end at 2017-09-21T07:31:39.082Z takes 1203 ms","v":1}

[ [Function: time],
  [Function: rp],
  [Function: timeEnd],
  [Function: logger],
  [Function: store] ]  // Anonymous function will be remove after running
  
The file req1.txt has been saved!

{"pid":2632,"hostname":"Cooper","level":30,"time":1505979100226,"msg":"req2 start at 2017-09-21T07:31:39.087Z end at 2017-09-21T07:31:40.226Z takes 1139 ms","v":1}

200 200

The file req2.txt has been saved!

```


## Tests

```bash
no scripts
```

## Contributing

...