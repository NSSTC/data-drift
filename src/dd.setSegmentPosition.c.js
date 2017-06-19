'use strict';

const Option = require('rustify-js').Option;

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype.setSegmentPosition = function ($segment, $position) {
    let item = this[sym.list].head;
    let oldSub = null;
    let success = false;
    while (Option.fromGuess(item).isSome()) {
        if (item.id === $segment) {
            if (item.type !== h.SegmentType.WORKER) {
                return;
            }

            oldSub = item.next;
            item.detach();
            let i = 0;
            let posItem = this[sym.list].head;
            while (Option.fromGuess(posItem).isSome()) {
                if (posItem.type === h.SegmentType.SOURCE) {
                    posItem = posItem.next;
                    continue;
                }

                if (i++ === $position) {
                    posItem.prepend(item);
                    success = true;
                    break;
                }

                posItem = posItem.next;
            }

            break;
        }

        item = item.next;
    }

    if (success) {
        this._rebuildPipeline();
    }
    else {
        oldSub.prepend(item);
    }
};
