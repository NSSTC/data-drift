# data-drift
**Extensively configurable and stateful data-transformation-stream builder**

Have you ever built a data pipeline, just to find out that the order of
your transformers might change during runtime? But how to do something
like that? Thankfully, data-drift comes to the rescue!

Data-drift is a highly configurable pipeline builder, which allows you to
add different segments and re-organize them. On top of that, everything is
built on top of Object Streams, which means you can add a state to the
streams. In short, you can have one pipeline and send different data
through it, which you can easily distinguish thanks to the state.

As an additional bonus, data-drift makes use of monadic
[Results](https://www.npmjs.com/package/result-js) and
[Options](https://www.npmjs.com/package/roption-js),
which results in superior error-management and better performance
(in error cases), as nothing has to unwind with try..catch.

**You can find the complete API, as defined in code, below the examples!**


## Installation

Data-drift requires Node.JS v6+.
For fast install-times, I recommend using npm v5+.

```sh
$ npm i data-drift
```


## Simple Example

```js
'use strict';

const Stream = require('stream');
const DD = require('data-drift');


const pipeline = new DD();

// create one source, one drain and n transformers.
// everything has to be in Object Mode, so we cannot simply use stdin and stdout.
const source = new Stream.Readable({ objectMode: true, });
const drain = new Stream.Writable({ objectMode: true, });
const trans = new Stream.Transform({ objectMode: true, });

// the source has to emit an object you want to use in your pipeline
source._read = function() {
    const input = process.stdin.read();
    if (input !== null) {
        this.push({
            state: {},
            data: input,
        });
    }
};

process.stdin.on('data', data => {
    source.push({
        state: {},
        data: data.toString(),
    });
});

// don't forget to always pass the initial object
trans._transform = function(data, _, cb) {
    data.data = `You just inputted "${data.data.replace(/\r?\n?$/, '')}"!\n`;
    cb(null, data);
};

// the drain can consume the object in any way it wants,
// for example write it to your HTTP server as response.
drain._write = function (data) {
    process.stdout.write(data.data);
};

// when using data-drift, you have to register all pieces
// you can register new workers any time you want
// however, there can only be one source and one drain at a time!
pipeline.registerSegment(DD.SegmentTypes.SOURCE, source);
pipeline.registerSegment(DD.SegmentTypes.DRAIN, drain);
pipeline.registerSegment(DD.SegmentTypes.WORKER, trans);
// add as many transformers as you like and hot-re-order them later on :)

// then start the pipeline
pipeline.buildPipeline();

```


## Usage

### Create New Pipeline

```js
'use strict';

const Stream = require('stream');
const DD = require('data-drift');


const pipeline = new DD();

// create one source, one drain and n transformers.
// everything has to be in Object Mode, so we cannot simply use stdin and stdout.
const source = new Stream.Readable({ objectMode: true, });
const drain = new Stream.Writable({ objectMode: true, });
const trans = new Stream.Transform({ objectMode: true, });
const trans2 = new Stream.Transform({ objectMode: true, });

// the source has to emit an object you want to use in your pipeline
source._read = function() {
    const input = process.stdin.read();
    if (input !== null) {
        this.push({
            state: {},
            data: input,
        });
    }
};

// the source can be fed manually
process.stdin.on('data', data => {
    source.push({
        state: {},
        data: data.toString(),
    });
});

// don't forget to always pass the initial object
trans._transform = function(data, _, cb) {
    data.data = `You just inputted "${data.data.replace(/\r?\n?$/, '')}"!`;
    cb(null, data);
};

trans2._transform = function(data, _, cb) {
    data.data += ' ~ ';
    data.state.foo = 'FOO';
    cb(null, data);
};

// the drain can consume the object in any way it wants,
// for example write it to your HTTP server as response.
drain._write = function (data, _, cb) {
    process.stdout.write(`Data: "${data.data}" State: ${JSON.stringify(data.state)}\n`);
    cb();
};

// ...

```


### Register Segments

```js
// ...

// when using data-drift, you have to register all pieces
// you can register new workers any time you want
// however, there can only be one source and one drain at a time!
pipeline.registerSegment(DD.SegmentTypes.SOURCE, source);
pipeline.registerSegment(DD.SegmentTypes.DRAIN, drain);
const transformer1 = pipeline.registerSegment(DD.SegmentTypes.WORKER, trans).unwrap();
const transformer2 = pipeline.registerSegment(DD.SegmentTypes.WORKER, trans2).unwrap();
// add as many transformers as you like and hot-re-order them later on :)

//...

```


### Start Pipeline

```js
// ...

// then start the pipeline
pipeline.buildPipeline();

//...

```


### Re-Order Segment

```js
// ...

// type something, wait 10s, type again to see the difference
setTimeout(() => {
    console.log('Swap transformers...');

    // the first position (after a source, if available) has the index 0
    pipeline.setSegmentPosition(transformer2, 0);

    // the next line is implicit, since all subsequent segments are pushed to the next position
    //pipeline.setSegmentPosition(transformer1, 1);
}, 10000);

```


## API

The interface below includes Exceptions,
however all methods are fully implemented and will not throw.
The Exceptions are in place in order to provide you a clear, non-cluttered API overview.

```js
class DataDrift {
    static get SegmentType() {
        return {
            SOURCE: 0b001,
            WORKER: 0b010,
            DRAIN:  0b100,
        };
    };

    constructor() { super({ objectMode: true, }); this._init(); };

    /**
     * Build pipeline and make it start working.
     * You only have to call this method once to kick off the pipeline.
     *
     * @returns {boolean} true if the process was successful. If a source or drain is missing, false is returned.
     */
    buildPipeline() { throw new Error('Not implemented: DataDrift.buildPipeline'); };

    /**
     * Get position of a segment in the chain
     *
     * @param {object} segment
     * @returns {Option<number>}
     */
    getSegmentPosition(segment) { throw new Error('Not implemented: DataDrift.getSegmentPosition'); };

    /**
     * Change the position of one of the worker segments
     *
     * @param {number} segment segment ID
     * @param {number} position new position, whereas 0 is the first index (after a source, if available)
     */
    setSegmentPosition(segment, position) { throw new Error('Not implemented: DataDrift.setSegmentPosition'); };

    /**
     * Register a new segment.
     * Can return the following errnos in an Err:
     *   EPARAMETER: Either the type or the segment were not specified correctly.
     *   ESOURCEALREADYREGISTERED: A source has already been registered before. There can only be one source.
     *   EDRAINALREADYREGISTERED: A drain has already been registered before. There can only be one drain.
     *   ESOURCEMUSTBEREADABLESTREAM: A source must be derived from a readable stream.
     *   EDRAINMUSTBEWRITABLESTREAM: A drain must be derived from a writable stream.
     *   ECREATEITEM
     *
     * @param {SegmentType} type
     * @param {function} segment
     * @returns {Result<number,VError>} segment ID as used by the Drift
     */
    registerSegment(type, segment) { throw new Error('Not implemented: DataDrift.registerSegment'); };

    /**
     * Unregister a segment from the pipeline
     *
     * @param {number} segment segment ID
     */
    unregisterSegment(segment) { throw new Error('Not implemented: DataDrift.unregisterSegment'); };

    /**
     * Check if the pipeline has a certain segment type
     *
     * @param {SegmentType} type
     * @returns {boolean}
     */
    hasSegmentType(type) { throw new Error('Not implemented: DataDrift.hasSegmentType'); };
};

```
