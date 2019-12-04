import makeRegl from 'regl/regl.js';

import { extensions, optionalExtensions } from './regl-gpgpu/setup';
import getStep from './regl-gpgpu/step';
import getShowTexture from './show-texture';
import getTest from './regl-gpgpu/test/';
import getGPGPU from './regl-gpgpu/particles-verlet-3d';
import getDrawVerlet3D from './regl-gpgpu/particles-verlet-3d/draw';

const regl = window.regl = makeRegl({
    extensions,
    optionalExtensions,
    pixelRatio: Math.max(+devicePixelRatio, 1.5)
});

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
const showTexture = getShowTexture(regl);
const test = getTest(regl, gpgpu);

gpgpu.timing = 0.01;

const debug = self.debug = {
    step: -1,
    texture: 0,
    auto: true,
    click: true
};

function frame() {
    regl.clear({ color: [1, 1, 1, 1], depth: 1, stencil: 0 });
    step(gpgpu);
    // draw(gpgpu);
    test(gpgpu);

    // if(debug.auto) {
    //     debug.step = gpgpu.step%gpgpu.steps.length;

    //     if(!debug.click) {
    //         debug.texture = (debug.texture+1)%gpgpu.groups.textures.length;
    //     }
    // }

    // showTexture({ texture: gpgpu.textures[debug.step][debug.texture].texture });

    // console.log(gpgpu.step, JSON.stringify(debug));
}

// document.body.addEventListener('click', () =>
//     ((debug.click) && (debug.texture = (debug.texture+1)%gpgpu.groups.textures.length)));

// document.body.addEventListener('click', () => {
//     regl.poll();
//     frame();
// });
regl.frame(frame);
