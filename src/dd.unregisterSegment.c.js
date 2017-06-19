'use strict';

const Option = require('rustify-js').Option;

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype.unregisterSegment = function ($segment) {
    let item = Option.fromGuess(this[sym.list].head);
    while (item.isSome()) {
        item = item.unwrap();
        if (item.id === $segment) {
            item.detach();
            if (item.type !== h.SegmentType.DRAIN) {
                item.task.unpipe();
            }

            if (
                item.type === h.SegmentType.SOURCE
                || item.type === h.SegmentType.DRAIN
                || !this.hasSegmentType(h.SegmentType.WORKER)
            ) {
                this[sym.workable] = false;
            }

            this._rebuildPipeline();
            break;
        }

        item = Option.fromGuess(item.next);
    }
};
