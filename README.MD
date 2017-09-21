node-ware
=========

middleware for nodejs

## Installation

  `npm i node-ware`

## Usage

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
  

## Tests

  `no scripts`

## Contributing

N/A at present