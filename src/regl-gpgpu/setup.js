/**
 * GPGPU ping-pong buffers, setup.
 *
 * @todo In-place updates of complex resources and meta info.
 * @todo Use transform feedback instead of data textures where supported (WebGL2)?
 * @todo Consider class/object/data/function structure further.
 * @todo Consider splitting these concerns into dedicated approaches.
 */

import { range, map, reduce, each } from '../util/array';

/**
 * The required and optional WebGL extensions for this GPGPU setup.
 *
 * @todo
 * For drawing into floating-point buffers:
 * `oes_texture_float` and `oes_texture_half_float` are required dependencies of
 * `webgl_color_buffer_float` and `ext_color_buffer_half_float`, respectively.
 *
 * @todo Can these be optional? Fallbacks? `ext_color_buffer_half_float`?
 * @export
 */
export const extensions = ['oes_texture_float'];
export const optionalExtensions = ['webgl_draw_buffers'];
// export const optionalExtensions = [];

/**
 * Groups the `values` of GPGPU data items across draw passes and data textures.
 * The `values` are grouped in the given order, which may affect the number of
 * passes/textures used:
 *
 * @example
 *     getGPGPUGroupsMap([2, 4, 1], 1, 4) => {
 *             values: [2, 4, 1],
 *             textures: [[0], [1], [2]], // length === 3
 *             passes: [[0], [1], [2]] // length === 3
 *         };
 *
 *     getGPGPUGroupsMap([4, 2, 1], 1, 4) => {
 *             values: [4, 2, 1],
 *             textures: [[0], [1, 2]], // length === 2
 *             passes: [[0], [1]] // length === 2
 *         };
 *
 *     getGPGPUGroupsMap([4, 2, 1], 4, 4) => {
 *             values: [4, 2, 1],
 *             textures: [[0], [1, 2]], // length === 2
 *             passes: [[0, 1]] // length === 1
 *         };
 *
 *     getGPGPUGroupsMap([2, 4, 1], 4, 4) => {
 *             values: [2, 4, 1],
 *             textures: [[0], [1], [2]], // length === 3
 *             passes: [[0, 1, 2]] // length === 1
 *         };
 *
 *     getGPGPUGroupsMap([2, 4, 1], 2, 4) => {
 *             values: [2, 4, 1],
 *             textures: [[0], [1], [2]], // length === 3
 *             passes: [[0, 1], [2]] // length === 2
 *         };
 *
 *     getGPGPUGroupsMap([2, 4, 1, 2], 2, 4) => {
 *             values: [2, 4, 1, 2],
 *             textures: [[0], [1], [2, 3]], // length === 3
 *             passes: [[0, 1], [2]] // length === 2
 *         };
 *
 *     getGPGPUGroupsMap([2, 4, 1, 4], 2, 4) => {
 *             values: [2, 4, 1, 4],
 *             textures: [[0], [1], [2], [3]], // length === 4
 *             passes: [[0, 1], [2, 3]] // length === 2
 *         };
 *
 * @export
 * @param {array.<number>} values An array, each number is how many values are to be
 *     grouped into one data texture in one draw pass, and separate numbers may be
 *     drawn across one or more data textures across one or more draw passes.
 *     Each value should be the number of co-dependent channels that must be drawn
 *     together in one pass. Separate values denote channels that aren't co-dependent
 *     and may be drawn in one pass or across separate passes, depending on support.
 *     The given order is (currently) maintained and may affect the number of passes
 *     and textures used. Also, in cases where the next state depends on the previous
 *     state, these should try to be in groups of `channels` or less, in order to do as
 *     few texture reads as possible in the step shaders to retrieve previous states.
 *
 * @param {number} [texturesMax=1] Maximum number of textures to be used per draw pass.
 * @param {number} [channelsMax=4] Maximum number of channels any of the `values`.
 *
 * @returns {object.<array.<array.<number>>, array.<array.<number>>, ...>} `out` The
 *     `values` grouped into passes and textures; plus given parameters and meta info.
 *
 * @returns {array.<array.<number>>} `out.passes` The groupings of textures into passes;
 *     arrays corresponding to framebuffers in separate draw passes; whose values are
 *     indices into `out.textures`.
 * @returns {array.<array.<number>>} `out.textures` The groupings of textures; arrays
 *     corresponding to framebuffer attachments into which `values` are drawn; whose
 *     values are indices into `values`.
 *
 * @returns {array.<number>} `out.values` The `values`, as given.
 * @returns {number} `out.values` The `texturesMax`, as given.
 * @returns {number} `out.values` The `channelsMax`, as given.
 *
 * @returns {array.<number>} `out.valueToTexture` A reverse map from each index of
 *     `values` to the index of the data texture which contains it; for convenience.
 * @returns {array.<number>} `out.valueToPass` A reverse map from each index of
 *     `values` to the index of the pass which contains it; for convenience.
 * @returns {array.<number>} `out.textureToPass` A reverse map from each index of
 *     `out.textures` to the index of the pass which contains it; for convenience.
 */
