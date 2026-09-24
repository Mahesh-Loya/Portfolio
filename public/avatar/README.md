# Avatar asset

Drop the Ready Player Me export here as `avatar.glb`.

Create it at https://readyplayer.me from a selfie, then request the morph targets
explicitly when downloading — the default export has no facial blendshapes and
cannot speak or blink:

    https://models.readyplayer.me/<your-id>.glb?morphTargets=Oculus%20Visemes,ARKit&textureAtlas=1024&quality=medium

- `Oculus Visemes` — mouth shapes for lip-sync
- `ARKit` — eye blinks for idle
- `textureAtlas` + `quality` — keeps the file under ~3MB

Half-body reads better at hero scale than full-body, and weighs less.
