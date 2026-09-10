# Character models

`person.glb` is the figure used throughout the Home narrative.

## What is here

**Animated Human** by [Quaternius](https://poly.pizza/u/Quaternius), via
[Poly Pizza](https://poly.pizza/m/c3Ibh9I3udk). **CC0 / public domain.**
683 KB, 1,578 triangles, rigged, with eight animation clips.

It is small and it is rigged, and the second of those matters more. The
collapse in beat three is the model's own `Death` clip, scrubbed frame by frame
against the reader's scroll position rather than played at them. Extra polygons
would not have bought that.

## Replacing it

Drop a different `person.glb` in and everything picks it up — the loader
measures the skeleton, scales to 1.78 units and sits it on the floor. Two
things to know:

- **Measure the skeleton, not the mesh.** This model stores an 0.08-unit mesh
  under an armature that scales its bones by 69. `Box3.setFromObject` reads
  geometry through the world matrix and knows nothing about bone transforms, so
  it reported "eight centimetres tall" and the figure was scaled to roughly a
  hundred metres with the camera inside it. See `PersonModel.tsx`.
- **Clip names drive the poses.** `POSE_CLIPS` in `PersonModel.tsx` maps each
  beat's posture to a named clip. A replacement with different clip names needs
  that table updated, or every figure falls back to the first animation.

## The licence question, which is the real constraint

The model is served as a plain file from a public site. Anyone can open the
network tab and save it. So the licence has to permit **redistribution**, not
merely "use" — which is a much smaller set than it first appears.

**Renderpeople cannot be used here.** Their terms permit real-time rendering,
but §4.3(b) forbids "Disclosure, making easily accessible, and/or providing the
3D data to third parties" and requires integration that stops third parties
extracting the files. A game packs assets into a binary; a website hands them
over. This is not a technical limitation and compressing the file does not
change it. Using them would put the team in breach on a public site. If the
team wants them specifically, that needs written consent from
info@renderpeople.com.

Licences that do work, because they permit redistribution:

| Source                                         | Licence               | Notes                                            |
| ---------------------------------------------- | --------------------- | ------------------------------------------------ |
| [Quaternius](https://poly.pizza/u/Quaternius)  | CC0                   | What is here now. Rigged, animated, tiny.        |
| [MakeHuman](http://www.makehumancommunity.org) | CC0 on exports        | More realistic; you generate and own the output. |
| [Ready Player Me](https://readyplayer.me)      | Permits web embedding | Built for browser avatars delivered as GLB.      |
| Sketchfab, filtered to **CC0**                 | CC0                   | Check each model; "free to download" is not CC0. |
