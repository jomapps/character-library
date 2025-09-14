1) New prompts (pre-blocked, multi-angle)





Use this universal template for all shots, then copy the ready-made prompts below.



Universal template

Ultra-detailed studio reference of {CHARACTER}; {PHYSIQUE_TRAITS};

personality cues: {PERSONALITY}; neutral seamless background; natural soft key.



CAMERA (full-frame):

- focal length: {LENS}mm

- physical distance: {DIST} m

- azimuth: {AZIMUTH}°  (− = camera-left, + = camera-right)

- elevation: {ELEV}°

COMPOSITION:

- crop: {CROP}  | thirds: {THIRDS} | headroom: {HEADROOM}

SUBJECT:

- shoulder yaw: {YAW}°  | gaze: {GAZE}  | pose: {POSE}

EXPOSURE: f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s

FOCUS: eyes tack sharp; realistic pores; natural micro-speculars.



reference_image: {REF_URL}

reference_weight: {REF_WEIGHT}



--negatives: centered_composition, front_facing (when not frontal), wrong_crop,

CGI, 3D, illustration, cartoon, props, text, watermarks, heavy DOF blur.



Core 9 (ready to paste)





Swap {CHARACTER}, {PHYSIQUE_TRAITS}, {PERSONALITY}, {REF_URL}.

If you want to run for Maya Chen now, just set {REF_URL} to your master and keep {REF_WEIGHT} values as written.



1) 35A_FRONT_FULL_A_POSE

...LENS: 35 | DIST: 3.4 | AZIMUTH: 0 | ELEV: 0

CROP: full | THIRDS: centered | HEADROOM: equal | YAW: 0 | GAZE: to_camera | POSE: a_pose

EXPOSURE: f/4, ISO 200, 1/250s

reference_weight: 0.90

--negatives: none beyond template

2) 35A_3QLEFT_3Q

...LENS: 35 | DIST: 2.7 | AZIMUTH: -35 | ELEV: 0

CROP: 3q (mid-thigh) | THIRDS: subject_on_right_third | HEADROOM: equal

YAW: +35 | GAZE: off_camera_left | POSE: relaxed

EXPOSURE: f/4, ISO 200, 1/250s

reference_weight: 0.80

--negatives: centered_composition, front_facing, full_body

3) 35A_3QRIGHT_3Q

...LENS: 35 | DIST: 2.7 | AZIMUTH: +35 | ELEV: 0

CROP: 3q | THIRDS: subject_on_left_third | HEADROOM: equal

YAW: -35 | GAZE: off_camera_right | POSE: relaxed

EXPOSURE: f/4, ISO 200, 1/250s

reference_weight: 0.80

--negatives: centered_composition, front_facing, full_body

4) 50C_FRONT_CU_NEUTRAL

...LENS: 50 | DIST: 1.1 | AZIMUTH: 0 | ELEV: 0

CROP: cu (chest-up) | THIRDS: center_or_left_third | HEADROOM: equal

YAW: 0 | GAZE: to_camera | POSE: relaxed | expression: neutral

EXPOSURE: f/2.8, ISO 200, 1/250s

reference_weight: 0.85

--negatives: wrong_crop

5) 50C_3QLEFT_CU_THOUGHTFUL

...LENS: 50 | DIST: 1.1 | AZIMUTH: -35 | ELEV: 0

CROP: cu | THIRDS: subject_on_right_third | HEADROOM: equal

YAW: +35 | GAZE: off_camera_left | POSE: relaxed | expression: thoughtful

EXPOSURE: f/2.8, ISO 200, 1/250s

reference_weight: 0.80

--negatives: centered_composition, front_facing, wrong_crop

6) 50C_3QRIGHT_CU_DETERMINED

...LENS: 50 | DIST: 1.1 | AZIMUTH: +35 | ELEV: 0

CROP: cu | THIRDS: subject_on_left_third | HEADROOM: equal

YAW: -35 | GAZE: to_camera | POSE: relaxed | expression: determined

EXPOSURE: f/2.8, ISO 200, 1/250s

reference_weight: 0.80

--negatives: centered_composition, front_facing, wrong_crop

7) 85E_FRONT_MCU_SUBTLE_CONCERN

...LENS: 85 | DIST: 1.8 | AZIMUTH: 0 | ELEV: +5

