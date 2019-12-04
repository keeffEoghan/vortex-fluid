/**
 * Draws the given texture.
 */

precision highp float;

uniform sampler2D texture;

varying vec2 uv;

const vec4 ndcRange = vec4(-1, -1, 1, 1);
const vec4 stRange = vec4(0, 0, 1, 1);

#pragma glslify: map = require('glsl-map');

void main() {
    vec2 st = map(uv, ndcRange.xy, ndcRange.zw, stRange.xy, stRange.zw);

    gl_FragColor = texture2D(texture, st);
}
