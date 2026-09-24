# Avatar assets

## `placeholder-robot.glb` — in use now

RobotExpressive, from the three.js example models. 456KB.

- Animations: Idle, Wave, ThumbsUp, Yes, No, Dance, Jump, and more
- Face morph targets: Angry, Surprised, Sad
- No visemes, so it cannot lip-sync — it emotes and gestures instead

Credit: Tomás Laulhé, modified by Don McCurdy. Distributed with three.js under CC0.
Keep this note if the model stays in the project.

## `avatar.glb` — to replace it with

A Ready Player Me avatar of Mahesh. Create it from a selfie at https://readyplayer.me,
then download with the morph targets requested explicitly — the default export has no
facial blendshapes and cannot speak or blink:

    https://models.readyplayer.me/<your-id>.glb?morphTargets=Oculus%20Visemes,ARKit&textureAtlas=1024&quality=medium

- `Oculus Visemes` — mouth shapes for lip-sync
- `ARKit` — eye blinks for idle
- `textureAtlas` + `quality` — keeps it under ~3MB

Half-body reads better at hero scale than full-body, and weighs less.
