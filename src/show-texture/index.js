/**
 * Draws the given texture.
 */

import { positions } from '@epok.tech/gl-screen-triangle';

import vert from '@epok.tech/gl-screen-triangle/index.vert.glsl';

import frag from './index.frag.glsl';

export const getDrawTexture = (regl) => regl({
    vert,
    frag,
    attributes: { position: positions },
    uniforms: { texture: regl.prop('texture') },
    count: positions.length*0.5,
    depth: { enable: false }
});

export default getDrawTexture;
