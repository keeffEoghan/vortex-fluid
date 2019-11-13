# Notes

## Approach
- References
  - Core best referred to at [#18](18 - Fluid Surface Extractionand Rendering/code/VortonFluid/vorton.h).
- Start with a brute-force, pure, naïve approach - to avoid pre-optimisation.
  - Separated concerns:
    - Fluid particles (vortons)
      - Direct summation first - simplest and reference.
    - Rendering tracers.
      - General renderer setup and lifecycle.
      - Tracer particles:
        - GPGPU ping-pong buffers drawn in line segment pairs of current/past positions (after Lumens).
    - Spatial partitions, and derived calculations/lookups/interpolations.
      - Grids, textures.
      - More to be investigated below.
- Optimisations, improvements, and considerations:
  - Spatial partitions, alternatives to the `uniform grid`:
    - [Excellent collision overview, streaming segment trees, and benchmark comparisons](https://0fps.net/2015/01/23/collision-detection-part-3-benchmarks/)
    - Important for both speed and accuracy; the articles initially avoid delving into spatial partition approaches, then go on to fundamentally rely on them and compensate for sampling errors arising from them.
    - Could this be a simpler case of tracking nearest neighbours (maybe weighted by distance, such as with SPH)? An interpolation could be made this way; the vorton neighbours are the sample points for which the fluid properties are known.
    - Does the mesh/spatial partition have to be of uniform cell size to work for interpolations/tree-code...?
      - KD-tree cells aren't square-ish; octree cells are. Does uniformity affect the fidelity of the fluid sim operations (interpolation, "supervortons", etc)?
      - KD-tree traversal involves lots of ascending/descending the hierarchy(?); octrees are more regular and predicatble(?).
      - Reducing jerkiness and improving sampling accuracy is helped by particles and the spatial partition to be aligned (see Particle-In-Cell method?)... best to use KD-tree there?
    - BVH / R-tree
      - How would interpolation work? Simply sum/integrate of nearest volumes, divided by their distance (similar to the supervorton abstraction or SPH kernels)?
  - Filaments instead of points?
    - See:
      - Gourlay's final summary points.
      - [This paper](http://www-evasion.imag.fr/Publications/2005/AN05/paper0132.pdf)
      - David Li's implementations of [vorticity filaments](https://github.com/dli/vortexspheres) and [FLIP](http://david.li/fluid/)
  - Smoothed Partical Hydrodynamics:
    - Promising approach for surfaces, surface tension, viscosity, and interfaces/boundaries (gas-liquid, etc).
    - See:
      - Gourlay's failed attempt to combine the approaches.
      - The papers detailed on [Tom Madam's I'm Doing it Wrong](https://imdoingitwrong.wordpress.com/2010/12/14/why-my-fluids-dont-flow/) and [Softology](https://softologyblog.wordpress.com/2018/09/04/3d-multiphase-smoothed-particle-hydrodynamics/) - in order of attempt:
        - [Particle-Based Fluid Simulation for Interactive Applications](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.2.7720&rep=rep1&type=pdf)
        - [Particle-based Viscoelastic Fluid Simulation](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.59.9379&rep=rep1&type=pdf)
        - [Weakly compressible SPH for free surface flows](https://cg.informatik.uni-freiburg.de/publications/2007_SCA_SPH.pdf)
      - [The publications of Computer Graphics at University of Freiburg](https://cg.informatik.uni-freiburg.de/publications.htm), which demonstrate treatments of the continuum between solid to liquid (to gas?) in SPH, and include a [recent survey of multi-phase/-fluid techniques](https://cg.informatik.uni-freiburg.de/publications/2018_JCST_multipleFluids.pdf).
      - Other papers:
        - [Divergence-Free Smoothed Particle Hydrodynamics](https://animation.rwth-aachen.de/media/papers/2015-SCA-DFSPH.pdf)
        - [An Advection-Reflection Solver for Detail-Preserving Fluid Simulation](https://jzehnder.me/publications/advectionReflection/paper.pdf)
    - Industry-leading approaches:
      - [FLIP Fluids Blender add-on](https://github.com/rlguy/Blender-FLIP-Fluids).
      - [Mantaflow](http://mantaflow.com/) (Blender main).
      - *Material Point Method (MPM)*.
        - [A Moving Least Squares Material Point Method with Displacement Discontinuity and Two-Way Rigid Body Coupling](http://taichi.graphics/wp-content/uploads/2019/03/mls-mpm-cpic.pdf)
        - [Summary](https://en.wikipedia.org/wiki/Material_point_method): seems simple, covers multiple phases
    - Surfaces:
      - Level sets (or Particle Level Sets).
      - Surface tension.
      - Whitewater.

## Ideas

- Portfolio
  - [Flow through Russian-doll classical bust](https://keep.google.com/u/0/?pli=1#LIST/1571161317129.586507768)
- Cloud flying dream: fly a character around and through clouds of various forms (lighting, forces, storms, cumulonimbus and others, hurricanes, lightning, feeding by evaporation, etc), with the character able to collide with the clouds and vice versa (surf, tumble through, skirt, shape, etc), and controlled in a nicely fluid way (hand/pose tracking as areodynamic wings, drag along spline, etc)... Inspiration ([A Year Along the Geostationary Orbit](https://vimeo.com/342333493), clouds in Phonsovan)
- Life barrage: model of a person's head, dragging on the window produces a jet (of e.g: ionised glowing air) blasting the face (from offscreen at angles inwards about a hemisphere), which collides with the face (exerting forces like a hairdryer flapping mouth), gradually blasting off particles of material (which flow away) to expose some underlying flesh/bone, regrowing as an aged form of the face... when oldest, all becomes dust... and then the cycle repeats with an inner head (e.g: Russian dolls).
- Cascading objects: objects (heads, Saigon motorbike traffic, etc) cascading in a turbulent flow, to give a sense of crowded copiousness... (how are the objects oriented?).
- Shape-shifting character: combine vsicous fluid dynamics with springs and rigged animation, for a shape-shifting character that sneaks and stretches around environments.

# Pointers

- Particles within mesh
  - Raycastng:
    - https://github.com/gonnavis/whether_point_in_3d_model/blob/master/index.html
  - SDF from mesh
    - https://github.com/szymonkaliski/hiccup-sdf
    - https://github.com/davidstutz/mesh-voxelization
    - https://github.com/mattatz/unity-voxel
    - [Wen](https://medium.com/@bongiovi015/codevember-breakdowns-part-2-depth-texture-to-world-position-68f237700945) recommends [Edan's work](https://medium.com/lusion-ltd/from-concept-prototyping-to-production-in-a-creative-studio-f2083e96c4b9).
    - Devcon advice:
      ```
      Does anyone know a good library or method for creating and working with 3D SDF volumes?
      Ideally, in a form that can be built from a standard mesh, includes simple boolean operations, and can be encoded into a 3D texture or other WebGL asset.

      alvin  3 days ago
      How about this https://szymonkaliski.com/projects/hiccup-sdf/
      szymonkaliski.com
      Szymon Kaliski — hiccup-sdf
      hiccup-sdf is set of open source tools made for creating, displaying and exporting 3d models made with SDFs.(31 kB)
      https://szymonkaliski.com/projects/hiccup-sdf/miniature.png

      alvin  3 days ago
      Never used it though :sweat_smile:

      epok.tech  1 day ago
      That covers some operations and exporting, but doesn’t seem to cover importing a mesh and converting to SDF

      alvin  11 hours ago
      Ah, let me know if you find something suitable

      edankwan  6 hours ago
      Converting Mesh into sdf, you will just need to create a volume and for each triangle, do a triangle sdf from https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
      iquilezles.orgiquilezles.org
      Inigo Quilez :: fractals, computer graphics, mathematics, shaders, demoscene and more
      Tutorials and articles of Inigo Quilez on computer graphics, fractals, demoscene, shaders and more.

      edankwan  6 hours ago
      Without doing any hierarchy/tree system, in a most naive way, you probably need to go through all voxels in a volume for each triangle. Maybe summon @ilmarihei here :slightly_smiling_face:

      ilmarihei:sunny:  5 hours ago
      Err you could make a bvh of the mesh, then cast rays from each coord of one plane of the 3d texture to find intersections on that row of voxels to voxelize the mesh, then compute sdf from that

      ilmarihei:sunny:  5 hours ago
      Or port https://github.com/davidstutz/mesh-voxelization/blob/master/README.md
      GitHubGitHub
      davidstutz/mesh-voxelization
      C++ implementation for computing occupancy grids and signed distance functions (SDFs) from watertight meshes. - davidstutz/mesh-voxelization

      ilmarihei:sunny:  5 hours ago
      https://github.com/mattatz/unity-voxel
      GitHubGitHub
      mattatz/unity-voxel
      Mesh voxelization for Unity. Contribute to mattatz/unity-voxel development by creating an account on GitHub.

      epok.tech  4 minutes ago
      Nice on guys these are great pointers - I’ll look into this and consider the best approach :slightly_smiling_face:
      ```

## Bugs

- Getting `GL ERROR :GL_INVALID_OPERATION : glDrawArrays: Source and destination textures of the draw are the same.` across separately-scoped commands:
  - It seems that `regl`'s texture binding/unbinding logic doesn't unbind textures unless another texture to be bound in the command needs the unit another texture is using. This can leave textures bound if they are not explicitly unbound; this may be fine/efficient usually, but it can cause issues if you've just bound a texture in one command, then render to the same texture in a framebuffer in the next command: the texture is the color attachment for the framebuffer, _and_ it's still bound to a texture unit from the previous command, which seems to cause a bug in Chrome at least. It also seems to be a side-effect leaking out of the functional abstraction. Perhaps framebuffers should always unbind their texture attachments from any active bindings; or perhaps textures should always be unbound at the end of a command if their `bindCount` falls to `0`.
  - Check further:
    - Any issues with the framebuffer part of this? Should the framebuffer binding ensure that its color attachments are unbound from any texture units?
  - Possible fixes:
    - Don't bind the extra 2 textures recently used by the framebuffer in the previous `step` command?
    - Explicitly unbind the framebuffer's textures before they're rendered to?
    - Patch/PR `regl` to unbind textures/framebuffers?
      - [Texture bind](https://github.com/regl-project/regl/blob/8c4b9c1bf78ff9a85366bf3441c084a1cd8b1f2c/lib/texture.js#L1178)
      - [Texture unbind](https://github.com/regl-project/regl/blob/8c4b9c1bf78ff9a85366bf3441c084a1cd8b1f2c/lib/texture.js#L1208)
      - [Framebuffer update and binding](https://github.com/regl-project/regl/blob/8c4b9c1bf78ff9a85366bf3441c084a1cd8b1f2c/lib/framebuffer.js#L296)
