'use strict';

const Stream = require('stream');

const Option = require('rustify-js').Option;
const Result = require('rustify-js').Result;
const VError = require('verror');

const h = require('../interface/dd.h');
const Item = require('../interface/dd-item.h');
const sym = require('../interface/dd-sym.h');


h.prototype.registerSegment = function ($type, $segment) {
    let type = Option.fromGuess($type);
    let segment = Option.fromGuess($segment);

    if (
        type.isNone()
        // todo: NodeJSv8+ Object.values(h.SegmentType).includes(type.unwrap())
        || Object
            .keys(h.SegmentType)
            .map(item => h.SegmentType[item])
            .indexOf(type.unwrap())
            < 0
        || segment.isNone()
        // todo: also check the segment argument-count against the type
    ) {
        return Result.fromError(new VError({
            name: 'RegisterError',
            cause: new Error('Either the type or the segment were not specified correctly.'),
            info: {
                errno: 'EPARAMETER',
                params: {
                    type: $type,
                    segment: $segment,
                },
            },
        }));
    }

    const headType = Option
        .fromGuess(this[sym.list].head)
        .or({ type: 0, })
        .type;

    const tailType = Option
        .fromGuess(this[sym.list].tail)
        .or({ type: 0, })
        .type;

    const tryItem = Result.fromTry(
        () => { return new Item.WorkerItem($type, $segment); }
    );

    if (tryItem.isErr()) {
        return Result.fromError(new VError({
            name: 'CreateItemError',
            cause: tryItem.unwrapErr(),
            info: {
                errno: 'ECREATEITEM',
            }
        }));
    }

    const newItem = tryItem.unwrap();
    switch ($type) {
        case h.SegmentType.SOURCE: {
            if (headType === h.SegmentType.SOURCE) {
                return Result.fromError(new VError({
                    name: 'RegisterError',
                    cause: new Error('A source has already been registered before. There can only be one source.'),
                    info: {
                        errno: 'ESOURCEALREADYREGISTERED',
                    },
                }));
            }

            if (!($segment instanceof Stream.Readable)) {
                return Result.fromError(new VError({
                    name: 'RegisterError',
                    cause: new Error('A source must be derived from a readable stream.'),
                    info: {
                        errno: 'ESOURCEMUSTBEREADABLESTREAM',
                    },
                }));
            }

            this[sym.list].prepend(newItem);
            if (tailType === h.SegmentType.DRAIN) {
                this[sym.workable] = true;
            }

            break;
        }

        case h.SegmentType.WORKER: {
            if (tailType === h.SegmentType.DRAIN) {
                this[sym.list].tail.prepend(newItem);
            }
            else {
                this[sym.list].append(newItem);
            }

            break;
        }

        case h.SegmentType.DRAIN: {
            if (tailType === h.SegmentType.DRAIN) {
                return Result.fromError(new VError({
                    name: 'RegisterError',
                    cause: new Error('A drain has already been registered before. There can only be one drain.'),
                    info: {
                        errno: 'EDRAINALREADYREGISTERED',
                    },
                }));
            }

            if (!($segment instanceof Stream.Writable)) {
                return Result.fromError(new VError({
                    name: 'RegisterError',
                    cause: new Error('A drain must be derived from a writable stream.'),
                    info: {
                        errno: 'EDRAINMUSTBEWRITABLESTREAM',
                    },
                }));
            }

            this[sym.list].append(newItem);
            if (headType === h.SegmentType.SOURCE) {
                this[sym.workable] = true;
            }

            break;
        }
    }

    return Result.fromSuccess(newItem.id);
};
