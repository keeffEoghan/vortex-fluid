import makeRegl from 'regl/regl.js';

import { extensions, optionalExtensions } from './regl-gpgpu/setup';
import getStep from './regl-gpgpu/step';
import getTest from './regl-gpgpu/test';
import getGPGPU from './regl-gpgpu/particles-verlet-3d';
import getDrawVerlet3D from './regl-gpgpu/particles-verlet-3d/draw';

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
const draw = getDrawVerlet3D(regl, gpgpu);
const test = getTest(regl, gpgpu);

gpgpu.timing = 0.01;

function frame() {
    regl.clear({ color: [1, 1, 1, 1], depth: 1, stencil: 0 });
    step(gpgpu);
    // draw(gpgpu);
    test(gpgpu);
}

document.body.addEventListener('click', () => {
    regl.poll();
    frame();
});
// regl.frame(frame);
