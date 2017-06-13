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

module.exports = class DataDrift {
    static get SegmentTypes() {
        return {
            SOURCE: 0b001,
            WORKER: 0b010,
            DRAIN:  0b100,
        };
    };

    constructor() { this._init(); };

    /**
     * Get position of a segment in the chain
     *
     * @param {object} segment
     * @returns {Option<number>}
     */
    getSegmentPosition(segment) { throw new Error('Not implemented: DataDrift.getSegmentPosition'); };
    setSegmentPosition() { throw new Error('Not implemented: DataDrift.setSegmentPosition'); };
    moveSegment() { throw new Error('Not implemented: DataDrift.moveSegment'); };

    /**
     * Register a new segment.
     * Can return the following errnos in an Err:
     *   EPARAMETER: Either the type or the segment were not specified correctly.
     *   ESOURCEALREADYREGISTERED: A source has already been registered before. There can only be one source.
     *   EDRAINALREADYREGISTERED: A drain has already been registered before. There can only be one drain.
     *   ECREATEITEM
     *
     * @param {SegmentTypes} type
     * @param {function} segment
     * @returns {Result<number,VError>} segment ID as used by the Drift
     */
    registerSegment(type, segment) { throw new Error('Not implemented: DataDrift.registerSegment'); };
    unregisterSegment() { throw new Error('Not implemented: DataDrift.unregisterSegment'); };
    hasSegmentType() { throw new Error('Not implemented: DataDrift.hasSegmentType'); };

    /**
     * work on data, given a complete queue
     * Can return the following errnos in an Err:
     *   ENOTREADY: The pipeline is missing important parts to function.
     *   EWORKERERROR
     *
     * @param data
     * @param state
     * @returns {Promise<Result<number,VError>>} Time for completion in ms
     */
    workOnData(data, state) { throw new Error('Not implemented: DataDrift.hasSegmentType'); };
};