CROP: mcu (shoulders-up) | THIRDS: center_or_left_third | HEADROOM: tight

YAW: 0 | GAZE: to_camera | POSE: relaxed | expression: subtle_concern

EXPOSURE: f/2.5, ISO 200, 1/250s

reference_weight: 0.85

--negatives: wrong_crop

8) 85E_3QLEFT_MCU_RESOLUTE

...LENS: 85 | DIST: 1.8 | AZIMUTH: -40 | ELEV: +5

CROP: mcu | THIRDS: subject_on_right_third | HEADROOM: tight

YAW: +40 | GAZE: to_camera | POSE: relaxed | expression: resolute

EXPOSURE: f/2.5, ISO 200, 1/250s

reference_weight: 0.78

--negatives: centered_composition, front_facing, wrong_crop

9) 85E_3QRIGHT_MCU_VULNERABLE

...LENS: 85 | DIST: 1.8 | AZIMUTH: +40 | ELEV: +5

CROP: mcu | THIRDS: subject_on_left_third | HEADROOM: tight

YAW: -40 | GAZE: down_10deg | POSE: relaxed | expression: vulnerable

EXPOSURE: f/2.5, ISO 200, 1/250s

reference_weight: 0.78

--negatives: centered_composition, front_facing, wrong_crop



Add-ons (quick)





PROFILE LEFT (85mm MCU)

...LENS: 85 | DIST: 1.8 | AZIMUTH: -90 | ELEV: +5

CROP: mcu | THIRDS: subject_on_right_third

YAW: +90 | GAZE: neutral | expression: neutral

EXPOSURE: f/2.5, ISO 200, 1/250s

reference_weight: 0.75

--negatives: front_facing, centered_composition, wrong_crop

PROFILE RIGHT (85mm MCU)

...LENS: 85 | DIST: 1.8 | AZIMUTH: +90 | ELEV: +5

CROP: mcu | THIRDS: subject_on_left_third

YAW: -90 | GAZE: neutral | expression: neutral

EXPOSURE: f/2.5, ISO 200, 1/250s

reference_weight: 0.75

--negatives: front_facing, centered_composition, wrong_crop

BACK FULL (35mm)

...LENS: 35 | DIST: 3.4 | AZIMUTH: 180 | ELEV: 0

CROP: full | THIRDS: centered | HEADROOM: equal

YAW: 180 | GAZE: away | POSE: relaxed

EXPOSURE: f/4, ISO 200, 1/250s

reference_weight: 0.70

--negatives: front_facing

HANDS CU (macro)

Ultra-detailed studio reference of {CHARACTER} hands; neutral pose; no props.

CAMERA: 100mm macro equivalent | DIST: 0.45 m | AZIMUTH: 0 | ELEV: 0

CROP: hands | THIRDS: centered | POSE: hands_centered, fingers relaxed

EXPOSURE: f/5.6, ISO 200, 1/250s

reference_image: {REF_URL} | reference_weight: 0.90

--negatives: face_visible, long_shot, props, text, watermarks









2) Simple protocol — file & asset addition (first framing)





A. Folder structure (per show)

/SHOW/

  /Characters/{CHAR}/

    /01_MasterRef/   (master JPG/PNG + README.md with traits)

    /02_CorePack/    (Core 9 outputs)

    /03_AddOns/      (profiles/back/hands/t-pose)

    /04_Grids/       (contact sheets)

    /metadata/

      reference_shots.csv

      reference_shots.json

  /Scenes/{SCENE_CODE}/

    /Refs/ (scene look refs: locations, props, lighting)

    /Grids/

B. File naming

{CHAR}_{LENS}{MODE}_{ANGLE}_{CROP}_{EXPR}_v{N}.jpg

Example: MayaChen_50C_3QRIGHT_CU_DETERMINED_v1.jpg



C. Metadata (CSV or JSON)



Required columns: slug, lensMm, mode, angle, crop, expression, pose, fStop, iso, shutterSpeed, cameraAzimuthDeg, cameraElevationDeg, subjectYawDeg, cameraDistanceM, thirds, gaze, refWeight, seed, notes.
Keep a single reference_shots.csv in /metadata/ and update per run.




D. Contact sheet (grid) spec



