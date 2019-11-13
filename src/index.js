import makeRegl from 'regl/regl.js';

import { extensions, optionalExtensions } from './regl-gpgpu/setup';
import getStep from './regl-gpgpu/step';
import getDraw from './regl-gpgpu/draw';
import getTest from './regl-gpgpu/test';
import getGPGPU from './regl-gpgpu/particles-verlet-3d';

const regl = window.regl = makeRegl({ extensions, optionalExtensions });
// const baseRegl = window.baseRegl = makeRegl({ extensions, optionalExtensions });
// const regl = window.regl = makeRegl({
//     gl: WebGLDebugUtils.makeDebugContext(baseRegl._gl, (e, f, params) =>
//         console.error(WebGLDebugUtils.glEnumToString(e), f, ...params)),
//     extensions,
//     optionalExtensions
// });

const gpgpu = window.gpgpu = getGPGPU(regl);
const step = getStep(regl, gpgpu);
const draw = getDraw(regl, gpgpu);
const test = getTest(regl, gpgpu);

regl.frame(() => {
    regl.clear({ color: [1, 1, 1, 1], depth: 1, stencil: 0 });
    step(gpgpu);
    // draw(gpgpu);
    test(gpgpu);
});
