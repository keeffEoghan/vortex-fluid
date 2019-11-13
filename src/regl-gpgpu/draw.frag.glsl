/**
 * The draw step for a GPGPU particle simulation.
 * Requires setup with preprocessor macros. See `macroGPGPUPass`.
 *
 * @see [getGPGPUDraw]{@link ../draw.js}
 * @see [macroGPGPUPass]{@link ../macros.js}
 */

precision highp float;

varying float state;

void main() {
    gl_FragColor = vec4(vec3(mix(0.0, 1.0, state/float(GPGPUStepsPast-1))), 1.0);
}
