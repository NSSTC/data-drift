#!/usr/bin/env node

'use strict';

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


const DD = require('.');
const stream = require('stream');

TAP.test('Test simple queue', $t => {
    $t.plan(4);

    const dd = new DD();
    dd.registerSegment(DD.SegmentTypes.SOURCE, state => {
        state.foo = true;
        return 'Hellow ';
    });

    dd.registerSegment(DD.SegmentTypes.DRAIN, (state, data) => {
        $t.ok(state.foo, 'Check state consistency');
        $t.ok(state.bar, 'Check state consistency');
        $t.equal(data, 'Hellow World!', 'Check data consistency');
    });

    dd.registerSegment(DD.SegmentTypes.WORKER, (state, data) => {
        state.bar = true;
        return Promise.resolve(data + 'World!');
    });

    dd.workOnData().then($r => {
        if ($r.isOk()) {
            $t.ok($r.unwrap() > 0, 'Check result (' + $r.unwrap() + 'ms elapsed!)');
        }
        else {
            $t.fail($r.unwrapErr().toString());
        }

        $t.end();
    }, $e => {
        $t.fail($e.toString());
    });
});
