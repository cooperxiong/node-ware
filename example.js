/**
 * Created by Cooper on 2017/09/21.
 */

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

let time = function (input) {
    input.time = new Date();
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

let timeEnd = function (input) {
    input.timeEnd = new Date();
    return input
};

let logger = function (input) {
    log.info(`${input.description} start at ${input.time.toISOString()} end at ${input.timeEnd.toISOString()} takes ${input.timeEnd - input.time} ms`);
    return input
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
