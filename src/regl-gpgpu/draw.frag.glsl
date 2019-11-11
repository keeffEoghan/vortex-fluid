/**
 * The draw step for a GPGPU particle simulation.
 * Requires setup with preprocessor macros. See `macroGPGPUPass`.
 *
 * @see [getGPGPUDraw]{@link ../draw.js}
 * @see [macroGPGPUPass]{@link ../macros.js}
 */

precision highp float;

void main() {
    gl_FragColor = vec4(0, 0, 0, 1);
}
