'use strict';

const LinkedList = require('linked-list');
const Option = require('rustify-js').Option;

const DataDrift = require('./dd.h');
const sym = require('./dd-sym.h');

let idCounter = 0;


/**
 * List-Item for blocking tasks
 *
 * @type {WorkflowItem}
 */
module.exports.WorkflowItem = class WorkflowItem extends LinkedList.Item {

    /**
     * Constructor
     * The type has to be one of {DataDrift.SegmentTypes}
     *
     * @throws if $type does not contain one of {DataDrift.SegmentTypes} or $task is not a callable
     * @param {DataDrift.SegmentTypes} $type
     * @param {function(Object)} $task
     */
    constructor($type, $task) {
        super();

        if (// todo: NodeJSv8+ Object.values(DataDrift.SegmentTypes).includes($type)
            Object
                .keys(DataDrift.SegmentTypes)
                .map(item => DataDrift.SegmentTypes[item])
                .indexOf($type)
                < 0
        ) {
            throw new Error('The WorkflowItem type has to contain one of {DataDrift.SegmentTypes}!');
        }

        if (typeof $task !== 'function') {
            throw new Error('The WorkflowItem task has to be a callable!');
        }

        this.type = $type;

        /**
         * The function which represents a task in a (blocking) workflow.
         * The function will receive the whole state and data by ref.
         * If it needs to run asynchonous tasks, it may return a Promise.
         *
         * @throws on rejected Promise
         * @param {Object.<{state, data}>} $item
         * @returns {Promise|undefined}
         */
        this.task = $task;

        this[sym.itemID] = idCounter++;
    };

    get id() {
        return this[sym.itemID];
    };
};

/**
 * List-Item for streaming tasks
 *
 * @type {PipelineItem}
 */
module.exports.PipelineItem = class PipelineItem extends LinkedList.Item {
    constructor() {
        super();
    };
};
