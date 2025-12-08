export interface Paper {
  slug: string;
  title: string;
  journal: string;
  year: number;
  status: 'published' | 'submitted' | 'in_prep';
  doi?: string;
  ssrn?: string;
  github?: string;
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
    image: 'falsifiability.jpeg',
    description: `Karl Popper's falsifiability criterion—the bedrock of scientific method—doesn't work universally in biology. This paper shows why.

Biological systems exist in absurdly high-dimensional spaces. A single cell needs thousands of variables to describe. When you try to test a yes/no hypothesis about such systems, you're projecting all that complexity onto a single bit. For a modest 100-neuron circuit, a binary test preserves about $10^{-100}$ of the information. That's functionally zero.

Worse, many biological patterns operate below the Landauer limit—the minimum energy needed to record one bit ($\\sim 3 \\times 10^{-21}$ J). Sub-threshold neural fluctuations, quantum coherence in photosynthesis, [ephaptic coupling](https://news.mit.edu/2023/brain-networks-encoding-memory-come-together-via-electric-fields-0724) between neurons: these patterns are too weak to measure discretely, yet they're causally important through collective effects.`,
    whyItMatters: `This isn't saying "biology is too complicated." It's identifying a fundamental physical limit on what binary hypothesis testing can tell us about high-dimensional systems. Falsifiability works for low-dimensional, strong-signal biology (enzyme kinetics, action potentials). But for consciousness, evolution on fitness landscapes, ecological networks, protein folding—we need different validation methods.`,
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
    image: 'timing-inaccessibility.jpeg',
    description: `Biology is astonishingly energy-efficient. The human brain runs at 20 watts while doing computations that would require megawatts on digital hardware. This paper explains why without invoking magic.

The key insight: below a certain energy threshold (the Landauer limit), you can't irreversibly record *when* things happen. You can detect that something occurred, but not its temporal order. This creates massive "path degeneracy"—exponentially many micro-trajectories that all look the same from the outside.

Biological systems exploit this by integrating weak signals across many dimensions, then paying the thermodynamic cost only when they commit to a discrete output. Digital computers, by contrast, pay for every bit at every clock cycle.`,
    whyItMatters: `This reconciles biology's efficiency with thermodynamics. The brain doesn't violate physics—it uses a different computational strategy that defers costs. It also explains why analog/neuromorphic computing can be more efficient: they're exploiting the same principle.`,
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
    image: 'high-dimensional-coherence.jpeg',
    description: `Intelligence isn't unique to humans—it emerges whenever a system can maintain high-dimensional dynamics that collapse to coherent outputs. From bacteria tracking chemical gradients to brains navigating social complexity, the same principle applies: explore a vast space internally, commit only when you must.

The brain doesn't compute by enumerating possibilities like a digital computer. It evolves through a high-dimensional landscape where incompatible solutions coexist peacefully until behaviour demands a choice. This isn't just elegant—it's thermodynamically necessary.`,
    whyItMatters: `Explains the million-fold energy efficiency gap between brains and computers as a fundamental architectural difference, not an engineering limitation. Also predicts why scaling digital AI hits diminishing returns.`,
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
    journal: 'BioSystems',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5018691',
    image: 'coherence-time.jpeg',
    description: `Your brain's processing speed isn't limited by how fast neurons fire—it's limited by how quickly distributed networks can [synchronise their oscillations](https://www.nature.com/articles/s41467-025-64471-2). Synchronisation time grows exponentially as more brain regions must coordinate, creating a fundamental trade-off: larger, more flexible networks process information more slowly.

This explains why visual binding takes 30-50ms, why flies perceive time faster than humans, and why consciousness may depend more on synchronised fields than individual spikes.`,
    whyItMatters: `Provides a quantitative framework for understanding processing speed across species and brain states. Also explains the attention paradox: focusing narrows your flexibility but sharpens perception.`,
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
    journal: 'Biological Cybernetics',
    year: 2025,
    status: 'submitted',
    image: 'substrate-dimensionality.jpeg',
    description: `Modern AI achieves enormous algorithmic complexity on substrates with essentially one degree of freedom—the global clock. Biological brains exploit vastly higher substrate dimensionality through asynchronous, continuous dynamics. This dimensional mismatch may explain why AI plateaus, resists interpretation, and may never achieve genuine consciousness.

The paper proves a structural limit: when internal complexity exceeds what we can measure, reconstructing internal states becomes mathematically impossible, not just difficult.`,
    whyItMatters: `If substrate dimensionality is the limiting factor, scaling parameters on digital hardware faces a hard ceiling we may already be approaching. Also raises questions about consciousness in field-based vs graph-based architectures.`,
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
    journal: 'Journal of Computational Neuroscience',
    year: 2025,
    status: 'submitted',
    github: 'todd866/brainwavedimensionality',
    image: 'cortical-oscillations.jpeg',
    description: `[Earl Miller's lab at MIT](https://ekmillerlab.mit.edu/) has argued that gamma oscillations carry working memory content while beta provides top-down control—but their framework treats dimensionality as something that *increases* with faster oscillations. This paper argues the opposite: slower oscillations maintain higher-dimensional representations.

Brain waves operate as a cascade of dimensional filters. Slower waves maintain a high-dimensional "canvas" with thousands of neurons in concert; faster waves compress information more tightly. At the tightest compression (gamma), the brain commits to clear categories. At moderate compression (beta), it retains flexibility to hold multiple ideas simultaneously.

This reframes the Miller Lab findings: gamma doesn't carry "rich content"—it carries *compressed* content. The richness lives in slower rhythms that gamma reads out from. It also explains why stress, sleep deprivation, and immaturity produce rigid thinking: when signals get noisier, the brain collapses toward categorical processing because that's more robust to interference.`,
    whyItMatters: `Inverts a major assumption in oscillatory neuroscience. If slow = high-D (not low-D), then interventions that enhance slow-wave activity (sleep, meditation, reduced stress) aren't just "calming"—they're expanding computational capacity.`,
    keyFindings: [
      'Slow oscillations recruit $\\sim 3\\times$ more neurons in coordinated patterns than fast oscillations',
      'Discrete symbols emerge predictably around 2:1 compression ratio',
      'Flexible thinking requires $\\geq 3$ dimensions; paradox tolerance is a signature of maturity',
      'Noise forces categorical collapse as information-theoretic necessity',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'coherence-gate-scaling',
    title: 'Thermodynamic Scaling Limits of Algorithmic Oscillatory Synchronization',
    journal: 'Neuromorphic Computing and Engineering',
    year: 2025,
    status: 'submitted',
    github: 'todd866/coherence-gate',
    image: 'coherence-gate-scaling.jpeg',
    description: `[Oscillating neural networks](https://www.nature.com/articles/s41467-025-64471-2) can extract powerful relational patterns from data. But simulating them on digital computers requires $O(N^2)$ operations per timestep—making large systems impractical. Physical coupling (electrical circuits, optical systems) does this automatically at $O(K)$ operations, offering 100-1000× better energy efficiency.

This isn't a temporary limitation—it's fundamental. The paper proposes the "coherence gate" as a hardware primitive for neuromorphic chips.`,
    whyItMatters: `Identifies a hard scaling barrier for oscillatory neural networks on digital hardware and shows a concrete path forward through dedicated analogue implementations.`,
    keyFindings: [
      'Digital simulation: $O(N^2)$ operations; physical coupling: $O(K)$ operations',
      '$86\\times$ energy advantage at 100 oscillators; $224\\times$ at 400 oscillators',
      'Coherence gate: let oscillators synchronise naturally, monitor via sparse taps',
      'Implementable via CMOS arrays, photonic resonators, or memristive crossbars',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'lsd-dimensionality',
    title: 'Psychedelics as Dimensionality Modulators: A Cortical Reservoir Theory of Serotonergic Plasticity',
    journal: 'Nature Communications',
    year: 2025,
    status: 'submitted',
    github: 'todd866/lsd-dimensionality',
    description: `Psychedelics like LSD and psilocybin don't flood the brain with chaos—they temporarily expand its computational flexibility. By activating 5-HT2A receptors on deep brain cells, they amplify dendritic gain and unlock dormant neural patterns that are normally suppressed.

The expansion is transient: after the drug wears off, dimensionality returns to baseline, but the brain has reorganised onto new, therapeutic attractors. This explains the mystery of lasting therapeutic changes after brief acute experiences.`,
    whyItMatters: `Identifies "dimensionality" as the therapeutic mechanism—something concrete to measure and optimise. Enables precision dosing, risk stratification, and potentially new treatments that expand dimensionality without requiring the full psychedelic experience.`,
    keyFindings: [
      'LSD: 8.6% increase in effective dimensionality (medium effect)',
      'Psilocybin: 19.2% increase acutely, returns to baseline after 1-2 weeks',
      'Three-phase model: overshoot → refractory collapse → recanalization',
      'Geometric (LSD) vs organic (psilocybin) visuals quantified via spectral centroid',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'nonergodic-development',
    title: 'Nonergodic Development: How High-Dimensional Systems with Low-Dimensional Anchors Generate Phenotypes',
    journal: 'BioSystems',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5846665',
    github: 'todd866/nonergodic-development',
    description: `Development isn't a recipe written in your genes that executes the same way every time. Biological systems develop through high-dimensional state spaces too vast to fully explore—they get "trapped" in particular developmental patterns based on environmental history.

The same genes can produce wildly different outcomes depending on which pathway an organism follows. [Sierra et al. (2025)](https://www.science.org/doi/10.1126/sciadv.adw0685) recently showed that cooperative mammals have dramatically lower cancer rates than competitive ones, interpreting this through group selection—cancer as an adaptation that benefits competitive populations by culling old individuals. This paper offers an alternative: cancer is cellular defection in the [Price equation](https://en.wikipedia.org/wiki/Price_equation) sense, and cooperative animals are cooperative at every level. The same coherence that prevents cells from defecting into cancerous states is what enables organisms to cooperate socially.

In cooperative environments, developmental trajectories remain stable within healthy attractor basins. In competitive environments, the same genome navigates unstable landscapes where cellular defection (cancer) becomes more likely. It's not that cancer is *selected for*—it's that cooperation is fractal: the mechanisms preventing cellular defection are the same mechanisms enabling social cooperation.`,
    whyItMatters: `Reframes nature vs nurture, missing heritability in GWAS, and cancer as attractor escape. Environmental buffering and stress reduction become powerful interventions—not because they fix broken cells, but because stability itself enables healthy development.`,
    keyFindings: [
      'Twin Worlds: identical genotypes, different environments → dramatically different phenotypes',
      'GWAS misses trajectory-based heritability entirely',
      'Cancer as cellular bifurcation into alternative stable states',
      'Fractal coherence: same mechanism prevents cancer and enables social cooperation',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'clinical-validity-bounds',
    title: 'The Dimensional Validity Bound: When Clinical Algorithms Fail Complex Patients',
    journal: 'npj Digital Medicine',
    year: 2025,
    status: 'submitted',
    github: 'todd866/clinical-validity-bounds',
    description: `When patients have many interacting diseases—kidney disease plus lung disease plus heart failure—no amount of AI data can make algorithms reliable at predicting outcomes. This isn't a technology problem; it's a fundamental mismatch between what computers can handle and how complex real patients actually are.

Think of it like navigating a 3D maze with only a 2D map: no matter how detailed your map is, it won't help.`,
    whyItMatters: `Explains why EHR alerts feel useless in complex patients and why experienced doctors often override them. You're not ignoring evidence—you're recognising that the algorithm is operating outside its valid range. This gives a framework to justify clinical override.`,
    keyFindings: [
      'AI performs worst not on sickest patients, but on moderate complexity (zone of maximum entropy)',
      'Healthy patients: D_eff = 44.3; sick patients collapse to D_eff = 29.5',
      '14 tests with 5% false positive rate → 50% chance of spurious finding',
      'Validated on 425,216 hospital admissions from MIMIC-IV',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'oscillatory-incompleteness',
    title: 'Oscillatory Incompleteness: Gödel, Symbol Formation, and High-Dimensional Dynamics',
    journal: 'Synthese',
    year: 2025,
    status: 'submitted',
    description: `When continuous physical systems with many interacting parts produce symbols we can observe, those symbols must necessarily be incomplete—there will always be true facts about what the system does that we cannot predict or explain using any fixed theory.

This reinterprets Gödel's famous incompleteness theorem as a fundamental constraint on any physical system that forms symbols from continuous oscillating dynamics.`,
    whyItMatters: `Explains why some aspects of clinical judgement and expertise cannot be fully captured in algorithmic form: the brain operates in higher dimensions than our symbolic theories can accommodate.`,
    keyFindings: [
      'Any consistent theory describing symbolic outputs from oscillatory systems is necessarily incomplete',
      'Information loss from high-D continuous space through low-D measurement creates Gödelian structure',
      'Applies to neural oscillations, gene networks, ecological cycles',
      'Physical self-referential oscillator embodies Gödel sentence in dynamical form',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'dimensional-landauer',
    title: 'The Dimensional Landauer Bound: Geometric Work in Information Processing',
    journal: 'Physical Review X',
    year: 2025,
    status: 'submitted',
    github: 'todd866/dimensional-work',
    description: `When information processing systems compress high-dimensional dynamics into lower-dimensional representations, they face two thermodynamic costs: the traditional Landauer cost of erasing bits, plus an additional "geometric work" cost from projecting curvy dynamics onto simpler manifolds.

This explains why biological systems favour oscillatory, coherent dynamics—coherence naturally reduces dimensionality, lowering the energetic rent of information processing.`,
    whyItMatters: `Information isn't just abstract symbols—it lives somewhere physically. Every time your brain extracts a useful signal from noisy, high-dimensional data, it's performing a geometric transformation with energetic cost. Dimensionality—not just the bit—is the fundamental resource.`,
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
    journal: 'BioSystems',
    year: 2025,
    status: 'submitted',
    ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5573915',
    github: 'todd866/limits-of-falsifiability',
    description: `When you project high-dimensional biological data (like gene expression from thousands of genes) into 2D visualisations like t-SNE or UMAP, you're not just simplifying—you're hallucinating structure. About 75% of the "neighbours" you see in a 2D plot weren't actually neighbours in the original high-dimensional space.

This paper provides the mathematical toolkit for measuring exactly how much your projections lie. It quantifies topological aliasing—points that appear close in 2D but were far apart in the original space—and shows it's not a bug in algorithms but a geometric inevitability.`,
    whyItMatters: `Gives bioinformaticians concrete tools to quantify uncertainty in their visualisations. When a paper shows a UMAP with clear clusters and claims "we identified distinct cell types," there's a mathematical limit to that confidence. Instead of pretending your t-SNE is ground truth, you can report the aliasing rate.`,
    keyFindings: [
      '75.5% of apparent 2D neighbours are wrong (topological aliasing)',
      '~40% of cluster assignments are incorrect due to projection artifacts',
      '<0.001% of state space is actually sampled in typical experiments',
      'Validated across 4 standard scRNA-seq datasets (n = 90,300 cells)',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },
  {
    slug: 'minimal-embedding',
    title: 'Minimal Embedding Dimension for Cyclic Decision Processes',
    journal: 'Information Geometry',
    year: 2025,
    status: 'submitted',
    description: `Cyclic decision processes—like the OODA loop (observe, orient, decide, act)—require at least 3 dimensions to avoid self-intersection. In 2D, the trajectory would collide with itself; in 3D, it spirals cleanly.

This isn't just geometry—it's a constraint on any physical system implementing feedback loops.`,
    whyItMatters: `Provides a lower bound on the complexity needed for adaptive decision-making. Systems with fewer than 3 effective dimensions cannot implement clean feedback cycles.`,
    keyFindings: [
      'Minimal embedding dimension = 3 for non-self-intersecting cycles',
      'Applies to OODA loops, control systems, metabolic cycles',
      'Information-geometric derivation from Fisher metric',
      'Connects to Takens embedding theorem',
    ],
    workflow: 'Claude Code with Opus 4.5 (Anthropic) for drafting and simulation code; Gemini 3 Pro (Google) and GPT-5.1 (OpenAI) for review. Author reviewed all content and takes full responsibility.',
  },

  // === IN PREPARATION ===
  {
    slug: 'embryo-oscillators',
    title: 'Slow Bioelectric Oscillations Dominate Morphological Information Capacity',
    journal: 'TBD',
    year: 2025,
    status: 'in_prep',
    description: `Embryonic development relies on slow bioelectric oscillations to coordinate morphogenesis. Fast signals (neural-like) can't carry enough information across the spatial scales required for organ formation. Slow oscillations dominate because they match the timescale of developmental decisions.`,
    whyItMatters: `Suggests that bioelectric pattern formation operates under information-theoretic constraints, not just biochemical ones.`,
  },
  {
    slug: 'abiogenesis-chemistry',
    title: 'Dimensional Constraints on Prebiotic Chemistry: Why Life Needed Cycles Before Replication',
    journal: 'Origins of Life and Evolution of Biospheres',
    year: 2025,
    status: 'in_prep',
    description: `Before life could replicate, it needed to maintain coherent chemical cycles against thermal noise. The dimensional framework suggests that autocatalytic cycles emerged first as thermodynamic necessities, with replication as a later refinement.`,
    whyItMatters: `Reframes origin of life questions from "how did replication start" to "how did coherent cycles become self-sustaining."`,
  },
  {
    slug: 'immune-cooperation',
    title: 'Immune Cooperation as Dimensional Surveillance: Why the Adaptive System Monitors Complexity, Not Pathogens',
    journal: 'BioSystems',
    year: 2025,
    status: 'in_prep',
    description: `The adaptive immune system doesn't primarily detect pathogens—it monitors local complexity. Cancer cells trigger immune responses not because they're "non-self" but because they increase local dimensional complexity. Infection is similar: the immune system responds to dimensional anomalies.`,
    whyItMatters: `Explains autoimmunity, cancer immune evasion, and tolerance from a unified dimensional perspective.`,
  },
  {
    slug: 'mri-coherence-controller',
    title: 'Coherence Metabolic Imaging via Photonic MRI Controllers',
    journal: 'Magnetic Resonance in Medicine',
    year: 2025,
    status: 'in_prep',
    description: `A photonic coherence computer attached to an MRI control loop could measure "computational hardness" as a new imaging contrast. Tissues with high coherence would show different signatures than disordered tissues, potentially detecting cancer or neurodegeneration before structural changes appear.`,
    whyItMatters: `Would enable early detection of diseases characterised by loss of tissue coherence, using existing MRI infrastructure.`,
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
