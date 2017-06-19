'use strict';

const Option = require('rustify-js').Option;

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype.getSegmentPosition = function ($segment) {
    let item = this[sym.list].head;
    let i = 0;
    while (
        Option
            .fromGuess(item)
            .isSome()
    ) {
        if (item.type !== h.SegmentType.WORKER) {
            item = item.next;
            continue;
        }

        if (item.id === $segment) {
            return Option.fromSome(i);
        }

        i++;
        item = item.next;
    }

    return Option.fromNone();
};