Core 9: 3×3 grid ordered left→right, top→bottom = 35/front, 35/3QL, 35/3QR, 50/front, 50/3QL, 50/3QR, 85/front, 85/3QL, 85/3QR.
Include tiny caption = {LENS}{MODE}_{ANGLE}_{CROP}.




E. QC checklist before approval



Angle matches azimuth/yaw;
Crop matches (FULL/3Q/MCU/CU);
Thirds/headroom correct;
Lens + distance pair applied;
Expressions/pose per spec;
No centered drift unless specified.










3) Categories of other assets (reusable for any movie)





For each category, use a Coverage Pack = Lenses (24/35/50/85) × Angles (front, 3Q left/right, profile when relevant) × Heights (low 1.2 m / eye 1.6 m / high 2.1 m). Save with the same naming + metadata fields.





A) Locations / Sets





What to gather: empty set plates, doorways, hallways, room corners, exteriors; time-of-day (day, golden, night), weather variants.
Angles: wide 24mm (master), 35mm (walk-in), 50mm (dialogue staging), 85mm (detail background).
Extras: blocking marks (X/Y), entrance/exits arrows embedded in metadata notes.
Prompt tail: “include architectural lines; horizon at eye-level or {ELEV}°; negative space on {side} third.”






B) Vehicles / Machinery





Exterior turnarounds: front, 3Q left/right, side, back (24/35mm);
Interior: driver/passenger seats (35/50/85), dashboard macro (100mm), pedals/hands.
Variants: day/night, engine on (glow), wet car.
Prompt tail: “orthographic-like perspective; wheel alignment straight; reflections controlled.”






C) Props (Hero + Hand props)





Turntable pack: 0/45/90/135/180/225/270/315° on neutral sweep.
Macro details: logos, seams, wear (100mm macro).
In-hand pack: left/right hand interactions at 50/85mm.
Prompt tail: “measure-true scale; no stylization; consistent soft key camera-left 45°.”






D) Wardrobe / Costume





Mannequin or character: front/back/3Q, full and 3Q crops (35mm); material swatches macro.
Variants: clean, distressed levels (L1–L3), wet, dusty.
Prompt tail: “include fabric weave visibility; true color under 5600K.”






E) Hair / Makeup





Angles: front, 3Q, profile, back (85mm MCU), hairline macro (100mm).
Variants: day-look, action-sweat, post-fight, wind/speed.






F) Lighting Lookbook





Ratios: key:fill 1:1, 2:1, 4:1; rim on/off; color temp 3200K/5600K.
Angles: 0/45/90° key positions at 50mm CU.
Prompt tail: “visible catchlight position matches key angle; shadows clean; no hard color gels.”






G) VFX / Plates / Elements





Clean plates (locked), BG cards (parallax), FX elements (smoke, sparks) on black/alpha.
Angles: match scene camera azimuth/elevation when known.
Prompt tail: “film backplate, no subject; maintain lens distortion model if applicable.”






H) Stunts / Action Beats (Previs stills)





Key poses: wind-up, peak, recovery; silhouettes readable at 35mm full and 50mm 3Q.
Safety: mark landing zones in notes.






I) UI / Screens / Inserts





Angles: straight-on + 3Q left/right; glare-controlled version.
Macro: bezels, buttons.






J) Crowd / Extras Types





Distance staging: wide (24mm groups), medium (35/50 singles/pairs), 85mm reaction.
Diversity: attire variations per scene (office, garage, street).










Category prompt mini-template



{ASSET_TYPE} reference for {SHOW/SCENE}; neutral controlled lighting.



CAMERA: {LENS}mm | DIST: {DIST} m | AZIMUTH: {AZ}° | ELEV: {EL}°

COMPOSITION: {CROP} | thirds: {THIRDS} | headroom: {HEADROOM}

SUBJECT/OBJECT: {NOTES_SPECIFIC_TO_CATEGORY}

EXPOSURE: f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s



reference_image: {REF_URL} (if any) | reference_weight: {REF_WEIGHT}

--negatives: stylization, CGI, text, watermarks, wrong_crop, centered_composition (if thirds required)

That’s everything you need to (a) generate the new character pack with true angle/lens variety, (b) add files cleanly, and (c) spin up consistent asset packs—locations, props, vehicles, wardrobe, lighting, etc.—for any show.

