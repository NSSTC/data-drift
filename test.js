#!/usr/bin/env node

'use strict';

const Stream = require('stream');

const TAP    = require('tap');

TAP.test('Test interface', $t => {

    const _interface = require('./interface/dd.h');
    require('./src/dd._init.c');
    const tmp = new _interface();

    const funs = Object.getOwnPropertyNames(_interface).concat(Object.getOwnPropertyNames(_interface.prototype));

    $t.plan(funs.length);

    funs.forEach($fun => {

        if ($fun === 'constructor' || $fun === '_init') {

            $t.pass($fun + ' is always defined');
            return;
        }

        if (typeof tmp[$fun] === 'function') {

            $t.throws(tmp[$fun].bind(tmp), 'Check Interface ' + $fun + ' throw');
            return;
        }

        if (typeof _interface[$fun] === 'function') {

            $t.throws(_interface[$fun].bind(tmp), 'Check Interface ' + $fun + ' throw');
            return;
        }

        $t.pass($fun + ' is not a function');
    });

    $t.end();
});

/**
 * @type {DataDrift}
 */
const DD = require('.');
const stream = require('stream');
const dd = new DD();
const segmentIDs = {
    source: -1,
    trans1: -1,
    trans2: -1,
    drain: -1,
};

const source = new Stream.Readable({
    objectMode: true,
});

const drain = new Stream.Writable({
    objectMode: true,
});

const trans1 = new Stream.Transform({
    objectMode: true,
});

const trans2 = new Stream.Transform({
    objectMode: true,
});

TAP.test('Test simple queue creation', $t => {
    $t.plan(13);

    source._read = () => {
        return {
            state: { foo: true, },
            data: 'Hellow ',
        }
    };

    source.push({
        state: { foo: true, },
        data: 'Hellow ',
    });

    drain._write = ($data, _, $cb) => {
        $t.ok($data.state.foo, 'Check state consistency foo');
        $t.ok($data.state.bar, 'Check state consistency bar');
        $t.equal($data.data, 'Hellow World!~ ', 'Check data consistency');
        $cb();
        $t.end();
    };

    trans1._transform = ($data, _, $cb) => {
        $data.state.bar = true;
        $data.data += 'World!';
        $cb(null, $data);
    };

    trans2._transform = ($data, _, $cb) => {
        $data.data += '~ ';
        $cb(null, $data);
    };

    const regSourceRes = dd.registerSegment(DD.SegmentType.SOURCE, source);
    const regDrainRes = dd.registerSegment(DD.SegmentType.DRAIN, drain);
    const regTrans1Res = dd.registerSegment(DD.SegmentType.WORKER, trans1);
    const regTrans2Res = dd.registerSegment(DD.SegmentType.WORKER, trans2);

    $t.ok(regSourceRes.isOk(), 'Check Source creation');
    $t.ok(regDrainRes.isOk(), 'Check Drain creation');
    $t.ok(regTrans1Res.isOk(), 'Check Transformer 1 creation');
    $t.ok(regTrans2Res.isOk(), 'Check Transformer 2 creation');

    $t.ok(dd.hasSegmentType(DD.SegmentType.SOURCE), 'Check if segment type SOURCE exists');
    $t.ok(dd.hasSegmentType(DD.SegmentType.DRAIN), 'Check if segment type DRAIN exists');
    $t.ok(dd.hasSegmentType(DD.SegmentType.WORKER), 'Check if segment type WORKER exists');

    segmentIDs.source = regSourceRes.unwrap();
    segmentIDs.drain = regDrainRes.unwrap();
    segmentIDs.trans1 = regTrans1Res.unwrap();
    segmentIDs.trans2 = regTrans2Res.unwrap();

    $t.equal(dd.getSegmentPosition(segmentIDs.trans1).unwrap(), 0, 'Check trans1 position');
    $t.equal(dd.getSegmentPosition(segmentIDs.trans2).unwrap(), 1, 'Check trans2 position');

    $t.ok(dd.buildPipeline(), 'Check Pipeline build ok');
});

TAP.test('Test hot-changing', $t => {
    $t.plan(3);

    drain._write = ($data, _, $cb) => {
        $t.equal($data.data, 'Hellow ~ World!', 'Check data consistency');
        $cb();
        $t.end();
    };

    dd.setSegmentPosition(segmentIDs.trans2, 0);
    source.push({
        state: { foo: true, },
        data: 'Hellow ',
    });

    $t.equal(dd.getSegmentPosition(segmentIDs.trans1).unwrap(), 1, 'Check trans1 position');
    $t.equal(dd.getSegmentPosition(segmentIDs.trans2).unwrap(), 0, 'Check trans2 position');
});

TAP.test('Unregister segments', $t => {
    $t.plan(1);

    dd.unregisterSegment(segmentIDs.source);
    $t.notOk(dd.hasSegmentType(DD.SegmentType.SOURCE), 'Check if segment type SOURCE exists');

    $t.end();
});

TAP.test('Destroy pipeline', $t => {
    $t.plan(0);

    source.unpipe();
    trans1.unpipe();
    trans2.unpipe();

    $t.end();
});
