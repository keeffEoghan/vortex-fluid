import { map, range, each, wrapGet, wrapIndex } from '../util/array';

/**
 * Common `regl` uniform inputs for GPGPU `step` and `draw`.
 *
 * @see [getGPGPUState]{@link ./state.js#getGPGPUState}
 *
 * @export
 * @param {regl} regl The `regl` instance to use.
 * @param {object} state The GPGPU state to use - see `getGPGPUState`.
 * @param {number} [bound=1] The number of steps bound to outputs, and unavailable as
 *     inputs.
 *
 * @returns {object} The `regl` uniforms object for the given GPGPU `state`.
 */
export function getGPGPUUniforms(regl, state, bound = 1) {
    const cache = {
        viewShape: [0, 0]
    };

    // @todo Move non-generic things out of here.
    const uniforms = {
        stepNow: regl.prop('step'),
        steps: regl.prop('steps.length'),
        stepsPast: (c, { steps: { length: s } }) => s-bound,
        passNow: regl.prop('pass'),
        passes: regl.prop('passes.length'),
        dt: regl.prop('dt'),
        stepTime: regl.prop('stepTime'),
        tick: regl.context('tick'),
        time: regl.context('time'),
        dataShape: regl.prop('size.shape'),
        viewShape: ({ viewportWidth: w, viewportHeight: h }) => {
            const { viewShape: s } = cache;

            s[0] = w;
            s[1] = h;

            return s;
        }
    };

    // Set up uniforms for the steps in the past [1...(steps-1)] of the current step.
    // Referenced as the number of steps into the past from the current step.

    const { steps: { length: numSteps }, groups: { textures: groupsTextures } } = state;
    const numTextures = groupsTextures.length;

    const addTexture = (past, texture) =>
        uniforms[`states[${(past*numTextures)+texture}]`] = (c, { step, textures }) =>
                wrapGet(step+past+bound, textures)[texture].texture;

    for(let past = numSteps-1-bound; past >= 0; --past) {
        each((values, texture) => addTexture(past, texture), groupsTextures);
    }

    return uniforms;
}

export const numGPGPUPairIndices =
    ({ steps: { length: s }, size: { index: i } }, bound = 0) => (s-1-bound)*2*i;

export const getGPGPUDrawIndices = (regl, state, bound = 0) =>
    map((v, i) => i, range(numGPGPUPairIndices(state, bound)), 0);
