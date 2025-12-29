---
slug: the-philosophy-trilogy
title: The Philosophy Trilogy
subtitle: Agency, signaling, and epistemic frustration from bacteria to belief systems
date: 2025-12-29
tags:
  - philosophy
  - agency
  - epistemology
  - signaling
  - dimensionality
summary: Three papers, one question. How do systems coordinate when participants can't verify each other's commitments? The answer connects bacterial quorum sensing to human ideology, and explains why mature institutions resist evidence.
relatedPapers:
  - agency-power
  - epistemic-frustration
  - costly-signaling
---

I've been working on a trilogy of papers for *Biology & Philosophy* that tackle a single question from three angles: **How do systems coordinate when participants can't verify each other's commitments?**

This isn't abstract philosophy. It's the core problem of social life at every scale.

Consider a cell in your body trying to coordinate with its neighbors. It can't open them up to check their intentions. But here's the deeper problem: even if it *could* read their genomes, that wouldn't help. Genomes don't deterministically specify behavior.

This isn't a minor technical point. [Elowitz and colleagues' classic 2002 experiments](https://www.science.org/doi/10.1126/science.1070919) showed that genetically identical cells in identical environments produce wildly different protein levels—"noise" that's intrinsic to the stochastic nature of gene expression. [Subsequent work](https://febs.onlinelibrary.wiley.com/doi/10.1002/1873-3468.14898) has shown that this noise isn't just error to be filtered out; cells actively exploit it for decision-making. Noise combined with regulatory circuits helps cells choose between fates—differentiation, apoptosis, immune response—in ways that depend on context, history, and dynamics, not just genetic sequence.

So how *do* cells make decisions? Not through deterministic computation from genetic lookup tables. They navigate high-dimensional dynamical landscapes. [Waddington's epigenetic landscape](https://www.nature.com/articles/nrg.2016.98)—the metaphor of a ball rolling through valleys representing cell fates—turns out to be more than metaphor. Cells occupy attractors in gene-expression space, and transitions between fates involve traversing saddle points, exploiting noise, and responding to signals that reshape the landscape itself. The same genome produces neurons, muscle cells, and skin cells not because different instructions are read, but because the dynamical system settles into different basins.

This means you can't predict a cell's behavior from its genome any more than you can predict a person's behavior from their personality test. The genome constrains the space of possibilities; it doesn't specify the trajectory.

And this is the fundamental coordination problem. Organisms can't read each other's minds. Nations can't verify each other's strategic intentions. You can't know whether someone's stated beliefs reflect genuine conviction or strategic performance.

Yet coordination happens—somehow. These papers explore how.

---

## Part 1: Agency and Power

The first paper ([Agency and Power](/papers/agency-power)) establishes the foundation: what *is* an agent, and how do agents control each other?

The standard philosophical move is to draw a bright line. Agents have beliefs and desires; non-agents don't. You're either in the club or you're not.

But this creates awkward categories. Consider:

- A thermostat that adjusts temperature based on a setpoint
- A bacterium swimming up a chemical gradient
- A slime mold solving mazes
- A corporation pursuing quarterly earnings
- A human deliberating over career choices

Where's the line? Any threshold feels arbitrary. Say agents need "beliefs"—but a bacterium's chemotaxis system maintains something like a running estimate of gradient direction. Say agents need "desires"—but what distinguishes a bacterium's "goal" of reaching nutrients from a thermostat's "goal" of reaching the setpoint?

I propose ditching the binary. **Agency comes in degrees.** A system is an agent to the extent it:

1. Maintains internal states representing self and environment
2. Uses those states to select among alternative actions
3. Has those states be *causally efficacious*—they actually guide behavior, not just correlate with it

This gives us a spectrum. A thermostat scores low (one internal state, one action dimension, minimal representation). A bacterium scores higher (gradient sensing, temporal memory, behavioral switching). A human scores higher still (rich world models, recursive self-representation, long-horizon planning).

What about corporations? Here's where it gets interesting. A corporation presents an agent-like interface to the world—it "decides," "pursues goals," "responds to incentives." But crack it open and there's no unified decision-maker inside. The "cognition" is distributed across constituent human minds, none of whom individually embody the corporation's goals. I call these **demi-agents**: entities that act like agents from outside but outsource their actual cognition to components.

Once you have agents (of varying grades), you can ask about power. And here's the key move: **power is control of controllers**.

Not control of outcomes—that's just effectiveness. Power is the capacity to reliably steer *another agent's* action by manipulating the variables that govern its action selection.

Power operates through two routes:

**Route 1: Representation-mediated.** Change what the target perceives or values. Advertising, propaganda, framing effects, prestige hierarchies, charismatic leadership. You're not constraining their options; you're reshaping their internal model so they *want* to do what you want.

**Route 2: Constraint and controller-hijack.** Limit available actions or directly modify control systems. Imprisonment, resource control, parasitic manipulation of nervous systems, addiction, brain damage. You're not persuading; you're overriding.

Both routes appear at every biological scale:

- **Bacteria:** Quorum sensing molecules alter gene expression in neighboring cells (representation-mediated). Bacteriocins kill competitors (constraint).
- **Fungi:** *Ophiocordyceps* hijacks ant nervous systems, forcing suicidal behavior that spreads spores (controller-hijack).
- **Insects:** Queen pheromones suppress worker reproduction (representation-mediated). Physical dominance enforces hierarchy (constraint).
- **Primates:** Prestige hierarchies shape attention and imitation (representation-mediated). Coalitional aggression enforces norms (constraint).
- **Humans:** All of the above, plus language-mediated manipulation at unprecedented scale.

The mechanisms trace continuously. This isn't metaphor—it's structural homology, convergent solutions to the control-of-controllers problem.

---

## Part 2: Costly Signaling

The second paper ([Costly Signaling](/papers/costly-signaling)) zooms in on a specific problem: **commitment verification**.

You want to form a coalition—hunt together, share resources, defend territory. But coalition members can defect: take benefits without contributing, free-ride on others' effort, betray the group when better offers arrive. How do you distinguish genuine allies from defectors *before* the costly collective action?

The answer is **costly signaling**: signals that reliably reveal commitment because they're structured so that faking is unprofitable.

The logic is simple. If defection pays bonus $D$, and the signal costs $C$ to produce, then a reliable signal requires $C > D$. Only agents who genuinely expect long-term coalition benefits will pay the cost. Defectors, who plan to grab benefits and leave, won't invest—the math doesn't work out for them.

(A note on theory: [Zahavi's original handicap principle](https://onlinelibrary.wiley.com/doi/10.1111/brv.12563) proposed that signals must be *wastefully* costly. [Recent work by Penn and Számadó](https://pmc.ncbi.nlm.nih.gov/articles/PMC7004190/) has refined this—what matters isn't waste per se, but that signals reliably reveal the signaler's type. Costs can be efficient rather than wasteful; what matters is that they create separating equilibria where honest signalers and cheaters make different choices.)

As coordination stakes increase—as the coalition becomes more valuable and defection more tempting—the required signal cost rises. Signals become increasingly **individually dominated**: they appear irrational from a narrow individual perspective.

Consider what reliable commitment signals look like in practice:

- **Painful initiation rituals.** Fraternity hazing, military boot camp, gang beatings-in. The pain isn't incidental—it's the point. Easy entry means cheap signals means unreliable commitment.

- **Dietary restrictions.** Keeping kosher, halal, vegetarian for ethical reasons. You're constantly paying costs (inconvenience, social friction, foregone pleasures) that only make sense if you're genuinely committed to the community that values these practices.

- **Celibacy vows.** Priests, monks, nuns. You're sacrificing one of the deepest biological drives. Hard to fake, hard to maintain without genuine commitment.

- **Public profession of improbable beliefs.** "I believe X" where X is empirically questionable or socially costly to assert. The very improbability is the signal—anyone can profess popular beliefs.

Notice the pattern. A **structural cluster** emerges wherever high-stakes coalition formation occurs:

1. **Ritual:** Costly, arbitrary, synchronized behavior
2. **Sacred markers:** Propositions held immune to evidence
3. **Deviation punishment:** Harsher penalties for internal defection than external opposition
4. **Identity fusion:** Self-concept merging with group identity
5. **Evidence resistance:** Counter-evidence *strengthening* commitment

These aren't independent cultural inventions. They're components of a single mechanism—commitment verification under information asymmetry.

The most counterintuitive prediction: **evidence against beliefs can strengthen commitment**. Why? Because maintaining a belief despite strong counter-evidence is *more costly*. You're paying a higher epistemic price—looking foolish, facing cognitive dissonance, losing credibility with outsiders. That makes your commitment signal *more* reliable.

This explains the otherwise puzzling phenomenon of beliefs hardening under attack. You're not refuting someone's epistemics. You're *validating their signaling*.

The paper traces this cluster across scales:

- **Bacteria:** [Costly autoinducer production in quorum sensing](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2722019/). Cheaters who don't produce signals get detected and excluded. Populations [minimize exploitation by collectively producing public goods only when cells reach quorum](https://pmc.ncbi.nlm.nih.gov/articles/PMC9333318/)—a density threshold that makes signal costs worthwhile.
- **Social insects:** Hydrocarbon profiles as colony recognition. Workers attack nestmates with wrong profiles—expensive to fake, reliable identification.
- **Immune systems:** Self-tolerance via costly developmental selection. T-cells that react to self-antigens are eliminated—an expensive filter that reliably distinguishes self from non-self.
- **Human ideologies:** The full cluster appears. Rituals, sacred values, heretic-hunting, identity fusion, evidence resistance.

Same mechanism, different substrates.

---

## Part 3: Epistemic Frustration

The third paper ([Epistemic Frustration](/papers/epistemic-frustration)) zooms out to ask: **why do mature institutions resist evidence?**

The usual answers—bias, groupthink, motivated reasoning—aren't wrong, but they're incomplete. They describe the phenomenon without explaining its structure. Why does resistance have the particular form it does? Why does it intensify predictably over institutional lifecycles? Why do similar patterns appear across wildly different domains?

I think there's something deeper going on. Something geometric.

Consider a high-dimensional optimization problem—say, coordinating a complex organization with many constraints (budgets, regulations, stakeholder interests, technical requirements, political realities). The "right answer" lives in this high-dimensional space.

Now project this into low-dimensional discourse—the simplified narratives, slogans, and position-statements that humans can actually communicate and reason about. What happens?

**Multiple high-dimensional optima can project to the same low-dimensional position.** Two configurations that are actually quite different in the full constraint space might look identical when compressed into talking points.

More importantly: **A single high-dimensional optimum can appear contradictory from different low-dimensional perspectives.** Imagine a 3D object casting shadows on two walls. The shadows might look incompatible—one circular, one rectangular—even though they're projections of the same coherent object.

This is **epistemic frustration**: disagreement that is *geometric*, not epistemic.

Two observers seeing different constraints—because they occupy different positions, have access to different information, or project along different dimensions—can each be locally correct but globally incompatible. They're not irrational. They're not lying. They're projecting different faces of a shared high-dimensional reality into incompatible low-dimensional frames.

Sound abstract? Here's a concrete example.

A hospital administrator, a frontline nurse, and a patient advocate might all want "better healthcare." But:

- The administrator sees budget constraints, regulatory compliance, liability exposure
- The nurse sees staffing ratios, equipment availability, workflow efficiency
- The advocate sees wait times, communication quality, outcome disparities

Each is locally correct. Each has genuine insight into real constraints. But their low-dimensional summaries—"we need more resources," "we need better systems," "we need more compassion"—can appear contradictory even when they're all projecting from the same underlying optimum.

Epistemic frustration explains why arguments don't converge. More information doesn't help when the problem is dimensional, not evidential. You can't resolve shadow-disagreements by examining the shadows more carefully.

**The transition.** As coordination stakes increase, systems undergo a predictable shift:

- **Epistemic-first regime:** Truth-seeking dominates. Anomalies trigger model revision. Disagreement is treated as information to be integrated.

- **Coordination-first regime:** Stability-seeking dominates. Anomalies are absorbed or explained away. Disagreement is treated as defection to be punished.

This isn't irrationality. It's optimization under a different objective function. When the cost of coordination failure exceeds the cost of local inaccuracy, systems *should* prioritize coherence over truth. A tribe that stays unified around a slightly wrong map survives; a tribe that fragments while debating cartography doesn't.

The paper provides a quantitative diagnostic. Define:

$$R = \frac{\text{error-model degrees of freedom}}{\text{informational constraints}}$$

When $R > 1$, the system can absorb any evidence without revision. It has enough free parameters to explain anything. This is the signature of effective unfalsifiability.

This explains phenomena that otherwise seem irrational:

- **Moralization of dissent.** In coordination-first regimes, disagreement isn't just error—it's defection. You're not wrong; you're *bad*. This seems excessive if the goal is truth-seeking, but makes perfect sense if the goal is maintaining coalition coherence.

- **Sacred value formation.** Certain propositions become immune to cost-benefit analysis. "We don't negotiate with terrorists," "human life is priceless," "some things aren't for sale." These aren't failures of rationality—they're coordination devices, commitment signals that would lose their function if subjected to case-by-case calculation.

- **Paradigm entrenchment.** Anomalies accumulate indefinitely rather than triggering Kuhnian crises. The system has enough error-model flexibility to absorb them. Only external shocks—new generations, institutional collapse, competitive pressure from alternative paradigms—force revision.

---

## The Trilogy Together

These papers aren't independent. They're a progression:

**Agency and Power** establishes that agency is graded and power is control of controllers. This gives us the vocabulary.

**Costly Signaling** shows how agents verify each other's commitments despite private internal states. This explains coalition formation—and the strange phenomena (ritual, sacred values, evidence resistance) that accompany it.

**Epistemic Frustration** zooms out to show how coordination-maintaining systems predictably sacrifice epistemic accuracy for stability, and why this happens through dimensional collapse.

The connections run deep:

- Power operates by manipulating agents' internal models (Part 1). But those models are low-dimensional projections of high-dimensional realities (Part 3). So power is partly about *controlling which projection* agents occupy.

- Epistemic frustration creates coordination-first systems (Part 3). But coordination-first systems need commitment verification (Part 2). So the shift from truth-seeking to stability-seeking *predicts* the emergence of costly signaling clusters.

- Costly signals work by being individually dominated (Part 2). But what counts as "dominated" depends on the agent's internal model (Part 1). So signaling regimes and agency interact—the signal shapes what kind of agent you become.

---

## Why This Matters

If this framework is right, it has practical implications:

**For institutional reform:** You can't fix coordination-first systems by providing better information. The problem isn't ignorance—it's that truth-seeking and coordination-maintaining have become decoupled. Reform requires restructuring incentives so that truth-seeking *serves* coordination rather than threatening it.

**For persuasion:** Attacking someone's sacred beliefs often backfires, strengthening commitment. You're raising signal costs, which makes their position more credible to their coalition. Effective persuasion requires understanding which beliefs are epistemically held (open to evidence) versus coordinatively held (functioning as commitment signals).

**For self-understanding:** Your own beliefs exist in both modes. Some you hold because you've examined evidence. Others you hold because they signal coalition membership. Distinguishing them is hard—the subjective experience is similar—but the implications for how they'll respond to evidence are very different.

**For predicting institutional behavior:** Institutions in coordination-first mode will exhibit the full cluster: ritualization, sacred value formation, heretic-hunting, evidence resistance. You can predict these behaviors from institutional lifecycle stage without knowing domain-specific details.

---

## What Would Prove Me Wrong?

Each paper has specific predictions:

**Agency and Power:**
- If power mechanisms differ *qualitatively* across scales (not just quantitatively), the cross-scale continuity claim fails
- If demi-agents turn out to have genuine unified agency (not outsourced cognition), the framework needs revision

**Costly Signaling:**
- If we find stable coalitions without costly signals, the mechanism isn't necessary
- If the structural cluster fails to appear in predicted contexts, the homology claim fails
- If counter-evidence reliably weakens commitment (rather than strengthening it in coordination-first regimes), the model is wrong

**Epistemic Frustration:**
- If we find mature coordination-first systems that maintain genuine epistemic openness, the transition isn't as deterministic as claimed
- If epistemic frustration can be resolved by better discourse design (rather than requiring dimensional restructuring), the geometric argument is wrong
- If the $R > 1$ diagnostic doesn't predict unfalsifiability in practice, the formalization fails

---

*The trilogy: [Agency and Power](/papers/agency-power) (under review), [Costly Signaling](/papers/costly-signaling) (in preparation), [Epistemic Frustration](/papers/epistemic-frustration) (in preparation). All targeted at Biology & Philosophy.*

---

**Sources:**

- Elowitz, M. B., Levine, A. J., Siggia, E. D., & Swain, P. S. (2002). [Stochastic gene expression in a single cell](https://www.science.org/doi/10.1126/science.1070919). *Science*, 297(5584), 1183-1186.
- Pal, M. (2024). [Living in a noisy world—origins of gene expression noise and its impact on cellular decision-making](https://febs.onlinelibrary.wiley.com/doi/10.1002/1873-3468.14898). *FEBS Letters*.
- Moris, N., Pina, C., & Arias, A. M. (2016). [Transition states and cell fate decisions in epigenetic landscapes](https://www.nature.com/articles/nrg.2016.98). *Nature Reviews Genetics*, 17(11), 693-703.
- Penn, D. J., & Számadó, S. (2020). [The handicap principle: how an erroneous hypothesis became a scientific principle](https://pmc.ncbi.nlm.nih.gov/articles/PMC7004190/). *Biological Reviews*, 95(1), 267-290.
- Czárán, T., & Hoekstra, R. F. (2009). [Microbial communication, cooperation and cheating: quorum sensing drives the evolution of cooperation in bacteria](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2722019/). *PLOS ONE*.
- Pollak, S., et al. (2022). [Cheater suppression and stochastic clearance through quorum sensing](https://pmc.ncbi.nlm.nih.gov/articles/PMC9333318/). *PLOS Computational Biology*.
