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
    journal: 'BioSystems (R2 minor revision)',
    year: 2025,
    status: 'submitted',
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
    whyItMatters: `This explains why brains and AI systems sometimes snap into discrete categories instead of maintaining fluid, continuous processing. The threshold isn't arbitrary—it's geometric necessity. Compress a cyclic process (like oscillating between possibilities) into too few dimensions, and you literally cannot tell "when" something happened, only "what" state you're in. This is why sleep deprivation, stress, and cognitive overload produce rigid either/or thinking: you're being forced below the dimensional threshold where nuance is geometrically possible.`,
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
    pdf: 'https://raw.githubusercontent.com/todd866/brainwavedimensionality/main/paper/slow_waves_high_D.pdf',
    image: 'cortical-oscillations.png',
    description: `**The field conflates three distinct notions of dimensionality that can systematically come apart** — and this category error inverts our understanding of what slow brain waves actually do.

We distinguish: (1) *substrate dimensionality* — how many oscillators participate coherently; (2) *interface dimensionality* — how many degrees of freedom a readout exposes; and (3) *expressed structure* — the complexity of downstream patterns. Slow waves are high-dimensional *substrates* (many neurons in concert) that appear smooth through low-dimensional *interfaces* (electrode arrays). The smoothness is concentration of measure, not simplicity.

New empirical support: [Chen et al. (2026, Current Biology)](https://doi.org/10.1016/j.cub.2025.11.072) from Miller's lab show that alpha/beta oscillations form spatial "inhibitory stencils" that gate *where* spiking can occur — exactly the interface/substrate distinction we propose. Their "spatial computing" framework validates our theoretical architecture.

The paper introduces *cycle aliasing*: when interface rank drops below $k=3$, distinct timepoints in recurring processes become observationally identical under linear readout. At $k=2$, the brain is forced into discrete categories. At $k \\geq 3$, it can represent self-referential dynamics (holding paradoxes without resolution). We propose emotion operates as a rank-1 readout that "diffracts" through coupling matrices to produce system-wide effects — explaining why anger feels like the whole brain agrees.

Cognitive maturity may be the capacity to sustain $k \\geq 3$ dynamics despite ongoing rank-1 affective pressure. Stress and noise force collapse toward categorical processing — not irrationality, but adaptive response when channel capacity is compromised.`,
    keyFindings: [
      'Tri-level distinction: substrate vs interface vs expressed structure resolves the "dimensionality confusion"',
      'Slow modes engage $\\sim 3\\times$ more oscillators (high participation ratio) than fast modes',
      'Cycle aliasing: $k < 3$ forces categorical representation; $k \\geq 3$ preserves continuous dynamics',
      'Emotion as rank-1 readout + diffraction explains global affective recruitment',
      'Maturity = sustaining high-rank interfaces under affective pressure; stress forces collapse',
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

  // === IN PREPARATION ===
  {
    slug: 'quotient-geometry',
    title: 'Quotient Geometry of Statistical Manifolds Under Dimensional Collapse',
    journal: 'Information Geometry (in preparation)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/code-emergence',
    pdf: 'https://github.com/todd866/code-emergence/blob/main/code_emergence.pdf',
    image: 'quotient-geometry.png',
    description: `**When a statistical manifold is observed through a lower-dimensional map, what geometric structure survives?** This paper provides the general quotient-geometric framework that makes the minimal embedding threshold inevitable.

The key insight: collapse maps foliate the manifold into fibers along which the *observed* Fisher metric degenerates. Parameters on the same fiber produce identical observed distributions—they're observationally indistinguishable, even if the full distributions differ.

The Fisher metric descends to the quotient **if and only if** it's bundle-like (constant along fibers on horizontal vectors). Totally geodesic fibers provide a sufficient condition. This settles when dimensional reduction preserves statistical structure versus when it destroys it.

The covering number bounds quantify what's lost: $N(\\varepsilon) \\sim \\varepsilon^{-r}$ where $r$ is the projection rank. Lower-rank projections yield coarser quotients—fewer distinguishable classes at any resolution. The $k=3$ threshold from the companion paper emerges as a special case: below $k=3$, phase-preserving projections drop from $r=2$ to $r=1$ scaling.

This forms a two-paper program with the minimal embedding result: Paper 1 gives the crisp threshold; Paper 2 provides the geometric machinery.`,
    whyItMatters: `Every time you compress information—whether it's a neural network bottleneck, a summary statistic, or your brain creating a memory—you're performing dimensional collapse. This paper answers: what survives? The answer isn't "it depends on the details." There are hard geometric constraints. Some information is genuinely lost (parameters become indistinguishable). Some structure survives (when the geometry is "nice" in a precise sense). And the amount you can distinguish at any resolution follows predictable scaling laws. This matters for AI interpretability (why we can't always reconstruct what a network "knows"), for neuroscience (why high-D brain states produce low-D behavior), and for any science that uses dimensionality reduction.`,
    keyFindings: [
      'Fiber Structure Theorem: collapse maps foliate M into observationally non-identifiable fibers',
      'Quotient Metric Theorem: Fisher metric descends iff bundle-like; totally geodesic is sufficient',
      'Covering bounds: $N(\\varepsilon) \\sim \\varepsilon^{-r}$ quantifies distinguishability at finite resolution',
      'Minimal embedding ($k=3$) emerges as dimension drop from $r=2$ to $r=1$',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting; GPT-5.2 (OpenAI) and Gemini 3 Pro (Google) for cross-paper consistency review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'spectral-decoupling',
    title: 'Spectral Decoupling of Capacity and Entropy in Network Dynamics',
    journal: 'Journal of Complex Networks (in preparation)',
    year: 2025,
    status: 'in_prep',
    github: 'todd866/spectral-decoupling',
    description: `**Network complexity is two-dimensional: capacity (how many slow modes topology supports) and entropy (how spread the dynamics are).** These axes are orthogonal — you can match entropy while having completely different capacities, or vary entropy while capacity stays fixed.

The key insight: the Laplacian spectrum determines spectral capacity $C(\\lambda^*)$ — the count of slow modes below a threshold. This is purely topological. State entropy, by contrast, decomposes as $H = 2\\log\\sigma + B(G;\\alpha)$ where noise contributes an additive shift and topology sets the baseline. Noise moves you along the entropy axis; topology determines your capacity.

This resolves a common conflation in network science. When people say a network is "complex," do they mean it supports many persistent patterns (high capacity) or that its dynamics are unpredictable (high entropy)? These are independent. A ring lattice has high capacity but can have low entropy (coherent slow modes). A random graph has zero capacity but can have high entropy (noisy fast dynamics).

The $(C, H)$ phase portrait provides a diagnostic: where does your network sit, and what controls each axis?`,
    keyFindings: [
      'Spectral capacity $C(\\lambda^*)$ counts slow Laplacian modes — purely topological',
      'State entropy decomposes: $H = 2\\log\\sigma + B(G;\\alpha)$ — noise vs topology contributions',
      'Iso-entropy networks can have vastly different capacities',
      'Fixed topology means fixed capacity regardless of noise level',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; GPT-5.2 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
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
