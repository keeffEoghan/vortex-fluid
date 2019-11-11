/**
 * GPGPU particles drawing, may be used with this module's GPGPU setup or anything else
 * given applicable parameters.
 */

import { macroGPGPUDraw } from './macros';
import { getGPGPUUniforms, getGPGPUDrawIndices, numGPGPUPairIndices } from './inputs.js';

import defaultVert from './draw.vert.glsl';
import defaultFrag from './draw.frag.glsl';

/**
 * 
 */
export function getDrawParticles(regl, setup, out = setup) {
    const {
            drawVert = defaultVert,
            drawFrag = defaultFrag,
            drawIndices: indices = getGPGPUDrawIndices(regl, setup),
            drawUniforms: uniforms = getGPGPUUniforms(regl, setup, 0)
        } = setup;

    const macros = macroGPGPUDraw(setup);

    out.drawVert = macros+drawVert;
    out.drawFrag = macros+drawFrag;
    out.drawIndices = indices;
    out.drawUniforms = uniforms;

    return regl({
        vert: regl.prop('drawVert'),
        frag: regl.prop('drawFrag'),
        // vert: (c, props) => macroGPGPUDraw(props)+(props.drawVert || defaultVert),
        // frag: (c, props) => macroGPGPUDraw(props)+(props.drawFrag || defaultFrag),
        attributes: { index: (c, { indices: i = indices }) => i },
        uniforms,
        count: (c, props) =>
            (('drawCount' in props)? props.drawCount : numGPGPUPairIndices(props)),
        primitive: (c, { primitive: p = 'lines' }) => p
    });
}

export default getDrawParticles;
