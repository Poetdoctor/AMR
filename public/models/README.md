# Character models

Drop a rigged or posed human here as `person.glb` and the narrative will use it
instead of the procedural figure. Nothing else needs changing — see
`src/components/home/atmosphere.tsx`, which loads it if present and falls back
if not.

## What the file has to be

- **glTF binary (`.glb`)**, one file, textures embedded.
- **Facing +Z, standing on Y=0**, roughly 1.8 units tall. The loader normalises
  height and centres on the feet, but it cannot guess which way is forward.
- **Draco or Meshopt compressed**, and **under about 4 MB**. This is a narrative
  a phone has to stream: a 60 MB scan will stall the whole sequence on the
  device that most needs it to work.
- Ideally a few thousand triangles, not a few hundred thousand. Retopologised
  game-resolution meshes are right; raw photogrammetry is not.

## The licence question, which is the actual constraint

The model is served as a plain file from a public website. Anyone can open the
network tab and save it. So the licence has to permit **redistribution**, not
just "use".

**Renderpeople will not work here.** Their terms permit real-time rendering, but
§4.3(b) forbids "Disclosure, making easily accessible, and/or providing the 3D
data to third parties" and requires integration that stops third parties
extracting the files. A game packs assets into a binary; a website hands them
over. Using their models on this site would breach the licence — this is not a
technical limitation, and it does not go away by compressing the file.

Licences that do work, because they permit redistribution:

| Source                                         | Licence                | Notes                                                                                           |
| ---------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| [MakeHuman](http://www.makehumancommunity.org) | CC0 on exported meshes | Generates realistic humans, exports glTF. The safest option, and the output is genuinely yours. |
| [Ready Player Me](https://readyplayer.me)      | Permits web embedding  | Built for exactly this: browser avatars delivered as GLB.                                       |
| Sketchfab, filtered to **CC0**                 | CC0                    | Check each model individually; "free to download" is not the same as CC0.                       |
| Quaternius, Kenney                             | CC0                    | Stylised rather than photoreal.                                                                 |

If the team would rather use Renderpeople specifically, that needs written
consent from them for web delivery — their terms say so explicitly. Their
contact is info@renderpeople.com.