export function getGPGPUGroupsMap(values, texturesMax = 1, channelsMax = 4) {
    // The maximum number of channels writeable in a single draw pass.
    let sum = 0;

    return reduce((out, value, index) => {
            if(value > channelsMax) {
                console.warn(`\`regl-gpgpu\`: none of the given \`values\` `+
                    `(${value}) should exceed the total number of channels `+
                    `available in a texture (${channelsMax}).`, values);
                
                return out;
            }

            const {
                    textures, passes, valueToTexture, valueToPass, textureToPass
                } = out;

            let p = passes.length-1;
            let pass = passes[p];
            let b = textures.length-1;
            let texture = textures[b];

            if((sum += value) > channelsMax) {
                sum = value;
                b = textures.push(texture = [])-1;

                ((pass.length >= texturesMax) && (p = passes.push(pass = [])-1));
                pass.push(b);
                textureToPass.push(p);
            }
            else if(pass.length === 0) {
                pass.push(b);
                textureToPass.push(p);
            }

            texture.push(index);
            valueToTexture.push(b);
            valueToPass.push(p);

            return out;
        },
        values,
        {
            passes: [[]],
            textures: [[]],
            values,
            texturesMax,
            channelsMax,
            valueToTexture: [],
            valueToPass: [],
            textureToPass: []
        });
}

/**
 * Gives the mappings for a minimal set of texture samples that need to be taken in
 * order to derive the next state of values.
 * 
 * @example
 *     const groups = getGPGPUGroupsMap([2, 4, 1, 2], 2, 4) => {
 *             values: [2, 4, 1, 2],
 *             textures: [[0], [1], [2, 3]], // length === 3
 *             passes: [[0, 1], [2]] // length === 2
 *         };
 *
 *     // Entries per-value of derived step/value indices, with entries including:
 *     // empty, single, multiple, and defined step samples.
 *     const derives = [[1, 0], , [3, [1, 0]], [2]];
 *     getGPGPUSamplesMap(derives, groups) => {
 *             // Per-pass, minimum values' texture samples.
 *             samples: [
 *                 // Per-value - step/texture index pairs into `groups.textures`.
 *                 [[0, 1], [0, 0]],
 *                 [[0, 2], [1, 0]]
 *             ],
 *             // Per-pass, value indices to texture samples.
 *             reads: [
 *                 // Per-value - indices into `out.samples`.
 *                 [[0, 1], , , ],
 *                 [, , [0, 1], [0]]
 *             ]
 *         };
 *
 * @see getGPGPUGroupsMap
 *
 * @todo Consider packing sample index pairs into a single number (float with texture
 *     and step either side of the decimal, or int of `texture+(step*textures.length)`).
 *
 * @export
 * @param {array.<array.<(null|number|array.<number>)>>} derives For every value,
 *     an array of indices of any other values it derives its next state from - values
 *     without derivations may have empty entries; values with an array entry derive
 *     from others:
 *     - Where a value's entry array has a number, it derives from the most
 *     recent state step at the given value index.
 *     - Where a value's entry array has an array of numbers, it derives from the given
 *     past state index (first number) at the given value index (second number).
 *
 * @param {object.<array.<array>, array.<array>, array.<number>, array.<number>>}
 *     groups The groups for the given `derives`; with `passes`, `textures`,
 *     `values`, and `valueToTexture` properties - see `getGPGPUGroupsMap`.
 * @param {object} [out=groups] The object to store the result in.
 *
 * @returns {object.<array.<array.<array.<number>>>, array.<array.<array.<number>>>>}
 *     `out` The given `out` object, with the resulting maps added.
 * @returns {array.<array.<array.<number>>>} `out.samples` Map of the minimum set of
 *     indices of `groups.textures` that need to be sampled per-pass, in order to get
 *     all the `derives` needed for each of the `groups.values` of each pass of
 *     `groups.passes`.
 * @returns {array.<array.<array.<number>>>} `out.reads` Sparse map from each value
 *     index of `derives` to the index of the step and texture its derives are
 *     stored at in `out.samples`.
 */
