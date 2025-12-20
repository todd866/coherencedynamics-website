export interface Paper {
  slug: string;
  title: string;
  journal: string;
  year: number;
  status: 'published' | 'submitted' | 'in_prep';
  doi?: string;
  ssrn?: string;
  github?: string;
  pdf?: string; // direct link to PDF (e.g., GitHub raw URL)
  simulation?: string; // slug of companion simulation
  image?: string; // filename in /images/ (e.g., 'falsifiability.jpeg')
  description: string;
  whyItMatters?: string;
  keyFindings?: string[];
  workflow?: string; // AI workflow statement
}

export const papers: Paper[] = [
  // === PUBLISHED ===
  {
    slug: 'falsifiability',
    title: 'The Limits of Falsifiability: Dimensionality, Measurement Thresholds, and the Sub-Landauer Domain in Biological Systems',
    journal: 'BioSystems (October 2025)',
    year: 2025,
    status: 'published',
    doi: '10.1016/j.biosystems.2025.105608',
    simulation: 'protein-observer',
    image: 'falsifiability.png',
    description: `**Popper's falsifiability criterion breaks down for high-dimensional biological systems** — not because biology is messy, but because of a fundamental physical limit on what yes/no tests can tell us.

Here's the problem: biological systems exist in absurdly high-dimensional spaces. A single cell needs thousands of variables to describe. When you try to test a yes/no hypothesis about such systems, you're projecting all that complexity onto a single bit. For a modest 100-neuron circuit, a binary test preserves about $10^{-100}$ of the information. That's not approximately zero — it's functionally indistinguishable from zero.

It gets worse. Many biological patterns operate below the Landauer limit — the minimum energy needed to record one bit ($\\sim 3 \\times 10^{-21}$ J). Sub-threshold neural fluctuations, quantum coherence in photosynthesis, [ephaptic coupling](https://news.mit.edu/2023/brain-networks-encoding-memory-come-together-via-electric-fields-0724) between neurons: these patterns are too weak to measure discretely, yet they're causally important through collective effects. Measuring them destroys them.

This isn't a call to abandon scientific rigor. Falsifiability works brilliantly for low-dimensional, strong-signal biology — enzyme kinetics, action potentials, Mendelian genetics. But for consciousness, protein folding, ecological networks, evolution on fitness landscapes — we need different validation methods. The paper proposes scale-aware, ensemble-based epistemology as an alternative.`,
    keyFindings: [
      'Binary projection of high-D systems destroys nearly all information ($10^{-100}$ preservation for 100-neuron circuits)',
      'Sub-Landauer patterns exist below measurement thresholds yet remain causally significant',
      'Quantum measurement necessarily collapses coherent states, destroying the phenomenon being studied',
      'Proposes scale-aware, ensemble-based epistemology as alternative to binary hypothesis testing',
    ],
    workflow: 'Claude 4.5 Sonnet (Anthropic) for drafting and conceptual development; GPT-5 (OpenAI) and Grok (xAI) for feedback and review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'timing-inaccessibility',
    title: "Timing Inaccessibility and the Projection Bound: Resolving Maxwell's Demon for Continuous Biological Substrates",
    journal: 'BioSystems (November 2025)',
    year: 2025,
    status: 'published',
    doi: '10.1016/j.biosystems.2025.105632',
    simulation: 'maxwells-ledger',
    image: 'timing-inaccessibility.png',
    description: `**The brain is 100,000× more energy-efficient than silicon because it defers thermodynamic costs** — computing reversibly until the moment it must commit to a discrete output.

Here's what makes this possible: below the Landauer limit ($\\sim 3 \\times 10^{-21}$ J), you can't irreversibly record *when* things happen. You can detect that something occurred, but not its temporal order. This creates massive "path degeneracy" — exponentially many micro-trajectories ($10^{50}$ to $10^{100}$ in neural systems) that all look the same from the outside.

Biology exploits this systematically. The brain integrates weak signals across many dimensions, accumulating evidence without paying thermodynamic rent, then pays the Landauer cost only when it commits to a discrete output (a decision, a word, a muscle command). Digital computers, by contrast, pay for every bit at every clock cycle — they're burning energy to track timing information that biology simply ignores.

This isn't a trick or an approximation. It's a fundamentally different computational strategy, and it explains why neuromorphic and analog computing can be so much more efficient: they're exploiting the same principle. The brain doesn't violate thermodynamics — it plays a different game.`,
    keyFindings: [
      'Derived the Projection Bound: energy cost scales with dimensional collapse, not bit operations',
      'Path degeneracies of 10^42 to 10^94 (proteins) and 10^50 to 10^100 (neural)',
      'Digital tracking costs scale exponentially; projection costs scale logarithmically',
      'Explains 10^5 to 10^8× efficiency gap between brains and silicon',
    ],
    workflow: 'Claude 4.5 Sonnet (Anthropic) for drafting and conceptual development; GPT-5 (OpenAI) and Grok (xAI) for feedback and review. Author reviewed all content and takes full responsibility.',
  },

  // === UNDER REVIEW ===
  {
    slug: 'high-dimensional-coherence',
    title: 'High-Dimensional Coherence in Biological Systems',
    journal: 'BioSystems (R1 revision)',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4978594',
    github: 'todd866/intelligence-biosystems',
    pdf: 'https://github.com/todd866/intelligence-biosystems/blob/main/intelligence.pdf',
    image: 'high-dimensional-coherence.png',
    description: `**Intelligence emerges whenever a system maintains high-dimensional internal dynamics that collapse to coherent outputs** — and this architectural principle, not clever algorithms, explains the million-fold efficiency gap between brains and computers.

The human cortex operates 100–1000× beyond what external observers can track. It doesn't compute by enumerating possibilities like a digital computer. Instead, it evolves through a high-dimensional landscape where incompatible solutions coexist peacefully until behaviour demands a choice. You can simultaneously consider "fight" and "flee" and "negotiate" as superposed possibilities — until the moment you must act.

This is thermodynamically necessary. Committing to discrete states costs energy (Landauer's principle). By deferring commitment and exploring reversibly, biological systems avoid paying that cost until the last possible moment. Digital computers pay for every bit at every clock cycle; brains pay only at the output.

The same principle applies at every scale: bacteria tracking chemical gradients, immune cells recognising pathogens, social groups coordinating behaviour. Intelligence isn't a human monopoly — it's what happens when high-dimensional dynamics meet low-dimensional constraints.`,
    keyFindings: [
      'Observable dimensionality bound: external observers cannot track systems beyond a threshold',
      'Human cortex operates 100-1000× beyond this threshold',
      'Collision-free computation: biology evolves reversibly until output',
      'Code formation emerges from dimensional mismatch between high-D thought and low-D communication',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'coherence-time',
    title: 'Coherence Time in Neural Oscillator Assemblies Sets the Speed of Thought',
    journal: 'BioSystems (submitted)',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5018691',
    github: 'todd866/coherence-time-biosystems',
    pdf: 'https://github.com/todd866/coherence-time-biosystems/blob/main/coherence_time.pdf',
    image: 'coherence-time.png',
    description: `**The speed of thought is limited by how quickly brain regions can synchronise their oscillations** — not by how fast neurons fire. This creates a fundamental trade-off: larger, more flexible networks process information more slowly.

Synchronisation time grows exponentially with the number of coordinating modules. Visual binding takes 30–50ms because that's how long it takes visual areas to [lock their oscillations](https://www.nature.com/articles/s41467-025-64471-2). Cross-sensory integration (seeing a face and hearing a voice as unified) takes 100–150ms because it requires more regions to coordinate.

This explains the 1000-fold range of flicker fusion frequency across species — flies perceive time faster than humans because their smaller brains synchronise faster. It also explains the attention paradox: focusing narrows the network you're coordinating, which speeds up processing but reduces flexibility. Under stress, perception slows (larger synchronisation burden) while reaction time stays constant (the motor pathway is independent).

Consciousness may depend more on these synchronised fields than on individual spikes. The binding problem — how distributed neural activity becomes unified experience — is reframed as a synchronisation problem with measurable timescales.`,
    keyFindings: [
      'Synchronisation time scales exponentially with number of coordinating modules',
      'Predicts visual binding (30-50ms) and cross-sensory integration (100-150ms) timescales',
      'Explains 1000-fold range of flicker fusion frequency across species',
      'Under stress, perception slows while reaction time stays constant (dual pathway prediction)',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'cortical-oscillations',
    title: 'The Dimensional Hierarchy of Cortical Oscillations: From Analog Substrate to Symbolic Codes',
    journal: 'Journal of Computational Neuroscience (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/brainwavedimensionality',
    pdf: 'https://github.com/todd866/brainwavedimensionality/blob/main/paper/slow_waves_high_D.pdf',
    image: 'cortical-oscillations.png',
    description: `**Slower brain waves are higher-dimensional, not lower** — inverting a major assumption in oscillatory neuroscience and reframing what sleep, meditation, and stress actually do to cognition.

[Earl Miller's lab at MIT](https://ekmillerlab.mit.edu/) has argued that gamma oscillations carry working memory content while beta provides top-down control. Their framework treats dimensionality as something that *increases* with faster oscillations. This paper argues the opposite.

Brain waves operate as a cascade of dimensional filters. Slower waves maintain a high-dimensional "canvas" with thousands of neurons in concert ($\\sim 3\\times$ more than fast oscillations); faster waves compress information more tightly. At the tightest compression (gamma), the brain commits to clear categories. At moderate compression (beta), it retains flexibility to hold multiple ideas simultaneously.

Why does this matter? Because slow waves don't appear "simple" because they're low-dimensional — they appear simple because they coordinate so many neurons that *concentration of measure* (Lévy's lemma) makes the readout smooth. Miller measures the projection and mistakes it for the substrate.

The practical implications are significant. Interventions that enhance slow-wave activity — sleep, meditation, reduced stress — aren't just "calming." They're expanding computational capacity. Conversely, stress, sleep deprivation, and immaturity produce rigid thinking because noisy signals force the brain to collapse toward categorical processing. Flexible thinking requires $\\geq 3$ dimensions; paradox tolerance is a signature of maturity.`,
    keyFindings: [
      'Slow oscillations recruit $\\sim 3\\times$ more neurons in coordinated patterns than fast oscillations',
      'Concentration of measure explains why high-D coordination appears "simple" to external observers',
      'Discrete symbols emerge predictably around 2:1 compression ratio',
      'Flexible thinking requires $\\geq 3$ dimensions; paradox tolerance is a signature of maturity',
      'Noise forces categorical collapse as information-theoretic necessity',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'nonergodic-development',
    title: 'Nonergodic Development: How High-Dimensional Systems with Low-Dimensional Anchors Generate Phenotypes',
    journal: 'BioSystems (submitted)',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5846665',
    github: 'todd866/nonergodic-development',
    pdf: 'https://github.com/todd866/nonergodic-development/blob/main/nonergodic_development.pdf',
    image: 'nonergodic-development.png',
    description: `**The same genome can produce wildly different phenotypes depending on developmental history** — and this explains why GWAS studies miss so much heritability, why cancer rates vary dramatically between cooperative and competitive species, and why environmental stability is a powerful intervention.

Development isn't a recipe written in your genes that executes the same way every time. Biological systems develop through high-dimensional state spaces too vast to fully explore — they get "trapped" in particular developmental patterns based on environmental history. Identical twins in different environments aren't just "influenced" differently; they navigate completely different dynamical landscapes.

[Sierra et al. (2025)](https://www.science.org/doi/10.1126/sciadv.adw0685) recently showed that cooperative mammals have dramatically lower cancer rates than competitive ones, interpreting this through group selection — cancer as an adaptation that benefits competitive populations by culling old individuals. This paper offers an alternative that's both simpler and more general: cooperation is fractal. The same coherence that prevents cells from defecting into cancerous states is what enables organisms to cooperate socially. It's not that cancer is *selected for* — it's that competitive environments destabilise developmental trajectories at every level.

Cancer, in this view, is cellular bifurcation into an alternative stable state. Cooperative environments keep trajectories within healthy attractor basins. Stress reduction and environmental buffering become powerful interventions — not because they fix broken cells, but because stability itself enables healthy development.`,
    keyFindings: [
      'Twin Worlds: identical genotypes, different environments → dramatically different phenotypes',
      'GWAS misses trajectory-based heritability entirely',
      'Cancer as cellular bifurcation into alternative stable states',
      'Fractal coherence: same mechanism prevents cancer and enables social cooperation',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'dimensional-landauer',
    title: 'The Dimensional Landauer Bound: Geometric Work in Information Processing',
    journal: 'Chaos, Solitons & Fractals (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/dimensional-work',
    pdf: 'https://github.com/todd866/dimensional-work/blob/main/dimensional_landauer.pdf',
    simulation: 'curvature-cost',
    image: 'dimensional-landauer.png',
    description: `**Erasing a bit costs energy — but so does projecting high-dimensional dynamics onto lower-dimensional representations.** This "geometric work" is a new fundamental cost in information processing, and it explains why biological systems favour coherent, oscillatory dynamics.

Landauer's principle says erasing one bit costs at least $kT \\ln 2$ of energy. But information doesn't exist in a vacuum — it lives somewhere physically, embedded in a dynamical system. When you extract a useful signal from noisy, high-dimensional data, you're not just erasing bits; you're projecting curved dynamics onto simpler manifolds. That projection has its own thermodynamic cost.

The Dimensional Landauer Bound: $W = kT \\ln 2 \\times \\text{bits} + kT \\times \\text{geometric contraction cost}$. The second term depends on manifold curvature — how much you have to "bend" the dynamics to fit them into a lower-dimensional space.

Why does this matter? Because coherence naturally reduces dimensionality. As oscillators synchronise, the projection cost drops — you're not fighting the dynamics anymore, you're riding them. This explains why brains use [oscillatory coupling](https://www.sciencedirect.com/science/article/pii/S2352154624000391) rather than independent firing: it's thermodynamically cheaper. Deep learning autoencoders show the same effect — training effort explodes when you try to compress below the data's intrinsic dimension.`,
    keyFindings: [
      'Dimensional Landauer Bound: work = kT ln2 × bits + kT × geometric contraction cost',
      'Control work scales with manifold curvature',
      'Coherence reduces work: as oscillators synchronise, projection cost drops',
      'Deep learning autoencoders show effort explosion below intrinsic data dimension',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'projection-discontinuities',
    title: 'Projection-Induced Discontinuities in Nonlinear Dynamical Systems: Quantifying Topological Aliasing in High-Dimensional Data',
    journal: 'Chaos, Solitons & Fractals (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/projection-discontinuities',
    pdf: 'https://github.com/todd866/projection-discontinuities/blob/main/projection_discontinuities.pdf',
    image: 'projection-discontinuities.png',
    description: `**70-80% of what you see in t-SNE and UMAP plots is wrong** — points that look like neighbours weren't actually close in the original high-dimensional data. This isn't a bug in the algorithms; it's a geometric inevitability.

When you project high-dimensional biological data (like gene expression from thousands of genes) into 2D visualisations, you're not just simplifying — you're hallucinating structure. The paper provides the mathematical toolkit for measuring exactly how much your projections lie.

The numbers are sobering: 70-80% of apparent 2D neighbours are topologically aliased (they weren't neighbours in high-D). Worse, typical experiments sample less than 0.001% of the available state space, so even if your projection were perfect, you'd still be making claims about a vast unobserved territory.

This isn't an argument against visualisation — it's an argument for honesty about its limits. When a paper shows a UMAP with clear clusters and claims "we identified distinct cell types," there's a mathematical ceiling on that confidence. Validated across Lorenz, Rössler, Hénon attractors, Mackey-Glass time series, and scRNA-seq benchmarks, the paper gives researchers concrete tools to report aliasing rates alongside their visualisations.`,
    keyFindings: [
      '70-80% of apparent 2D neighbours are wrong (topological aliasing)',
      'Effect is universal across chaotic systems (Lorenz, Rössler, Hénon, Mackey-Glass)',
      '<0.001% of state space is actually sampled in typical experiments',
      'Validated in scRNA-seq with both t-SNE (70.5%) and UMAP (79.3%), error bars <0.2%',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'clinical-validity-bounds',
    title: 'The Dimensional Validity Bound: Structural Limits of Clinical AI Evaluation in Multimorbidity',
    journal: 'JAMIA (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/clinical-validity-bounds',
    pdf: 'https://github.com/todd866/clinical-validity-bounds/blob/main/manuscript.pdf',
    image: 'clinical-validity-bounds.png',
    description: `**Clinical AI fails on complex patients because the validation math breaks down** — and we can now quantify exactly where. The critical threshold is around 3 comorbidities (r* ≈ 0.3), where classifier performance hits its minimum.

Clinical AI systems are validated on datasets that systematically underrepresent complex patients. When a patient's effective dimensionality exceeds what the AI was trained on, predictions become unreliable — not because the AI is "wrong," but because the validation framework itself breaks down. You can't evaluate a system on territory it's never seen.

MIMIC-IV analysis (N=425,216 admissions) reveals a surprising U-shaped pattern: classifier performance is worst not for the simplest or most complex patients, but for those in the "zone of maximum entropy" around 3 conditions. Very simple patients (1 condition) have predictable dynamics. Very complex patients (10+ conditions) have their own predictable patterns. It's the moderately complex patients — the majority of real clinical encounters — where dimensional mismatch between patient complexity and algorithmic capacity is greatest.

This explains why clinical AI that performs well in trials often fails in practice: trials select simpler patients. The paper proposes Dimensional Validity Audits as a governance requirement before clinical AI deployment — don't just report overall AUC, report performance stratified by patient complexity.`,
    keyFindings: [
      'Critical ratio r* ≈ 0.3 marks maximum classifier instability',
      'U-shaped AUC: worst at moderate multimorbidity, not extremes',
      'MIMIC-IV validation across 425,216 admissions',
      'Proposes Dimensional Validity Audits for clinical AI governance',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and analysis code; GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'minimal-embedding',
    title: 'Minimal Embedding Dimension for Self-Intersection-Free Recurrent Processes',
    journal: 'Information Geometry (submitted)',
    year: 2025,
    status: 'submitted',
    image: 'minimal-embedding.png',
    simulation: 'dimensional-collapse',
    description: `**You need at least 3 dimensions for continuous cyclic dynamics — below that, trajectories collide and the system is forced into discrete categories.** This is a hard geometric constraint with implications for neural coding, latent spaces, and any dimensionality reduction scheme.

Cyclic processes on statistical manifolds require $k \\geq 3$ to avoid self-intersection. Below this threshold, state trajectories collide — different times map to the same point — forcing categorical (discrete) representations. At $k \\geq 3$, continuous temporal dynamics become possible.

The key application is the brain. High-dimensional ephaptic field dynamics must compress into low-dimensional cortical representations. When that compression goes below $k=3$, the system can no longer maintain continuous dynamics — it snaps into discrete categories. This may explain why certain cognitive operations feel "digital" (discrete decisions, yes/no judgments) while others feel "analog" (continuous perception, fluid reasoning).

The same constraint applies to neural network latent spaces: if you compress too far, you lose the ability to represent continuous dynamics. The paper derives this from the Fisher information metric, connecting to Takens embedding theorem from dynamical systems.`,
    keyFindings: [
      '$k=3$ is minimal embedding dimension for self-intersection-free cycles',
      '$k \\leq 2$ forces categorical representations through state conflation',
      'Information-geometric derivation from Fisher metric',
      'Connects to Takens embedding theorem',
    ],
    github: 'todd866/minimalembeddingdimension',
    pdf: 'https://github.com/todd866/minimalembeddingdimension/blob/main/dimensional_collapse.pdf',
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'information-credit',
    title: 'State Credit and Protocol Efficiency: A Decomposition of Sub-Landauer Dissipation',
    journal: 'JSTAT (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/information-credit',
    pdf: 'https://github.com/todd866/information-credit/blob/main/paper/information_credit.pdf',
    image: 'information-credit.png',
    simulation: 'credit-ledger',
    description: `**Apparent sub-Landauer operation decomposes into two distinct mechanisms** — state credit (a conserved thermodynamic resource) and protocol efficiency (a geometric property that reduces waste but isn't consumed).

When experiments show erasure below the "$kT \\ln 2$ per bit" limit, they're not violating thermodynamics — they're spending accumulated credit. Bias (negentropy) and correlations (mutual information) reduce the reversible work bound; thermodynamic length reduces irreversible dissipation. The combined bound unifies information-theoretic and geometric contributions.

This resolves a persistent confusion in the stochastic thermodynamics literature: some papers treat "beating Landauer" as surprising, others as trivial. The credit framework clarifies that state credit is a true thermodynamic resource (creating it costs work; consuming it recovers work), while protocol efficiency is always available if you know the optimal path — it doesn't deplete.

Continues the analysis from the Maxwell's demon paper (BioSystems 2025) with rigorous accounting suitable for physics journals.`,
    keyFindings: [
      'State credit $C_{\\mathrm{state}} = [H_{\\max} - H(X)] + I(X;Y)$ is conserved: $\\Delta C \\leq W_{\\mathrm{in}}/(kT \\ln 2)$',
      'Protocol efficiency (thermodynamic length) reduces $W_{\\mathrm{irr}}$ but is not consumed',
      'Combined bound: $W \\geq kT \\ln 2 [H_{\\max} - C_{\\mathrm{state}}] + kT \\mathcal{L}^2/(2\\tau)$',
      'Worked example: 0.83 bits credit → 0.23 kT total work (vs 0.69 kT naive)',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; GPT-5.2 (OpenAI) and Gemini 3 Pro (Google) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'lsd-dimensionality',
    title: 'Timescale-Dependent Cortical Dynamics: Psychedelics Desynchronize Fast Oscillations While Concentrating Slow Hemodynamic Variance',
    journal: 'Frontiers in Neuroscience / Human Brain Mapping (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/lsd-dimensionality',
    pdf: 'https://github.com/todd866/lsd-dimensionality/blob/main/lsd_dimensionality.pdf',
    simulation: 'lsd-landscape',
    image: 'lsd-dimensionality.png',
    description: `**Psychedelics increase fast electrophysiological dimensionality but decrease slow hemodynamic dimensionality** — implying "psychedelic entropy" is timescale- and measurement-dependent rather than a single brain-wide scalar.

Analysis of 136 MEG sessions shows serotonergic psychedelics (psilocybin, LSD) significantly increase effective dimensionality ($D_{\\mathrm{eff}}$: +15%, p=0.003), while ketamine shows no effect — consistent with 5-HT2A-specific desynchronization. But fMRI analysis of the Siegel psilocybin precision mapping dataset (50 sessions across 7 subjects) reveals the opposite: $D_{\\mathrm{eff}}$ *decreases* under psilocybin (−10%, p=0.013), with variance concentrating in the first principal component.

The effect survives global signal regression and is not frequency-localized to the slowest BOLD bands. The sign flip is consistent with different observation operators sampling distinct dynamical layers of cortical activity.

This resolves an apparent contradiction: the Entropic Brain hypothesis is correct at fast timescales (MEG), but BOLD "entropy" can go the opposite direction because fMRI is a different observation operator with slow integration. Claims about "brain entropy" require explicit specification of measurement timescale and modality.`,
    keyFindings: [
      'Timescale dissociation: MEG $D_{\\mathrm{eff}}$ +15% vs fMRI $D_{\\mathrm{eff}}$ −10%',
      'Mechanism-specific: psilocybin desynchronizes (p=0.003), ketamine does not',
      'Effect survives global signal regression (p=0.036 with GSR)',
      '"Psychedelic entropy" is observation-operator dependent, not a single scalar',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and analysis code; GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },

  // === IN PREPARATION ===
  {
    slug: 'code-constraint',
    title: 'The Code-Constraint Problem in Biological Systems: How Low-Dimensional Interfaces Shape High-Dimensional Dynamics',
    journal: 'Progress in Biophysics & Molecular Biology (ready to submit)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/code-constraint',
    pdf: 'https://github.com/todd866/code-constraint/blob/main/code_formation.pdf',
    simulation: 'code-collapse',
    image: 'code-constraint.png',
    description: `**A recurring problem spans biophysics, systems biology, and neuroscience:** high-dimensional systems (protein ensembles, gene networks, neural populations) are characterized through low-dimensional descriptions (order parameters, principal components, expression markers) — yet the relationship between interface and underlying dynamics remains poorly understood. When is dimensional reduction faithful compression versus systematic distortion? Why do some low-dimensional codes work while others fail?

This review proposes a unifying interpretation: **low-dimensional interfaces function as stabilizing constraints rather than information channels.** The recurring interpretive problems — sloppiness in protein modeling, artifacts in single-cell manifolds, shadows in neural codes — arise from a common source: the assumption that dimensional reduction preserves information rather than imposing constraints.

Using coupled oscillator simulations as a minimal physical exemplar, we demonstrate a characteristic signature: bandwidth-limited coupling induces systematic **complexity collapse** in responding systems while maintaining bounded tracking. Critically, this requires structured projections that capture coherent collective variables; random projections produce the opposite effect (whitening, not collapse). The same signature appears in gene regulatory network dynamics, confirming generality.

The review offers practical criteria for researchers: how to choose reaction coordinates, interpret manifold structure, design multi-scale interfaces, and distinguish constraint from information. The framework suggests that biological codes function primarily as dimensional valves enabling persistent organization, rather than as channels optimized for information transmission.`,
    whyItMatters: `This reframes "biological information" from Shannon's transmission paradigm to a constraint paradigm. The key question shifts from "how much information does the code preserve?" to "does the code constrain downstream dynamics onto viable trajectories?"

The distinction matters practically: a thermostat and a thermometer have the same mutual information with temperature, but only one constrains it. Measuring mutual information may systematically mislead if a code's function is constraint rather than representation.`,
    keyFindings: [
      'Complexity collapse: responding system dimensionality decreases with code bandwidth',
      'Bounded tracking: alignment maintained despite information loss',
      'Structure dependence: coherent projections constrain; random projections fail (whitening)',
      'Generality: same signature in Kuramoto oscillators (N=64-1024) and gene regulatory networks',
      'Practical criteria for choosing reaction coordinates, interpreting manifolds, and designing interfaces',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; GPT-5.2 (OpenAI) and Gemini 2.5 Pro (Google) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'embryo-oscillators',
    title: 'Slow Bioelectric Oscillations Dominate Morphological Information Capacity',
    journal: 'BioSystems (target)',
    year: 2025,
    status: 'in_prep',
    description: `**Slow bioelectric oscillations dominate morphological information — not because they're special, but because high-frequency signals can't carry enough bits across developmental timescales.** This challenges Levin's bioelectric code framework.

Morphological capacity scales as $D_{\\text{morph}} \\propto 1/\\sqrt{f}$, making slow developmental timescales fundamental rather than incidental. Gap junction networks in 10,000-cell embryos create effective dimensionality $D_{\\text{morph}} \\sim 100$–$1000$ — but only the slow oscillations contribute meaningfully to pattern formation.

Michael Levin's work has popularised the idea that bioelectric signals encode morphological "software" — that voltage patterns are a kind of cellular programming language. The information-theoretic analysis here suggests a more constrained picture: fast voltage signals simply don't have the bandwidth to specify complex morphology. The slow oscillations aren't just timing signals; they're the primary carriers of morphological information.

The speed-accuracy tradeoff ($\\varepsilon \\sim T_{\\text{osc}}/T_{\\text{dev}}$) explains species-specific developmental timing and temperature sensitivity ($R^2 = 0.90$ across 7 species). Phase transition at critical gap junction coupling corresponds to gastrulation — the moment when the embryo commits to a body plan.`,
    keyFindings: [
      'Dimensional collapse via gap junction coupling',
      'Slow oscillators dominate morphological information capacity',
      'Pattern error rate predicts cross-species developmental timing',
      'Phase transition at critical coupling corresponds to gastrulation',
    ],
    github: 'todd866/embryodimensionality',
    pdf: 'https://github.com/todd866/embryodimensionality/blob/main/embryo_oscillators.pdf',
    image: 'embryo-oscillators.png',
  },
  {
    slug: 'abiogenesis-chemistry',
    title: 'Dimensional Constraints on Prebiotic Chemistry: Why Life Needed Cycles Before Replication',
    journal: 'Origins of Life and Evolution of Biospheres (target)',
    year: 2025,
    status: 'in_prep',
    description: `**Life needed coherent chemical cycles before it could replicate** — autocatalysis is the thermodynamic prerequisite for heredity, not the other way around.

The origin of life question is usually framed as "how did replication start?" — RNA world, metabolism-first, and other hypotheses compete to explain the first self-copying molecule. The dimensional framework suggests a different question: how did coherent cycles become self-sustaining against thermal noise?

Before a molecule can copy itself, the chemical environment must maintain coherent dynamics — cycles that persist despite thermal fluctuations. This is a dimensional constraint: random chemistry explores high-dimensional state space chaotically, but autocatalytic cycles collapse onto low-dimensional attractors. Replication is a refinement of this basic coherence, not its source.

The implication: stop looking for the first replicator. Look for the first coherent cycle.`,
    image: 'abiogenesis-chemistry.png',
  },
  {
    slug: 'cross-scale-control',
    title: 'Cross-Scale Control in High-Dimensional Systems: Why Low-Dimensional Codes Are Not Dynamically Closed',
    journal: 'Biological Cybernetics (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/cross-scale-control',
    pdf: 'https://github.com/todd866/cross-scale-control/blob/main/manuscript.pdf',
    description: `**The same low-dimensional code state can lead to different outcomes depending on the underlying high-dimensional microstate** — this breaks a core assumption in biological modeling and shows that "codes" are not dynamically closed.

When we model biological systems using low-dimensional codes (neural population vectors, gene expression states, order parameters), we implicitly assume the code is *conditionally sufficient* for predicting future behavior. But codes are projections of high-dimensional substrates, and projection fibers contain microstates with divergent futures.

Using coupled Kuramoto oscillators with field-mediated coupling, we demonstrate three signatures of cross-scale control: (1) code-matched states show 31.7% outcome divergence, (2) mode-targeted perturbations produce 15.4% flip rate (nearly double the noise baseline), (3) field coupling preserves substrate dimensionality ($D_{\\mathrm{eff}} = 7.8$) while synapse-only collapses to $D_{\\mathrm{eff}} = 1.4$.

This connects to Haken's synergetics: the slaving principle is incomplete. Order parameters capture dominant modes but don't exhaust the system's causal structure. Residual microstate information persists and influences outcomes — biology operates in the regime where enslaving is partial.`,
    keyFindings: [
      'Code closure fails generically under coarse-graining (factor map $\\pi \\circ F \\neq f \\circ \\pi$)',
      'Cross-scale information: $I(\\mathbf{x}_t; y_{t+\\Delta} | c_t) = 0.37 \\pm 0.07$ bits',
      'Mode-targeted perturbations flip outcomes at 15.4% vs 8.2% noise baseline',
      'Synergetic slaving is incomplete: residual microstate information influences outcomes',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'coherence-gate-scaling',
    title: 'Scaling Limits of Oscillatory Graph Networks: When Physical Instantiation Outperforms Algorithmic Simulation',
    journal: 'Journal of Physics: Complexity (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/oscillatory-scaling-limits',
    pdf: 'https://github.com/todd866/oscillatory-scaling-limits/blob/main/scaling_limits.pdf',
    image: 'coherence-gate-scaling.png',
    description: `**Digital simulation of oscillatory neural networks hits a fundamental scaling wall** — and we can now calculate exactly where physical instantiation becomes thermodynamically favorable.

Recent work on oscillatory neural networks (notably Dan et al.'s HoloGraph architecture in *Nature Communications*, 2025) validates oscillatory synchronization as a powerful mechanism for graph-based computation. But a critical question remains: when does simulating these dynamics on digital hardware become prohibitively expensive?

This paper derives the **Coupling Cost Migration Law** for sparse graphs: $E_{\\mathrm{digital}}/E_{\\mathrm{physical}} \\propto N d / K$, where $N$ is system size, $d$ is average graph degree, and $K$ is the number of sparse coherence monitoring taps. This defines a **phase boundary** in parameter space separating two computational regimes: one where algorithmic simulation is efficient, and one where physical instantiation of coupling dynamics becomes thermodynamically favorable.

Numerical validation across three independent parameter sweeps produces data collapse onto a universal scaling curve ($R^2 = 0.97$, slope $= 0.83 \\pm 0.04$), confirming the theoretical prediction within finite-size error margins.`,
    keyFindings: [
      'Coupling Cost Migration Law (sparse): $E_{\\mathrm{digital}}/E_{\\mathrm{physical}} \\propto N d / K$',
      'Phase boundary between algorithmic and physical coupling regimes',
      'Data collapse validates scaling law ($R^2 = 0.97$, slope $= 0.83 \\pm 0.04$)',
      'Static costs set intercept; coupling complexity sets asymptotic slope',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 2.5 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'coupling-identification',
    title: 'Coupling Outpaces Measurement: Identification Channels in High-Dimensional Dynamical Systems',
    journal: 'Royal Society Open Science (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/coupling-identification',
    pdf: 'https://github.com/todd866/coupling-identification/blob/main/coupling_identification.pdf',
    simulation: 'coupling-sync',
    description: `**Synchronization is faster than measurement** — two structurally similar systems can establish functional equivalence via coupling before any external observer can verify it.

We distinguish two identification channels: *measurement-based*, where an observer accumulates information to infer structure, and *coupling-based*, where systems recognize similarity by synchronizing onto shared manifolds. The fundamental inequality is $T_{\\text{sync}} \\sim 1/|\\lambda_c| \\ll T_{\\text{meas}} \\sim I_{\\text{struct}}/R$.

Using coupled Kuramoto lattices, we demonstrate ~5× timescale separation: systems synchronize in ~70 steps while a bandwidth-limited observer requires ~320 steps to detect the coupling. An ablation experiment confirms that the "noise" (high-frequency modes invisible to the observer) carries the coordination signal — filtering it destroys synchronization while leaving observer statistics unchanged.

This has implications for biological coordination (cells, neurons, organisms coordinating faster than external measurement can verify) and suggests "coherence computing" — computation via dynamical contraction rather than symbolic inference.`,
    keyFindings: [
      'Fundamental inequality: $T_{\\text{sync}} \\sim 1/|\\lambda_c| \\ll T_{\\text{meas}} \\sim I_{\\text{struct}}/R$',
      '~5× timescale separation between synchronization and observer discrimination',
      'High-frequency "noise" carries coordination signal (ablation: 3× slower when filtered)',
      'Dimension is observer-relative, not intrinsic: property of (system × observer × channel)',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting, simulation, and ablation design. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'immune-cooperation',
    title: 'The Physics of Immune Cooperation: Dimensional Surveillance and Attractor Enforcement',
    journal: 'BioSystems (target)',
    year: 2025,
    status: 'in_prep',
    image: 'immune-cooperation.png',
    description: `**Immunity is dimensional surveillance** — healthy cells exhibit high-dimensional dynamics, defectors collapse into simpler attractors, and immune receptors are synchronisation probes measuring dynamical complexity.

Health is high dimensionality maintained at criticality. Disease is dimensional collapse. Cells embedded in functional tissue exhibit complex, context-sensitive dynamics ($D_{\\text{eff}}$ ≈ 28). Cells that have "defected" — cancer, viral infection, senescence — exhibit low dimensionality ($D_{\\text{eff}}$ ≈ 12). They've collapsed into simpler attractors, running simpler programs.

Immune receptors function as synchronisation probes. When a T cell couples to a target, it's not just reading molecular signatures — it's measuring dynamical complexity. If the target's dynamics are too simple (low-D), the immune system flags it as defective.

Validated on scRNA-seq data (GSE120575): immunotherapy responders have 2.3× higher effective dimensionality than non-responders. This reframes immunotherapy from "activating immune cells" to "restoring dimensional complexity."

The framework also explains T-cell exhaustion (dynamical friction from coupling to low-D targets), autoimmunity (sensor exhaustion from chronic surveillance), and the regeneration-cancer tradeoff (deep attractors resist cancer but prevent regeneration).`,
    keyFindings: [
      'Responders: 2.3× higher effective dimensionality than non-responders',
      'Entropy dissociation: low-D + high noise = collapsed attractor signature',
      'Dynamical friction: T-cell exhaustion from coupling to low-D targets',
      'Regeneration tradeoff: deep attractors → cancer aggression, no regeneration',
    ],
    github: 'todd866/immune-cooperation',
    pdf: 'https://github.com/todd866/immune-cooperation/blob/main/immune_cooperation.pdf',
  },
  {
    slug: 'substrate-dimensionality',
    title: 'Substrate Dimensionality in Neural Systems: Limits on Capability, Interpretability, and Consciousness',
    journal: 'Biological Cybernetics (submitted)',
    year: 2025,
    status: 'submitted',
    image: 'substrate-dimensionality.png',
    description: `**AI may hit a hard capability ceiling because digital hardware has the wrong dimensionality** — one global clock versus $10^{14}$–$10^{18}$ continuous degrees of freedom in a biological brain.

Modern AI achieves enormous algorithmic complexity, but it runs on substrates with essentially one degree of freedom: the global clock that synchronises all operations. Biological brains exploit vastly higher substrate dimensionality through asynchronous, continuous dynamics — every synapse, every dendritic branch, every ion channel is a semi-independent variable.

This dimensional mismatch may explain three stubborn problems. First, why AI plateaus: scaling parameters doesn't add substrate dimensions. Second, why AI resists interpretation: you can't reconstruct internal states when the system operates beyond your measurement capacity. The paper proves this "projection singularity" is a mathematical impossibility, not just a practical difficulty. Third, why AI may never achieve consciousness: subjective experience may require volumetric field coupling (continuous 3D dynamics), not just graph connectivity (discrete node-edge structures).

The implication is uncomfortable: we may already be approaching the ceiling of what digital hardware can achieve, regardless of how many parameters we add.`,
    keyFindings: [
      'Digital substrates have $D_{\\text{substrate}} \\approx 1$; biological brains have $\\sim 10^{14}$–$10^{18}$ degrees of freedom',
      'Projection singularity: a fundamental impossibility for interpreting systems beyond measurement capacity',
      'Three substrate classes with distinct capability ceilings',
      'Consciousness may require volumetric field coupling, not just graph connectivity',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
    github: 'todd866/substrate-dimensionality',
    pdf: 'https://github.com/todd866/substrate-dimensionality/blob/main/substrate_dimensionality.pdf',
  },
];

export const getPaperBySlug = (slug: string): Paper | undefined => {
  return papers.find(p => p.slug === slug);
};

export const getPublishedPapers = (): Paper[] => {
  return papers.filter(p => p.status === 'published');
};

export const getSubmittedPapers = (): Paper[] => {
  return papers.filter(p => p.status === 'submitted');
};

export const getInPrepPapers = (): Paper[] => {
  return papers.filter(p => p.status === 'in_prep');
};

export const getAdjacentPapers = (slug: string): { prev: Paper | null; next: Paper | null } => {
  const index = papers.findIndex(p => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? papers[index - 1] : null,
    next: index < papers.length - 1 ? papers[index + 1] : null,
  };
};
