import { map, range, each, wrapGet, wrapIndex } from '../util/array';

/**
 * Common `regl` uniform inputs for GPGPU `step` and `draw`.
 *
 * @see [getGPGPUSetup]{@link ./setup.js#getGPGPUSetup}
 *
 * @export
 * @param {regl} regl The `regl` instance to use.
 * @param {object} setup The GPGPU setup to use - see `getGPGPUSetup`.
 * @param {number} bound The number of steps currently bound to outputs, and
 *     unavailable as inputs.
 *
 * @returns {object} The `regl` uniforms object for the given GPGPU `setup`.
 */
export function getGPGPUUniforms(regl, setup, bound = 0) {
    const uniforms = {
        step: regl.prop('step'),
        steps: regl.prop('steps.length'),
        stepsPast: (c, { steps: { length: s } }) => s-bound,
        pass: regl.prop('pass'),
        passes: regl.prop('passes.length'),
        dt: regl.prop('dt'),
        tick: regl.context('tick'),
        time: regl.context('time'),
        size: regl.prop('size.shape')
    };

    // Set up uniforms for the steps in the past [1...(steps-1)] of the current step.
    // Referenced as the number of steps into the past from the current step.

    const { steps: { length: numSteps }, groups: { textures: groupsTextures } } = setup;
    const numTextures = groupsTextures.length;

    const addTexture = (past, texture) =>
        uniforms[`states[${(past*numTextures)+texture}]`] =
            (c, { step, textures }) => {
                const s = wrapIndex(step+past+bound, textures);
                const out = wrapGet(step+past+bound, textures)[texture].texture;
                
                console.log('read:', {
                        b: (past*numTextures)+texture, s, texture, bound,
                        texture: wrapGet(step+past+bound, textures)[texture].number,
                        out
                    });

                return out;
            };

    for(let past = numSteps-bound; past >= 0; --past) {
        each((values, texture) => addTexture(past, texture), groupsTextures);
    }

    return uniforms;
}

export const numGPGPUPairIndices = ({ steps: { length: s }, size: { index: i } }) =>
    (s-1)*2*i;

export const getGPGPUDrawIndices = (regl, setup) => (setup.indices ||
    regl.buffer(map((v, i) => i, range(numGPGPUPairIndices(setup)), 0)));
