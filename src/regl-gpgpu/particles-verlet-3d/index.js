import { getGPGPUSetup, getGPGPUSamples } from '../setup.js';
import { map } from '../../util/array';

import stepFrag from './step.frag.glsl';

const valuesMap = [
    {
        // position
        values: 3,
        samples: [0, [1, 0], 2, 1]
    },
    {
        // life
        values: 1,
        samples: [1]
    },
    {
        // acceleration
        values: 3,
        samples: [2, 1]
    }
];

const values = map(({ values: v }) => v, valuesMap);
const derives = map(({ samples: s }) => s, valuesMap);

export const getInitSetup = () => ({
    stepFrag,
    // 1 active state + 2 past states needed for verlet.
    steps: 1+2,
    values: [...values],
    derives: [...derives]
});

export const getParticlesVerlet3DSetup = (regl, s, o) =>
    getGPGPUSetup(regl, Object.assign(getInitSetup(), s), o);

export default getParticlesVerlet3DSetup;
