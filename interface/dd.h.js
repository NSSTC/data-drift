'use strict';

//                                          ...
//                       s,                .                    .s
//                        ss,              . ..               .ss
//                        'SsSs,           ..  .           .sSsS'
//                         sSs'sSs,        .   .        .sSs'sSs
//                          sSs  'sSs,      ...      .sSs'  sSs
//                           sS,    'sSs,         .sSs'    .Ss
//                           'Ss       'sSs,   .sSs'       sS'
//                  ...       sSs         ' .sSs'         sSs       ...
//                 .           sSs       .sSs' ..,       sSs       .
//                 . ..         sS,   .sSs'  .  'sSs,   .Ss        . ..
//                 ..  .        'Ss .Ss'     .     'sSs. ''        ..  .
//                 .   .         sSs '       .        'sSs,        .   .
//                  ...      .sS.'sSs        .        .. 'sSs,      ...
//                        .sSs'    sS,     .....     .Ss    'sSs,
//                     .sSs'       'Ss       .       sS'       'sSs,
//                  .sSs'           sSs      .      sSs           'sSs,
//               .sSs'____________________________ sSs ______________'sSs,
//            .sSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS'.Ss SSSSSSSSSSSSSSSSSSSSSs,
//                                    ...         sS'
//                                     sSs       sSs
//                                      sSs     sSs
//                                       sS,   .Ss
//                                       'Ss   sS'
//                                        sSs sSs
//                                         sSsSs
//                                          sSs
//                                           s

const Stream = require('stream');


module.exports = class DataDrift extends Stream.Writable {
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
