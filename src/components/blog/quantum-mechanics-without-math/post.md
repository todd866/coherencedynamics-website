---
slug: quantum-mechanics-without-math
title: Quantum Mechanics Without the Math
subtitle: And then with the math put back in
date: 2025-12-27
tags:
  - quantum mechanics
  - philosophy of mind
  - dimensionality
  - consciousness
summary: Quantum mechanics feels spooky because we keep asking it to behave like a low-dimensional classical story. The mind looks quantum for the same reason.
relatedPapers:
  - high-dimensional-coherence
  - minimal-embedding
  - falsifiability
---

## Part I: Without the Math

### Before we start: the projection problem

Here's a simple puzzle that contains the whole mystery of quantum mechanics.

Look at a coffee mug from the side: you see a rectangle with a handle.

Look at it from above: you see a circle.

Which is the "true" shape of the mug?

<!-- SIMULATION: projection -->

Neither view is wrong. But they're incompatible—you can't see both at once. And if you only ever saw 2D shadows, you might think the mug was "paradoxically" both circular and rectangular, switching mysteriously between states.

That's not what's happening. The mug is a 3D object. The "paradox" comes from trying to describe it using only 2D pictures.

**Quantum mechanics is what happens when reality is high-dimensional, but our measurements are low-dimensional projections.**

The dimensions here aren't spatial—they're degrees of freedom. But they're no less real for that. A photon's polarization state lives in a 2D space. Two entangled photons live in a 4D space (for two polarization qubits). A hundred atoms? Exponentially many dimensions. The mug is an analogy for the geometry quantum mechanics actually uses: Hilbert space. Different measurement choices are literally different projections (in the linear-algebra sense), even though the "dimensions" are degrees of freedom, not spatial axes.

A quick translation:
- **Object:** state vector (or density matrix)
- **View/projection:** choice of measurement basis
- **Shadow:** outcome distribution
- **Handle you lose:** phase relations between alternatives (destroyed by decoherence)

Keep this in mind. It's the whole story.

---

### The double-slit experiment

Let's start with the most famous experiment in physics.

You fire individual photons (particles of light) at a barrier with two slits. Behind the barrier is a detection screen that records where each photon lands.

Here's what happens:

<!-- SIMULATION: double-slit -->

**Without detectors at the slits:** The photons build up an interference pattern—alternating bright and dark stripes. This is what waves do when they overlap. It's as if each photon went through *both* slits and interfered with itself.

**With detectors at the slits:** The interference vanishes. You just get two blobs—exactly what you'd expect if each photon went through one slit or the other, like a bullet.

This is already strange. The availability of which-path information—typically via entanglement with a detector or environment—changes the outcome statistics.

Formally: the which-path detector entangles with the photon; when you ignore (trace out) the detector, the phase coherence between the two paths disappears, so the interference term vanishes.

But it gets stranger.

---

### The delayed-choice quantum eraser

Now for the experiment that makes physicists reach for phrases like "spooky" and "retrocausal."

The setup is more complicated, but the key idea is simple:

1. A photon enters a special crystal that splits it into two entangled photons—twins that share a quantum connection
2. One photon (the "signal") heads toward a double slit and a detection screen—this is the one we care about
3. The other photon (the "idler") takes a longer path through a maze of beam splitters to one of four detectors—it's called the idler because it seems to just tag along, but it holds the key to the whole puzzle

The crucial part: **the signal photon hits the screen *before* the idler photon reaches its detector.**

Step through the experiment:

<!-- SIMULATION: delayed-choice -->

Here's the trick with the detectors: the beam splitters are arranged so that some detectors (D1 and D2) can be reached by idlers from *either* slit—the paths merge, so you can't tell which slit the signal went through. Other detectors (D3 and D4) can only be reached by idlers from one specific slit—the which-path information is preserved.

Now here's what you find when you analyze the data:

- If the idler hit D1 or D2 (which-path **erased**), the corresponding signal photons show interference fringes
- If the idler hit D3 or D4 (which-path **preserved**), the corresponding signal photons show two blobs—no interference

But wait. The signal photon was already detected. Its position was already recorded. How can a *later* measurement of the idler change whether the *earlier* signal shows interference?

It looks like the future is reaching back and rewriting the past.

---

### Why it seems like time travel

