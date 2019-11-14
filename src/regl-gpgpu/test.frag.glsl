/**
 * Outputs the GPGPU step data.
 * Requires setup with preprocessor macros - see `macroGPGPUDraw`.
 *
 * @see [macroGPGPUStepPass]{@link ../macros.js#macroGPGPUStepPass}
 * @see [macroGPGPUDraw]{@link ../macros.js#macroGPGPUDraw}
 */

precision highp float;

const int numStates = GPGPUStepsPast*GPGPUTextures;

uniform sampler2D states[numStates];
uniform vec2 range;
uniform vec2 viewShape;

varying vec2 uv;

const int numChannels = 4;
const vec2 splits = vec2(GPGPUStepsPast, GPGPUTextures*numChannels);
// const float gapSize = 1.0;

void main() {
    vec2 st = (uv+vec2(1.0))*0.5;

    // vec2 splitGaps = (splits+vec2(1.0))*gapSize;

    // vec2 gaps = splitGaps/viewShape;
    // vec2 gap = gapSize/viewShape;

    vec2 scaled = st*splits;
    // vec2 scaled = (st*splits)+gaps;
    // vec2 scaled = st*(splits+gaps);
    // vec2 scaled = (st*splits)-gaps;

    vec2 lookup = fract(scaled);

    vec4 data;
    int s = (int(scaled.x)*GPGPUTextures)+int(scaled.y);

    for(int i = numStates-1; i >= 0; --i) {
        if(i == s) {
            data = texture2D(states[i], lookup);
            break;
        }
    }

    vec3 pixel = vec3(0);
    int p = int(float(s)/float(numStates*numChannels));

    for(int i = numChannels-1; i >= 0; --i) {
        if(i == p) {
            if(i < 3) {
                pixel[i] = data[i];
            }
            else {
                pixel.xyz = vec3(data[i]);
            }
            break;
        }
    }

    // gl_FragColor = vec4((data-min(range.x, range.y))/abs(range.x-range.y));
    // gl_FragColor = vec4((pixel-min(range.x, range.y))/abs(range.x-range.y), 1.0);
    // gl_FragColor = vec4(uv, 0, 1);
    // gl_FragColor = vec4(st, 0, 1);
    gl_FragColor = vec4(mod(scaled, float(numStates)), 0, 1);
    // gl_FragColor = vec4(lookup, length(st), 1);
}
