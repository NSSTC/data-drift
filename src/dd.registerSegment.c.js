'use strict';

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
        // todo: NodeJSv8+ Object.values(h.SegmentTypes).includes(type.unwrap())
        || Object
            .keys(h.SegmentTypes)
            .map(item => h.SegmentTypes[item])
            .indexOf(type.unwrap())
            < 0
        || segment.isNone()
        || typeof segment.unwrap() !== 'function'
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

    if (
        $type === h.SegmentTypes.SOURCE
        && headType === h.SegmentTypes.SOURCE
    ) {
        return Result.fromError(new VError({
            name: 'RegisterError',
            cause: new Error('A source has already been registered before. There can only be one source.'),
            info: {
                errno: 'ESOURCEALREADYREGISTERED',
            },
        }));
    }

    const tailType = Option
        .fromGuess(this[sym.list].tail)
        .or({ type: 0, })
        .type;

    if (
        $type === h.SegmentTypes.DRAIN
        && tailType === h.SegmentTypes.DRAIN
    ) {
        return Result.fromError(new VError({
            name: 'RegisterError',
            cause: new Error('A drain has already been registered before. There can only be one drain.'),
            info: {
                errno: 'EDRAINALREADYREGISTERED',
            },
        }));
    }

    const tryItem = Result.fromTry(
        () => { return new Item.WorkflowItem($type, $segment); }
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
        case h.SegmentTypes.SOURCE: {
            this[sym.list].prepend(newItem);
            if (tailType === h.SegmentTypes.DRAIN) {
                this[sym.workable] = true;
            }

            break;
        }

        case h.SegmentTypes.WORKER: {
            if (tailType === h.SegmentTypes.DRAIN) {
                this[sym.list].tail.prepend(newItem);
            }
            else {
                this[sym.list].append(newItem);
            }

            break;
        }

        case h.SegmentTypes.DRAIN: {
            this[sym.list].append(newItem);
            if (headType === h.SegmentTypes.SOURCE) {
                this[sym.workable] = true;
            }

            break;
        }
    }

    return Result.fromSuccess(newItem.id);
};
