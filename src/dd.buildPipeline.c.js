'use strict';

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype.buildPipeline = function () {
    if (!this[sym.workable]) {
        return false;
    }

    this[sym.hasBeenBuilt] = true;
    this._rebuildPipeline();
    return true;
};
