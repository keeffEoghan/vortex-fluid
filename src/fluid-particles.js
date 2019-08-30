/**
 * Fluid particles - fluid continuum properties described at discrete particle
 * locations; the Lagrangian view.
 * These denote vorticity and position space (maybe more porperties later, as in
 * SPH or MPM).
 * Properties evolve through interpolation between the particles and
 * motion/exchange/creation of the particles through the fluid (simplifying some
 * concepts such as fluid advection and conservation of mass).
 *
 * Code arranged to separate functions/behaviour from data/containers.
 *
 * @see [Vorticity equations](https://en.wikipedia.org/wiki/Vorticity_equation)
 *
 * @todo Adapt a 2D version of `vorticityToVelocity` (e.g: no tilt/stretch/cross).
 */

import { sub, magSq, cross3 } from '@thi.ng/vectors';

export const inv4Pi = 1/(4*Math.PI);

/**
 * Compute velocity from vorticity using the Biot-Savart law for a vortex particle
 * with finite core size.
 *
 * @param {vec3} queryPos Position at which to compute velocity.
 * @param {vec3} vortonPos Vorton position.
 * @param {vec3} angularVel Vorton angular velocity.
 * @param {float} radius Vorton radius.
 * @param {float} spreadFactor Amount by which to scale vorton radius.
 * @param {float?} vorticityFactor Amount by which to scale vorton vorticity; if given,
 *     must be equal to `spreadFactor**-3`.
 *
 * @returns {vec3} Velocity contribution due to the given vorton.
 */
export function vorticityToVelocity(queryPos, vortonPos, angularVel, radius,
        spreadFactor = 1, vorticityFactor = (spreadFactor == 1 || spreadFactor**-3)) {
    const vortonToQuery = sub([], queryPos, vortonPos);

    // Using `x**2` to avoid `sqrt` here.
    const r = radius*spreadFactor;
    const r2 = r*r;
    const r3 = r2*r;
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
     * This simplifies (the `4*Math.PI` cancel; and
     * [`vorticity === angularVel*2`](https://en.wikipedia.org/wiki/Vorticity):
     */
    return 2/3*r3*cross3([], angularVel, vortonToQuery)/distFactor*vorticityFactor;
}
