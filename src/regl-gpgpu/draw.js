/**
 * GPGPU particles drawing, may be used with this module's GPGPU setup.
 */

import { macroGPGPUDraw } from './macros';
import { getGPGPUUniforms, getGPGPUDrawIndices, numGPGPUPairIndices } from './inputs.js';

import defaultVert from './draw.vert.glsl';
import defaultFrag from './draw.frag.glsl';

/**
 * Draws particles form data textures.
 */
export function getDrawParticles(regl, setup, out = setup) {
    const {
            drawVert = defaultVert,
            drawFrag = defaultFrag,
            drawIndices: indices = getGPGPUDrawIndices(regl, setup),
            drawUniforms: uniforms = Object.assign(getGPGPUUniforms(regl, setup, 1), {
                    pointSize: (c, {
                            drawPointSize: s = 10,
                            drawPointClamp: r = regl.limits.pointSizeDims
                        }) =>
                        Math.max(r[0], Math.min(s, r[1]))
                })
        } = setup;

    const macros = macroGPGPUDraw(setup);

    out.drawVert = macros+drawVert;
    out.drawFrag = macros+drawFrag;
    out.drawUniforms = uniforms;

    const drawIndices = out.drawIndices = regl.buffer(indices);

    return regl({
        vert: regl.prop('drawVert'),
        frag: regl.prop('drawFrag'),
        // vert: (c, props) => macroGPGPUDraw(props)+(props.drawVert || defaultVert),
        // frag: (c, props) => macroGPGPUDraw(props)+(props.drawFrag || defaultFrag),
        attributes: { index: (c, { drawIndices: i = drawIndices }) => i },
        uniforms,
        primitive: (c, { primitive: p = 'points' }) => p,
        lineWidth: (c, {
                drawLineWidth: w = 10,
                drawLineClamp: r = regl.limits.lineWidthDims
            }) =>
            Math.max(r[0], Math.min(w, r[1])),
        count: (c, props) =>
            (('drawCount' in props)? props.drawCount : numGPGPUPairIndices(props))
    });
}

export default getDrawParticles;
