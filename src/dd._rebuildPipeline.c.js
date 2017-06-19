'use strict';

const Option = require('rustify-js').Option;

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype._rebuildPipeline = function () {
    let item = this[sym.list].head;
    while (
        Option
            .fromGuess(item)
            .isSome()
    ) {
        if (item.type !== h.SegmentType.DRAIN) {
            item.task.unpipe();
        }

        item = item.next;
    }

    if (
        !this[sym.workable]
        || !this[sym.hasBeenBuilt]
    ) {
        return;
    }

    item = this[sym.list].head;
    let nextItem = this[sym.list].head.next;
    while (
        Option
            .fromGuess(nextItem)
            .isSome()
    ) {
        item.task.unpipe();
        item.task.pipe(nextItem.task);
        item = nextItem;
        nextItem = nextItem.next;
    }
};
