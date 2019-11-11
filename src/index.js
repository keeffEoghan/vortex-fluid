import makeRegl from 'regl';

import { extensions, optionalExtensions } from './regl-gpgpu/setup';
import getStep from './regl-gpgpu/step';
import getDraw from './regl-gpgpu/draw';
import getGPGPU from './regl-gpgpu/particles-verlet-3d';

const regl = window.regl = makeRegl({ extensions, optionalExtensions });
const gpgpu = window.gpgpu = getGPGPU(regl);
const step = getStep(regl, gpgpu);
const draw = getDraw(regl, gpgpu);

const frame = () => {
    console.log('step', step(gpgpu));
    console.log('draw', draw(gpgpu));
};

document.body.addEventListener('click', frame);
// regl.frame(frame);
