/**
 * Euler integration.
 *
 * @param {*} vel Velocity.
 * @param {*} pos Current position.
 * @param {*} dt Time elapsed.
 * @return The new position (`pos1`).
 */

float euler(in float vel, in float pos, in float dt) {
    return pos+(vel*dt);
}

vec2 euler(in vec2 vel, in vec2 pos, in float dt) {
    return pos+(vel*dt);
}

vec3 euler(in vec3 vel, in vec3 pos, in float dt) {
    return pos+(vel*dt);
}


#pragma glslify: export(euler)
