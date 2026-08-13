import json

questions = [
    # 151
    {
        "id": 151, "subject": "Paper-II · Professional Knowledge", "topic": "Petrology — Metamorphic", "section": "Paper-II",
        "refined_question": "Metasomatism refers to a change in rock bulk composition brought about by:",
        "difficulty_level": 3,
        "difficulty_justification": "Requires distinguishing metasomatism (open-system chemical change) from isochemical metamorphism and deformation.",
        "correct_answer": "Change in bulk composition by fluid transport of elements",
        "distractors": [
            "Isochemical recrystallization under new pressure-temperature conditions",
            "Mechanical deformation producing foliation without chemical change",
            "Change in mineral assemblage driven solely by increasing temperature and pressure"
        ],
        "distractor_rationale": "Each distractor represents a distinct metamorphic process (contact/regional metamorphism, deformation, prograde metamorphism) commonly confused with metasomatism.",
        "correction_note": None
    },
    # 152
    {
        "id": 152, "subject": "Paper-II · Professional Knowledge", "topic": "Geophysics", "section": "Paper-II",
        "refined_question": "In well logging, the sonic tool measures compressional slowness (Δt), which is primarily used to calculate:",
        "difficulty_level": 3,
        "difficulty_justification": "Requires knowledge of the Wyllie time-average equation linking sonic transit time to porosity.",
        "correct_answer": "Porosity via the Wyllie time-average equation: ϕ = (Δt − Δtₘₐ)/(Δt_f − Δtₘₐ)",
        "distractors": [
            "Formation bulk density from gamma-gamma scattering for density-derived porosity",
            "Natural gamma-ray spectrometry of K, U, Th for shale volume and correlation",
            "Resistivity of invaded and virgin zones for water saturation via Archie's equation"
        ],
        "distractor_rationale": "Each distractor describes a different primary logging measurement (density, gamma-ray, resistivity) with its standard application.",
        "correction_note": None
    },
    # 153
    {
        "id": 153, "subject": "Paper-II · Professional Knowledge", "topic": "Economic Geology", "section": "Paper-II",
        "refined_question": "Sedimentary exhalative (SEDEX) deposits form at:",
        "difficulty_level": 3,
        "difficulty_justification": "Tests specific depositional environment knowledge for a major Zn-Pb deposit type.",
        "correct_answer": "Seafloor in submarine rift basins where hydrothermal fluids exhale into seawater",
        "distractors": [
            "Continental river delta distributary channels under subaerial conditions",
            "Near-surface karst solution cavities at atmospheric pressure",
            "Stable continental shelves far from volcanic or tectonic activity"
        ],
        "distractor_rationale": "Distractors represent fluvial, karst, and passive margin settings that host other deposit types (placer, Mississippi Valley, sedimentary copper).",
        "correction_note": None
    },
    # 154
    {
        "id": 154, "subject": "Paper-II · Professional Knowledge", "topic": "Geochronology", "section": "Paper-II",
        "refined_question": "In U–Pb dating of zircon, the two decay schemes (²³⁸U→²⁰⁶Pb and ²³⁵U→²⁰⁷Pb) are displayed on a:",
        "difficulty_level": 4,
        "difficulty_justification": "Requires understanding concordia/discordia geometry for interpreting open-system behavior.",
        "correct_answer": "Concordia diagram where concordant ages plot on the curve and discordant ages define a discordia line",
        "distractors": [
            "K–Ar isochron diagram using potassium feldspar from the same rock",
            "Radiocarbon calibration curve for organic matter in overlying sediments",
            "Single isotope ratio plot with no internal consistency check"
        ],
        "distractor_rationale": "Each distractor represents a different geochronological method or a flawed approach lacking the dual-system verification unique to U–Pb.",
        "correction_note": None
    },
    # 155
    {
        "id": 155, "subject": "Paper-II · Professional Knowledge", "topic": "Structural Geology", "section": "Paper-II",
        "refined_question": "A plunging anticline eroded to a planar surface shows an outcrop pattern of beds forming a:",
        "difficulty_level": 4,
        "difficulty_justification": "Requires 3D visualization of fold geometry intersecting a horizontal erosion plane.",
        "correct_answer": "V- or nose-shaped pattern closing in the direction of plunge",
        "distractors": [
            "Horseshoe pattern opening in the plunge direction",
            "Straight parallel belts of equal width curving around the closure",
            "Identical elliptical outcrops regardless of plunge direction"
        ],
        "distractor_rationale": "Horseshoe describes a syncline; parallel belts imply a non-plunging fold; ellipses ignore the asymmetric V-shape diagnostic of plunge.",
        "correction_note": None
    },
    # 156
    {
        "id": 156, "subject": "Paper-II · Professional Knowledge", "topic": "Coal Geology", "section": "Paper-II",
        "refined_question": "To extract 5 m³ of coal, 30 m³ of overburden must be removed. The stripping ratio is:",
        "difficulty_level": 2,
        "difficulty_justification": "Simple volumetric ratio calculation (overburden/coal) standard in opencast mine planning.",
        "correct_answer": "6 : 1",
        "distractors": [
            "0.17 : 1",
            "12 : 1",
            "7 : 1"
        ],
        "distractor_rationale": "0.17:1 inverts the ratio; 12:1 doubles it; 7:1 adds 1 — all common arithmetic errors.",
        "correction_note": None
    },
    # 157
    {
        "id": 157, "subject": "Paper-II · Professional Knowledge", "topic": "Hydrogeology", "section": "Paper-II",
        "refined_question": "How is Darcy velocity (v) related to seepage velocity (vₛ) in a porous medium of porosity n?",
        "difficulty_level": 3,
        "difficulty_justification": "Core concept distinguishing specific discharge from actual pore-water velocity.",
        "correct_answer": "vₛ = v / n, so seepage velocity exceeds Darcy velocity",
        "distractors": [
            "vₛ = v × n, so seepage velocity is always less than Darcy velocity",
            "vₛ < v, meaning seepage velocity is smaller than Darcy velocity",
            "Both velocities are identical for flow through any porous medium"
        ],
        "distractor_rationale": "First distractor inverts the porosity relationship; second states the wrong inequality; third ignores porosity entirely.",
        "correction_note": None
    },
    # 158
    {
        "id": 158, "subject": "Paper-II · Professional Knowledge", "topic": "Mineralogy", "section": "Paper-II",
        "refined_question": "What interference colours does quartz typically show in thin section under crossed polars?",
        "difficulty_level": 3,
        "difficulty_justification": "Diagnostic optical property; low birefringence (0.009) yields first-order grey/white.",
        "correct_answer": "First-order grey to white (low birefringence ≈ 0.009)",
        "distractors": [
            "Complete extinction in all orientations (isotropic behaviour)",
            "Second-order blue indicative of high birefringence",
            "Third-order red characteristic of strongly birefringent minerals"
        ],
        "distractor_rationale": "Extinction describes isotropic minerals; second/third order colours belong to calcite, pyroxene, or mica — common confusion in thin-section identification.",
        "correction_note": None
    },
    # 159
    {
        "id": 159, "subject": "Paper-II · Professional Knowledge", "topic": "Geomorphology", "section": "Paper-II",
        "refined_question": "In the Universal Soil Loss Equation (USLE), A = R·K·L·S·C·P, the factors represent:",
        "difficulty_level": 3,
        "difficulty_justification": "Standard soil conservation formula; requires matching each factor to its physical meaning.",
        "correct_answer": "R = rainfall erosivity, K = soil erodibility, L = slope length, S = slope steepness, C = cover, P = practice",
        "distractors": [
            "Rainfall intensity is the only factor; all others are fixed constants",
            "Slope angle alone controls soil loss; other factors are negligible",
            "A fixed constant predicts annual loss without measurable site factors"
        ],
        "distractor_rationale": "Each distractor oversimplifies the multiplicative model by isolating one factor or treating it as constant.",
        "correction_note": None
    },
    # 160
    {
        "id": 160, "subject": "Paper-II · Professional Knowledge", "topic": "Remote Sensing & GIS", "section": "Paper-II",
        "refined_question": "In radar remote sensing, backscatter strength increases with which surface characteristic relative to the radar wavelength?",
        "difficulty_level": 3,
        "difficulty_justification": "Fundamental radar scattering principle: rough surfaces (relative to λ) produce stronger backscatter.",
        "correct_answer": "Surface roughness relative to the radar wavelength",
        "distractors": [
            "Surface smoothness relative to the radar wavelength",
            "Increasing radar wavelength while surface roughness stays fixed",
            "Decreasing look angle to the target area"
        ],
        "distractor_rationale": "Smooth surfaces produce specular reflection away from sensor; longer λ makes surface appear smoother; look angle affects incidence but not the roughness-wavelength relationship.",
        "correction_note": None
    },
    # 161
    {
        "id": 161, "subject": "Paper-II · Professional Knowledge", "topic": "Engineering Geology", "section": "Paper-II",
        "refined_question": "Rock bolts in landslide remediation provide:",
        "difficulty_level": 3,
        "difficulty_justification": "Distinguishes active reinforcement (pre-tensioned bolts) from passive support and drainage methods.",
        "correct_answer": "Active reinforcement by compressing the rock mass and increasing frictional resistance along discontinuities",
        "distractors": [
            "Only redistribution of surface loads by shotcreting the slope face",
            "Removal of overburden to reduce gravitational driving force",
            "Blanket drainage of groundwater by horizontal filter drains"
        ],
        "distractor_rationale": "Describes shotcrete, excavation unloading, and drainage — separate mitigation techniques often combined with but distinct from rock bolting.",
        "correction_note": None
    },
    # 162
    {
        "id": 162, "subject": "Paper-II · Professional Knowledge", "topic": "Petrology — Igneous", "section": "Paper-II",
        "refined_question": "For plutonic rocks, the IUGS QAPF diagram uses which four mineral groups?",
        "difficulty_level": 2,
        "difficulty_justification": "Basic classification scheme memorisation; Q, A, P, F are the modal mineral proportions.",
        "correct_answer": "Quartz (Q), Alkali feldspar (A), Plagioclase (P), Feldspathoid (F)",
        "distractors": [
            "Silica percentage boundaries at 45, 52, 63, and 69 wt%",
            "Texture categories: phaneritic, aphanitic, glassy, porphyritic",
            "Colour index divisions: leucocratic, mesocratic, melanocratic"
        ],
        "distractor_rationale": "Each distractor represents a different igneous classification approach (chemical, textural, colour index) not used in the QAPF modal scheme.",
        "correction_note": None
    },
    # 163
    {
        "id": 163, "subject": "Paper-II · Professional Knowledge", "topic": "Petrology — Sedimentary", "section": "Paper-II",
        "refined_question": "Which minerals are most commonly produced by the precipitation of evaporites?",
        "difficulty_level": 2,
        "difficulty_justification": "Standard evaporite mineral assemblage; halite, gypsum, anhydrite are the classic trio.",
        "correct_answer": "Halite (NaCl), Gypsum (CaSO₄·2H₂O), Anhydrite (CaSO₄)",
        "distractors": [
            "Quartz, feldspar, and rock fragments transported by rivers",
            "Carbonate grains of biological origin including ooids and shell fragments",
            "Clay minerals and silt accumulated in quiet deep-marine basins"
        ],
        "distractor_rationale": "Detrital siliciclastics, biogenic carbonates, and deep-marine muds represent clastic, carbonate, and pelagic sedimentary processes, not evaporitic precipitation.",
        "correction_note": None
    },
    # 164
    {
        "id": 164, "subject": "Paper-II · Professional Knowledge", "topic": "Geophysics", "section": "Paper-II",
        "refined_question": "A sonic (acoustic) log records Δt, which is:",
        "difficulty_level": 3,
        "difficulty_justification": "Requires knowing Δt is interval transit time (slowness, μs/ft), the inverse of velocity, used in porosity equations.",
        "correct_answer": "Slowness (μs/ft) inversely related to compressional wave velocity; a primary porosity indicator",
        "distractors": [
            "Formation resistivity corrected for invasion and borehole diameter",
            "Direct reading of seismic velocity in m/s with no travel-time measurement",
            "Magnetic susceptibility to detect iron-rich horizons"
        ],
        "distractor_rationale": "Resistivity, velocity (not slowness), and magnetic susceptibility are measurements from induction/resistivity, check-shot/VSP, and magnetic logs respectively.",
        "correction_note": None
    },
    # 165
    {
        "id": 165, "subject": "Paper-II · Professional Knowledge", "topic": "Structural Geology", "section": "Paper-II",
        "refined_question": "Given the outcrop positions and elevations of three points on a planar surface, what attitude can be determined?",
        "difficulty_level": 4,
        "difficulty_justification": "Classic three-point problem; tests ability to derive strike and dip from map coordinates and elevations.",
        "correct_answer": "Strike and dip of the plane using elevation differences between the three points",
        "distractors": [
            "Fault throw from vertical separation at the surface trace",
            "Fold interlimb angle from two limb surface orientations",
            "Outcrop trace of a formation from three borehole intersections"
        ],
        "distractor_rationale": "Each distractor describes a different structural problem (fault analysis, fold geometry, subsurface correlation) solvable with other data.",
        "correction_note": None
    },
    # 166
    {
        "id": 166, "subject": "Paper-II · Professional Knowledge", "topic": "Hydrogeology", "section": "Paper-II",
        "refined_question": "What distinguishes the water table of an unconfined aquifer from the potentiometric surface of a confined aquifer?",
        "difficulty_level": 2,
        "difficulty_justification": "Fundamental definition: water table is the phreatic surface; potentiometric surface is the hydraulic head in a confined aquifer.",
        "correct_answer": "Water table: phreatic surface in an unconfined aquifer. Potentiometric surface: hydraulic head in a confined aquifer",
        "distractors": [
            "Water table is the head surface of the confined aquifer at depth",
            "Potentiometric surface is the phreatic surface of an unconfined aquifer",
            "Water table is always higher than the potentiometric surface in a drainage basin"
        ],
        "distractor_rationale": "Swaps the definitions; confuses the terms; makes an incorrect generalisation about relative elevations.",
        "correction_note": None
    },
    # 167
    {
        "id": 167, "subject": "Paper-II · Professional Knowledge", "topic": "Remote Sensing & GIS", "section": "Paper-II",
        "refined_question": "In GIS spatial analysis, overlay for suitability studies involves:",
        "difficulty_level": 3,
        "difficulty_justification": "Core GIS operation; weighted overlay combines multiple criteria layers for decision support.",
        "correct_answer": "Intersection of multiple thematic layers with attribute weighting for suitability modelling",
        "distractors": [
            "Simple union of layers without any attribute weighting scheme",
            "Display of only a single raster layer at a time for visual inspection",
            "Visual comparison of layers by eye without computational analysis"
        ],
        "distractor_rationale": "Union without weighting, single-layer display, and visual-only comparison are lesser or incorrect forms of multi-criteria analysis.",
        "correction_note": None
    },
    # 168
    {
        "id": 168, "subject": "Paper-II · Professional Knowledge", "topic": "Stratigraphy", "section": "Paper-II",
        "refined_question": "The age and stratigraphic subdivision of the Vindhyan Basin of peninsular India is:",
        "difficulty_level": 3,
        "difficulty_justification": "Requires specific knowledge of India's major Proterozoic basin and its four main groups.",
        "correct_answer": "Proterozoic (~1.7–0.5 Ga); Semri, Kaimur, Rewa, and Bhander groups",
        "distractors": [
            "Mesozoic (Triassic–Jurassic) rift basin with Gondwana-type coal-bearing fluvial sediments",
            "Archean (3.4–2.5 Ga) greenstone–granite terrain of the northern Indian Shield",
            "Paleozoic (Cambrian–Permian) shelf basin with rich marine brachiopod fossil assemblages"
        ],
        "distractor_rationale": "Gondwana (Mesozoic coal), Archean basement, and Paleozoic Himalayan shelf sequences are distinct Indian stratigraphic units often confused with the Vindhyans.",
        "correction_note": None
    },
    # 169
    {
        "id": 169, "subject": "Paper-II · Professional Knowledge", "topic": "Structural Geology", "section": "Paper-II",
        "refined_question": "A bed dipping 60° shows a horizontal outcrop width of 20 m. Its true (perpendicular) thickness is approximately:",
        "difficulty_level": 3,
        "difficulty_justification": "Applies t = w × sin(δ); sin 60° = 0.866, yielding 17.3 m.",
        "correct_answer": "17.3 m",
        "distractors": [
            "10.0 m",
            "20.0 m",
            "22.3 m"
        ],
        "distractor_rationale": "10 m uses sin 30°; 20 m ignores dip (true thickness = width); 22.3 m uses 1/sin 60° (inverse error).",
        "correction_note": None
    },
    # 170
    {
        "id": 170, "subject": "Paper-II · Professional Knowledge", "topic": "Geomorphology", "section": "Paper-II",
        "refined_question": "Badland topography on soft rocks is produced by:",
        "difficulty_level": 3,
        "difficulty_justification": "Diagnostic landform-process linkage; intense gully erosion in weak materials yields high drainage density.",
        "correct_answer": "Intense gully erosion in soft rocks (shale, clay) creating steep slopes, high drainage density, and rapid erosion rates",
        "distractors": [
            "Uniform sheet erosion removing a thin soil layer across an entire hillslope",
            "Dissolution of carbonate rocks producing sinkholes, caves, and underground drainage",
            "Numerous small channels readily removed by normal ploughing each season"
        ],
        "distractor_rationale": "Sheet erosion, karst, and rill erosion (ploughable) are distinct processes/landforms from badland gullying.",
        "correction_note": None
    },
    # 171
    {
        "id": 171, "subject": "Paper-II · Professional Knowledge", "topic": "Petrology — Sedimentary", "section": "Paper-II",
        "refined_question": "Red beds differ from grey beds in depositional oxidation conditions by:",
        "difficulty_level": 3,
        "difficulty_justification": "Classic diagenetic colour contrast: hematite (oxidising) vs pyrite/organic (reducing).",
        "correct_answer": "Red beds: hematite coating under oxidising conditions; Grey beds: pyrite/organic matter under reducing conditions",
        "distractors": [
            "Red beds: pyrite framboids in reducing conditions; Grey beds: hematite coating",
            "Red beds: iron sulfide and organic matter; Grey beds: hematite and ferric oxides",
            "Red beds: reducing conditions with pyrite; Grey beds: oxidising conditions with hematite"
        ],
        "distractor_rationale": "Each distractor reverses or scrambles the mineral–oxidation state pairing.",
        "correction_note": None
    },
    # 172
    {
        "id": 172, "subject": "Paper-II · Professional Knowledge", "topic": "Geomorphology", "section": "Paper-II",
        "refined_question": "In the Strahler stream ordering system, the order of a segment is determined by:",
        "difficulty_level": 4,
        "difficulty_justification": "Requires precise rule: headwaters = 1; confluence of two same-order streams increases order; different orders → higher order unchanged.",
        "correct_answer": "Headwater streams are order 1; when two streams of the same order join, the downstream segment increases by one order",
        "distractors": [
            "Shreve method: order equals the sum of the two upstream orders at each junction",
            "Hack method: every link assigned an order of magnitude one",
            "Horton method: order-one streams join to form order two, order two to form order three"
        ],
        "distractor_rationale": "Shreve (magnitude), Hack (link-based), and the oversimplified Horton description are distinct ordering systems or misstatements of Strahler's rule.",
        "correction_note": None
    },
    # 173
    {
        "id": 173, "subject": "Paper-II · Professional Knowledge", "topic": "Petrology — Sedimentary", "section": "Paper-II",
        "refined_question": "An organic-rich black shale is a potential hydrocarbon source rock when it has:",
        "difficulty_level": 3,
        "difficulty_justification": "Key source-rock criteria: high TOC (>2%), anoxic/reducing deposition, kerogen types I/II.",
        "correct_answer": "High total organic carbon (>2%) deposited under reducing (anoxic) conditions preserving kerogen",
        "distractors": [
            "High TOC (>2%) but formed exclusively under oxidising, well-oxygenated conditions",
            "Freshwater lake origin only, with no organic carbon or pyrite preservation",
            "Oxidising conditions with low TOC, rich in hematite and ferric iron minerals"
        ],
        "distractor_rationale": "Oxidising conditions destroy organic matter; freshwater-only and low-TOC oxidised shales lack source-rock potential.",
        "correction_note": None
    },
    # 174
    {
        "id": 174, "subject": "Paper-II · Professional Knowledge", "topic": "Engineering Geology", "section": "Paper-II",
        "refined_question": "Barton's Q-system: Q = (RQD/Jn)×(Jr/Ja)×(Jw/SRF). For RQD=75, Jn=12, Jr=1.5, Ja=2, Jw=1, SRF=1, Q equals:",
        "difficulty_level": 4,
        "difficulty_justification": "Multi-parameter calculation; correct grouping and arithmetic yields Q ≈ 4.7 (Poor rock class).",
        "correct_answer": "4.7 (Poor rock mass quality)",
        "distractors": [
            "300 (Extremely good) — from misplacing RQD and Jn",
            "0.21 (Extremely poor) — from inverting the first two ratios",
            "67 (Very good) — from adding/subtracting parameters instead of multiplying"
        ],
        "distractor_rationale": "Each distractor reflects a common algebraic error in the Q-formula structure.",
        "correction_note": None
    },
    # 175
    {
        "id": 175, "subject": "Paper-II · Professional Knowledge", "topic": "Engineering Geology", "section": "Paper-II",
        "refined_question": "The most critical geological factors for tunnel design are:",
        "difficulty_level": 3,
        "difficulty_justification": "Standard tunnel site investigation priorities: rock mass quality, groundwater, squeezing/swelling, gas.",
        "correct_answer": "Rock mass quality, groundwater inflow, swelling/squeezing ground conditions, and gas occurrence",
        "distractors": [
            "Only tunnel length and number of cross-passages in the heading",
            "Only muck disposal space availability near the portal",
            "Only laboratory rock strength on dry core samples"
        ],
        "distractor_rationale": "Each distractor isolates a single logistical or lab parameter, ignoring the comprehensive geotechnical assessment required.",
        "correction_note": None
    },
    # 176
    {
        "id": 176, "subject": "Paper-II · Professional Knowledge", "topic": "Coal Geology", "section": "Paper-II",
        "refined_question": "A coal seam covers 2 km², is 2 m thick, with density 1.4 t/m³. The in-situ reserve is approximately:",
        "difficulty_level": 2,
        "difficulty_justification": "Direct volume × density calculation: 2×10⁶ m² × 2 m × 1.4 t/m³ = 5.6 Mt.",
        "correct_answer": "5.6 Mt",
        "distractors": [
            "4.0 Mt",
            "11.2 Mt",
            "2.8 Mt"
        ],
        "distractor_rationale": "4 Mt omits density; 11.2 Mt doubles the result; 2.8 Mt halves it — common arithmetic slips.",
        "correction_note": None
    },
    # 177
    {
        "id": 177, "subject": "Paper-II · Professional Knowledge", "topic": "Structural Geology", "section": "Paper-II",
        "refined_question": "An upward-arching fold with the oldest beds in its core is called a(n):",
        "difficulty_level": 1,
        "difficulty_justification": "Basic fold definition; anticline = arch up, oldest in core.",
        "correct_answer": "Anticline",
        "distractors": [
            "Monocline",
            "Graben",
            "Syncline"
        ],
        "distractor_rationale": "Monocline is a single limb; graben is a fault-bounded basin; syncline is a downward fold with youngest in core.",
        "correction_note": None
    },
    # 178
    {
        "id": 178, "subject": "Paper-II · Professional Knowledge", "topic": "Coal Geology", "section": "Paper-II",
        "refined_question": "A coal seam covers 5 km², is 5 m thick, with density 1.4 t/m³. The in-situ reserve is approximately:",
        "difficulty_level": 2,
        "difficulty_justification": "5×10⁶ m² × 5 m × 1.4 t/m³ = 35 Mt; straightforward reserve estimation.",
        "correct_answer": "35 Mt",
        "distractors": [
            "17.5 Mt",
            "25 Mt",
            "70 Mt"
        ],
        "distractor_rationale": "17.5 Mt uses half the thickness; 25 Mt omits density (or uses 1.0); 70 Mt doubles the correct value.",
        "correction_note": None
    },
    # 179
    {
        "id": 179, "subject": "Paper-II · Professional Knowledge", "topic": "Structural Geology", "section": "Paper-II",
        "refined_question": "Apparent dip (α) of a plane is calculated from true dip (δ) and the angle (θ) between strike and section plane by:",
        "difficulty_level": 4,
        "difficulty_justification": "Trigonometric relationship tan α = tan δ · sin θ; apparent dip ≤ true dip, maximum when section ⟂ strike (θ = 90°).",
        "correct_answer": "tan α = tan δ · sin θ, where α = apparent dip, δ = true dip, θ = angle between strike and section plane",
        "distractors": [
            "tan α = tan δ · cos θ",
            "tan α = sin δ · tan θ",
            "tan α = cos δ · tan θ"
        ],
        "distractor_rationale": "Cosine version gives maximum at θ=0° (wrong); sine-dip and cosine-dip variants are dimensionally inconsistent or geometrically incorrect.",
        "correction_note": None
    },
    # 180
    {
        "id": 180, "subject": "Paper-II · Professional Knowledge", "topic": "Mineralogy", "section": "Paper-II",
        "refined_question": "The streak colour of hematite on a streak plate is:",
        "difficulty_level": 1,
        "difficulty_justification": "Diagnostic property: hematite (Fe₂O₃) gives a reddish-brown streak regardless of specular or earthy habit.",
        "correct_answer": "Reddish brown",
        "distractors": [
            "Greenish black",
            "Pale yellow",
            "Snow white"
        ],
        "distractor_rationale": "Greenish black is magnetite/chromite; pale yellow is sulfur; snow white is quartz/feldspar/gypsum — common mineral streak colours.",
        "correction_note": None
    },
    # 181
    {
        "id": 181, "subject": "Paper-II · Professional Knowledge", "topic": "Hydrogeology", "section": "Paper-II",
        "refined_question": "Darcy's law states groundwater discharge is proportional to hydraulic gradient and the:",
        "difficulty_level": 2,
        "difficulty_justification": "Q = K·i·A; hydraulic conductivity (K) is the proportionality constant for a given medium.",
        "correct_answer": "Hydraulic conductivity (permeability) of the medium",
        "distractors": [
            "Porosity of the medium",
            "Specific yield of the aquifer",
            "Temperature of the flowing water"
        ],
        "distractor_rationale": "Porosity and specific yield relate to storage, not flow rate; temperature affects viscosity but is not the primary medium property in Darcy's law.",
        "correction_note": None
    },
    # 182
    {
        "id": 182, "subject": "Paper-II · Professional Knowledge", "topic": "Coal Geology", "section": "Paper-II",
        "refined_question": "A section shows 30 m of overburden above a 3 m coal seam. The volumetric stripping ratio (overburden : coal) is:",
        "difficulty_level": 2,
        "difficulty_justification": "Simple ratio 30/3 = 10:1; thickness-based stripping ratio.",
        "correct_answer": "10 : 1",
        "distractors": [
            "0.1 : 1",
            "11 : 1",
            "20 : 1"
        ],
        "distractor_rationale": "0.1:1 inverts the ratio; 11:1 adds 1; 20:1 may use 30/1.5 or similar miscalculation.",
        "correction_note": None
    },
    # 183
    {
        "id": 183, "subject": "Paper-II · Professional Knowledge", "topic": "Structural Geology", "section": "Paper-II",
        "refined_question": "On a Flinn diagram, K = (R₁₂−1)/(R₂₃−1) where R are axial ratios. K > 1 indicates:",
        "difficulty_level": 4,
        "difficulty_justification": "Flinn plot interpretation: K>1 = prolate (L-tectonite, elongation dominant); K<1 = oblate (S-tectonite); K=1 = plane strain.",
        "correct_answer": "L-tectonite (prolate, cigar-shaped fabric) with elongation strain dominant",
        "distractors": [
            "Oblate (pancake-shaped) fabric with flattening strain dominant",
            "Plane strain with no deformation along the intermediate principal strain axis",
            "Flattening strain with greatest shortening along the maximum principal stress direction"
        ],
        "distractor_rationale": "Oblate = K<1; plane strain = K=1; the last option misstates the strain geometry for K>1.",
        "correction_note": None
    },
    # 184
    {
        "id": 184, "subject": "Paper-II · Professional Knowledge", "topic": "Mineralogy", "section": "Paper-II",
        "refined_question": "On the Mohs scale of hardness, the mineral assigned value 10 (hardest) is:",
        "difficulty_level": 1,
        "difficulty_justification": "Rote memorisation of the Mohs scale endpoint.",
        "correct_answer": "Diamond",
        "distractors": [
            "Quartz",
            "Topaz",
            "Corundum"
        ],
        "distractor_rationale": "Quartz=7, Topaz=8, Corundum=9 — the three minerals immediately below diamond on the scale.",
        "correction_note": None
    },
    # 185
    {
        "id": 185, "subject": "Paper-II · Professional Knowledge", "topic": "Geochronology", "section": "Paper-II",
        "refined_question": "A rock retains 50% of its original parent isotope (half-life 4.47 Gyr). Its radiometric age is approximately:",
        "difficulty_level": 3,
        "difficulty_justification": "50% remaining = exactly one half-life elapsed; age = 4.47 Gyr.",
        "correct_answer": "4.47 Gyr",
        "distractors": [
            "8.94 Gyr",
            "2.24 Gyr",
            "6.71 Gyr"
        ],
        "distractor_rationale": "8.94 Gyr = two half-lives (25% remaining); 2.24 Gyr = half a half-life (confused math); 6.71 Gyr = 1.5 half-lives.",
        "correction_note": None
    },
    # 186
    {
        "id": 186, "subject": "Paper-II · Professional Knowledge", "topic": "Applied Geology and Environmental Geology", "section": "Paper-II",
        "refined_question": "Soil liquefaction hazard during strong seismic shaking is greatest in:",
        "difficulty_level": 3,
        "difficulty_justification": "Classic liquefaction susceptibility: saturated, loose, fine-grained sand/silt.",
        "correct_answer": "Saturated loose fine sand",
        "distractors": [
            "Densely packed gravel with good drainage",
            "Dry clay with low moisture content",
            "Massive solid rock with few discontinuities"
        ],
        "distractor_rationale": "Dense gravel drains quickly; dry clay lacks saturation; solid rock lacks pore space — none meet liquefaction criteria.",
        "correction_note": None
    },
    # 187
    {
        "id": 187, "subject": "Paper-II · Professional Knowledge", "topic": "Engineering Geology", "section": "Paper-II",
        "refined_question": "The most favourable geological conditions for a dam site are:",
        "difficulty_level": 3,
        "difficulty_justification": "Standard dam site criteria: competent foundation, watertight abutments, no active faults.",
        "correct_answer": "Foundation on competent rock, watertight abutments, and no active faults",
        "distractors": [
            "Thick alluvial gravel foundation with high seepage gradient",
            "Flat-lying shale with a weak shear zone along the foundation",
            "Reservoir underlain by soluble gypsum and anhydrite formations"
        ],
        "distractor_rationale": "All three distractors describe problematic conditions: high seepage, weak shear zone, and karstic dissolution — all avoided in dam siting.",
        "correction_note": None
    },
    # 188
    {
        "id": 188, "subject": "Paper-II · Professional Knowledge", "topic": "Geomorphology", "section": "Paper-II",
        "refined_question": "An arroyo is correctly described as a:",
        "difficulty_level": 3,
        "difficulty_justification": "Specific arid-land channel form: steep-walled, flat-floored, ephemeral, incised.",
        "correct_answer": "Steep-walled, flat-floored ephemeral channel in arid regions, typically incised",
        "distractors": [
            "Perennial channel carrying flowing water year-round without drying",
            "Broad U-shaped valley with steep walls carved by glacial ice",
            "Multiple unstable channels splitting and rejoining around mid-channel bars"
        ],
        "distractor_rationale": "Perennial stream, glacial trough, and braided river — distinct channel types from different process regimes.",
        "correction_note": None
    },
    # 189
    {
        "id": 189, "subject": "Paper-II · Professional Knowledge", "topic": "Plate Tectonics", "section": "Paper-II",
        "refined_question": "Back-arc basin formation by extension behind a volcanic arc is primarily caused by:",
        "difficulty_level": 4,
        "difficulty_justification": "Geodynamic mechanism: slab rollback or mantle wedge corner flow induces upper-plate extension.",
        "correct_answer": "Rollback of the subducting slab or mantle wedge convection",
        "distractors": [
            "Collision of a continental fragment with the volcanic arc",
            "Ridge subduction and opening of a slab window beneath the arc",
            "Crustal thickening due to compressional forces at the margin"
        ],
        "distractor_rationale": "Collision and compression cause shortening, not extension; slab window is a separate ridge-subduction phenomenon.",
        "correction_note": None
    },
    # 190
    {
        "id": 190, "subject": "Paper-II · Professional Knowledge", "topic": "Crystallography and Mineralogy", "section": "Paper-II",
        "refined_question": "The specific gravity of gold is approximately:",
        "difficulty_level": 2,
        "difficulty_justification": "Standard physical property; Au = 19.3 g/cm³.",
        "correct_answer": "19.3",
        "distractors": [
            "19.25",
            "11.34",
            "13.60"
        ],
        "distractor_rationale": "19.25 is a close distractor; 11.34 = lead; 13.60 = mercury — other dense metals often confused.",
        "correction_note": None
    },
    # 191
    {
        "id": 191, "subject": "Paper-II · Professional Knowledge", "topic": "Mineralogy", "section": "Paper-II",
        "refined_question": "Calcite cleaves in how many directions and at what angle?",
        "difficulty_level": 2,
        "difficulty_justification": "Diagnostic property: three perfect cleavages at ~75° (rhombohedral).",
        "correct_answer": "Three directions at approximately 75° (rhombohedral cleavage)",
        "distractors": [
            "Perfect cleavage producing thin elastic sheets",
            "Three directions of cleavage at right angles (cubic)",
            "A single direction of cleavage parallel to the base (basal)"
        ],
        "distractor_rationale": "Elastic sheets = mica; cubic = galite/halite; basal = graphite/mica — distinct cleavage types from other common minerals.",
        "correction_note": None
    },
    # 192
    {
        "id": 192, "subject": "Paper-II · Professional Knowledge", "topic": "Engineering Geology", "section": "Paper-II",
        "refined_question": "Shotcrete in underground construction is:",
        "difficulty_level": 2,
        "difficulty_justification": "Definition: pneumatically applied concrete (dry/wet mix), often fibre-reinforced, for immediate ground support.",
        "correct_answer": "Sprayed concrete (dry or wet mix), typically steel-fibre reinforced, applied directly to the rock surface",
        "distractors": [
            "Concrete cast in timber formwork and cured for 28 days before loading",
            "Precast panels bolted onto the rock face with no bonding material",
            "Poured tremie concrete placed underwater through a tremie pipe"
        ],
        "distractor_rationale": "Cast-in-place, precast panels, and tremie concrete are distinct placement methods, not shotcrete.",
        "correction_note": None
    },
    # 193
    {
        "id": 193, "subject": "Paper-II · Professional Knowledge", "topic": "Hydrogeology", "section": "Paper-II",
        "refined_question": "When multiple wells are pumped close together, well interference leads to:",
        "difficulty_level": 3,
        "difficulty_justification": "Superposition of drawdown cones increases total drawdown and reduces individual well yield.",
        "correct_answer": "Superposition of drawdown cones causing additional drawdown and reduced yield per well",
        "distractors": [
            "A single well lowers water level only within its own circle of influence",
            "Pumping one well raises the water level in all neighbouring wells",
            "Interference appears only when wells tap different aquifers"
        ],
        "distractor_rationale": "Ignores interference; reverses the hydraulic effect; incorrectly limits interference to cross-aquifer cases.",
        "correction_note": None
    },
    # 194
    {
        "id": 194, "subject": "Paper-II · Professional Knowledge", "topic": "Mineralogy and Petrology", "section": "Paper-II",
        "refined_question": "A garnet porphyroblast with inclusion trails (Si/Se) indicates:",
        "difficulty_level": 3,
        "difficulty_justification": "Inclusion trail geometry (straight vs curved) reveals timing of porphyroblast growth relative to deformation phases.",
        "correct_answer": "Timing of porphyroblast growth relative to deformation events",
        "distractors": [
            "Composition of the surrounding country rock",
            "Rate of cooling following peak metamorphism",
            "Pressure conditions during initial burial"
        ],
        "distractor_rationale": "Composition, cooling rate, and burial pressure are inferred from other microstructural or geochemical features, not inclusion trail geometry.",
        "correction_note": None
    },
    # 195
    {
        "id": 195, "subject": "Paper-II · Professional Knowledge", "topic": "Mineralogy", "section": "Paper-II",
        "refined_question": "Quartz belongs to which crystal system?",
        "difficulty_level": 2,
        "difficulty_justification": "Basic crystallography: quartz is trigonal (hexagonal subsystem).",
        "correct_answer": "Hexagonal (trigonal)",
        "distractors": [
            "Tetragonal",
            "Orthorhombic",
            "Cubic (isometric)"
        ],
        "distractor_rationale": "The three other common crystal systems; many rock-forming minerals belong to these (e.g., zircon=tetragonal, olivine=orthorhombic, garnet=cubic).",
        "correction_note": None
    },
    # 196
    {
        "id": 196, "subject": "Paper-II · Professional Knowledge", "topic": "Palaeontology", "section": "Paper-II",
        "refined_question": "A good index (guide) fossil should possess which characteristics?",
        "difficulty_level": 2,
        "difficulty_justification": "Classic definition: wide geographic distribution + narrow stratigraphic range.",
        "correct_answer": "Widespread geographic distribution but short-lived in geologic time",
        "distractors": [
            "Rare and confined to a single basin with an extremely long stratigraphic range",
            "Found in igneous and metamorphic rocks, permitting absolute-age dating of plutons",
            "Geographically restricted to one locality but present in almost every formation there"
        ],
        "distractor_rationale": "Each distractor violates one or both key criteria: narrow distribution, long range, wrong rock type, or restricted locality.",
        "correction_note": None
    },
    # 197
    {
        "id": 197, "subject": "Paper-II · Professional Knowledge", "topic": "Coal Geology", "section": "Paper-II",
        "refined_question": "Inertinite macerals in coal originate from which type of plant material?",
        "difficulty_level": 3,
        "difficulty_justification": "Maceral group definition: inertinite = oxidised/charred material (fusinite, semifusinite, micrinite).",
        "correct_answer": "Oxidised or charred plant material (fusain, charcoal)",
        "distractors": [
            "Fresh unaltered plant tissue preserved in peat before burial",
            "Spore exines rich in waxy cuticular material",
            "Algal remains deposited in marine basins"
        ],
        "distractor_rationale": "Fresh tissue = vitrinite; spore exines = liptinite; algal remains = liptinite/alginite — the other two maceral groups.",
        "correction_note": None
    },
    # 198
    {
        "id": 198, "subject": "Paper-II · Professional Knowledge", "topic": "Geomorphology", "section": "Paper-II",
        "refined_question": "An esker in a glaciated landscape is a:",
        "difficulty_level": 2,
        "difficulty_justification": "Standard glacial landform: sinuous ridge of stratified sand/gravel from subglacial meltwater streams.",
        "correct_answer": "Ridge of stratified sand and gravel deposited by a subglacial meltwater stream",
        "distractors": [
            "Circular depression formed when a buried ice block melts (kettle hole)",
            "Broad plain of stratified sand and gravel spread beyond the glacier margin (outwash plain)",
            "Gentle undulating plain of unsorted debris deposited directly by glacier ice (till plain)"
        ],
        "distractor_rationale": "Kettle hole, outwash plain, and till plain are distinct glacial depositional landforms often taught alongside eskers.",
        "correction_note": None
    },
    # 199
    {
        "id": 199, "subject": "Paper-II · Professional Knowledge", "topic": "Remote Sensing & GIS", "section": "Paper-II",
        "refined_question": "Which spaceborne sensor carries OLI and TIRS instruments with a 16-day revisit and 185 km swath?",
        "difficulty_level": 3,
        "difficulty_justification": "Specific satellite specification knowledge: Landsat 8/9 operational parameters.",
        "correct_answer": "Landsat 8: OLI (9 bands, 30 m) + TIRS (2 thermal bands, 100 m); 16-day revisit; 185 km swath",
        "distractors": [
            "Landsat 8: single panchromatic band at 15 m, no thermal capability",
            "Landsat 8: 36 spectral bands at 250 m resolution, daily revisit",
            "Landsat 8: 13 bands at 10 m resolution, 5-day revisit, 290 km swath"
        ],
        "distractor_rationale": "Describes: early Landsat MSS, MODIS, and Sentinel-2 specifications respectively — common satellite confusion.",
        "correction_note": None
    },
    # 200
    {
        "id": 200, "subject": "Paper-II · Professional Knowledge", "topic": "Geophysics", "section": "Paper-II",
        "refined_question": "Electrical resistivity tomography (ERT) produces a 2D/3D subsurface image by:",
        "difficulty_level": 4,
        "difficulty_justification": "ERT methodology: multi-electrode arrays (Wenner, dipole-dipole, Schlumberger), pseudo-sections, inversion.",
        "correct_answer": "Measuring apparent resistivity with multi-electrode arrays (Wenner, dipole-dipole, Schlumberger) and inverting for 2D/3D resistivity models",
        "distractors": [
            "One-dimensional vertical electrical sounding expanding current electrodes about a fixed centre",
            "Mapping magnetic susceptibility contrasts to locate buried ferrous objects",
            "Measuring natural electric and magnetic fields at surface to image deep crustal resistivity"
        ],
        "distractor_rationale": "VES (1D), magnetic survey, and magnetotellurics (MT) are distinct geophysical methods often confused with ERT.",
        "correction_note": None
    }
]

with open('/Users/vikasyadav/Development/crackgate/apps/web/src/data/questions/cil/geology/audit/out/cil-geology-07.05-geo-2.audit.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f"Generated {len(questions)} questions, IDs {questions[0]['id']} to {questions[-1]['id']}")
