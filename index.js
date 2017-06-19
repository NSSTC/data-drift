'use strict';

module.exports = require('./interface/dd.h');
require('./src/dd._init.c');
require('./src/dd._rebuildPipeline.c');
require('./src/dd._write.c');
require('./src/dd.buildPipeline.c');
require('./src/dd.getSegmentPosition.c');
require('./src/dd.hasSegmentType.c');
require('./src/dd.registerSegment.c');
require('./src/dd.setSegmentPosition.c');
require('./src/dd.unregisterSegment.c');
