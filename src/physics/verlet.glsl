/**
 * Verlet integration. See slide 26 of the second part of
 * [Acko's Animating Your Way to Glory](http://acko.net/blog/animate-your-way-to-glory/).
 *
 * @param {*} acc Acceleration.
 * @param {*} pos0 Last position.
 * @param {*} pos1 Current position.
 * @param {*} dt0 Time elapsed in the last frame.
 * @param {*} dt1 Time elapsed in the current frame.
 * @return The new position (`pos2`).
 */

float verlet(in float acc, in float pos0, in float pos1, in float dt0, in float dt1) {
    return (2.0*pos1)-pos0+(acc*dt0*dt1);
}

vec2 verlet(in vec2 acc, in vec2 pos0, in vec2 pos1, in float dt0, in float dt1) {
    return (2.0*pos1)-pos0+(acc*dt0*dt1);
}

vec3 verlet(in vec3 acc, in vec3 pos0, in vec3 pos1, in float dt0, in float dt1) {
    return (2.0*pos1)-pos0+(acc*dt0*dt1);
}


// Constant time step

float verlet(in float acc, in float pos0, in float pos1, in float dt) {
    return verlet(acc, pos0, pos1, dt, dt);
}

vec2 verlet(in vec2 acc, in vec2 pos0, in vec2 pos1, in float dt) {
    return verlet(acc, pos0, pos1, dt, dt);
}

vec3 verlet(in vec3 acc, in vec3 pos0, in vec3 pos1, in float dt) {
    return verlet(acc, pos0, pos1, dt, dt);
}


#pragma glslify: export(verlet);