export function getGPGPUSamplesMap(derives, groups, out = groups) {
    const { passes, textures, values, valueToTexture } = groups;
    const reads = out.reads = [];

    const getAddSample = (set, pass, value) => (derive, d) => {
        const sample = ((Array.isArray(derive))?
                [derive[0], valueToTexture[derive[1]]]
            :   [0, valueToTexture[derive]]);
        
        const [step, texture] = sample;
        let i = set.findIndex(([s, t]) => (s === step) && (t === texture));

        ((i < 0) && (i = set.push(sample)-1));

        const passReads = (reads[pass] || (reads[pass] = []));
        const valueReads = (passReads[value] || (passReads[value] = []));

        valueReads[d] = i;
    };

    const getAddSamples = (pass) => (set, value) => {
        const valueDerives = derives[value];

        (valueDerives && each(getAddSample(set, pass, value), valueDerives));

        return set;
    }

    const samples = out.samples = map((pass, p) =>
            reduce((set, texture) => reduce(getAddSamples(p), textures[texture], set),
                pass, []),
        passes, []);

    return out;
}

/**
 * Set up the GPGPU resources and meta information for the state of a number of data
 * items.
 *
 * @todo Transform feedback.
 * @todo Validation.
 * @todo Reorder the given `values` into the most efficient `groups`?
 *
 * @see getGPGPUGroupsMap
 * @see getGPGPUSamplesMap
 * @see [getGPGPUStep]{@link ./step.js#getGPGPUStep}
 * @see [macroGPGPUPass]{@link ./macros.js#macroGPGPUPass}
 *
 * @export
 * @param {regl} regl The `regl` instance to use.
 * @param {object} [setup={}] The setup parameters.
 * @param {number} [setup.radius] The length of the sides of the data textures to
 *     allocate. If given, supersedes `setup.width`, `setup.height`, and `setup.scale`.
 * @param {number} [setup.width] The width of the data textures to allocate. If given,
 *     supersedes `setup.scale`, if `setup.radius` isn't given.
 * @param {number} [setup.height] The height of the data textures to allocate. If given,
 *     supersedes `setup.scale`, if `setup.radius` isn't given.
 * @param {number} [setup.scale=10] The length of the sides of the data textures to
 *     allocate. Given as the power by which to raise 2, ensuring a power-of-two square
 *     texture. Used if `setup.width`, `setup.height`, or `setup.radius` aren't given.
 * @param {number} [setup.steps=2] How many steps of state to track (should be > 1).
 * @param {array.<number>} [setup.values=[4]] How values of each data item may be
 *     grouped into textures across passes - see `getGPGPUGroupsMap` and `out.groups`.
 * @param {number} [setup.texturesMax=regl.limits.maxDrawbuffers] The maximum number of
 *     textures to use per draw pass. Extra passes will be used above this limit.
 * @param {string} [setup.type='float'] The data type of the textures.
 * @param {array.<array.<(null|number|array.<number>)>>} [setup.derives] Any values
 *     which derive their state from other values - see `getGPGPUSamplesMap`.
 * @param {(string|function|falsey)} [setup.macros] How GLSL preprocessor macro
 *     definitions and prefixes may be generated later - see `macroGPGPUPass`.
 * @param {object} [out=setup] The state object to set up. Modifies the given `setup`
 *     object by default; new object if not given.
 *
 * @returns {object} `out` The state object, set up with the data resources and meta
 *     information, for later step/draw:
 * @returns {array} `out.values` The given `setup.values`.
 * @returns {array} `[out.derives]` The given `setup.derives`, if any.
 * @returns {number} `out.texturesMax` The given `setup.texturesMax`.
 * @returns {(string|function|falsey)} `out.macros` The given `setup.macros`.
 * @returns {object.<array.<number>, array.<array.<number>>, array.<array.<number>>>}
 *     `out.groups` How `setup.values` are grouped into textures and passes per step -
 *     see `getGPGPUGroupsMap`.
 * @returns {array.<array.<array.<number>>>} `[out.groups.samples]` If any
 *     `setup.derives` were given, the samples are set up - see `getGPGPUSamplesMap`.
 * @returns {array.<array.<array.<number>>>} `[out.groups.reads]` If any
 *     `setup.derives` were given, the reads are set up - see `getGPGPUSamplesMap`.
 * @returns {object.<number>} `out.size` Info about the sizes of the resources created.
 * @returns {array.<array.<object.<regl.texture, array.<number>, number,...>>>}
 *     `out.textures` Textures per step, as arrays of objects of `regl.textures`, and
 *     meta info - see `out.groups.textures`.
 * @returns {array.<array.<object.<regl.framebuffer, array.<number>, number,...>>>}
 *     `out.passes` Passes per step, as arrays of objects of `regl.framebuffers`,
 *     with textures from `out.textures`, and meta info - see `out.groups.passes`.
 * @returns {array.<regl.framebuffer.<array.<texture>>>} `out.steps` Hierarchy of steps
 *     of state, as an array of `regl.framebuffers` from `out.passes`, with arrays of
 *     `regl.textures` from `out.textures`, and meta info - see `getGPGPUGroupsMap`.
 *     State data may be drawn into the framebuffers accordingly - see `getGPGPUStep`.
 *
 * @returns {number} `out.step` The currently active state step.
 * @returns {number} `out.pass` The currently active framebuffer pass.
 */
