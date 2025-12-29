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

## Convergence with Levin's TAME Framework

These ideas converge with [Michael Levin's](https://drmichaellevin.org/) work on what he calls [TAME—Technological Approach to Mind Everywhere](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/technological-approach-to-mind-everywhere-an-experimentally-grounded-framework-for-understanding-diverse-bodies-and-minds/D1888C08244A29591DCA72C20F45D894). Levin, a developmental biologist at Tufts, has been arguing for years that agency is graded and that cognitive processes extend far beyond brains.

His [response to critics](https://thoughtforms.life/qa-from-the-internet-and-recent-presentations-4/) who accuse him of "anthropomorphism" or "mysterianism" for using agentic language about cells is instructive:

> "Declaring cognition outside the brain as some sort of 'anthropomorphism' is a pre-scientific notion, incompatible with advances in evolutionary biology (precursors of brains) and in developmental biology (we were all single cells once). The more informed position is that we now have non-magical sciences of mind, from the most minimal to the most advanced, and the real question is which cybernetic/agentic model is appropriate in any given case."

This flips the usual critique. It's not that applying agency to cells is "mysterian"—it's that *refusing* to reveals an implicit belief that agency can't be studied scientifically. Decades of cybernetics and behavioral science say otherwise.

Levin's empirical work on [bioelectricity and morphogenesis](https://www.sciencedirect.com/science/article/pii/S0959438820301653) demonstrates the point concretely. Cells navigate "morphospace"—the high-dimensional space of possible anatomies—using bioelectric signals as a kind of distributed cognition. They solve problems (regenerating limbs, correcting developmental errors, coordinating tissue growth) that require representing goals and selecting actions to achieve them. Not metaphorically. Operationally.

This connects directly to our framework:

- **Graded agency** (Part 1): Levin's TAME framework provides empirical grounding for the claim that agency exists on a continuum. His lab has demonstrated goal-directed behavior in systems ranging from individual cells to bioengineered "xenobots"—organisms with no evolutionary history for the behaviors they exhibit.

- **Coordination without mind-reading** (Part 2): Levin's work on bioelectric networks shows how cells coordinate without direct access to each other's internal states. They use voltage gradients and gap junctions as a kind of primitive signaling system—not unlike the costly signaling mechanisms we discuss.

- **Multi-scale competency** (Part 3): Levin emphasizes that competency exists at multiple scales simultaneously. A cell has goals. A tissue has goals. An organism has goals. These can align or conflict. This multi-scale structure is exactly what creates the dimensional mismatch we call epistemic frustration—different levels "see" different projections of the same underlying optimization problem.

The convergence isn't coincidental. We're both taking seriously the idea that the mechanisms underlying human cognition and social coordination didn't appear from nowhere—they're elaborations of patterns that exist at every biological scale. If you want to understand why institutions resist evidence or why coalitions demand costly signals, it helps to understand that these are solutions to problems that life has been solving for billions of years.

---

## Why Math Can't Model Free Will

Here's a claim that sounds mysterian but isn't: **genuine agency cannot be mathematically modeled**. Not "hasn't been yet"—*cannot be in principle*.

Mathematics gives you two options for describing a system's output:

1. **Deterministic**: Output is a function of inputs. Given the same inputs, you get the same output. No freedom here—just computation.

2. **Stochastic**: Output is drawn from a probability distribution over inputs. Given the same inputs, you get *different* outputs, but the distribution is fixed. This is randomness, not freedom. A coin flip isn't making choices.

Genuine agency would be neither. When you make a choice, it's not determined by prior states (that's determinism), but it's also not random (that's noise). It's *yours*. You're the author.

Try to write an equation for that. Either:
- The decision is a function of variables → you've modeled determinism
- The decision has a stochastic component → you've modeled noise
- There's a gap in the equation where "the agent decides" → you haven't modeled the agency, you've just labeled where it happens

The determinist says option three is illegitimate—any gap must be fillable with more variables or more probability distributions. But that's the *claim*, not its proof. It's an assertion that mathematical description is complete, offered as evidence that mathematical description is complete.

