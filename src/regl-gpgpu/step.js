/**
 * GPGPU ping-pong buffers, update step.
 */

import { positions as defaultPositions } from '../screen';
import { map, each, wrapGet, wrapIndex } from '../util/array';
import { macroGPGPUStepPass } from './macros';
import { getGPGPUUniforms } from './inputs.js';

import defaultVert from '../screen/index.vert.glsl';

// Different modes of time-stepping (frame-time, real-time, constant-step).
export const timings = ['tick', 'time', 1000/60];
export const defaultTiming = timings[0];

/**
 * Creates a GPGPU update step function, for use with a GPGPU setup/state object.
 *
 * @todo Optional transform feedback functionality instead of GPGPU textures
 *     functionality, where available (needs vertex draw, instead of texture draw).
 * @todo Optional multi-buffer-rendering, where available.
 * @todo Make this fully extensible in setup.
 *
 * @see [getGPGPUSetup]{@link ./setup.js#getGPGPUSetup}
 * @see [macroGPGPUStepPass]{@link ./macros.js#macroGPGPUStepPass}
 * @see [getGPGPUUniforms]{@link ./inputs.js#getGPGPUUniforms}
 *
 * @export
 * @param {regl} regl The `regl` instance to use.
 * @param {object} setup An initial object of GPGPU state data and resources. See
 *     `getGPGPUSetup`.
 *
 * @returns A GPGPU update step function, to be called with a GPGPU state to update it.
 */
export function getGPGPUStep(regl, setup, out = setup) {
    const {
            stepVert = defaultVert,
            stepFrag,
            stepPositions: positions = defaultPositions,
            stepUniforms: uniforms = getGPGPUUniforms(regl, setup, 1),
            timing = defaultTiming,
            // The initial time - `-1` for frame-time, or the current time for
            // real-time or constant-step. Should be reset if `out.timing` is changed.
            time = ((timing === 'tick')? 0 : regl.now()),
            groups: { passes }
        } = setup;

    // Set up the shaders needed for all the passes.
    const stepVerts = out.stepVerts = [];
    const stepFrags = out.stepFrags = [];
    const passSetup = {...setup};

    each((pass, p) => {
            passSetup.pass = p;

            const passMacros = macroGPGPUStepPass(passSetup);

            stepVerts[p] = passMacros+stepVert;
            stepFrags[p] = passMacros+stepFrag;
        },
        passes);

    const stepPositions = out.stepPositions = regl.buffer(positions);

    out.stepUniforms = uniforms;
    out.timing = timing;
    out.time = time;

    // Uses the full-screen vertex shader setup by default.
    const step = regl({
        vert: (c, { stepVert: v, stepVerts: vs, pass: p }) => (vs[p] || v),
        frag: (c, { stepFrag: f, stepFrags: fs, pass: p }) => (fs[p] || f),
        // vert: (c, props) => macroGPGPUStepPass(props)+(props.stepVert || defaultVert),
        // frag: (c, props) => macroGPGPUStepPass(props)+props.stepFrag,
        attributes: { position: (c, { stepPositions: p = stepPositions }) => p },
        uniforms,
        count: (c, { stepCount: count = positions.length*0.5 }) => count,
        depth: { enable: false },
        framebuffer: (c, { steps, step, pass, textures }) => wrapGet(step, steps)[pass]
    });

    let state;

    const withContext = (context) => {
        state.step++;

        const { onPass, groups: { passes }, timing = defaultTiming, time: t0 } = state;

        // Step the timer - add the constant-step, or update to the current tick/time.
        const t1 = state.time = ((isNaN(timing))? context[timing] : t0+timing);

        state.dt = t1-t0;

        each((pass, p) => {
                state.pass = p;
                step((onPass)? onPass(state) : state);
            },
            passes);

        return state;
    };

    return (props) => {
        state = props;
        regl.draw(withContext);
    };
}

export default getGPGPUStep;
