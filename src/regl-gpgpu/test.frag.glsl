/**
 * Outputs the GPGPU step data.
 * Requires setup with preprocessor macros - see `macroGPGPUDraw`.
 *
 * @see [macroGPGPUStepPass]{@link ../macros.js#macroGPGPUStepPass}
 * @see [macroGPGPUDraw]{@link ../macros.js#macroGPGPUDraw}
 */

precision highp float;

uniform sampler2D states[GPGPUStepsPast*GPGPUTextures];

varying vec2 uv;

// const vec2 split = vec2(GPGPUStepsPast*GPGPUTextures, GPGPUTextures);
const vec2 split = vec2(GPGPUStepsPast, GPGPUTextures);

void main() {
    vec2 st = (uv+vec2(1.0))*0.5;
    vec2 scaled = st*split;
    vec2 lookup = mod(scaled, split);
    // vec2 lookup = mod(scaled*float(GPGPUTextures), split);
    vec4 color;
    // int s = int(scaled.x+scaled.y);
    int s = (int(scaled.x)*GPGPUTextures)+int(scaled.y);

    for(int i = (GPGPUStepsPast*GPGPUTextures)-1; i >= 0; --i) {
        if(i == s) {
            color = texture2D(states[i], lookup);
        }
    }

    gl_FragColor = color;
    // gl_FragColor = vec4(st, 0, 1);
}
