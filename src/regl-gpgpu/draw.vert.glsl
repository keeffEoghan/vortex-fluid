/**
 * The draw step for a GPGPU particle simulation.
 * Requires setup with preprocessor macros. See `macroGPGPUPass`.
 *
 * @see [getGPGPUDraw]{@link ../draw.js}
 * @see [macroGPGPUPass]{@link ../macros.js}
 */

#define texturePos GPGPUTexture_0
#define textureLife GPGPUTexture_1
#define textureAcc GPGPUTexture_2

#define channelsPos GPGPUChannels_0
#define channelsLife GPGPUChannels_1
#define channelsAcc GPGPUChannels_2

attribute float index;

uniform sampler2D states[GPGPUStepsPast*GPGPUTextures];
uniform vec2 dataShape;
uniform float steps;
uniform float pointSize;

varying float state;

#pragma glslify: indexGPGPUState = require('./util/index-state');

void main() {
    vec3 lookup = indexGPGPUState(index, dataShape, steps);

    state = lookup.z;

    vec4 state = texture2D(states[(int(state)*GPGPUTextures)+texturePos], lookup.xy);
    vec3 pos = state.channelsPos;

    gl_Position = vec4(pos, 1.0);
    gl_PointSize = pointSize;
}
