/**
 * GPGPU particles drawing, may be used with this module's GPGPU setup or anything else
 * given applicable parameters.
 */

import { positions as defaultPositions } from '../screen';
import { macroGPGPUDraw } from './macros';
import { getGPGPUUniforms } from './inputs.js';

import defaultVert from '../screen/index.vert.glsl';
import defaultFrag from './test.frag.glsl';

export const GPGPUTestDebug = self.GPGPUTestDebug = {
    // range: [0, 256]
    range: [-128, 128]
};

/**
 * Draws the values within GPGPU data textures.
 */
export function getGPGPUTest(regl, setup, out = setup) {
    const {
            testVert = defaultVert,
            testFrag = defaultFrag,
            testPositions: positions = defaultPositions,
            testUniforms: uniforms = getGPGPUUniforms(regl, setup, 1)
        } = setup;

    const macros = macroGPGPUDraw(setup);

    out.testVert = macros+testVert;
    out.testFrag = macros+testFrag;

    (('range' in uniforms) || (uniforms.range = () => GPGPUTestDebug.range));

    out.testUniforms = uniforms;

    const testPositions = out.testPositions = regl.buffer(positions);

    return regl({
        vert: regl.prop('testVert'),
        frag: regl.prop('testFrag'),
        // vert: (c, props) => macroGPGPUDraw(props)+(props.testVert || defaultVert),
        // frag: (c, props) => macroGPGPUDraw(props)+(props.testFrag || defaultFrag),
        attributes: { position: (c, { testPositions: p = testPositions }) => p },
        uniforms,
        count: (c, { testCount: count = positions.length*0.5 }) => count,
        depth: { enable: false }
    });
}

export default getGPGPUTest;
