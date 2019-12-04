/**
 * GPGPU ping-pong buffers, update step.
 */

import { positions as defaultPositions } from '@epok.tech/gl-screen-triangle';

import defaultVert from '@epok.tech/gl-screen-triangle/index.vert.glsl';

import { map, each, wrapGet, wrapIndex } from '../util/array';
import { macroGPGPUStepPass } from './macros';
import { getGPGPUUniforms } from './inputs.js';

// Different modes of time-stepping (frame-time, real-time, constant-step).
export const timings = ['tick', 'time', 1000/60];
export const defaultTiming = timings[0];

/**
 * Creates a GPGPU update step function, for use with a GPGPU state object.
 *
 * @todo Optional transform feedback functionality instead of GPGPU textures
 *     functionality, where available (needs vertex draw, instead of texture draw).
 * @todo Optional multi-buffer-rendering, where available.
 * @todo Make this fully extensible in state.
 *
 * @see [getGPGPUState]{@link ./state.js#getGPGPUState}
 * @see [macroGPGPUStepPass]{@link ./macros.js#macroGPGPUStepPass}
 * @see [getGPGPUUniforms]{@link ./inputs.js#getGPGPUUniforms}
 *
 * @export
 * @param {regl} regl The `regl` instance to use.
 * @param {object} state An initial object of GPGPU state data and resources. See
 *     `getGPGPUState`.
 *
 * @returns A GPGPU update step function, to be called with a GPGPU state to update it.
 */
export function getGPGPUStep(regl, state, out = state) {
    const {
            stepVert = defaultVert,
            stepFrag,
            stepPositions: positions = defaultPositions,
            stepUniforms: uniforms = getGPGPUUniforms(regl, state),
            timing = defaultTiming,
            // The initial time - `-1` for frame-time, or the current time for
            // real-time or constant-step. Should be reset if `out.timing` is changed.
            stepTime = ((timing === 'tick')? 0 : regl.now()),
            groups: { passes }
        } = state;

    // Set up the shaders needed for all the passes.
    const stepVerts = out.stepVerts = [];
    const stepFrags = out.stepFrags = [];
    const passSstate = {...state};

    each((pass, p) => {
            passSstate.pass = p;

            const passMacros = macroGPGPUStepPass(passSstate);

            stepVerts[p] = passMacros+stepVert;
            stepFrags[p] = passMacros+stepFrag;
        },
        passes);

    const stepPositions = out.stepPositions = regl.buffer(positions);

    out.stepUniforms = uniforms;
    out.timing = timing;
    out.stepTime = stepTime;

    // Uses the full-screen vertex shader state by default.
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

    let props;

    const withContext = (context) => {
        props.step++;

        const {
                onPass, groups: { passes }, timing = defaultTiming, stepTime: t0
            } = props;

        // Step the timer - add the constant-step, or update to the current tick/time.
        const t1 = props.stepTime = ((isNaN(timing))? context[timing] : t0+timing);

        props.dt = t1-t0;

        each((pass, p) => {
                props.pass = p;
                step((onPass)? onPass(props) : props);
            },
            passes);

        return props;
    };

    return (p) => {
        props = p;
        regl.draw(withContext);
    };
}

export default getGPGPUStep;
