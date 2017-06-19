'use strict';

const Option = require('rustify-js').Option;

const h = require('../interface/dd.h');

//todo: implement error check and $cb
h.prototype._write = function ($data, _, $cb) {
    throw new VError({
        name: "Not fully implemented",
        cause: new Error('This feature has not been fully implemented, sorry.'),
        info: {
            errno: 'ENOTIMPLEMENTED',
        },
    });

    if (typeof $data !== 'object') {
        this.workOnData($data).unwrap();
    }
    else {
        if (
            Option.fromGuess($data.state).isSome()
            && Option.fromGuess($data.data).isSome()
        ) {
            this.workOnData($data.data, $data.state).unwrap();
        }
        else {
            this.workOnData($data).unwrap();
        }
    }
};
