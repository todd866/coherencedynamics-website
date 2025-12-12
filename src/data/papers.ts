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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'coherence-time',
    title: 'Coherence Time in Neural Oscillator Assemblies Sets the Speed of Thought',
    journal: 'BioSystems (submitted)',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5018691',
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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'cortical-oscillations',
    title: 'The Dimensional Hierarchy of Cortical Oscillations: From Analog Substrate to Symbolic Codes',
    journal: 'Journal of Computational Neuroscience (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/brainwavedimensionality',
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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'coherence-gate-scaling',
    title: 'Thermodynamic Scaling Limits of Algorithmic Oscillatory Synchronization',
    journal: 'Neuromorphic Computing and Engineering (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/coherence-gate',
    pdf: 'https://raw.githubusercontent.com/todd866/coherence-gate/main/coherence_gate_scaling.pdf',
    image: 'coherence-gate-scaling.png',
    description: `**Oscillatory neural networks hit a hard scaling wall on digital hardware** — $O(N^2)$ operations per timestep — but physical coupling does the same computation at $O(K)$, offering 100–1000× better energy efficiency.

[Oscillating neural networks](https://www.nature.com/articles/s41467-025-64471-2) can extract powerful relational patterns from data by letting oscillators synchronise into meaningful clusters. But simulating all-to-all coupling on a digital computer requires checking every pair of oscillators at every timestep. For 400 oscillators, that's 160,000 operations per tick. Physical coupling — electrical circuits, optical resonators, memristive crossbars — does this automatically through the physics of the substrate.

The numbers are striking: $86\\times$ energy advantage at 100 oscillators, $224\\times$ at 400 oscillators, and the gap grows quadratically. This isn't a temporary limitation waiting for better algorithms — it's fundamental to how digital hardware handles continuous dynamics.

The paper proposes the "coherence gate" as a hardware primitive for neuromorphic chips: let oscillators synchronise naturally through physical coupling, then monitor the result via sparse measurement taps. Instead of simulating synchronisation, you let physics do the work and just read out the answer.`,
    keyFindings: [
      'Digital simulation: $O(N^2)$ operations; physical coupling: $O(K)$ operations',
      '$86\\times$ energy advantage at 100 oscillators; $224\\times$ at 400 oscillators',
      'Coherence gate: let oscillators synchronise naturally, monitor via sparse taps',
      'Implementable via CMOS arrays, photonic resonators, or memristive crossbars',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'nonergodic-development',
    title: 'Nonergodic Development: How High-Dimensional Systems with Low-Dimensional Anchors Generate Phenotypes',
    journal: 'BioSystems (submitted)',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5846665',
    github: 'todd866/nonergodic-development',
    pdf: 'https://raw.githubusercontent.com/todd866/nonergodic-development/main/nonergodic_development.pdf',
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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'dimensional-landauer',
    title: 'The Dimensional Landauer Bound: Geometric Work in Information Processing',
    journal: 'Physical Review E (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/dimensional-work',
    pdf: 'https://raw.githubusercontent.com/todd866/dimensional-work/main/manuscript_pre.pdf',
    simulation: 'curvature-cost',
    image: 'dimensional-landauer.png',
    description: `**Erasing a bit costs energy — but so does projecting high-dimensional dynamics onto lower-dimensional representations.** This "geometric work" is a new fundamental cost in information processing, and it explains why biological systems favour coherent, oscillatory dynamics.

Landauer's principle says erasing one bit costs at least $kT \\ln 2$ of energy. But information doesn't exist in a vacuum — it lives somewhere physically, embedded in a dynamical system. When you extract a useful signal from noisy, high-dimensional data, you're not just erasing bits; you're projecting curved dynamics onto simpler manifolds. That projection has its own thermodynamic cost.

The Dimensional Landauer Bound: $W = kT \\ln 2 \\times \\text{bits} + kT \\times \\text{geometric contraction cost}$. The second term depends on manifold curvature — how much you have to "bend" the dynamics to fit them into a lower-dimensional space.

Why does this matter? Because coherence naturally reduces dimensionality. As oscillators synchronise, the projection cost drops — you're not fighting the dynamics anymore, you're riding them. This explains why brains use oscillatory coupling rather than independent firing: it's thermodynamically cheaper. Deep learning autoencoders show the same effect — training effort explodes when you try to compress below the data's intrinsic dimension.`,
    keyFindings: [
      'Dimensional Landauer Bound: work = kT ln2 × bits + kT × geometric contraction cost',
      'Control work scales with manifold curvature',
      'Coherence reduces work: as oscillators synchronise, projection cost drops',
      'Deep learning autoencoders show effort explosion below intrinsic data dimension',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'biological-shadows',
    title: 'The Geometry of Biological Shadows: Quantifying Topological Aliasing in High-Dimensional Systems',
    journal: 'BioSystems (submitted)',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5573915',
    github: 'todd866/limits-of-falsifiability',
    pdf: 'https://raw.githubusercontent.com/todd866/limits-of-falsifiability/main/paper2_shadow_geometry.pdf',
    image: 'biological-shadows.png',
    description: `**75% of what you see in t-SNE and UMAP plots is wrong** — points that look like neighbours weren't actually close in the original high-dimensional data. This isn't a bug in the algorithms; it's a geometric inevitability.

When you project high-dimensional biological data (like gene expression from thousands of genes) into 2D visualisations, you're not just simplifying — you're hallucinating structure. The paper provides the mathematical toolkit for measuring exactly how much your projections lie.

The numbers are sobering: 75.5% of apparent 2D neighbours are topologically aliased (they weren't neighbours in high-D), and ~40% of cluster assignments are incorrect due to projection artifacts. Worse, typical experiments sample less than 0.001% of the available state space, so even if your projection were perfect, you'd still be making claims about a vast unobserved territory.

This isn't an argument against visualisation — it's an argument for honesty about its limits. When a paper shows a UMAP with clear clusters and claims "we identified distinct cell types," there's a mathematical ceiling on that confidence. Validated across 4 standard scRNA-seq datasets (n = 90,300 cells), the paper gives bioinformaticians concrete tools to report aliasing rates alongside their visualisations.`,
    keyFindings: [
      '75.5% of apparent 2D neighbours are wrong (topological aliasing)',
      '~40% of cluster assignments are incorrect due to projection artifacts',
      '<0.001% of state space is actually sampled in typical experiments',
      'Validated across 4 standard scRNA-seq datasets (n = 90,300 cells)',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'clinical-validity-bounds',
    title: 'The Dimensional Validity Bound: Structural Limits of Clinical AI Evaluation in Multimorbidity',
    journal: 'JAMIA (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/clinical-validity-bounds',
    pdf: 'https://raw.githubusercontent.com/todd866/clinical-validity-bounds/main/manuscript.pdf',
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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and analysis code; GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'minimal-embedding',
    title: 'Minimal Embedding Dimension for Self-Intersection-Free Recurrent Processes',
    journal: 'Information Geometry (submitted)',
    year: 2025,
    status: 'submitted',
    image: 'minimal-embedding.png',
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
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'lsd-dimensionality',
    title: 'Psychedelics as Dimensionality Modulators: A Cortical Reservoir Theory of Serotonergic Plasticity',
    journal: 'Translational Psychiatry (target)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/lsd-dimensionality',
    pdf: 'https://raw.githubusercontent.com/todd866/lsd-dimensionality/main/lsd_dimensionality.pdf',
    simulation: 'lsd-landscape',
    image: 'lsd-dimensionality.png',
    description: `**Classical psychedelics work by dismantling the oscillatory constraints that lock cortical dynamics into low-dimensional attractors** — and MEG data reveals a mechanism-specific dissociation that distinguishes psychedelics from ketamine at the neural level.

Analysis of 136 MEG sessions across four compounds shows that 5-HT2A agonists (psilocybin, LSD) produce significant oscillatory desynchronization (psilocybin: −15%, p=0.003; LSD: −13%), while ketamine (NMDA antagonist) shows no effect. This specificity suggests that while both drug classes produce altered states, only serotonergic psychedelics function by breaking the synchronous constraints of the cortex.

The framework proposes effective dimensionality — the number of independent modes available to cortical dynamics — as the computational target of psychedelic therapy. Through dendritic gain amplification at 5-HT2A receptors on layer 5 pyramidal neurons, psychedelics expand the eigenmode spectrum, enabling exploration of configurations inaccessible under baseline conditions. This dimensionality expansion manifests across measurement modalities: as increased metabolic diversity (fMRI) mediated by the breakdown of synchronous oscillatory constraints (MEG).

A three-phase model (overshoot → refractory → recanalization) explains how transient dimensionality expansion enables lasting therapeutic reorganization. MEG-derived oscillatory coherence could serve as a real-time biomarker for "psychedelic depth" during treatment sessions.`,
    keyFindings: [
      'Mechanism-specific dissociation: psilocybin desynchronizes (−15%, p=0.003), ketamine does not',
      'Three-phase model: overshoot → refractory → recanalization',
      'MEG coherence as real-time biomarker for psychedelic depth',
      'Dimensionality expansion via 5-HT2A dendritic gain amplification',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and MEG analysis code; Gemini 2.5 Pro (Google) for review. Author reviewed all content and takes full responsibility.',
  },

  // === IN PREPARATION ===
  {
    slug: 'code-formation',
    title: 'Low-Dimensional Codes Constrain High-Dimensional Biological Dynamics',
    journal: 'Journal of Theoretical Biology (submitted)',
    year: 2025,
    status: 'submitted',
    github: 'todd866/code-formation-jtb',
    pdf: 'https://raw.githubusercontent.com/todd866/code-formation-jtb/main/code_formation_jtb.pdf',
    simulation: 'code-collapse',
    description: `**Biological systems exhibit persistent organization despite operating in high-dimensional, noisy, and finite-time dynamical regimes.** While order parameters and attractor dynamics explain pattern formation within single systems, they do not account for how biological organization is stabilized through low-dimensional interfaces such as genetic, regulatory, or homeostatic codes.

We propose a minimal dynamical mechanism by which low-dimensional codes emerge as stabilizing constraints between coupled high-dimensional systems. We model two locally coupled phase fields — an environment and a responding system — where interaction is restricted to a low-dimensional projection of the environmental state.

Using a Fourier bottleneck to control code bandwidth, we show that reducing coupling dimensionality induces a systematic collapse in the responding system's behavioral complexity while preserving bounded tracking of the driving system. Crucially, this collapse requires *structured* projections that capture coherent macroscopic degrees of freedom; random k-mode projections of the same dimensionality fail to constrain complexity.

Parameter sweeps suggest a trade-off between stability and behavioral richness: intermediate code dimensionality maintains bounded tracking under noise, while excessive compression produces rigid, low-complexity behavior.`,
    whyItMatters: `This provides a dynamical explanation for the ubiquity of low-dimensional coding structures in biology — DNA, neural codes, hormonal signals — as *constraint-forming devices* that preserve viability in high-dimensional systems, rather than as predictive representations.

The code constrains dynamics without enabling prediction or reconstruction of the full environmental microstate. This is fundamentally different from how we typically think about biological "information" — it's not about transmitting data, it's about enforcing coherence.`,
    keyFindings: [
      'Low-dimensional codes emerge as stabilizing constraints between coupled high-D systems',
      'Fourier bandwidth bottleneck induces systematic complexity collapse in responding system',
      'Structured projections (low-frequency Fourier modes) constrain; random projections fail',
      'Trade-off between stability and behavioral richness at intermediate code dimensionality',
      'Codes constrain dynamics without enabling prediction of full environmental microstate',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Author reviewed all content and takes full responsibility.',
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
    pdf: 'https://raw.githubusercontent.com/todd866/embryodimensionality/main/embryo_oscillators.pdf',
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
    pdf: 'https://raw.githubusercontent.com/todd866/immune-cooperation/main/immune_cooperation.pdf',
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
