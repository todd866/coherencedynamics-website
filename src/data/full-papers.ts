export interface FullPaperContent {
  abstract: string;
  sections: {
    title: string;
    content: string;
    figure?: {
      src: string;
      caption: string;
    };
  }[];
  references?: string[];
}

const fullPapers: Record<string, FullPaperContent> = {
  'high-dimensional-coherence': {
    abstract: `**Intelligence arises from high-dimensional coherent dynamics.** We show that high-dimensional continuous dynamics are not merely one way to implement intelligence—they are the thermodynamically favored solution under bounded measurement capacity. The core constraint is *measurement bandwidth*, not computational complexity: tracking systems with effective dimensionality $D_{\\text{target}}$ requires measurement capacity $C_{\\text{obs}} \\gtrsim D_{\\text{target}} \\cdot h_\\varepsilon^{\\text{track}} / \\tau_e$. External observers with finite bandwidth face an observational accessibility threshold beyond which the system becomes ontologically unmeasurable. This applies to *all living systems*: bacteria tracking chemical gradients ($D_{\\text{target}} \\sim 10^1$–$10^2$, $\\sim 10^{-12}$ W) and human brains tracking social/ecological complexity ($D_{\\text{target}} \\sim 10^3$–$10^5$, $\\sim$20 W) both require high-dimensional substrates ($D_{\\text{eff}} \\gg D_{\\text{target}}$), scaled to their respective behavioral bandwidths.`,

    sections: [
      {
        title: '1. Introduction',
        content: `Intelligence arises from high-dimensional continuous dynamics operating in phase space with effective dimensionality $D_{\\text{eff}} \\sim 10^3$–$10^4$. This is not one implementation among many—it is the thermodynamically favored way to track and control complex environments in real time under bounded measurement capacity.

What does high-dimensional continuous computation enable?

1. **Simultaneous exploration of incompatible states.** In high-D phase space ($D_{\\text{eff}} \\gg 1$), orthogonal subspaces allow the system to maintain superpositions of mutually exclusive configurations without forced resolution.

2. **Thermal noise as functional dimensionality expansion.** Coupling to a thermal bath enables computation through stochastic resonance and noise-assisted barrier crossing.

3. **Constraint satisfaction without enumeration.** Problems intractable for discrete search become tractable when relaxed to continuous high-D dynamics.

4. **Power scaling with behavioral output, not internal complexity.** Biological systems dissipate $\\sim$20 W regardless of task dimensionality.`
      },
      {
        title: '2. The Observable Dimensionality Bound',
        content: `We establish a fundamental relationship between dimensionality, measurement capacity, and temporal resolution. There exists a critical dimension:

$$D_{\\text{crit}} = \\frac{C_{\\text{obs}} \\tau_e}{\\alpha h_\\varepsilon^{\\text{track}}}$$

where $C_{\\text{obs}}$ is the observation channel capacity (bits/s), $\\tau_e$ is the evolution timescale, $h_\\varepsilon^{\\text{track}}$ is the minimum bits per mode per $\\tau_e$ to track geometry, and $\\alpha$ captures compressibility.

When $D_{\\text{eff}} > D_{\\text{crit}}$, the system's constraint geometry reconfigures faster than behavioral measurement can track—it becomes **timing-inaccessible**. This establishes a physical boundary separating observable computation from timing-inaccessible computation.`
      },
      {
        title: '3. The Measurement-Theoretic Tracking Bound',
        content: `**Theorem 1 (Measurement-Theoretic Tracking Bound).** Consider a target system with effective dimensionality $D_{\\text{target}}$. Let an external observer with measurement bandwidth $C_{\\text{obs}}$ attempt to predict events with timing precision $\\varepsilon$ over coherence time $\\tau_e$. Then:

1. If $D_{\\text{target}} \\le D_{\\text{crit}}$: The system is **observationally accessible**. External measurement can resolve enough dimensions to predict outputs.

2. If $D_{\\text{target}} > D_{\\text{crit}}$: The system is **observationally inaccessible**. Insufficient measurement bandwidth to resolve the full manifold of causal influences.

The brain does not face this constraint because it *is* the high-dimensional substrate. No "measurement" occurs during internal evolution—information is carried in geometric configuration.`
      },
      {
        title: '4. Code Formation from Dimensional Mismatch',
        content: `**Theorem 2 (Code Formation from Dimensional Mismatch).** When two high-dimensional systems interact through a low-dimensional communication channel, stable codes must form at the boundary.

If $D_B > D_{\\text{link}}^{\\text{crit}}$, the full state is observationally inaccessible. However, if $B$'s behaviorally-relevant dynamics are confined to structured regions—recurring subspaces $\\mathcal{S}_i$—then $A$ can learn to recognize these regions as discrete *codes* $c_i$. The effective dimensionality of what must be tracked collapses from $D_B$ to $D_{\\text{code}} \\sim \\log_2(N_{\\text{codes}})$.

**Implication:** This theorem provides a thermodynamic explanation for the emergence of language, gesture, and other symbolic codes in biological systems. When two agents with high internal dimensionality ($D_{\\text{brain}} \\sim 10^3$–$10^6$) coordinate through low-bandwidth channels (speech $\\sim 50$ phonemes/s), stable symbolic codes are thermodynamically *necessary*.`
      },
      {
        title: '5. Worked Example: Human Cortex',
        content: `MEG source reconstruction yields hundreds of cortical parcels ($N \\sim 10^2$–$10^3$) coupling across frequency bands ($|B| \\sim 3$–$5$). A conservative estimate of effective dimensionality:

$$D_{\\text{eff}}^{\\text{MEG}} \\sim \\kappa N |B| \\approx 0.3 \\times 250 \\times 4 \\approx 300$$

For mid-range parameters ($C_{\\text{obs}} \\sim 10^2$ bits/s, $\\tau_e \\sim 0.1$ s):

$$D_{\\text{crit}} = \\frac{100 \\times 0.1}{1 \\times 2} = 5 \\text{ modes}$$

Therefore: $D_{\\text{eff}}^{\\text{MEG}}/D_{\\text{crit}} \\approx 10^2$. Even at MEG-accessible scales, cortex operates $\\sim 10^2\\times$ above the observability threshold.`
      },
      {
        title: '6. Conclusion',
        content: `Training GPT-scale models ($\\sim 10^{11}$ parameters) requires $\\sim 10^{24}$ collision events, consuming megawatts. The human brain achieves comparable complexity at $\\sim$20 W—six orders of magnitude less. This gap reflects the fundamental thermodynamic cost of dimensional mismatch.

**Irreducible complexity is irreducible.** Systems with irreducible high-D—ecosystems, vector addition systems with Ackermann-complete reachability, multi-agent dynamics—cannot be faithfully compressed without information loss.

**The clocking constraint:** Digital systems enforce temporal synchronization via a global clock signal. Every register must settle to a definite state at each clock edge, forcing $D_{\\text{eff}}/D_{\\text{crit}} \\to 1$. Biological systems operate **unclocked**—oscillations emerge from coupled dynamics without external synchronization, permitting $D_{\\text{eff}} \\gg D_{\\text{crit}}$.`
      }
    ]
  },

  'clinical-validity-bounds': {
    abstract: `Clinical decision support systems (CDSS) are typically evaluated using aggregate metrics like AUC, assuming the inference problem is well-posed across the patient population. We identify a structural failure mode where this assumption breaks: when patient effective dimensionality ($D_{\\text{eff}}$) exceeds the model's representational capacity by a critical ratio. We derive the "Dimensional Validity Bound" from information-theoretic principles (Fano's inequality) and validate it using simulation studies and MIMIC-IV data (425,216 ICU admissions). We observe a paradoxical U-shaped performance curve: models perform best on low-complexity (healthy) and high-complexity (stereotyped/collapsed) patients, but fail in the "moderate complexity" regime. This "Zone of Maximum Entropy" represents a systematic blind spot where aggregate AUC remains high (0.835) despite structural posterior instability.`,

    sections: [
      {
        title: '1. Introduction',
        content: `The remarkable success of statistical learning in healthcare has created an implicit assumption: given sufficient data, appropriate algorithms, and careful validation, clinical prediction problems are solvable in principle. We demonstrate that this assumption fails in a specific, identifiable regime.

When the effective dimensionality of the system being predicted exceeds the representational capacity of the observer by a critical ratio, the inference problem becomes *structurally ill-posed*. This is not a limitation of current methods—it is an information-theoretic impossibility.

Three distinct mechanisms drive failure below the validity bound:

1. **Projection error.** When $D_{\\text{observer}} < D_{\\text{system}}$, the model necessarily performs lossy compression.

2. **Noise amplification.** Higher-dimensional system states amplify variance when projected onto lower-dimensional models.

3. **Hypothesis space explosion.** As system dimensionality grows, the number of distinguishable states scales exponentially.`
      },
      {
        title: '2. The Dimensional Validity Bound',
        content: `We adopt the participation ratio as our measure of effective dimensionality:

$$D_{\\text{eff}} = \\frac{\\left(\\sum_i \\lambda_i\\right)^2}{\\sum_i \\lambda_i^2}$$

where $\\lambda_i$ are eigenvalues of the covariance matrix.

Let an observer operate in $D_{\\text{obs}}$ effective dimensions while the system state occupies $D_{\\text{sys}}$ dimensions. Define the dimensional ratio:

$$r = \\frac{D_{\\text{obs}}}{D_{\\text{sys}}}$$

**Dimensional validity principle.** Under standard assumptions, stable inference requires a dimensional ratio $r$ above a critical value $r^* \\approx 0.3$. Below this threshold, the inference problem becomes ill-posed.

**Information-theoretic motivation.** The bound follows from Fano's inequality: $P(\\text{error}) \\geq \\frac{H(X) - C - 1}{\\log|\\mathcal{X}|}$`
      },
      {
        title: '3. Clinical Validation: MIMIC-IV',
        content: `We analyzed 425,216 adult hospitalizations from MIMIC-IV v3.1, stratifying by multimorbidity burden:

| Multimorbidity | N | $D_{\\text{eff}}$ | Mortality | AUC |
|----------------|-------|---------|-----------|-----|
| Low | 159,211 | 44.3 | 0.3% | 0.867 |
| Moderate | 128,979 | 37.5 | 1.1% | **0.835** |
| High | 137,026 | 29.5 | 5.8% | 0.859 |

Two findings confirm theoretical predictions:

1. **Effective dimensionality decreases with multimorbidity.** Counter to naive intuition ("sicker patients are more complex"), $D_{\\text{eff}}$ drops from 44.3 to 29.5 as multimorbidity increases. This supports the view that illness represents loss of physiological complexity—diseased systems collapse into stereotyped attractors.

2. **Classifier performance shows the predicted U-shape.** Worst AUC (0.835) occurs in the *moderate* multimorbidity stratum—the zone of maximum entropy.`
      },
      {
        title: '4. The Zone of Maximum Entropy',
        content: `The dimensional validity bound identifies a regime where standard evaluation metrics become unreliable—not because of insufficient data or poor algorithms, but because the inference problem itself is ill-posed.

Consider what aggregate AUC actually measures: the probability that a randomly chosen positive instance ranks higher than a randomly chosen negative instance *within the model's representation*. When projection error is severe, many distinct system states map to the same representation. The model may achieve excellent separation among distinguishable states while systematically failing on conflated states.

The zone of maximum entropy is particularly insidious. It is:
- Invisible to aggregate metrics
- Occurs in an intermediate regime that intuition misses
- Represents the population where model errors may be most consequential`
      },
      {
        title: '5. Recommendations',
        content: `Three practical recommendations follow:

1. **Compute $D_{\\text{eff}}$ at runtime.** Before generating predictions, estimate system complexity. When $r < 0.3$, flag that the validity bound may be exceeded.

2. **Stratify validation by complexity.** Report performance separately for low, moderate, and high complexity strata. Aggregate AUC should not be the sole basis for deployment decisions.

3. **Design appropriate abstention.** In regimes where the validity bound is violated, models should abstain rather than predict with false confidence.`
      },
      {
        title: '6. Conclusion',
        content: `Statistical learning has limits that are not merely practical but structural. When the effective dimensionality of the system being predicted exceeds the observer's representational capacity by more than approximately threefold, inference becomes ill-posed and standard evaluation metrics become misleading.

The zone of maximum entropy represents a systematic blind spot in current evaluation practice. It is invisible to aggregate metrics, occurs in an intermediate complexity regime, and may contain the instances where model errors are most consequential.

The dimensional validity bound is not a call for pessimism but for appropriate humility. In domains where the bound may be violated—biological systems, social networks, complex physical systems—we need different evaluation protocols, explicit validity checks, and appropriate abstention mechanisms.`
      }
    ]
  },

  'minimal-embedding': {
    abstract: `We study the problem of embedding recurrent processes on statistical manifolds into Euclidean spaces of minimal dimension while preserving temporal distinctness. A *self-intersection* occurs when two temporally distinct points of a trajectory are mapped to the same point in the embedding space. We show that for cyclic processes with strictly monotone meta-time—including recurrent neural dynamics, biological oscillators, and symbolic state transitions—any continuous embedding into $\\mathbb{R}^2$ that preserves the cyclic structure necessarily produces self-intersections, whereas self-intersection-free embeddings into $\\mathbb{R}^3$ always exist. This establishes $k=3$ as a critical dimension threshold: $k \\leq 2$ forces categorical discretization through unavoidable state conflation, while $k \\geq 3$ preserves the continuous structure of temporal dynamics.`,

    sections: [
      {
        title: '1. Introduction',
        content: `Information geometry provides a natural framework for studying inference and decision-making, endowing families of probability distributions with Riemannian structure via the Fisher information metric. A fundamental question arises when we consider *dimensional collapse*: what happens when a high-dimensional statistical manifold is projected onto a lower-dimensional subspace?

We focus on a specific aspect: the emergence of *self-intersections* between temporally distinct states. When a trajectory $\\gamma(t)$ on a statistical manifold $\\mathcal{M}$ is projected to a lower-dimensional space via a map $\\pi_k: \\mathcal{M} \\to \\mathbb{R}^k$, distinct times $t_1 \\neq t_2$ may be mapped to the same point. Such self-intersections destroy temporal information.

Our main results establish that:
1. For cyclic processes with monotone meta-time, self-intersections are structurally unavoidable in $\\mathbb{R}^2$
2. Self-intersection-free embeddings into $\\mathbb{R}^3$ always exist
3. The dimension $k = 3$ is therefore a *critical threshold*`
      },
      {
        title: '2. Cyclic Processes with Monotone Meta-Time',
        content: `A recurrent process $\\gamma$ is *cyclic with monotone meta-time* if:
1. There exists a "phase coordinate" projection $\\theta: \\mathcal{M} \\to S^1$ such that $\\theta \\circ \\gamma$ covers the circle $n \\geq 2$ times
2. The process encodes a strictly monotone "meta-time" variable $\\tau: [0,T] \\to \\mathbb{R}$ with $\\tau'(t) > 0$

**Examples:**
- **Biological oscillators:** Neural limit cycles, circadian rhythms, cardiac pacemakers
- **Recurrent neural networks:** Hidden state trajectories processing sequential data
- **Logical paradoxes:** The Liar's paradox ("This statement is false") oscillates between TRUE and FALSE, with each cycle occurring at a distinct meta-time`
      },
      {
        title: '3. The Minimal Embedding Theorem',
        content: `**Theorem (Minimal Embedding Dimension).** Let $\\gamma: [0, T] \\to \\mathcal{M}$ be a cyclic process with monotone meta-time. Then:

**(i)** For any continuous $\\pi_2: \\mathcal{M} \\to \\mathbb{R}^2$ preserving the cyclic structure, the self-intersection functional satisfies $E_{\\cap}(\\pi_2, \\gamma) > 0$.

**(ii)** There exists a continuous $\\pi_3: \\mathcal{M} \\to \\mathbb{R}^3$ such that $E_{\\cap}(\\pi_3, \\gamma) = 0$.

**Proof of (ii).** Define $\\pi_3(\\gamma(t)) = (\\cos(2\\pi \\theta), \\sin(2\\pi \\theta), \\tau(t)/T)$. This maps the trajectory to a helix in $\\mathbb{R}^3$. Since $\\tau$ is strictly monotone, $t_1 \\neq t_2$ implies $\\tau(t_1) \\neq \\tau(t_2)$, so the third coordinates differ and the map is injective.`
      },
      {
        title: '4. Information-Geometric Interpretation',
        content: `The self-intersection phenomenon has a natural interpretation in terms of metric degeneracy.

**Proposition (Fisher Metric Singularity).** Consider a statistical manifold parametrized by $(\\theta, \\tau) \\in S^1 \\times \\mathbb{R}$. Assume the Fisher information matrix $G(\\theta, \\tau)$ has full rank 2.

Under a projection $\\pi_2$ that discards the $\\tau$ coordinate, the induced metric has rank at most 1. The smallest eigenvalue of the induced metric tensor vanishes.

This rank drop corresponds to *non-identifiability*: distinct values of $\\tau$ produce identical sufficient statistics after projection. Self-intersections are thus equivalent to singularities in the accessible information geometry.`
      },
      {
        title: '5. Categorical vs. Continuous Representations',
        content: `Our results formalize a fundamental dichotomy in information processing:

- **Categorical regime ($k \\leq 2$):** Self-intersections are structurally unavoidable for cyclic processes with meta-time, forcing the system to treat temporally distinct states as equivalent. This naturally encourages discrete categories and symbolic representations.

- **Continuous regime ($k \\geq 3$):** Self-intersection-free embeddings exist, allowing the system to maintain temporal distinctness and represent processes rather than just states.

This dichotomy suggests that the emergence of discrete symbols from continuous dynamics may be geometrically inevitable under dimensional constraints.`
      },
      {
        title: '6. Conclusion',
        content: `We have established that $k = 3$ is the minimal embedding dimension for self-intersection-free representation of cyclic processes with monotone meta-time on statistical manifolds.

This result identifies a critical threshold in information geometry: below three dimensions, temporal information is necessarily lost when the cyclic structure is preserved, forcing categorical representations; at three dimensions and above, continuous processes can be faithfully represented.

The proofs are elementary, relying on the topology of the circle and the definition of injectivity, combined with the classical Whitney embedding principle. Yet the result has implications for understanding when and why discrete structures emerge from continuous substrates.`
      }
    ]
  },

  'lsd-dimensionality': {
    abstract: `The Entropic Brain hypothesis posits that psychedelics increase the richness of cortical states—in dynamical terms, an expansion of effective dimensionality. We tested this prediction across two neuroimaging modalities with distinct temporal resolutions. In MEG (136 sessions across four compounds), classical psychedelics significantly increased effective dimensionality (psilocybin: $+15\\%$, $p = 0.003$, $d = +0.78$), while ketamine showed no effect—consistent with 5-HT2A-specific mechanism. However, fMRI analysis revealed the opposite pattern: effective dimensionality *decreased* under psilocybin ($D_{\\text{eff}}$: $18.8 \\to 17.0$, $-10\\%$, $p = 0.013$). These results suggest a timescale dissociation: 5-HT2A agonism increases the independence of fast neural oscillations, but at slow hemodynamic timescales, BOLD variance concentrates in the first principal component.`,

    sections: [
      {
        title: '1. Introduction',
        content: `If the cortex operates as a system of coupled neural oscillators, it is inherently high-dimensional. The state space includes the phases and amplitudes of oscillators across frequencies and regions. A natural question arises: do psychedelics change this dimensionality?

By "dimensionality" we mean the number of independent modes of variation—how many degrees of freedom are actively being used. A system with 1000 oscillators might have effective dimensionality of 10 (if they're all synchronized) or 500 (if they're largely independent).

**The Prediction:** Classical psychedelics are 5-HT2A agonists. The 5-HT2A receptor is concentrated on layer 5 pyramidal neurons. Activation increases dendritic gain—the same input produces larger postsynaptic responses. In a coupled oscillator system, this predicts desynchronization: higher gain → neurons respond more to local inputs → this disrupts coherent oscillations → higher effective dimensionality.`
      },
      {
        title: '2. Methods',
        content: `**MEG Analysis:** We analyzed MEG data from 136 sessions across four compounds: psilocybin ($N=40$), LSD ($N=30$), ketamine ($N=36$), and tiagabine ($N=30$). We computed effective dimensionality ($D_{\\text{eff}}$) via participation ratio of sensor covariance eigenvalues.

**fMRI Analysis:** We analyzed fMRI data from the Siegel psilocybin precision functional mapping study (OpenNeuro ds006072). We included 50 sessions: 36 baseline and 14 drug sessions across 7 subjects.

**Effective dimensionality** via participation ratio:
$$D_{\\text{eff}} = \\frac{\\left(\\sum_i \\lambda_i\\right)^2}{\\sum_i \\lambda_i^2}$$

**Spectral centroid**—the center of mass of the eigenspectrum:
$$C = \\frac{\\sum_i i \\cdot \\lambda_i}{\\sum_i \\lambda_i}$$`
      },
      {
        title: '3. Results: MEG',
        content: `| Compound | $D_{\\text{eff}}$ Change | $p$ | Cohen's $d$ |
|----------|----------|-----|-------------|
| Psilocybin | $+15.0\\%$ | 0.003 | $+0.78$ |
| LSD | $+13.4\\%$ | 0.082 | $+0.50$ |
| Ketamine | $-5.7\\%$ | 0.290 | $-0.26$ |
| Tiagabine | $-10.8\\%$ | 0.307 | $-0.28$ |

Classical psychedelics (5-HT2A agonists) significantly increase oscillatory dimensionality—more independent modes, less synchronization. Ketamine (NMDA antagonist) shows no such effect. This dissociation is consistent with serotonergic psychedelic effects not shared by ketamine.`
      },
      {
        title: '4. Results: fMRI',
        content: `Contrary to the entropic brain prediction, fMRI eigenspectrum analysis revealed variance *concentration* rather than dispersion under psilocybin.

**Effective dimensionality:**
- Baseline (36 sessions): $D_{\\text{eff}} = 18.8 \\pm 3.1$
- Drug (14 sessions): $D_{\\text{eff}} = 17.0 \\pm 5.5$
- Change: $-9.8\\%$ (LMM: $z = -2.48$, $p = 0.013$, $d = -0.61$)

**Robustness to Global Signal Regression:**
- Without GSR: $D_{\\text{eff}}$ decreased $-9.8\\%$ ($p = 0.013$)
- With GSR: $D_{\\text{eff}}$ decreased $-8.7\\%$ ($p = 0.036$)

The effect survives GSR with medium effect sizes, suggesting it reflects genuine changes in hemodynamic covariance structure rather than global signal inflation.`
      },
      {
        title: '5. Discussion: A Timescale Dissociation',
        content: `Our central finding is a dissociation between electrophysiological and hemodynamic effects, but in the opposite direction from that predicted by simple "entropy increase" accounts.

At the millisecond timescale (MEG), 5-HT2A agonism produces the expected desynchronization—neural populations become more independent.

However, at the slow hemodynamic timescale (fMRI), psilocybin produces variance *concentration* rather than dispersion. The first principal component captures more variance under psilocybin, not less.

**Possible Mechanism:** Local neural populations can exhibit high-dimensional fast dynamics while riding on a shared slow envelope. Under psilocybin, the fast layer becomes more desynchronized (MEG: $D_{\\text{eff}} \\uparrow$) while the slow layer becomes more globally coordinated (fMRI: $D_{\\text{eff}} \\downarrow$).`
      },
      {
        title: '6. Conclusion',
        content: `We report a timescale dissociation in psychedelic effects on cortical dynamics:

1. **Fast oscillations (MEG):** Serotonergic psychedelics significantly increase effective dimensionality ($+15\\%$, $p = 0.003$), indicating more independent oscillatory modes.

2. **Slow hemodynamics (fMRI):** Effective dimensionality *decreases* ($-10\\%$, $p = 0.013$) and spectral centroid shifts toward lower modes. Variance concentrates in the first principal component.

3. **Robustness:** The fMRI effect survives global signal regression ($p = 0.036$), with medium effect sizes ($d = -0.61$ to $-0.64$).

These results suggest that the "entropic" effects of psychedelics may be confined to fast oscillatory dynamics and do not propagate to slow metabolic timescales.`
      }
    ]
  },

  'code-constraint': {
    abstract: `A recurring problem spans biophysics, systems biology, and neuroscience: high-dimensional systems (protein ensembles, gene networks, neural populations) are characterized through low-dimensional descriptions (order parameters, principal components, expression markers), yet the relationship between interface and underlying dynamics remains poorly understood. When is dimensional reduction faithful compression versus systematic distortion? Why do some low-dimensional codes work while others fail?

This review proposes a unifying interpretation: low-dimensional interfaces between coupled systems function as **stabilizing constraints** rather than information channels. We synthesize evidence from dynamical systems theory, statistical mechanics, and information theory to argue that the recurring interpretive problems arise from a common source—the assumption that dimensional reduction preserves information rather than imposing constraints.

Using coupled oscillator simulations as a minimal physical exemplar, we demonstrate a characteristic signature of constraint: bandwidth-limited coupling induces systematic complexity collapse in responding systems while maintaining bounded tracking. Critically, this requires structured projections that capture coherent collective variables; random projections of the same dimensionality produce the opposite effect (whitening, not collapse). The same signature appears in gene regulatory network dynamics, confirming generality beyond oscillatory systems.`,

    sections: [
      {
        title: '1. A Common Problem Across Fields',
        content: `Across biophysics, systems biology, and neuroscience, a recurring tension appears: the systems we study operate in high-dimensional state spaces, yet we characterize them through low-dimensional descriptions. This dimensional mismatch generates systematic interpretive problems that recur across domains.

**In protein biophysics**, conformational ensembles explore thousands of degrees of freedom, yet function is characterized by a handful of order parameters. Reaction coordinates that appear to govern folding kinetics may hide multiple parallel pathways. Parameter estimation is generically "sloppy"—many parameter combinations produce indistinguishable low-dimensional outputs.

**In single-cell genomics**, RNA sequencing reveals that cell states occupy low-dimensional manifolds embedded in ~20,000-dimensional gene expression space. Yet dimensionality reduction techniques can create spurious clusters, collapse distinct states, and distort neighborhood relationships.

**In developmental biology**, tissues coordinate through field-like gradients—morphogen concentrations, bioelectric potentials, mechanical stresses. These fields may possess rich, high-dimensional dynamics at molecular and ionic scales, yet individual cells respond through bandwidth-limited interfaces (ion channels, receptors).

**In neuroscience**, neural populations fire in high-dimensional pattern spaces, yet must coordinate across distant brain regions through apparent low-dimensional codes. Order parameters that appear to govern dynamics may be shadows of higher-dimensional processes.

These problems share a common structure: high-dimensional systems coupled through low-dimensional interfaces, where the relationship between interface and underlying dynamics is poorly understood.`
      },
      {
        title: '2. This Review: Codes as Constraints',
        content: `This review proposes a unifying interpretation of these phenomena, rather than a new biological mechanism. We synthesize insights from dynamical systems theory, statistical mechanics, and information theory to argue that the recurring problems above arise from a common source: the assumption that dimensional reduction preserves information rather than imposing constraints.

The core reframing is that low-dimensional interfaces between coupled systems function as *stabilizing constraints* rather than information channels.

Consider any biological interface: a cell membrane transducing environmental signals, a morphogenetic gradient coordinating tissue development, a neural code coupling sensory input to motor output. In each case, a high-dimensional "driving" system couples to a high-dimensional "responding" system through a low-dimensional bottleneck.

The standard information-theoretic framing asks how much information about the driving system's state is preserved or lost. We propose a different question: how does the bottleneck *shape the dynamics* of the responding system?

Using a minimal model of coupled oscillator lattices, we demonstrate that bandwidth-limited coupling produces a distinctive signature:
1. **Complexity collapse**: The responding system's effective dimensionality decreases systematically with code bandwidth
2. **Bounded tracking**: Alignment between systems remains stable despite information loss
3. **Structure dependence**: The effect requires projections onto coherent collective variables; random projections fail`
      },
      {
        title: '3. Biophysical Contexts',
        content: `**Protein Conformational Ensembles:** Proteins exist as dynamic ensembles exploring rugged energy landscapes. The full conformational state space has thousands of dimensions, yet function is often characterized by a handful of order parameters. Our framework suggests a reinterpretation: rather than asking whether order parameters *represent* the ensemble, we ask whether they *constrain* accessible trajectories.

**Single-Cell State Manifolds:** Single-cell RNA sequencing reveals that cell states occupy low-dimensional manifolds. Yet recent critiques highlight systematic artifacts. The constraint perspective offers a different question: which expression programs *constrain* cell fate transitions? A gene regulatory motif that restricts accessible trajectories functions differently from one that merely correlates with cell state.

**Morphogenetic Fields:** Developmental biology increasingly recognizes that tissues coordinate through field-like gradients. The key insight is not that bioelectric fields are simple, but that cellular responses are constrained to low-dimensional projections of field dynamics.

**Neural Population Codes:** Low-frequency oscillations can coordinate activity across spatially distributed populations, while high-frequency activity carries precise local information but couples only locally. The "bandwidth" of inter-regional coupling is set by oscillatory frequency, not by the intrinsic complexity of local circuits.`
      },
      {
        title: '4. A Minimal Physical Exemplar',
        content: `To make the constraint interpretation concrete, we demonstrate its signature in a minimal model: two coupled lattices of phase oscillators where interaction is restricted to a bandwidth-limited projection. This is not intended as a model of any specific biological system, but as a *didactic exemplar*.

**Driving System Dynamics (Kuramoto model):**
$$\\dot{\\theta}^A_i = \\omega_i + K \\sum_{j \\in \\mathcal{N}(i)} \\sin(\\theta^A_j - \\theta^A_i) + \\eta^A_i(t)$$

**Low-Dimensional Constraint (Fourier truncation):**
$$C_m = \\frac{1}{N} \\sum_{i=1}^{N} e^{i\\theta^A_i} e^{-i 2\\pi m i / N}, \\quad m = 0, \\ldots, k$$

The bandwidth-limited reconstruction:
$$\\hat{\\theta}^A_i = \\arg\\left(\\sum_{m=0}^{k} C_m e^{i 2\\pi m i / N}\\right)$$

**Responding System Dynamics:**
$$\\dot{\\theta}^B_i = \\omega_i + K \\sum_{j \\in \\mathcal{N}(i)} \\sin(\\theta^B_j - \\theta^B_i) + \\lambda \\sin(\\hat{\\theta}^A_i - \\theta^B_i) + \\eta^B_i(t)$$

System $B$ has no access to the full state of system $A$, only to the reconstructed field $\\hat{\\theta}^A$.`
      },
      {
        title: '5. Results: The Constraint Signature',
        content: `As code bandwidth $k$ decreases, the effective dimensionality of system $B$ decreases systematically ($N_{\\text{eff}} = 16.7 \\to 10.9$), while system $A$'s complexity remains constant ($N_{\\text{eff}} \\approx 17.0$).

**The bottleneck constrains only the responding system; the driving system's dynamics are unaffected by how it is observed.** This asymmetry is the hallmark of constraint rather than mutual information loss.

Mismatch between systems increases only modestly as bandwidth decreases ($\\Delta = 0.38 \\to 0.50$), a ~32% change compared to ~35% reduction in $N_{\\text{eff}}(B)$. If the code merely lost information, we would expect commensurate tracking failure. Instead, $B$ tracks *the code* faithfully—it aligns with $A$'s coarse-grained representation.

**Random projections fail:** Results differ strikingly when using random $k$-mode projections:
- $N_{\\text{eff}}(B)$ remains high (~15–17), showing no complexity collapse
- At low $k$, random projections produce *higher* complexity in $B$ than in $A$

This "whitening" effect occurs because sparse random projections destroy local spatial correlations, effectively acting as a noise source rather than a constraint. The constraining effect is not about dimensionality per se, but about *structure*.`
      },
      {
        title: '6. Generality: Gene Regulatory Networks',
        content: `To verify the constraint signature is not specific to phase oscillators, we implemented a gene regulatory network (GRN) model with Hill-function activation:

$$\\dot{x}_i = -\\frac{x_i}{\\tau} + \\sigma\\left(\\sum_j W_{ij} x_j\\right) + \\eta_i(t)$$

where $\\sigma(\\cdot)$ is a sigmoid activation function, $W$ is a sparse random connectivity matrix, and $\\tau$ is the decay timescale.

**Results ($N = 256$ genes):**
- $N_{\\text{eff}}(A)$ remains constant at $\\approx 193$
- $N_{\\text{eff}}(B)$ collapses from $192$ at $k = 1$ to $121$ at $k = 32$ (37% reduction)
- Mismatch increases modestly (0.22 to 0.37) as bandwidth decreases

The same qualitative signature—complexity collapse with bounded tracking—emerges in a fundamentally different dynamical system. The constraint mechanism is not specific to Kuramoto dynamics.

**Alternative complexity metrics** (PCA participation ratio, spatial gradient energy, Kuramoto order parameter) all show the same pattern, confirming that complexity collapse is a genuine dynamical phenomenon, not an artifact of the measurement basis.`
      },
      {
        title: '7. Implications for Practice',
        content: `The constraint interpretation suggests practical changes to how researchers approach low-dimensional descriptions:

**Choosing reaction coordinates in molecular dynamics:** The standard criterion is that a good reaction coordinate captures the slowest relaxation timescale. The constraint perspective suggests an additional criterion: does the coordinate *restrict accessible conformational dynamics* in the bound or functional state? The signature would be complexity collapse in conformational fluctuations when the coordinate is held fixed.

**Interpreting single-cell manifolds:** When UMAP or diffusion maps reveal low-dimensional structure, the standard interpretation is underlying regulatory simplicity. The constraint perspective suggests an alternative: low-dimensional structure may reflect bandwidth limitations of inter-cellular coupling. Testing this would involve comparing manifold dimensionality in tissues with different coupling architectures.

**Designing interfaces between models:** Multi-scale modeling often couples coarse and fine scales through ad hoc "handshaking" variables. The constraint framework suggests a principled criterion: the interface should select coherent collective variables that induce complexity collapse in the fine-scale system without unbounded tracking error.

**Distinguishing constraint from information:** Mutual information measures how much an observer can learn about one system from another. But a thermostat and a thermometer have the same mutual information with temperature—only one constrains it. When evaluating biological codes, ask: does reducing bandwidth produce complexity collapse (constraint) or tracking failure (information loss)?`
      },
      {
        title: '8. Conclusion',
        content: `This review has argued that the recurring interpretive problems surrounding dimensional mismatch in biology—sloppiness in protein modeling, artifacts in single-cell manifolds, shadows in neural codes—arise from a common source: the assumption that dimensional reduction preserves information rather than imposing constraints.

We proposed a unifying interpretation: low-dimensional interfaces between coupled high-dimensional systems function as stabilizing constraints rather than information channels. The signature of effective constraint is complexity collapse with bounded tracking. Critically, this requires structured projections onto coherent collective variables; random projections fail.

The framework offers practical guidance across fields: criteria for choosing reaction coordinates, for interpreting manifold structure, for designing multi-scale interfaces, and for distinguishing constraint from information. The key question is not "how much information does the code preserve?" but "does the code constrain downstream dynamics onto viable trajectories?"

**The deeper insight:** Biological codes are not optimized for information transmission at all. They are dimensional valves that enable persistent organization by constraining what responding systems can do. Constraint and representation are distinct functions, and conflating them has systematically misled our understanding of biological organization.`
      }
    ]
  },

  'coherence-time': {
    abstract: `Neuroscience has established that cognitive processing depends on coherent oscillations across neural assemblies: working memory maintenance requires sustained theta-gamma coupling, attention modulates inter-areal synchronization, and perceptual binding emerges from transient phase alignment. Yet the physical principles determining how fast these assemblies can synchronize—and thus how fast we can think—remain incompletely formalized. We derive a quantitative framework showing that coherence time in coupled oscillator networks scales exponentially with coordination depth. For $M$ semi-independent modules requiring phase alignment within tolerance $\\varepsilon$ at Kuramoto coherence $r$ and phase-exploration rate $\\Delta\\omega$:

$$\\tau_{\\mathrm{coh}} = \\frac{1}{\\Delta\\omega}\\left(\\frac{2\\pi}{\\varepsilon}\\right)^{\\alpha(1-r)(M-1)}$$

where circular variance $(1-r)$ governs phase dispersion and $\\alpha$ captures network topology. This produces a fundamental speed-flexibility trade-off: increasing coordination depth $M$ expands combinatorial flexibility but slows commits exponentially; tighter coherence (higher $r$) speeds synchronization but restricts dynamics to low-dimensional attractors.`,

    sections: [
      {
        title: '1. Introduction',
        content: `A fundamental insight from systems neuroscience is that cognition emerges from coherent oscillations across neural assemblies, not merely from individual spike rates. Working memory maintenance requires sustained theta-gamma phase-amplitude coupling. Attention selectively enhances inter-areal synchronization in gamma band. Perceptual binding depends on transient phase alignment across sensory cortices.

Yet despite extensive empirical characterization, the physical principles governing *how fast* distributed assemblies can achieve coherence—and thus how quickly cognitive operations can proceed—remain incompletely formalized. Why does perceptual binding require 30–50 ms rather than 3 ms or 300 ms? Why do larger assemblies integrating more information process more slowly?

We propose that neural processing speed is fundamentally limited by **coherence time**: the time required for distributed oscillators to achieve sufficient phase alignment for a collective computation to register.`
      },
      {
        title: '2. The Unified Temporal Resolution Bound',
        content: `We model biological temporal processing as a sequence of *commits*—thermodynamically irreversible events that register high-dimensional internal state as low-dimensional output. The minimum time between commits is bounded by four physical constraints:

$$\\tau_{\\mathrm{eff}} = \\max\\left[\\tau_{\\mathrm{QSL}},\\; \\tau_{\\mathrm{SNR}},\\; \\tau_{\\mathrm{coh}},\\; \\tau_{\\mathrm{power}}\\right]$$

where the **max** operation reflects that the slowest mechanism dominates:

- **Quantum speed limits** ($\\tau_{\\mathrm{QSL}}$): ~$10^{-13}$ s, relevant only for ultrafast molecular dynamics
- **Signal-to-noise limit** ($\\tau_{\\mathrm{SNR}}$): Time for signal integration above detection threshold
- **Coherence time** ($\\tau_{\\mathrm{coh}}$): Time for phase alignment across $M$ modules
- **Power limit** ($\\tau_{\\mathrm{power}}$): Metabolic constraints on commit rate`
      },
      {
        title: '3. Visual Perceptual Binding Windows',
        content: `Human visual perception exhibits temporal integration windows of 30–50 ms (flicker fusion at 20–30 Hz). We apply the bound with neural parameters:

Take $M=8$ occipital modules, $r=0.7$ (attention), full tolerance $\\varepsilon=\\pi$ rad, and phase-exploration rate $\\Delta\\omega=2\\pi\\times 20$ rad/s. Using the coherence time formula with $\\alpha=0.9$:

$$\\tau_{\\mathrm{coh}} \\approx \\frac{1}{125.66}\\left(\\frac{2\\pi}{\\pi}\\right)^{0.9(1-0.7)(7)} = \\frac{1}{125.66} \\cdot 2^{1.89} \\approx 30~\\mathrm{ms}$$

The effective commit time is $\\tau_{\\mathrm{eff}} \\approx 30$–$50$ ms, matching human binding windows. **Coherence time dominates**.`
      },
      {
        title: '4. Tachypsychia: Dual-Loop Dissociation',
        content: `During acute stress or falls, subjects report subjective time slowing while objective reaction times remain unchanged. We propose dual commit pathways:

**Perceptual loop** (cortical): High-$M$ (~10–15 modules) coherent field dynamics across sensory and associative areas. Commits sparse (5–20 Hz), expensive. Arousal increases coherence $r$ and thus information rate $\\mathcal{I}(t)$. Subjective duration scales as:
$$T_{\\mathrm{subjective}} \\propto \\int_0^{\\Delta t} \\mathcal{I}(t)\\,dt$$

**Motor loop** (cerebellar/basal ganglia): Low-$M$ (~3–5 modules) primitives executing learned policies. Commits faster (50–150 ms), cheaper. Arousal modulates decision threshold/drift rate, preserving reaction time.

This dual-loop architecture explains the dissociation: perceptual commits (high $M$, modulated by arousal) proceed independently of motor commits (low $M$, threshold-compensated).`
      },
      {
        title: '5. Metabolic Scaling Across Species',
        content: `Critical flicker fusion frequency correlates with mass-specific metabolic rate across three orders of magnitude in body size:

- Flies: ~240 Hz (metabolic rate ~10 mL O₂/g/hr, mass ~10 mg)
- Humans: ~60 Hz (~0.25 mL O₂/g/hr, mass ~70 kg)
- Leatherback turtles: ~15 Hz (~0.02 mL O₂/g/hr, mass ~500 kg)

Log-log regression shows $R^2 \\approx 0.6$ across three orders of magnitude in body mass, with $f_{\\mathrm{CFF}} \\propto P_{\\mathrm{meta}}^{0.6}$.`
      },
      {
        title: '6. Conclusion',
        content: `We have established that coherence time sets the speed of thought. Key findings:

1. **Speed-flexibility trade-off**: Increasing $M$ exponentially slows commits but expands combinatorial flexibility. Increasing $r$ speeds commits but restricts dynamics to low-dimensional synchronized manifolds.

2. **Dual-loop architecture**: Separate perceptual (high-$M$ cortical) and motor (low-$M$ cerebellar) pathways explain tachypsychia dissociation.

3. **Parameter sensitivity mechanism**: Modest $r$ or $M$ shifts (factor of 2) produce order-of-magnitude temporal changes without proportional metabolic costs.

4. **Quantitative predictions**: Visual binding windows (30–50 ms), metabolic scaling ($R^2 = 0.6$), alpha entrainment linearity, dual-task dissociations under arousal.`
      }
    ]
  },

  'cortical-oscillations': {
    abstract: `We propose that cortical oscillations implement a *dimensional hierarchy*: a cascade of progressively tighter information bottlenecks from slow to fast frequencies. Using graph Laplacian analysis on modular networks approximating cortical column structure, we show that slow eigenmodes engage substantially more oscillators than fast modes ($r = -0.75$), establishing the high-dimensional geometric substrate. Using encoder-decoder networks, we show that discrete symbolic codes emerge at a critical bottleneck width of $k=2$, while $k=3$ preserves continuous "compliant" dynamics capable of representing self-referential structures without trajectory collision. We propose that this hierarchy maps onto frequency bands: slow oscillations maintain the volumetric analog context; beta ($k \\approx 3$) supports manipulation and meta-cognition; gamma ($k \\approx 2$) forces categorical commitment.`,

    sections: [
      {
        title: '1. Introduction',
        content: `Influential work on oscillatory dynamics in prefrontal cortex suggests that different frequency bands serve distinct computational roles. Low-frequency oscillations are often characterized as "low-dimensional" coordinating signals, while gamma activity is associated with "high-dimensional" information processing.

However, this framing conflates two distinct notions of dimensionality:

1. **Temporal complexity**: How many independent time-varying components describe the signal at a single site.
2. **Geometric dimensionality**: How many degrees of freedom participate coherently across space.

A slow wave sweeping across cortex may appear "simple" at a single electrode but coordinates thousands of oscillators into coherent phase relationships (high geometric dimensionality). Conversely, a gamma burst may exhibit complex temporal structure but engage only a small cortical population (low geometric dimensionality).`
      },
      {
        title: '2. The Hierarchy Hypothesis',
        content: `We propose that the frequency spectrum implements a *dimensional hierarchy*—a cascade of information bottlenecks characterized by spatial participation:

| Band | Bottleneck | Topology | Function |
|------|------------|----------|----------|
| Delta/Theta | $k \\gg 3$ | Volumetric | Raw substrate |
| Beta | $k \\approx 3$ | Compliant manifold | Manipulation, meta-cognition |
| Gamma | $k \\approx 2$ | Discrete clusters | Symbols, decisions |

The key insight is that **different bottleneck widths support qualitatively different computations**. At $k=2$, the system is forced to discretize—continuous manifolds collapse into distinct attractor basins ("symbols"). At $k \\geq 3$, the system retains enough dimensionality to represent continuous processes, including self-referential structures that would produce trajectory collisions in lower dimensions.`
      },
      {
        title: '3. Slow Modes Have Higher Participation',
        content: `Graph Laplacian analysis shows a strong negative correlation ($r = -0.75$, $p < 0.001$): slower modes engage substantially more oscillators. The slowest 15 modes have mean PR ≈ 560 (23% of nodes); the fastest 15 modes have mean PR ≈ 175 (7% of nodes)—a 3-fold difference.

Synthetic time-series validation confirms that PR correctly distinguishes global from local activity. Slow-band activity (2–8 Hz) engaged 99% of channels (PR = 63.2/64); fast-band activity (30–50 Hz) engaged only 42% (PR = 26.6/64)—a 2.4-fold difference matching the Laplacian prediction.`
      },
      {
        title: '4. Self-Reference Benefits from k ≥ 3',
        content: `The Liar's Paradox trajectory produces 1511 self-intersections when confined to 2D; in 3D, it forms a collision-free helix. A linear autoencoder trained to compress and reconstruct the 3D helix through a $k=2$ bottleneck fails catastrophically on the time dimension (MSE = 0.108), while $k=3$ achieves perfect reconstruction (MSE $< 10^{-6}$).

This offers a geometric interpretation of why we can *think about* paradoxes (beta, meta-cognition) but cannot *decide* them (gamma, assertion).`
      },
      {
        title: '5. Noise Shifts the Optimal Bottleneck',
        content: `The optimal bottleneck width depends on channel noise. Quantitatively, the argmax over $k$ shifts from $k \\geq 3$ at $\\sigma \\leq 0.3$ to $k = 2$ at $\\sigma \\geq 0.7$. High-dimensional "helical" representations are fragile—they require precise coordination across many dimensions. Binary contrast ($k = 2$) is robust: it survives noise because it only needs to distinguish two categories.

This provides a computational mechanism for the stress–rigidity link: degraded signal-to-noise ratio drives the system toward categorical processing not by choice but by information-theoretic necessity.`
      },
      {
        title: '6. Conclusion',
        content: `Cortical oscillations implement a dimensional hierarchy: slow waves maintain the high-dimensional analog substrate; beta provides intermediate "compliant" compression for manipulation; gamma enforces discrete symbol formation. The capacity to sustain $k \\geq 3$ dynamics—to hold paradoxes without collision—may be a geometric signature of maturity. Long-wavelength stability provides the temporal substrate for collision-free cognition; its disruption forces the mind into rigid categorical processing.

**Intelligence emerges from the controlled collapse of analog into digital. The canvas is slow; the brushstrokes are fast.**`
      }
    ]
  },

  'nonergodic-development': {
    abstract: `Biological development is a high-dimensional dynamical process that cannot explore its state space in finite time—it is *nonergodic*. We argue that this nonergodicity, combined with low-dimensional genetic anchors, is the fundamental reason why genotype does not algorithmically determine phenotype. The genome constrains which regions of developmental state space are reachable, but environmental history determines which attractor basin the system occupies. Using a minimal developmental network model, we demonstrate that (1) identical genotypes produce substantially different phenotypes depending on which trajectory the system follows, (2) these trapped states constitute "developmental memory" that is invisible to genetic analysis, and (3) the "dimensional gap" $\\Delta_D$ between genetic parameters and developmental degrees of freedom quantifies this non-identifiability.`,

    sections: [
      {
        title: '1. Introduction',
        content: `Biological development unfolds in a high-dimensional state space. Gene regulatory networks, signaling cascades, and metabolic pathways create a system with vastly more degrees of freedom than the genome that parameterizes it. This dimensionality has a fundamental consequence: the system is *nonergodic*—it cannot explore its state space in biological time.

This nonergodicity is not a limitation to be overcome but a feature that enables stable phenotypes. The genome acts as a low-dimensional *anchor* that constrains which regions of state space are reachable, while environmental history determines which specific attractor the system occupies within those constraints.`
      },
      {
        title: '2. The Dimensional Gap',
        content: `We quantify the relationship between anchor dimensionality and state space dimensionality:

Let $L$ be the dimension of the genotype (anchor) space and $k$ the dimension of measured phenotypic traits. Let the developmental system evolve on a manifold $\\mathcal{M}$ with effective dimension $m_{\\text{eff}}$. The **dimensional gap** is:

$$\\Delta_D = m_{\\text{eff}} - (L + k)$$

When $\\Delta_D \\gg 0$, the developmental system has far more degrees of freedom than can be specified by the genome or captured by phenotypic measurement. This creates a fundamental ambiguity:
- The same genotype can produce different phenotypes (depending on which trajectory/attractor)
- The same phenotype can arise from different mechanisms (genotype-determined vs. trajectory-determined)`
      },
      {
        title: '3. Application: Cooperative Lifestyles and Cancer',
        content: `Sierra et al. (2025) demonstrated that cooperative mammalian species exhibit lower cancer prevalence than competitive species. The same pattern admits both interpretations:

- **Allele interpretation:** Cooperative lineages have accumulated cancer-suppressing alleles through selection.
- **Trajectory interpretation:** Cooperative environmental cues enable slower, more coordinated development with fewer attractor bifurcations, yielding lower cancer mortality as an emergent property.

These interpretations are *non-identifiable* from cross-species comparative data. They diverge only in predictions for intervention: the allele model predicts that changing an organism's environment will not change its cancer risk; the trajectory model predicts substantial phenotypic shifts.`
      },
      {
        title: '4. Twin Worlds Experiment',
        content: `We create two "worlds" with *identical* genotype distributions but different environmental regimes. The developmental trajectories in each world converge to different attractor basins, producing dramatically different phenotype distributions.

The genetic distance between worlds is $F_{ST} \\approx 0$ (by construction), yet phenotypic distance is $P_{ST} \\gg 0$. A GWAS would find no significant variants and conclude "missing heritability"—but the heritability is not missing, it is *trajectory-based*.`
      },
      {
        title: '5. Fractal Cooperation',
        content: `Coherence is self-stabilizing: organisms that maintain high coherence maintain high coherence. The property that prevents cellular bifurcation (cancer) is the same property that stabilizes group dynamics (cooperation). Nonergodicity doesn't just trap individual trajectories—it creates nested attractors at every scale where the same coherence parameter operates.

The "fractal" nature of the architecture means that solving the social dilemma (stabilizing the group) automatically solves the cellular dilemma (suppressing cancer). This is not coincidence but consequence: the same dynamical structure operates at both scales.`
      },
      {
        title: '6. Conclusion',
        content: `Biological development is nonergodic. The state space is too vast to explore; trajectories are trapped; phenotypes are attractor states, not algorithmic outputs.

The genome is a low-dimensional anchor that constrains which attractor basins exist, but environmental history determines which basin is entered. This anchor-trajectory duality offers one lens on the genotype-phenotype relationship: the mapping is many-to-one not only because of noise or missing variants, but also because trajectory information that distinguishes outcomes is projected out by genotype-phenotype analysis.

**Genotype does not algorithmically determine phenotype. Genotype anchors a nonergodic developmental system; environmental history traps it in an attractor; the phenotype is the trapped state.**`
      }
    ]
  },

  'dimensional-landauer': {
    abstract: `Landauer's principle establishes the minimum energetic cost of erasing discrete information, linking logical irreversibility to heat dissipation. However, many physical and biological systems process information by projecting high-dimensional dynamics onto lower-dimensional continuous manifolds. Here, we extend Landauer's framework to quantify the thermodynamic cost of this dimensional reduction. Using stochastic thermodynamics, we derive a "Dimensional Landauer Bound," $W_{\\text{min}} \\ge k_B T (\\ln 2 \\cdot \\Delta I + C_\\Phi)$, where $C_\\Phi$ is a dimensionless geometric contraction cost determined by the Jacobian of the projection and the curvature of the target manifold.`,

    sections: [
      {
        title: '1. Introduction',
        content: `The thermodynamics of computation is anchored by Landauer's principle, which states that any logically irreversible manipulation of information, such as bit erasure, must be accompanied by a corresponding entropy increase in the non-computational degrees of freedom. This typically sets a lower bound on energy dissipation of $k_B T \\ln 2$ per bit erased.

Complex physical systems—ranging from biochemical networks and neural populations to machine learning hardware—rarely operate on discrete bits. Instead, they process information by compressing high-dimensional state space trajectories into lower-dimensional representational manifolds.

While the information-theoretic aspects of this compression are well-understood, the thermodynamic costs associated with the *physical process* of dimensional reduction have not been fully characterized.`
      },
      {
        title: '2. The Dimensional Landauer Bound',
        content: `Consider a projection process taking the system from an initial distribution $p_0(x)$ on $\\mathbb{R}^{D_{\\text{in}}}$ to a final projected distribution $p_\\tau(y)$ on $\\mathbb{R}^{D_{\\text{out}}}$. The thermodynamic cost is bounded by:

$$W_{\\text{min}} \\ge k_B T (\\ln 2 \\cdot \\Delta I + C_\\Phi)$$

where $\\Delta I$ represents the classical information-theoretic erasure (in bits), and $C_\\Phi$ is the *dimensionless geometric contraction cost*:

$$C_\\Phi = -\\frac{1}{2} \\left\\langle \\ln \\det (J_\\Phi(x) J_\\Phi(x)^\\top) \\right\\rangle_{p(x)}$$`
      },
      {
        title: '3. Geometric Interpretation',
        content: `The term $C_\\Phi$ arises from the transformation of the phase space volume element under the projection map. The dimensional work is the thermodynamic cost of suppressing fluctuations in the null space of $J_\\Phi$.

Crucially, $C_\\Phi$ depends on physical properties of the constraint, not just the choice of coordinates. If the target manifold is curved, the Jacobian varies with position, and the cost includes a curvature penalty: $\\sim \\sum \\kappa_i^2 \\sigma_\\perp^2$, where $\\kappa_i$ are principal curvatures.

This confirms that $C_\\Phi$ represents genuine energy dissipation, not a coordinate transformation.`
      },
      {
        title: '4. Coherence Reduces Geometric Work',
        content: `In coupled Kuramoto oscillators, we observed a regime shift as coupling strength increased. In the incoherent phase ($r \\approx 0$), high effective dimensionality required substantial control work to project onto a 1D macroscopic state. However, as the system entered the coherent phase ($r \\to 1$), the effective dimensionality collapsed.

This spontaneous dimensional reduction aligned the system's intrinsic manifold with the target projection, minimizing orthogonal fluctuations. Consequently, control power $P_{\\text{maint}}$ decreased sharply as coherence emerged. This result suggests that **synchronization functions thermodynamically as a "pre-computation" that lowers the geometric cost $C_\\Phi$ of downstream readout**.`
      },
      {
        title: '5. Conclusion',
        content: `We have derived the Dimensional Landauer Bound, a thermodynamic inequality that quantifies the energetic cost of projecting high-dimensional stochastic dynamics onto lower-dimensional manifolds.

These findings suggest that dimensionality is a fundamental thermodynamic resource. In biological systems, the drive to minimize geometric work may explain the prevalence of coherent, oscillatory dynamics. Future work will extend this formalism to quantum systems, where state vector reduction represents the ultimate dimensional projection.`
      }
    ]
  },

  'projection-discontinuities': {
    abstract: `Low-dimensional projections of high-dimensional nonlinear dynamical systems introduce spurious discontinuities that do not exist in the underlying flow. We call this phenomenon **topological aliasing**: continuous trajectories appear to "jump" between states when observed through incomplete coordinates. We distinguish **system dimensionality** ($D_{\\text{sys}}$)—intrinsic degrees of freedom—from **observation dimensionality** ($D_{\\text{obs}}$)—coordinates accessible to measurement. Using the Lorenz, Rössler, and Hénon attractors as minimal models, we demonstrate that aliasing rates of 50-56% occur across canonical chaotic systems. We extend to time series (Mackey-Glass) and validate in biological data: across two standard scRNA-seq benchmarks, **70-80% of apparent neighbors in t-SNE/UMAP projections were not neighbors in high-dimensional space**.`,

    sections: [
      {
        title: '1. Introduction',
        content: `When a high-dimensional dynamical system is observed through low-dimensional coordinates, continuous trajectories can appear discontinuous. A system flowing smoothly through phase space may seem to "jump" between states in the projection—not because it actually jumped, but because distinct regions of the attractor overlap when viewed from incomplete coordinates.

We call this phenomenon **topological aliasing**. It is not noise, not measurement error, not a failure of statistical power—it is a geometric inevitability when the intrinsic dimension of the system exceeds the dimension of observation.

The central insight is **geometric**, not merely statistical. We distinguish between:

- **$D_{\\text{sys}}$**: The intrinsic degrees of freedom of the dynamical system—the dimension of the manifold the system actually occupies in phase space
- **$D_{\\text{obs}}$**: The number of coordinates we record—sensors, channels, features

When $D_{\\text{sys}} > D_{\\text{obs}}$, projection is necessarily non-injective: distinct states in the high-dimensional system map to the same point in observation space. The resulting overlaps are the geometric origin of the aliasing we quantify here.`
      },
      {
        title: '2. The Shadow Box',
        content: `Using the Lorenz attractor ($D_{\\text{sys}} \\approx 2.06$), we observe only the $(y, z)$ projection—the $x$ coordinate is hidden. We apply a classifier $\\hat{L} = \\mathbf{1}[z > 25]$ and compare to the true lobe label $L = \\mathbf{1}[x > 0]$.

Key results:
- **Aliasing rate**: 47% of states are misclassified by the shadow cut
- **Classification accuracy**: 53% (barely above chance)
- **Topological violations**: 199 false discontinuities—times the shadow "teleports" while the system flows continuously

The binary cut that appears "clean" in the shadow is fundamentally wrong about the underlying dynamics.`
      },
      {
        title: '3. Validation in Single-Cell Data',
        content: `Across two standard scRNA-seq benchmarks:

| Dataset | $D_{\\text{sys}}$ | t-SNE Aliasing | UMAP Aliasing |
|---------|----------|----------------|---------------|
| PBMC 3k | 38.8 | 73.6% ± 0.0% | 81.8% ± 0.1% |
| Paul15 | 110.9 | 67.4% ± 0.1% | 76.8% ± 0.2% |
| **Average** | — | **70.5%** | **79.3%** |

Error bars across 5 random seeds are <0.2%, confirming this is deterministic geometry, not stochastic noise.

When researchers draw cluster boundaries on t-SNE/UMAP plots, approximately **70-80% of the neighborhood relationships those boundaries rely upon are wrong with respect to the high-dimensional metric space**.`
      },
      {
        title: '4. The Inference Trilemma',
        content: `This creates a trilemma for high-dimensional biological inference:

1. **Time averaging fails**: non-ergodicity means temporal samples are not equivalent to ensemble samples.
2. **Ensemble averaging is impractical**: the curse of dimensionality demands sample sizes that scale as $k^n$—functionally infinite for biological dimensions.
3. **Direct measurement is destructive**: energy injection sufficient to resolve sub-Landauer structure perturbs the system beyond recovery.

All three classical escape routes from measurement uncertainty are blocked.`
      },
      {
        title: '5. Conclusion',
        content: `We have provided computational tools to quantify projection-induced discontinuities in nonlinear dynamical systems:

1. **Topological aliasing is quantifiable**: Across Lorenz, Rössler, and Hénon attractors, aliasing rates of 50-56% occur consistently.
2. **The effect scales with system dimension**: Mackey-Glass time series show aliasing increases from 50-61% (low chaos) to 76-91% (high chaos).
3. **The effect is pervasive in biological data**: Across scRNA-seq benchmarks, 70-80% of apparent neighbors in t-SNE/UMAP projections are wrong—and this is deterministic geometry (error bars <0.2%).
4. **The inference trilemma is structural**: Non-ergodicity, dimensional explosion, and thermodynamic fragility block all classical paths to inference.

Although illustrated with biological data, these results apply generally to any nonlinear dynamical system observed through incomplete coordinates.`
      }
    ]
  },

  'information-credit': {
    abstract: `Landauer's bound is often stated as a fixed cost per bit erased. The correct bound depends on entropy removed, which can be significantly less than the bit-count when the system or its environment carries structure. We show that apparent sub-Landauer episodes decompose into two distinct mechanisms: (i) *state credit*—bias (negentropy) and correlations (mutual information) that reduce the reversible work bound and obey a conservation law; and (ii) *protocol efficiency*—geometric structure in control space (thermodynamic length) that reduces irreversible dissipation but is not itself conserved. This decomposition yields a combined finite-time bound unifying information-theoretic and geometric contributions, and clarifies that anomalously low dissipation corresponds to spending accumulated state credit, not violating thermodynamic limits.`,

    sections: [
      {
        title: '1. Introduction',
        content: `The physics of information processing is often summarized by Landauer's limit: erasing one bit of information requires dissipating at least $k_\\mathrm{B}T\\ln 2$ of heat. This statement is correct only for a maximally uncertain bit in contact with a featureless thermal reservoir. The general bound is

$$W_{\\mathrm{rev}} \\geq k_\\mathrm{B}T \\, \\Delta S_{\\mathrm{register}}$$

where $\\Delta S_{\\mathrm{register}}$ is the entropy *removed* from the information-bearing degrees of freedom. A biased bit has less entropy; erasing it costs less.

This entropic framing resolves apparent paradoxes. Experiments have confirmed the entropic bound in standard erasure, while feedback protocols have demonstrated work extraction from correlations. These results are not violations of a "$k_\\mathrm{B}T\\ln 2$ per bit" rule—they are consequences of structure in the initial state or correlations with a measurement apparatus.

We distinguish two mechanisms:

1. **State credit:** Bias and correlations reduce the *reversible* work bound by reducing the entropy that must be removed. This is a true thermodynamic resource—creating it costs work; consuming it recovers work.

2. **Protocol efficiency:** Geometric structure in the control landscape reduces *irreversible* dissipation during finite-time operations. This is not a conserved resource but a property of the transformation path.`,
        figure: {
          src: '/images/papers/information-credit.png',
          caption: 'Figure 1: The decomposition. State credit (bias + correlations) is a conserved resource that reduces reversible work; protocol optimization (geometry) reduces irreversible work but does not deplete.'
        }
      },
      {
        title: '2. State Credit I: Bias',
        content: `Consider a binary register $X \\in \\{0,1\\}$ with probability $p = P(X=1)$. Resetting to a standard state removes entropy

$$H(X) = -p\\log_2 p - (1-p)\\log_2(1-p)$$

bits. The minimal (reversible) work is

$$W_{\\mathrm{rev}} = k_\\mathrm{B}T\\ln 2 \\cdot H(X)$$

For $p = 0.5$, this gives the familiar $k_\\mathrm{B}T\\ln 2$. For $p = 0.1$, the entropy is $H \\approx 0.47$ bits and the cost drops to $0.47 \\, k_\\mathrm{B}T\\ln 2$. The register's bias is not separate from the entropy—it *is* the reduced entropy.

The negentropy $H_{\\max} - H(X)$, where $H_{\\max} = \\log_2|\\mathcal{X}|$ is the register capacity, quantifies how much cheaper erasure is compared to the unbiased case. This negentropy was "paid for" when the bias was created—by measurement, asymmetric initialization, or prior computation.`
      },
      {
        title: '3. State Credit II: Correlations',
        content: `If the register $X$ is correlated with an auxiliary system $Y$, the erasure bound tightens further. Given access to $Y$, the minimal work to reset $X$ is

$$W_{\\mathrm{rev}} = k_\\mathrm{B}T\\ln 2 \\cdot H(X|Y)$$

where $H(X|Y) = H(X) - I(X;Y)$ is the conditional entropy. The mutual information $I(X;Y)$ is a true thermodynamic resource:

- Creating $I(X;Y)$ bits of correlation costs at least $k_\\mathrm{B}T\\ln 2 \\cdot I(X;Y)$ in work.
- Consuming it (via conditional erasure or feedback) recovers at most the same amount.

**State credit** is thus the sum of negentropy and accessible mutual information:

$$C_{\\mathrm{state}} = [H_{\\max} - H(X)] + I(X;Y)$$

The reversible work bound becomes $W_{\\mathrm{rev}} = k_\\mathrm{B}T\\ln 2 \\cdot [H_{\\max} - C_{\\mathrm{state}}]$.

**Conservation of state credit:** State credit cannot increase without external work input. Under isothermal conditions:

$$\\Delta C_{\\mathrm{state}} \\leq \\frac{W_{\\mathrm{in}}}{k_\\mathrm{B}T\\ln 2}$$

In isothermal settings, $k_\\mathrm{B}T\\ln 2 \\cdot C_{\\mathrm{state}}$ is the information free energy available to offset work—"credit" is not merely a metaphor but a thermodynamic quantity.`
      },
      {
        title: '4. Protocol Efficiency: Geometry',
        content: `Bias and correlation concern the *endpoints* of a transformation. A separate question is *how* you get there. Even between fixed initial and final distributions, different protocols incur different dissipation.

For slow driving near equilibrium, total work decomposes as $W = W_{\\mathrm{rev}} + W_{\\mathrm{irr}}$. In the linear-response regime, the irreversible part is bounded by

$$W_{\\mathrm{irr}} \\geq \\frac{k_\\mathrm{B}T}{2\\tau} \\mathcal{L}^2$$

where $\\tau$ is the protocol duration and $\\mathcal{L}$ is the **thermodynamic length**—the path length through parameter space measured in a generalized friction metric.

**Key distinction:** Protocol efficiency is *not* a conserved resource. Using an optimal protocol does not "spend" anything—it simply avoids waste. The geodesic is always available; the question is whether the controller can implement it.

- State credit obeys a conservation law.
- Protocol efficiency does not. It reduces $W_{\\mathrm{irr}}$ but cannot make $W_{\\mathrm{rev}}$ negative.`
      },
      {
        title: '5. Combined Bound',
        content: `Putting together state credit and protocol efficiency, the total work for a finite-time operation satisfies

$$W \\geq k_\\mathrm{B}T\\ln 2 \\cdot [H_{\\max} - C_{\\mathrm{state}}] + \\frac{k_\\mathrm{B}T}{2\\tau}\\mathcal{L}^2$$

The first term is the reversible bound (reduced by state credit); the second is the irreversible floor (reduced by protocol efficiency). Both must be paid, but they are paid in different currencies.

**Worked example.** Consider erasing a biased bit ($p=0.1$, so $H \\approx 0.47$) that is correlated with an auxiliary system ($I = 0.3$ bits). The state credit is $C_{\\mathrm{state}} = (1 - 0.47) + 0.3 = 0.83$ bits, so the reversible work is $W_{\\mathrm{rev}} = k_\\mathrm{B}T\\ln 2 \\cdot (1 - 0.83) = 0.17\\,k_\\mathrm{B}T\\ln 2$—about 17% of the naive Landauer cost.

If the protocol duration is $\\tau = 10$ relaxation times with thermodynamic length $\\mathcal{L} = 1.5$, the irreversible term is $\\mathcal{L}^2/(2\\tau\\ln 2) = 2.25/(20 \\times 0.693) \\approx 0.16$, giving total work $W \\gtrsim 0.23\\,k_\\mathrm{B}T$, well below the naive $k_\\mathrm{B}T\\ln 2 \\approx 0.69\\,k_\\mathrm{B}T$.`
      },
      {
        title: '6. Discussion',
        content: `The state-credit/protocol-efficiency distinction reorganizes established results into a cleaner accounting:

- **"Beating Landauer"**: No system beats the entropic bound. Systems with low $H(X|Y)$ simply have less entropy to remove.
- **Maxwell's demon**: The demon's memory is a correlation reservoir. Erasing it dissipates exactly what was "saved" during sorting.
- **Feedback engines**: Work extraction is financed by mutual information, which was created by a prior measurement that cost at least as much.

**Outlook:** The framework presented here assumes a fixed state space. In physical systems—particularly biological ones—structure can arise dynamically through confinement and history dependence. Extending the present accounting to variable-dimensional codes and nonstationary reservoirs is a natural direction for future work.`
      },
      {
        title: '7. Conclusion',
        content: `Landauer's bound is not a fixed tax on computation. It is a lower limit that depends on the entropy removed, which depends on the state credit available. Bias and correlations are thermodynamic resources obeying a conservation law; protocol efficiency reduces waste but is not conserved.

Episodes of ultra-low dissipation or work extraction are withdrawals from the state-credit account, not thermodynamic free lunches. The accounting clarifies what must be measured—entropy, mutual information, thermodynamic length—to predict dissipation in real systems.

For information processors operating in structured environments, the question is not "how many bits?" but "how much credit, and how good is the protocol?"`
      }
    ],

    references: [
      'Landauer, R. (1961). Irreversibility and heat generation in the computing process. IBM J. Res. Dev. 5, 183–191.',
      'Bennett, C. H. (1982). The thermodynamics of computation—a review. Int. J. Theor. Phys. 21, 905–940.',
      'Parrondo, J. M. R., Horowitz, J. M., & Sagawa, T. (2015). Thermodynamics of information. Nature Physics 11, 131–139.',
      'Bérut, A. et al. (2012). Experimental verification of Landauer\'s principle linking information and thermodynamics. Nature 483, 187–189.',
      'Toyabe, S. et al. (2010). Experimental demonstration of information-to-energy conversion. Nature Physics 6, 988–992.',
      'Sagawa, T. & Ueda, M. (2009). Minimal energy cost for thermodynamic information processing. Phys. Rev. Lett. 102, 250602.',
      'Sagawa, T. & Ueda, M. (2010). Generalized Jarzynski equality under nonequilibrium feedback control. Phys. Rev. Lett. 104, 090602.',
      'Seifert, U. (2012). Stochastic thermodynamics, fluctuation theorems and molecular machines. Rep. Prog. Phys. 75, 126001.',
      'Sivak, D. A. & Crooks, G. E. (2012). Thermodynamic metrics and optimal paths. Phys. Rev. Lett. 108, 190602.',
      'Crooks, G. E. (2007). Measuring thermodynamic length. Phys. Rev. Lett. 99, 100602.',
      'Todd, I. (2025). Timing inaccessibility and the projection bound. BioSystems 258, 105632.',
    ]
  },

  'coupling-identification': {
    abstract: `Identifying structure in high-dimensional dynamical systems via external measurement is fundamentally limited by finite information rates and observability constraints. We show that structurally similar systems can instead identify each other through weak dynamical coupling, synchronizing onto shared low-dimensional manifolds on timescales set by contraction rates rather than information accumulation. Formally, the synchronization time $T_{\\text{sync}} \\sim 1/|\\lambda_c|$ (where $\\lambda_c$ is the conditional Lyapunov exponent) can be orders of magnitude shorter than the measurement time $T_{\\text{meas}} \\sim I_{\\text{struct}}/R$ required for an external observer with bandwidth $R$ to infer equivalent structural information. We demonstrate this separation in a minimal coupled oscillator model where synchronization succeeds under conditions where external discrimination fails.`,

    sections: [
      {
        title: '1. Introduction',
        content: `How do complex systems recognize each other? We distinguish two channels: **measurement-based identification**, where an external observer accumulates information to infer structure, and **coupling-based identification**, where systems recognize similarity by synchronizing onto shared dynamical manifolds.

The standard scientific answer emphasizes measurement: an observer samples a system's outputs, accumulates statistics, and infers structural properties. This underlies model fitting, system identification, dimensionality estimation, and most of machine learning. Its limits are well understood: finite bandwidth, noise, and observability constraints bound what can be inferred from any measurement channel.

Yet many natural systems appear to coordinate without performing anything resembling measurement-based inference. Neural populations synchronize across brain regions. Cells entrain to neighbors. Organisms coordinate behavior through brief interactions that seem insufficient for model estimation. Humans reliably discriminate real from simulated dynamics even when they cannot articulate the distinguishing features.

We propose that these phenomena reflect the **coupling channel**: systems recognize structural similarity by synchronizing rather than by inferring models from observations.

The key insight is that synchronization is a *contraction process*, not an *inference process*. When structurally similar systems couple, perturbations transverse to a synchronization manifold decay at a rate governed by conditional Lyapunov exponents. This contraction can occur faster than any external observer could accumulate the information needed to verify that synchronization has occurred.`
      },
      {
        title: '2. The Fundamental Inequality',
        content: `We formalize the distinction as an inequality between two characteristic timescales:

$$T_{\\text{sync}} \\ll T_{\\text{meas}}$$

**Measurement-based identification:** Consider a dynamical system with state $x(t) \\in \\mathbb{R}^N$ observed through a measurement function $y(t) = M(x(t)) + \\eta(t)$. An external observer seeks to identify structural properties by accumulating observations over time. Let $R$ denote the effective information rate of the measurement channel (bits per unit time). Identifying structural equivalence to tolerance $\\epsilon$ requires accumulating information $I_{\\text{struct}}(\\epsilon)$, yielding:

$$T_{\\text{meas}} \\geq \\frac{I_{\\text{struct}}(\\epsilon)}{R}$$

**Coupling-based identification:** Now consider two systems $A$ and $B$ weakly coupled. If they share structural similarity, coupling drives them toward a functional relationship on the synchronization manifold. The timescale for synchronization is governed by the conditional Lyapunov exponent $\\lambda_c$:

$$T_{\\text{sync}} \\sim \\frac{1}{|\\lambda_c|}$$

Crucially, synchronization does not require explicit reconstruction of internal state. The systems do not infer each other's microstate; identification occurs through dynamical contraction onto an invariant relation, not through model estimation.

**Example scaling:** Consider systems with effective dimension $D_{\\text{eff}} \\sim 100$ requiring structural identification to precision $\\epsilon \\sim 10^{-3}$. For an observer with bandwidth $R \\sim 100$ bits/s: $T_{\\text{meas}} \\sim 10$ seconds. Meanwhile, moderate coupling can produce $|\\lambda_c| \\sim 10$ s$^{-1}$, giving $T_{\\text{sync}} \\sim 0.1$ seconds. A hundredfold separation—and this gap widens with system dimensionality.`
      },
      {
        title: '3. Minimal Demonstration',
        content: `To illustrate the synchronization-measurement separation, we construct a minimal model: two high-dimensional oscillator lattices with weak coupling, observed by a bandwidth-limited external discriminator.

**Model Setup:** One-dimensional lattices of $N = 64$ locally coupled phase oscillators (Kuramoto model). Cross-system coupling operates via pairwise phase-difference coupling: $\\epsilon \\sin(\\theta_i^A - \\theta_i^B)$. This exploits all $N$ degrees of freedom in the phase field—precisely the high-dimensional structure that a low-bandwidth observer cannot access.

**External Observer:** A bandwidth-limited observer receives the first $k = 4$ Fourier modes of each phase field. The observer measures *magnitudes* (energy), not phases—modeling a generic observer without foreknowledge that synchronization is fundamentally a phase-locking phenomenon.

**Results:**
- **Synchronization succeeds rapidly:** Cross-system coherence exceeds 0.7 within ~70 time steps
- **The Fourier observer lags substantially:** Requires ~320 steps to reliably discriminate (AUC > 0.75)
- **At $T_{\\text{sync}}$, Fourier AUC is only 0.58**—barely above chance
- **Cross-coherence oracle is fast but requires foreknowledge:** Achieves AUC > 0.75 within ~40 steps when given direct access to $r_{AB}$

The key insight: The oracle's success requires *foreknowledge* of what to measure. The coupling channel requires no such foreknowledge—it discovers relevance dynamically.`
      },
      {
        title: '4. The Residual Is Structured',
        content: `From the Fourier observer's perspective, the high-frequency phase dynamics ($k > 4$) appear as noise. We verify this with an ablation: coupling via low-pass filtered phases (keeping only $k=4$ modes) instead of full phases.

**Results:**
- Full coupling: $T_{\\text{sync}} \\approx 60$ steps, final coherence 0.99
- Filtered coupling: $T_{\\text{sync}} \\approx 190$ steps (~3× slower), final coherence 0.85
- Fourier features differ by only 0.06 on average

The "noise" carries the coordination; removing it cripples synchronization while leaving the observer's statistics nearly unchanged.

**Residual correlation analysis:** High-frequency residuals (modes $k > 4$) show $r \\approx 0.90$ correlation between coupled systems A and B, but $r \\approx 0$ between system A and an uncoupled control C. This confirms that the synchronization manifold occupies the observer's null space—the "noise" is structured coordination.`
      },
      {
        title: '5. Measurement as Cross-Scale Coupling',
        content: `The preceding analysis treats measurement and coupling as distinct. We now argue they are instances of the same phenomenon—dynamical coupling across timescales—differing only in bandwidth and structure.

**The Observer as an Oscillator:** Any physical measurement apparatus is itself a dynamical system. From a dynamical systems perspective, measurement is a coupling between a slow system (the target) and a fast system (the observer/sensor).

**Measurement Dimension as Coupling Rank:** Define the *measurement dimension* as the number of independent slow-system modes that can imprint distinguishable effects on the fast observer. This is the rank of the cross-scale coupling operator. Modes orthogonal to this coupling—those in the observer's null space—are *unmeasured*.

**Dimension Is Observer-Relative:** A crucial implication: dimensionality is not an intrinsic property of the system. It is a property of the (system × observer) pair. The same physical system can appear low-dimensional to one observer and high-dimensional to another.

**Why Coupling Beats Measurement:** Synchronization between similar systems exploits *matched coupling*—naturally engaging the relevant modes. Measurement imposes a *generic coupling* defined by the sensor, not by the target's structure. The observer must accumulate enough information to infer which modes are relevant—a process that scales with system complexity.`
      },
      {
        title: '6. Coherence Computing',
        content: `The synchronization-measurement inequality suggests a distinct computational regime, which we term **coherence computing**.

**Computation by Contraction:** A conventional computer performs inference: it represents system state explicitly, updates representations based on inputs, and derives outputs through symbolic manipulation. A coherence computer performs contraction: it couples to a target system, allows dynamics to flow toward synchronized manifolds, and reads out which manifold was reached.

**Architecture:** A coherence computer comprises three layers:
1. **Oscillator substrate (slow, high-D):** A tunable field of coupled oscillators with rich internal dynamics
2. **Coupling interface:** Adaptive connections that link the substrate to external systems
3. **Order-parameter readout (low-D):** Sensors that extract macroscopic features without reconstructing microstate

"Programming" consists of tuning coupling to match a target class of systems. "Inputs" are external dynamics that bias which synchronized manifold becomes stable. "Outputs" are order parameters of the resulting state.

**Why This Works:** The coherence computer identifies structure via coupling (fast) rather than inference (slow), reads out low-dimensional order parameters (cheap) rather than reconstructing high-dimensional state (expensive), and generalizes to a class of systems rather than memorizing instances.`
      },
      {
        title: '7. Conclusion',
        content: `We have shown that coupling-based identification can outperform measurement-based identification in high-dimensional dynamical systems. The timescale separation:

$$T_{\\text{sync}} \\sim \\frac{1}{|\\lambda_c|} \\ll T_{\\text{meas}} \\sim \\frac{I_{\\text{struct}}}{R}$$

reflects a fundamental distinction between contraction-driven and inference-driven processes.

This inequality clarifies the role of unmeasured dynamics: they are not irrelevant noise but the substrate through which rapid coordination occurs. Measurement collapses dimensional structure; coupling exploits it.

The observer-as-oscillator reframing reveals dimensionality as observer-relative: the "dimension" of a system is a property of the measurement channel, not an intrinsic system invariant.

Coherence computing instantiates these principles as an engineering framework, suggesting that biological coordination has long exploited what silicon is only beginning to attempt.

The broader implication is epistemic: **what generic measurement captures is not all there is, and the dynamics it misses may be precisely what matters for coordination.**`
      }
    ],

    references: [
      'Pecora, L. M. & Carroll, T. L. (1990). Synchronization in chaotic systems. Phys. Rev. Lett. 64, 821–824.',
      'Pikovsky, A., Rosenblum, M. & Kurths, J. (2001). Synchronization: A Universal Concept in Nonlinear Sciences. Cambridge University Press.',
      'Rulkov, N. F. et al. (1995). Generalized synchronization of chaos in directionally coupled chaotic systems. Phys. Rev. E 51, 980–994.',
      'Kalman, R. E. (1960). A new approach to linear filtering and prediction problems. J. Basic Eng. 82, 35–45.',
      'Hermann, R. & Krener, A. J. (1977). Nonlinear controllability and observability. IEEE Trans. Autom. Control 22, 728–740.',
      'Shannon, C. E. (1948). A mathematical theory of communication. Bell Syst. Tech. J. 27, 379–423.',
      'Kuramoto, Y. (1984). Chemical Oscillations, Waves, and Turbulence. Springer.',
      'Fries, P. (2015). Rhythms for cognition: Communication through coherence. Neuron 88, 220–235.',
      'Winfree, A. T. (1980). The Geometry of Biological Time. Springer.',
      'Acebrón, J. A. et al. (2005). The Kuramoto model: A simple paradigm for synchronization phenomena. Rev. Mod. Phys. 77, 137–185.',
    ]
  }
};

export function getFullPaperContent(slug: string): FullPaperContent | undefined {
  return fullPapers[slug];
}

export function hasFullPaperContent(slug: string): boolean {
  return slug in fullPapers;
}
