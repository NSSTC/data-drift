'use strict';

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype.hasSegmentType = function ($type) {
    if ($type === h.SegmentType.SOURCE) {
        return this[sym.list].head && this[sym.list].head.type === $type;
    }

    if ($type === h.SegmentType.DRAIN) {
        return this[sym.list].tail && this[sym.list].tail.type === $type;
    }

    return this[sym.list].head
        && this[sym.list].head.next
        && this[sym.list].head.next.type === $type;
};