**The unreasonable effectiveness of mathematics doesn't extend to consciousness and free will.**

Wigner's famous observation was about physics—why do abstract mathematical structures map so well onto physical reality? But agency, if it's real, is precisely what *doesn't* map. It's the causal work done by factors that external measurement cannot access. Mathematics describes the constraints on what can happen; agency is what happens *within* those constraints, from the inside.

Actually, let's go deeper. How does math describe *any* high-dimensional system?

It doesn't. Not directly. Any mathematical description is necessarily finite—you can only write down finitely many symbols, equations, variables. Real systems, especially biological ones, have state spaces of enormous or effectively infinite dimension. So every mathematical model is already a projection, a shadow of the actual dynamics.

We don't notice this with physics because physics has historically focused on systems where the projection loss is small—isolated systems, controlled conditions, symmetric situations where the relevant degrees of freedom are few. The "unreasonable effectiveness" of mathematics is partly selection bias: we call "physics" the domains where math works, and everything else gets other names.

Biology is where the projection loss becomes obvious. Living systems maintain high-dimensional internal states that exceed observational access. That's not a bug—it's the feature that makes them alive. A cell's state space includes every molecular configuration, every protein fold, every membrane potential. No finite description captures it. Every model is a shadow.

Agency is just the case where we have *direct access* to something being projected away. We experience choice from the inside while the models describe only the shadows visible from outside. The "hard problem of consciousness" is a special case of the projection problem—what happens when the observer *is* the high-dimensional system being inadequately modeled?

This reframes the whole debate. It's not that agency is magically exempt from mathematical description while everything else submits. It's that *all* mathematical description is dimensional reduction, and agency is where the loss becomes undeniable because we're inside the system being reduced.

This connects to Levin's frustration with critics who demand mechanistic reduction of everything. The demand assumes that if something can't be reduced to mechanism, it doesn't exist. But that's not a scientific conclusion—it's a metaphysical commitment dressed up as rigor.

What if some things are real but not mathematically describable? Not because they're supernatural, but because they're the *inside* of processes that math can only describe from the outside?

The hard determinist's move—"your experience of choice is an illusion generated by neural processes you don't observe"—is unfalsifiable by construction. Any phenomenological evidence can be dismissed as "the illusion is very convincing." The error model can absorb any data. By the DOF diagnostic from the Epistemic Frustration paper, hard determinism has entered an unfalsifiable regime. It's not that it's wrong—it's that it's become structurally immune to evidence.

Compatibilism doesn't help. It redefines "free will" to mean "actions caused by your own desires rather than external coercion"—but if your desires are themselves determined by prior causes you didn't choose, you're still a domino that falls because the previous domino fell. You just get to call yourself a "free" domino. That's semantic negotiation, not metaphysical resolution.

The honest position is uncertainty. We don't know whether genuine agency exists. But dismissing the question because "physics is deterministic (or deterministic plus random)" assumes exactly what needs to be proved. And the phenomenological evidence—the direct, continuous, universal experience of making choices—shouldn't be dismissed just because it doesn't fit the formalism.

If agency is real and irreducible to mechanism, that matters for how we think about biology. It means organisms aren't just complicated machines. It means the difficulty of reducing biology to physics isn't a temporary limitation awaiting better tools—it's a feature of the subject matter. Living systems maintain internal complexity that exceeds external measurement *by design*. That's part of what makes them alive.

### Why Science Can't Accept This

Here's the sociological point: even if everything above is correct, the scientific community *cannot accept it*. Not because the arguments are weak, but because of the coordination dynamics we discussed in Part 3.

Science is a coordination-first institution at this point in its lifecycle. "Mechanism" and "mathematical describability" function as coalition markers. To question them doesn't register as intellectual engagement—it registers as defection. You're not making a philosophical point; you're signaling that you're not a serious scientist.

Notice the social dynamics:

- **Sophistication signaling**: Believing in free will marks you as naive. Believing in determinism marks you as having understood the deep implications of physics. The belief functions as a credential.

