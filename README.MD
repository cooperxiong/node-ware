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


## Tests

```bash
no scripts
```

## Contributing

...