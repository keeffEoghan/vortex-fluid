/**
 * The number of indeces of pairs across the given number of `steps`.
 */

float numGPGPUPairIndeces(in float steps) {
    return (steps-1.0)*2.0;
}

int numGPGPUPairIndeces(in int steps) {
    return int(numGPGPUPairIndeces(float(steps)));
}

/**
 * The number of indeces of pairs across the given number of `steps` of the given size.
 */

float numGPGPUPairIndeces(in float steps, in float indeces) {
    return numGPGPUPairIndeces(steps)*indeces;
}

float numGPGPUPairIndeces(in float steps, in float width, in float height) {
    return numGPGPUPairIndeces(steps, width*height);
}

float numGPGPUPairIndeces(in float steps, in vec2 size) {
    return numGPGPUPairIndeces(steps, size.x, size.y);
}

int numGPGPUPairIndeces(in int steps, in int indeces) {
    return int(numGPGPUPairIndeces(float(steps), float(indeces)));
}

int numGPGPUPairIndeces(in int steps, in int width, in int height) {
    return int(numGPGPUPairIndeces(float(steps), float(width), float(height)));
}

int numGPGPUPairIndeces(in int steps, in ivec2 size) {
    return int(numGPGPUPairIndeces(float(steps), vec2(size)));
}

#pragma glslify: export(numGPGPUPairIndeces);
