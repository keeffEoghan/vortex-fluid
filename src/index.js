import makeRegl from 'regl/regl.js';

import { extensions, optionalExtensions } from './regl-gpgpu/setup';
import getStep from './regl-gpgpu/step';
import getDraw from './regl-gpgpu/draw';
import getGPGPU from './regl-gpgpu/particles-verlet-3d';

const regl = window.regl = makeRegl({ extensions, optionalExtensions });
// const baseRegl = window.baseRegl = makeRegl({ extensions, optionalExtensions });
// const regl = window.regl = makeRegl({
//     gl: WebGLDebugUtils.makeDebugContext(baseRegl._gl, (e, f, params) =>
//         console.error(WebGLDebugUtils.glEnumToString(e), f, ...params)),
//     extensions,
//     optionalExtensions
// });

const a = (location.search.indexOf('b') < 0);

if(a) {
    const gpgpu = window.gpgpu = getGPGPU(regl);
    const step = getStep(regl, gpgpu);
    const draw = getDraw(regl, gpgpu);

    regl.frame(() => {
        regl.clear({ color: [1, 1, 1, 1], depth: 1, stencil: 0 });
        step(gpgpu);
        draw(gpgpu);
    });
}
else {
    const RADIUS = 512
    const INITIAL_CONDITIONS = (Array(RADIUS * RADIUS * 4)).fill(0).map(
        () => Math.random() > 0.9 ? 255 : 0)

    const state = (Array(2)).fill().map(() =>
        regl.framebuffer({
            color: [regl.texture({
                radius: RADIUS,
                data: INITIAL_CONDITIONS,
                wrap: 'repeat'
            })],
            depthStencil: false
        }))

    const updateLife = regl({
        frag: `
            precision mediump float;
            uniform sampler2D prevState;
            varying vec2 uv;
            void main() {
                float n = 0.0;
                for(int dx=-1; dx<=1; ++dx)
                for(int dy=-1; dy<=1; ++dy) {
                n += texture2D(prevState, uv+vec2(dx,dy)/float(${RADIUS})).r;
                }
                float s = texture2D(prevState, uv).r;
                if(n > 3.0+s || n < 3.0) {
                gl_FragColor = vec4(0,0,0,1);
                } else {
                gl_FragColor = vec4(1,1,1,1);
                }
            }`,

        framebuffer: ({tick}) => state[(tick + 1) % 2]
    })

    const setupQuad = regl({
        frag: `
            precision mediump float;
            uniform sampler2D prevState;
            varying vec2 uv;
            void main() {
                float state = texture2D(prevState, uv).r;
                gl_FragColor = vec4(vec3(state), 1);
            }`,

        vert: `
            precision mediump float;
            attribute vec2 position;
            varying vec2 uv;
            void main() {
                uv = 0.5 * (position + 1.0);
                gl_Position = vec4(position, 0, 1);
            }`,

        attributes: {
            position: [ -4, -4, 4, -4, 0, 4 ]
        },

        uniforms: {
            prevState: ({tick}) => state[tick % 2]
        },

        depth: { enable: false },

        count: 3
    })

    regl.frame(() => {
        console.log('setupQuad: '+regl._gl.getParameter(regl._gl.FRAMEBUFFER_BINDING),
            setupQuad(() => {
                console.log('draw: '+regl._gl.getParameter(regl._gl.FRAMEBUFFER_BINDING),
                    regl.draw());

                console.log('bound: '+regl._gl.getParameter(regl._gl.FRAMEBUFFER_BINDING));

                console.log('updateLife: '+regl._gl.getParameter(regl._gl.FRAMEBUFFER_BINDING),
                    updateLife());

                console.log('bound: '+regl._gl.getParameter(regl._gl.FRAMEBUFFER_BINDING));
            }))
    })
}
