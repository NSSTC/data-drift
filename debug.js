'use strict';

const Stream = require('stream');

const DD = require('.');


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

process.stdin.on('data', data => {
    source.push({
        state: {
            timestamp: new Date(),
        },
        data: data.toString(),
    });
});

// don't forget to always pass the initial object
trans._transform = function(data, _, cb) {
    data.data = `You just inputted "${data.data.replace(/\r?\n?$/, '')}"!`;
    cb(null, data);
};

trans2._transform = function(data, _, cb) {
    data.data = data.data.replace(/\r?\n?$/, '');
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

drain.on('close', $d => { console.log('drain event ' + JSON.stringify($d)); });

// when using data-drift, you have to register all pieces
// you can register new workers any time you want
// however, there can only be one source and one drain at a time!
pipeline.registerSegment(DD.SegmentType.SOURCE, source);
pipeline.registerSegment(DD.SegmentType.DRAIN, drain);
const transformer1 = pipeline.registerSegment(DD.SegmentType.WORKER, trans).unwrap();
const transformer2 = pipeline.registerSegment(DD.SegmentType.WORKER, trans2).unwrap();
// add as many transformers as you like and hot-re-order them later on :)

// then start the pipeline
pipeline.buildPipeline();

// type something, wait 10s, type again to see the difference
setTimeout(() => {
    console.log('Swap transformers...');

    // the first position (after a source, if available) has the index 0
    pipeline.setSegmentPosition(transformer2, 0);

    // the next line is implicit, since all subsequent segments are pushed to the next position
    //pipeline.setSegmentPosition(transformer1, 1);
}, 10000);