The natural reaction:

> "The later measurement must somehow change what the earlier photon did."

This is how the experiment is often presented—as evidence that quantum mechanics allows retrocausation, or that observation creates reality, or that the universe is fundamentally weird in a way that defies all intuition.

But this interpretation is **misleading**.

And seeing why reveals something profound about what quantum mechanics actually is.

---

### What actually happens

Here's the key: **the pattern on the screen never changes.**

Look at all the signal photon detections, without sorting by idler outcome. What do you see?

No interference fringes. Just a smooth envelope—the sum of all the hidden patterns, washing each other out.

Even if the experimenter changes the idler measurement setting at the last moment, the marginal distribution at the signal screen is unchanged. (This is the **no-signaling theorem** in action.) No paradox.

The fringes only appear **after** you sort the data into coincidence-matched subsets—after you look at just the photons whose idlers went to D1, or just the ones whose idlers went to D2.

You're not changing the past. You're not even changing the data.

You're choosing **how to slice a correlated dataset**. Nothing is rewritten—your grouping reveals correlations that were already there.

In quantum language: the signal alone is described by a reduced density matrix. The interference lives in off-diagonal terms that vanish when you trace out (ignore) the idler. Conditioning on an idler outcome is not changing the signal's past—it's selecting a sub-ensemble where a particular phase relation becomes visible.

<!-- SIMULATION: quantum-eraser -->

Click through the buttons above. Watch the same 2000 data points. They never move. The only thing that changes is which subset you're highlighting.

Different slices reveal different patterns. But those patterns were always there, latent in the correlations between signal and idler.

---

### The projection mistake

Remember the coffee mug?

The "paradox" of delayed choice is exactly the same kind of mistake.

We assume there's a single, definite, low-dimensional story of "what the photon did"—which slit it went through, whether it interfered.

But that's demanding a 2D shadow when the reality is 3D.

The quantum state is not a list of definite facts about particles. It's a high-dimensional object—a catalog of correlations and possibilities. When you measure, you project this high-dimensional state down into something you can write on a piece of paper: "detector 3 clicked," "position was x=0.7."

Different measurements are different projections. They reveal different slices of the same underlying reality. And just like the mug, the slices can be incompatible—you can't see them all at once.

Delayed-choice experiments don't show that the present changes the past.

They show that **the past was never a low-dimensional object to begin with.**

---

### Multiple truths, one reality

This leads to a genuinely strange feature of quantum mechanics—and it's not the strangeness you usually hear about.

There can be multiple valid stories about what happened, each internally consistent, that cannot be combined into a single master narrative.

It's not that "many worlds" exist. It's that no single classical description survives all possible measurements.

The rule is simple: you're allowed to tell a story only when alternative stories can't interfere with each other.

This is what physicists call the "consistent histories" interpretation. A "history" is just a story you try to tell: "the photon went through the left slit, then hit position x." Quantum mechanics allows you to tell such stories only when they don't interfere with each other—only when the 2D shadows happen to be consistent.

When alternative stories *do* interfere, the question "which one really happened?" isn't mysterious or unanswerable. It's **not a well-posed classical question**—like asking for the "true" 2D shape of a 3D object.

---

### The real lesson

Quantum mechanics is not about particles behaving strangely.

It's about the fact that reality has more dimensions than our descriptions. Measurement creates a stable record in one basis by destroying coherence between alternatives in that basis.

We don't passively observe reality. Interaction and record-formation compress it into a story.

This is the same insight that drives our work on [the limits of falsifiability](/papers/falsifiability): when you project a high-dimensional system through a low-dimensional measurement, you lose almost everything. A single binary readout of a 100-dimensional continuous state necessarily discards almost all of the available information.

---

### A note on time

Here's one way to extend the projection idea—though this is more interpretive than the core argument above.

The delayed-choice experiment feels like time travel only if you assume the signal photon must already "have" a definite classical story—interfered or didn't—independent of how the entangled partner is later measured. Quantum theory instead treats the pair as one joint state, and different measurements reveal different, incompatible slices of its correlations.

Importantly: **you cannot send signals backward in time this way**. The unsorted signal data shows no trace of the idler measurement choice. The correlations only appear when you have access to *both* records and can sort them together. No retrocausation, no paradox—just entanglement doing what entanglement does.