- **Heretic punishment**: Suggest that some things might be real but not mathematically describable, and watch the responses. They won't engage the argument—they'll question your scientific literacy, suggest you don't understand physics, imply mysterianism or dualism.

- **Evidence resistance**: The phenomenological evidence for agency (universal, continuous, direct experience of making choices) is dismissed as "illusion" without this dismissal being treated as a claim requiring evidence. The error model is installed at the foundation.

This is the costly signaling cluster from Part 2, appearing in scientific discourse. Professing determinism is costly—you have to dismiss your own direct experience as illusory—which makes it a reliable signal of coalition membership. The costlier the belief (the more it conflicts with immediate experience), the more reliable the signal.

The irony is thick. The scientific community, which prides itself on following evidence, has adopted a position (hard determinism) that is unfalsifiable by the community's own standards, enforced through social dynamics rather than empirical test, and maintained by dismissing the primary evidence against it (phenomenology) as inadmissible.

This isn't a criticism of individual scientists. It's a prediction from the framework. Mature coordination-first institutions will exhibit exactly these dynamics—sacred values, heretic-hunting, evidence resistance—regardless of their explicit commitment to truth-seeking. The structure produces the behavior.

Which means: don't expect this argument to be accepted by mainstream scientific discourse. The acceptance conditions aren't met. What you *can* expect is that people working at the edges—people like Levin, who are already paying the costs of questioning mechanism—might find it useful.

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

*The trilogy builds on [The Limits of Falsifiability in High-Dimensional Systems](https://www.sciencedirect.com/science/article/pii/S0303264725002187) (published in BioSystems), which establishes the formal framework for projection and dimensional collapse.*

*The trilogy: [Agency and Power](/papers/agency-power) (under review), [Costly Signaling](/papers/costly-signaling) (in preparation), [Epistemic Frustration](/papers/epistemic-frustration) (in preparation). All targeted at Biology & Philosophy.*

---

**Sources:**

- Todd, I. (2025). [The Limits of Falsifiability in High-Dimensional Systems](https://www.sciencedirect.com/science/article/pii/S0303264725002187). *BioSystems*, 258, 105608.
- Elowitz, M. B., Levine, A. J., Siggia, E. D., & Swain, P. S. (2002). [Stochastic gene expression in a single cell](https://www.science.org/doi/10.1126/science.1070919). *Science*, 297(5584), 1183-1186.
- Pal, M. (2024). [Living in a noisy world—origins of gene expression noise and its impact on cellular decision-making](https://febs.onlinelibrary.wiley.com/doi/10.1002/1873-3468.14898). *FEBS Letters*.
- Moris, N., Pina, C., & Arias, A. M. (2016). [Transition states and cell fate decisions in epigenetic landscapes](https://www.nature.com/articles/nrg.2016.98). *Nature Reviews Genetics*, 17(11), 693-703.
- Penn, D. J., & Számadó, S. (2020). [The handicap principle: how an erroneous hypothesis became a scientific principle](https://pmc.ncbi.nlm.nih.gov/articles/PMC7004190/). *Biological Reviews*, 95(1), 267-290.
- Czárán, T., & Hoekstra, R. F. (2009). [Microbial communication, cooperation and cheating: quorum sensing drives the evolution of cooperation in bacteria](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2722019/). *PLOS ONE*.
- Pollak, S., et al. (2022). [Cheater suppression and stochastic clearance through quorum sensing](https://pmc.ncbi.nlm.nih.gov/articles/PMC9333318/). *PLOS Computational Biology*.
- Levin, M. (2022). [Technological Approach to Mind Everywhere: An experimentally-grounded framework for understanding diverse bodies and minds](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/technological-approach-to-mind-everywhere-an-experimentally-grounded-framework-for-understanding-diverse-bodies-and-minds/D1888C08244A29591DCA72C20F45D894). *Behavioral and Brain Sciences*, 45, e207.
- Levin, M. (2021). [Bioelectric signaling: Reprogrammable circuits underlying embryogenesis, regeneration, and cancer](https://www.sciencedirect.com/science/article/pii/S0959438820301653). *Cell*, 184(6), 1656-1672.