export function getGPGPUSetup(regl, setup = {}, out = setup) {
    const {
            radius,
            width,
            height,
            scale = 3,
            // scale = 10,
            steps = 2,
            values = [1],
            texturesMax = regl.limits.maxDrawbuffers,
            type = 'float',
            macros,
            derives
        } = setup;

    out.values = values;
    out.texturesMax = texturesMax;
    out.macros = macros;

    // The range of allowable number of channels for framebuffer attachments.
    const channelsMin = 3;
    const channelsMax = 4;

    // How the resources will be created for each pass, according to given `values`.
    const groups = out.groups = getGPGPUGroupsMap(values, texturesMax, channelsMax);

    // Passing `setup.scale` ensures a power-of-two square texture size.
    const textureSetup = {
        type,
        width: (radius || width || 2**scale),
        height: (radius || height || 2**scale)
    };

    // Size of the created resources.
    const size = out.size = {
        shape: [textureSetup.width, textureSetup.height],
        width: textureSetup.width,
        height: textureSetup.height,
        index: textureSetup.width*textureSetup.height,
        passes: 0,
        textures: 0
    };

    const textures = out.textures = [];
    const passes = out.passes = [];

    const addTexture = (step, pass, textureSetup) => (index) => {
        const texture = regl.texture(textureSetup);

        texture.EOK = (textures[step] || (textures[step] = []))[index] = {
            // Meta info.
            number: size.textures++,
            step,
            pass,
            index,
            group: groups.textures[index],
            // Resources.
            texture
        };

        return texture;
    };

    const addPass = (step) => (pass, index) => {
        // All framebuffer color attachments must have the same number of channels.
        const passSetup = {
            type: 'float',
            channels: reduce((max, b) =>
                    reduce((max, v) => Math.max(max, values[v]),
                        groups.textures[b], max),
                pass, channelsMin),
            ...textureSetup
        };

        const textures = map(addTexture(step, index, passSetup), pass);
        const framebuffer = regl.framebuffer({ color: textures, depthStencil: false });

        framebuffer.EOK = (passes[step] || (passes[step] = []))[index] = {
            // Meta info.
            number: size.passes++,
            step,
            index,
            group: pass,
            // Resources.
            textures,
            framebuffer
        };

        return framebuffer;
    };

    // Set up resources we'll need to store data per-texture-per-pass-per-step.
    out.steps = map((v, step) => map(addPass(step), groups.passes), range(steps));

    // Tracking currently active state/pass.
    out.step = out.pass = -1;

    // If `derives` given, set it up.
    ((out.derives = derives) && getGPGPUSamplesMap(derives, groups));

    return out;
}

export default getGPGPUSetup;
