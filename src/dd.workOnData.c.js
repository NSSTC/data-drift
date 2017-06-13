'use strict';

const defer = require('promise-defer');
const Option = require('rustify-js').Option;
const Result = require('rustify-js').Result;
const VError = require('verror');

const h = require('../interface/dd.h');
const sym = require('../interface/dd-sym.h');


h.prototype.workOnData = function ($data, $state) {
    if (!this[sym.workable]) {
        return Promise.reject(Result.fromError(new VError({
            name: 'NotReadyError',
            cause: new Error('The pipeline is missing important parts to function.'),
            info: {
                errno: 'ENOTREADY',
            },
        })));
    }

    const d = defer();
    let data = Option.fromGuess($data).or('');
    let state = Option.fromGuess($state).or({});
    state[sym.elapsedTime] = new Date();

    handleWork(this[sym.list].head, state, data, d);

    return d.promise;
};

function handleWork($item, $state, $data, $defer) {
    const result = $item.task($state, $data);
    if (result instanceof Promise) {
        result.then($r => {
            if (Option.fromGuess($item.next).isSome()) {
                handleWork($item.next, $state, $r, $defer);
            }
            else {
                $defer.resolve(Result.fromSuccess((new Date()) - $state[sym.elapsedTime]));
            }
        }, $e => {
            $defer.reject(Result.fromError(new VError({
                name: 'WorkerError',
                cause: $e instanceof Error ? $e : new Error($e),
                info: {
                    errno: 'EWORKERERROR',
                },
            })));
        });
    }
    else {
        if (Option.fromGuess($item.next).isSome()) {
            handleWork($item.next, $state, result, $defer);
        }
        else {
            $defer.resolve(Result.fromSuccess((new Date()) - $state[sym.elapsedTime]));
        }
    }
}