But there's a suggestive lesson here. The Schrödinger equation evolves the quantum state smoothly and reversibly. The arrow of time—the sense that the past is fixed and the future is open—comes not from the equation itself, but from **thermodynamics, decoherence, and the irreversibility of records**. Measurement is one way that irreversibility enters the picture.

The consistent histories framework formalizes this: a "history" is a time-ordered sequence of projections. You choose the projections. The formalism doesn't privilege a *single* classical time-ordered narrative unless you choose one.

Whether this means time is "emergent" or merely that our *descriptions* of time require choosing a basis—that's a deeper question. But the delayed-choice experiment is a vivid reminder that temporal ordering and causal ordering are not as simple as they seem.

---

## Part II: Putting the Definitions Back In

Everything above can be said precisely—the math just formalizes the same projection logic. To describe the coffee mug mathematically, we can't just use x and y coordinates. We need a representation that captures all possible views. In physics, we call this a vector in a high-dimensional state space.

### The quantum state

The state of a system is a vector

$$|\psi\rangle \in \mathcal{H}$$

where $\mathcal{H}$ is a Hilbert space—typically enormous in dimension.

This state does not encode definite values of observables. It's a compact object that encodes **amplitudes for correlations**—and those amplitudes can't all be made simultaneously classical.

### Projective measurements are projections

A measurement corresponds to a set of projection operators $\{P_i\}$ satisfying:

$$\sum_i P_i = I, \quad P_i P_j = \delta_{ij} P_i$$

Choosing an observable is choosing a basis—a particular way to project the high-D state into low-D outcomes.

Measurement does not reveal a pre-existing value. It applies:

$$|\psi\rangle \rightarrow \frac{P_i |\psi\rangle}{\|P_i |\psi\rangle\|}$$

That is symmetry breaking by projection.

Play with it yourself:

<!-- SIMULATION: hilbert-projection -->

(This describes ideal *projective* measurements. More generally, measurements are described by POVMs—but the projection picture captures the essential geometry.)

### Noncommutation = incompatible slices

If two observables $A$ and $B$ satisfy:

$$[A, B] \neq 0$$

then their projection operators define incompatible decompositions of the same state.

There is no single noncontextual joint probability distribution—no classical assignment of definite values that reproduces the observed statistics across all measurement contexts.

This is not epistemic ignorance. It's structural: you can't assign pre-existing values to all observables *in a noncontextual way* and still match quantum statistics. Hidden variables are possible, but they must be contextual—and in Bell-type settings, nonlocal.

Try it:

<!-- SIMULATION: noncommutation -->

### Histories and decoherence

A "history" is a time-ordered sequence of projections:

$$C_\alpha = P_{\alpha_n}(t_n) \cdots P_{\alpha_1}(t_1)$$

Probabilities can be assigned only if the decoherence functional satisfies:

$$D(\alpha, \beta) = \text{Tr}(C_\alpha \rho C_\beta^\dagger) \approx 0 \text{ for } \alpha \neq \beta$$

Intuitively, $D(\alpha, \beta)$ measures whether two alternative stories can interfere with each other. If they can, you can't treat them as exclusive classical alternatives with ordinary probabilities—the question "which really happened?" presupposes a classical framework that doesn't apply.

If histories interfere, you can't assign them classical probabilities. The formalism still gives amplitudes, but the probability interpretation fails.

### Why multiple histories can be "true"

Different sets of projections can each satisfy decoherence internally, yet be mutually incompatible.

Each defines a self-consistent low-D narrative.

Quantum mechanics forbids combining them into a single classical account.

The math does not say: "many realities exist."

It says: no single classical narrative survives all projections.

### See it in action

The simulation below shows dimensional collapse geometrically. A helix in 3D projects to a circle in 2D—and the circle crosses itself where the helix didn't:

<!-- SIMULATION: dimensional-collapse -->

The underlying dynamics never change. Only your view of them does.

---

## Why the Mind Looks Quantum

*Everything above is standard quantum mechanics. What follows is an analogy about information geometry and readout constraints.*

Everything we've said about quantum mechanics has been structural, not mystical. Nothing required particles to be conscious or brains to be quantum computers. The only ingredient was this:

> A high-dimensional coherent system observed through low-dimensional projections will exhibit contextuality, incompatibility, and collapse.

