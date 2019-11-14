import { getGPGPUSetup, getGPGPUSamples } from '../setup.js';
import { getGPGPUUniforms } from '../inputs.js';
import { map } from '../../util/array';

import stepFrag from './step.frag.glsl';

const valuesMap = [
    {
        // position
        values: 3,
        derives: [0, [1, 0], 2, 1]
    },
    {
        // life
        values: 1,
        derives: [1]
    },
    {
        // acceleration
        values: 3,
        derives: [2, 1]
    }
];

const values = map(({ values: v }) => v, valuesMap);
const derives = map(({ derives: d }) => d, valuesMap);

export const getInitSetup = () => ({
    stepFrag,
    // 1 active state + 2 past states needed for verlet.
    steps: 1+2,
    values: [...values],
    derives: [...derives]
});

export function getParticlesVerlet3DSetup(regl, s, o) {
    const out = getGPGPUSetup(regl, Object.assign(getInitSetup(), s), o);

    const extra = out.verlet3D = { lifetime: [200, 256] };

    const stepUniforms = out.stepUniforms = getGPGPUUniforms(regl, out);
    const drawUniforms = out.drawUniforms = getGPGPUUniforms(regl, out);

    stepUniforms.lifetime = drawUniforms.lifetime =
        (c, { verlet3D: { lifetime: l } }) => l;

    return out;
}

export default getParticlesVerlet3DSetup;
