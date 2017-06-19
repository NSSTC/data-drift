'use strict';

const LinkedList = require('linked-list');
const Option = require('rustify-js').Option;

const DataDrift = require('./dd.h');
const sym = require('./dd-sym.h');

let idCounter = 0;


/**
 * List-Item for blocking tasks
 *
 * @type {WorkerItem}
 */
module.exports.WorkerItem = class WorkflowItem extends LinkedList.Item {

    /**
     * Constructor
     * The type has to be one of {DataDrift.SegmentType}
     *
     * @throws if $type does not contain one of {DataDrift.SegmentType} or $task is not a callable
     * @param {DataDrift.SegmentType} $type
     * @param {function(Object)} $task
     */
    constructor($type, $task) {
        super();

        if (// todo: NodeJSv8+ Object.values(DataDrift.SegmentType).includes($type)
            Object
                .keys(DataDrift.SegmentType)
                .map(item => DataDrift.SegmentType[item])
                .indexOf($type)
                < 0
        ) {
            throw new Error('The WorkerItem type has to contain one of {DataDrift.SegmentType}!');
        }

        //if (typeof $task !== 'function') {
        //    throw new Error('The WorkerItem task has to be a callable!');
        //}

        this.type = $type;

        /**
         * @type {Stream|Readable|Writable|Transform}
         */
        this.task = $task;

        this[sym.itemID] = idCounter++;
    };

    get id() {
        return this[sym.itemID];
    };
};
