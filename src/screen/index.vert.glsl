precision highp float;

attribute vec2 position;

varying vec2 uv;

void main() {
    uv = position*vec2(1.0, -1.0);
    gl_Position = vec4(position, 0, 1);
}
