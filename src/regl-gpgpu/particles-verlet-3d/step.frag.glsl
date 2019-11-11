/**
 * The update step for a GPGPU particle simulation.
 * Requires setup with preprocessor macros. See `macroGPGPUPass`.
 *
 * @see [getGPGPUStep]{@link ../step.js}
 * @see [macroGPGPUPass]{@link ../macros.js}
 */

#define texturePos GPGPUTexture_0
#define textureLife GPGPUTexture_1
#define textureAcc GPGPUTexture_2

#define channelsPos GPGPUChannels_0
#define channelsLife GPGPUChannels_1
#define channelsAcc GPGPUChannels_2

#ifdef GPGPUOutput_0
    #define outputPos GPGPUOutput_0
    GPGPUUseReads_0
    #define readsPosPos1 GPGPUReads_0_0
    #define readsPosPos0 GPGPUReads_0_1
    #define readsPosAcc1 GPGPUReads_0_2
    #define readsPosLife1 GPGPUReads_0_3
#endif
#ifdef GPGPUOutput_1
    #define outputLife GPGPUOutput_1
    GPGPUUseReads_1
    #define readsLifeLife1 GPGPUReads_1_0
#endif
#ifdef GPGPUOutput_1
    #define outputAcc GPGPUOutput_2
    GPGPUUseReads_2
    #define readsAccAcc1 GPGPUReads_2_0
    #define readsAccLife1 GPGPUReads_2_1
#endif

GPGPUUseSamples
#define samples GPGPUSamples

#ifdef GL_EXT_draw_buffers
    #extension GL_EXT_draw_buffers : require
#endif

precision highp float;

uniform sampler2D states[GPGPUStepsPast*GPGPUTextures];
uniform float dt;
uniform float tick;

varying vec2 uv;

#ifdef GPGPUOutput_0
    #pragma glslify: verlet = require('../../physics/verlet');
#endif

const vec3 g = vec3(0, -0.00098, 0);
const vec3 spawnPos = vec3(0);
const vec3 spawnAcc = vec3(0, 0.25, 0);
const float spawnLife = 10000.0;

void main() {
    // Sample textures.

    GPGPUTapSamples(sampled, states, uv)

    // Get values.

    #ifdef outputPos
        vec3 pos0 = sampled[readsPosPos0].channelsPos;
        vec3 pos1 = sampled[readsPosPos1].channelsPos;
    #endif

    #if defined(outputLife) || defined(outputPos) || defined(outputAcc)
        #if defined(outputPos)
            #define readSampleLife readsPosLife1
        #elif defined(outputLife)
            #define readSampleLife readsLifeLife1
        #elif defined(outputAcc)
            #define readSampleLife readsAccLife1
        #endif

        float life1 = sampled[readSampleLife].channelsLife;
    #endif

    #if defined(outputPos) || defined(outputAcc)
        #if defined(outputPos)
            #define readSampleAcc readsPosAcc1
        #elif defined(outputAcc)
            #define readSampleAcc readsAccAcc1
        #endif

        vec3 acc1 = sampled[readSampleAcc].channelsAcc;
    #endif

    // Update values.

    #if defined(outputLife) || defined(outputPos) || defined(outputAcc)
        float life = max(life1-dt, 0.0);
        float alive = clamp(0.0, 1.0, life/spawnLife);
    #endif
    #ifdef outputLife
        life = mix(spawnLife, life, alive);
    #endif
    #ifdef outputPos
        vec3 pos = mix(spawnPos, verlet(acc1, pos0, pos1, dt), alive);
    #endif
    #ifdef outputAcc
        vec3 acc = mix(spawnAcc+vec3(cos(tick*0.001), cos(tick*0.001), 0),
            acc1+(g*dt),
            alive);
    #endif

    // Output values.

    #ifdef outputPos
        outputPos = pos;
    #endif
    #ifdef outputLife
        outputLife = life;
    #endif
    #ifdef outputAcc
        outputAcc = acc;
    #endif
}