/**
 * Vorticity particles - fluid continuum properties described at discrete particle
 * locations; the Lagrangian view - also known as _vortons_.
 * These denote vorticity and position space (maybe more properties too, as in
 * SPH or MPM).
 * Properties evolve through motion/exchange/creation of the particles through the
 * fluid (simplifying some concepts such as fluid advection and conservation of mass),
 * and are interpolated between the particles.
 *
 * Code arranged to separate functions/behaviour from data/containers.
 *
 * @see [_Fluid Simulation for Video Games_ series by Dr. Michael J. Gourlay](https://software.intel.com/en-us/articles/fluid-simulation-for-video-games-part-1/)
 * @see [Vorticity equations](https://en.wikipedia.org/wiki/Vorticity_equation)
 *
 * @todo Port to GLSL.
 * @todo Adapt a 2D version of `vorticityToVelocity` (e.g: no tilt/stretch/cross).
 */

import { sub, magSq, cross3, mulN } from '@thi.ng/vectors';

const _2over3 = 2/3;

/**
 * Compute velocity from vorticity using the [Biot-Savart law](https://en.wikipedia.org/wiki/Biot%E2%80%93Savart_law#Aerodynamics_applications)
 * for a vortex particle with finite core size.
 *
 * @param {vec3} queryPos Position at which to compute velocity.
 * @param {vec3} vortonPos Vorton position.
 * @param {vec3} angularVel Vorton angular velocity.
 * @param {float} radius Vorton radius.
 * @param {float} spreadFactor Amount by which to scale vorton radius.
 * @param {float} [vorticityFactor=1] Amount by which to scale vorton vorticity; if
 *     given, should be equal to `spreadFactor**-3` (the default).
 * @param {array} [out=[]] The array in which to store the resulting vector; if not
 *     given, a new array is created.
 *
 * @returns {vec3} Velocity contribution due to the given vorton.
 */
export function vorticityToVelocity(queryPos, vortonPos, angularVel, radius,
        spreadFactor = 1,
        vorticityFactor = +(spreadFactor === 1 || spreadFactor**-3),
        out = []) {
    const vortonToQuery = sub([], queryPos, vortonPos);

    const r = radius*spreadFactor;
    const r2 = r*r;
    const r3 = r2*r;
    // Using `x**2` to avoid `sqrt` here.
    const d2 = magSq(vortonToQuery);

    /**
     * If the reciprocal law is used everywhere then when 2 vortices get close, they
     * tend to jettison. Mitigate this by using a linear law when 2 vortices get
     * close to each other. This is referred to as mollification, and is similar to a
     * [Rankine vortex](https://en.wikipedia.org/wiki/Rankine_vortex).
     */
    const distFactor = ((d2 < r2)? r3 : d2*Math.sqrt(d2));

    /**
     * The formula for velocity from vorticity, derived from the Biot-Savart law
     * applied to each discrete query location, is given as:
     *     (The first part of the integration:)
     *     `(1/(4*Math.PI))*`
     *     (Volume of the sphere of the vortex element:)
     *     `((4*Math.PI)/3*r3)*`
     *     (The cross product part:)
     *     `cross(vorticity, vortonToQuery)/`
     *     (The above distance factor, mollified within the threshold:)
     *     `distFactor`
     *
     * The above simplifies to the below (the `4*Math.PI` cancel; and
     * [`vorticity === angularVel*2`](https://en.wikipedia.org/wiki/Vorticity)):
     *     `(2/3*r3)*cross(vorticity, vortonToQuery)/distFactor`
     *
     * `vorticityFactor` is separate, it scales the resulting vorticity in proportion
     * to `spreadFactor`.
     */
    return mulN(out,
        cross3(out, angularVel, vortonToQuery),
        _2over3*r3/distFactor*vorticityFactor);
}
