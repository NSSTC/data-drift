'use strict';

const sym = require('../interface/dd-sym.h');
const LinkedList = require('linked-list');


require('../interface/dd.h').prototype._init = function() {
    this[sym.list] = new LinkedList();
    this[sym.workable] = false;
};
