# Notes - Private

## To-Do

- GPGPU: use texture atlasses for states rather than arrays of textures?
- [Screen-space lines in `regl`](https://github.com/regl-project/regl/blob/gh-pages/example/line.js)
- [Screen-space lines in `regl` - article](https://observablehq.com/@rreusser/quick-miterless-lines-in-webgl)

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

## Done

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
  - Fixed by:
    - Don't bind the extra 2 textures recently used by the framebuffer in the previous `step` command.