These signatures don't uniquely identify quantum physics; they also appear in classical contextual systems. The claim here is about **geometry of readout**, not microtubules or long-lived quantum coherence.

Once you see that, it becomes obvious why cognition keeps getting compared to quantum mechanics.

Human minds are not directly observable systems. They maintain distributed, multi-scale dynamical states—neural, bodily, affective, semantic—that cannot be simultaneously accessed without disturbing one another. Introspection, attention, and verbal report are not passive readouts; they are measurement operations that reshape the underlying dynamics.

This connects to what we've called [substrate dimensionality](/papers/substrate-dimensionality): the brain's internal state is effectively astronomically high-dimensional (neurons, synapses, ion channels, fields), while any external measurement—or internal report—compresses it to a handful of variables. The mismatch is vast.

This is why:
- The order of questions matters
- Beliefs don't form a single coherent probability distribution
- Preferences appear inconsistent under interrogation
- Decisions seem to crystallize only at the moment of report

These effects can also arise in classical contextual models; the point is structural similarity, not proof of quantum substrate. They are signatures of dimensional reduction, not failures of rationality.

### Intelligence as coherence maintenance

In recent work, we formalize this by treating intelligence as active coherence maintenance across incompatible observational scales. Reasoning is not the evaluation of stored propositions but the selection of trajectories through a high-dimensional dynamical state space. Decisions are not retrieved values; they are phase-locking events that terminate coherence.

This framework reproduces the phenomena that motivate "quantum cognition" models—contextuality, order effects, non-commutativity—without requiring microscopic quantum effects in the brain. The resemblance to quantum mechanics is not coincidence. It's a consequence of operating in the same geometric regime.

There's even a [minimal embedding threshold](/papers/minimal-embedding): below ~3 effective dimensions, rich dynamics (chaos, self-avoiding trajectories) become geometrically constrained—trajectories are forced to cross themselves or collapse into simpler attractors. This may explain why stress and cognitive overload produce rigid either/or thinking—when effective dimensionality drops, nuance becomes geometrically impossible.

### What I'm claiming (and not claiming)

**Not claiming:** neurons are quantum computers; microtubule coherence explains consciousness; literal wavefunction collapse happens in brains.

**Claiming:** many "quantum cognition" signatures—contextuality, order effects, apparent irrationality—arise from **context-dependent readout of a high-dimensional dynamical system**. The math is similar because the geometry is similar.

This is *not* the Penrose-Hameroff "Orch-OR" hypothesis. That theory claims consciousness arises from literal quantum coherence in microtubules—a claim that faces serious objections regarding decoherence timescales in warm, wet biological tissue.

The present argument requires no such thing. The mind exhibits quantum-like structure not because neurons are quantum computers, but because any high-dimensional coherent system observed through low-dimensional channels will show these features.

The substrate is classical. The geometry is the same.

---

## The Punchline

Quantum mechanics looks strange because it is the first physical theory that forced us to abandon the idea that all properties can coexist in a single classical description.

The mind looks quantum for the same reason: it sustains coherence in a space too large to be fully observed, then collapses it into usable action.

The mind doesn't use quantum mechanics. It lives in the same structural regime.

Just as Bergson argued that time is a continuous flow that we artificially slice into discrete moments, quantum mechanics shows that physical reality is a continuous high-dimensional flow that we artificially slice into discrete measurements. The slicing is real. The discreteness is not.

---

**One-sentence synthesis:**

> Quantum mechanics is what physics looks like when high-dimensional coherence is observed through low-dimensional measurements. Intelligence is what cognition looks like when high-dimensional coherence is forced through attention, language, and action. Same geometry. Different substrate.

---

*The formal version of this argument appears in our paper on [high-dimensional coherence as the basis of biological intelligence](/papers/high-dimensional-coherence).*

---

**This is Part 1 of a three-part series.**

In [Part 2: Quantum Gravity Without the Paradox](/blog/quantum-gravity-without-the-paradox), we apply the same projection framework to dissolve the apparent conflict between quantum mechanics and general relativity. In [Part 3: Time From Dimensions](/blog/time-from-dimensions), we explore how time dilation and dimensional contraction are the same phenomenon—squeeze the aperture, slow the clock.
