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

### The core mistake

Quantum mechanics feels spooky because we keep asking it to behave like a low-dimensional classical story, when it is actually describing a high-dimensional coherence structure.

We assume there is a single, stable narrative of "what happened," and that measurements merely reveal parts of it. QM says: no—"what happened" is not a stored classical fact until you decide how to ask.

This is the same insight that drives our work on [the limits of falsifiability](/papers/falsifiability): when you project a high-dimensional system through a low-dimensional measurement, you lose almost everything. A binary readout of a 100-dimensional continuous state discards essentially all of the state information—by construction it can carry at most 1 bit, no matter how rich the underlying dynamics are.

### The quantum state is not a history

The quantum state is not a movie of particles moving through space. It's a catalog of correlations—a high-dimensional object that contains many potential narratives, none of which are privileged until a measurement framework is chosen.

When you measure:
- you don't uncover a hidden past,
- you select a slice of the coherence structure,
- and that slice defines which questions even have answers.

### Why delayed choice feels like time travel

Imagine you fire a photon at a double slit.

If you detect which slit it went through, you see two clean blobs on the screen. If you don't, you see an interference pattern.

So far, so familiar.

Now here's the twist: you let the photon hit the screen **first**, and only afterward do you decide whether to record which-path information about its entangled partner.

When you later sort the data, something strange happens.

- Sort one way, and the earlier photon *appears* to have gone through a single slit.
- Sort another way, and the same earlier photon *appears* to have interfered with itself.

It looks like a choice made in the present changed the behavior of a particle in the past.

Cue ominous music.

### The apparent paradox

The natural conclusion is:

> "Measurement reaches backward in time and rewrites history."

That's not just a casual misunderstanding—it's exactly how the experiment is often presented, even by physicists trying to convey how strange quantum mechanics is.

But it's wrong.

### What actually happens

Nothing about the earlier detection ever changes.

The pattern on the screen—taken by itself—is always the same washed-out distribution. No interference. No which-path structure. Just noise.

The "retroactive change" appears **only after** you:

1. consider the joint signal–idler system, and
2. partition the already-collected data based on how the idler was later measured.

You are not changing the past. You are choosing **how to slice a correlated dataset**.

Different slices reveal different correlations that were always present in the joint high-dimensional state.

### The real mistake

The paradox arises because we smuggle in a classical assumption:

> *There must have been a single, definite low-dimensional history all along.*

Quantum mechanics refuses this assumption.

There is no unique "what the photon did" independent of how you interrogate the system. There is only a high-dimensional coherence structure, from which different classical-looking stories can be extracted—but not simultaneously.

Delayed-choice experiments don't show that the present changes the past.

They show that **the past was never a classical object to begin with.**

### Consistent histories, intuitively

A "history" is just a story you try to tell about events at different times.

Quantum mechanics allows you to tell a story only if interference between alternative stories is negligible. If interference exists, your story is not wrong—it's *undefined*.

Worse (and spookier): there can be multiple valid stories that cannot be combined into a single master narrative.

This isn't because reality is confused. It's because low-dimensional narratives are lossy projections of a higher-dimensional object.

### The real lesson

Quantum mechanics is not about particles behaving strangely.

It's about the fact that coherence exists at higher dimensionality than classical explanation, and that measurement is an act of dimensional reduction that destroys some truths to create others.

We don't observe reality.

We collapse it into a story.

---

## Part II: Putting the Definitions Back In

Now let's say the same thing precisely.

### The quantum state

The state of a system is a vector

$$|\psi\rangle \in \mathcal{H}$$

where $\mathcal{H}$ is a Hilbert space—typically enormous in dimension.

This state does not encode definite values of observables. It encodes amplitudes for correlations.

### Observables are projections

A measurement corresponds to a set of projection operators $\{P_i\}$ satisfying:

$$\sum_i P_i = I, \quad P_i P_j = \delta_{ij} P_i$$

Choosing an observable is choosing a basis, i.e., a particular projection of the high-D state.

Measurement does not reveal a pre-existing value. It applies:

$$|\psi\rangle \rightarrow \frac{P_i |\psi\rangle}{\|P_i |\psi\rangle\|}$$

That is symmetry breaking by projection.

### Noncommutation = incompatible slices

If two observables $A$ and $B$ satisfy:

$$[A, B] \neq 0$$

then their projection operators define incompatible decompositions of the same state.

There is no joint probability distribution because no single low-D narrative exists that refines both slices simultaneously.

This is not epistemic. It is structural. The point isn't that we *don't know* both values; it's that the theory does not permit a single joint assignment consistent with observed statistics across measurement contexts.

### Histories and decoherence

A "history" is a time-ordered sequence of projections:

$$C_\alpha = P_{\alpha_n}(t_n) \cdots P_{\alpha_1}(t_1)$$

Probabilities can be assigned only if the decoherence functional satisfies:

$$D(\alpha, \beta) = \text{Tr}(C_\alpha \rho C_\beta^\dagger) \approx 0 \text{ for } \alpha \neq \beta$$

This condition means: alternative histories do not interfere.

If they do interfere, probabilities are undefined—not unknown, *undefined*.

### Why multiple histories can be "true"

Different sets of projections can each satisfy decoherence internally, yet be mutually incompatible.

Each defines a self-consistent low-D narrative.

Quantum mechanics forbids combining them into a single classical account.

The math does not say: "many realities exist."

It says: no single classical narrative survives all projections.

### Measurement as dimensional collapse

Formally:
- the Hilbert state is high-D and coherent,
- measurement projects it into a low-D subspace,
- interference between discarded dimensions is destroyed,
- and classical facts emerge only within that subspace.

This is why quantum mechanics feels contextual, retrocausal, or paradoxical when interpreted classically.

We keep demanding invariance under projection. The theory explicitly denies it.

---

## See It Happen

The simulation below shows dimensional collapse in action. Watch how the same high-dimensional trajectory looks completely different depending on which projection you choose:

<!-- SIMULATION: dimensional-collapse -->

Notice: the underlying dynamics never change. Only your view of them does. This is exactly what happens in quantum measurement—and in cognition.

---

## Why the Mind Looks Quantum

Up to this point, everything we've said about quantum mechanics has been structural, not mystical. Nothing required particles to be conscious or brains to be quantum computers. The only ingredient was this:

> A high-dimensional coherent system observed through low-dimensional projections will exhibit contextuality, incompatibility, and collapse.

Once you see that, it becomes obvious why cognition keeps getting compared to quantum mechanics.

Human minds are not directly observable systems. They maintain distributed, multi-scale dynamical states—neural, bodily, affective, and semantic—that cannot be simultaneously accessed without disturbing one another. Introspection, attention, and verbal report are not passive readouts; they are measurement operations that reshape the underlying dynamics.

This connects to what we've called [substrate dimensionality](/papers/substrate-dimensionality): the brain's internal state is effectively astronomically high-dimensional (neurons, synapses, ion channels, fields), while any external measurement—or internal report—compresses it to a handful of variables. The mismatch is vast.

This is why:
- the order of questions matters,
- beliefs do not form a single global probability distribution,
- preferences appear inconsistent under interrogation,
- and "decisions" seem to crystallize only at the moment of report.

These are not failures of rationality. They are signatures of dimensional reduction.

Classical cognitive models assume a stable internal state sampled with noise. But real cognition does not behave that way. Instead, it more closely resembles a coherence-maintaining system that collapses into action or language only when forced to do so—precisely the structure we already encountered in quantum measurement.

### Intelligence as coherence maintenance

In recent work, we formalize this idea by treating intelligence as active coherence maintenance across incompatible observational scales, rather than symbol manipulation or probabilistic inference. On this view, reasoning is not the evaluation of stored propositions but the selection of trajectories through a high-dimensional dynamical state space. Decisions are not retrieved values; they are phase-locking events that terminate coherence.

This framework reproduces the same phenomena that motivate "quantum cognition" models—contextuality, order effects, non-commutativity—without requiring microscopic quantum effects in the brain. The resemblance to quantum mechanics is not a coincidence. It is a consequence of operating in the same geometric regime.

There's even a [minimal embedding threshold](/papers/minimal-embedding): below 3 dimensions, cyclic dynamics become impossible and systems are forced into discrete categories. This may explain why stress and cognitive overload produce rigid either/or thinking—you're being pushed below the dimensional threshold where nuance is geometrically possible.

### A note on Penrose-Hameroff

This is *not* the Penrose-Hameroff "Orch-OR" hypothesis. That theory claims consciousness arises from literal quantum coherence in microtubules—a claim that faces serious objections regarding decoherence timescales in warm, wet biological tissue.

The present argument is different: the mind exhibits quantum-like structure not because neurons are quantum computers, but because any high-dimensional coherent system observed through low-dimensional channels will show these features. You don't need quantum mechanics in the brain. You need dimensionality mismatch between internal states and external readouts.

The substrate is classical. The geometry is the same.

---

## The Punchline

Quantum mechanics looks strange because it is the first physical theory that forced us to abandon the idea that all properties can coexist in a single classical description.

The mind looks quantum for the same reason: it sustains coherence in a space too large to be fully observed, then collapses it into usable action.

The mind doesn't use quantum mechanics. It lives in the same structural regime.

---

**One-sentence synthesis:**

> Quantum mechanics is what physics looks like when high-dimensional coherence is observed through low-dimensional measurements. Intelligence is what cognition looks like when high-dimensional coherence is forced through attention, language, and action. Same geometry. Different substrate.

---

*The formal version of this argument appears in our paper on [high-dimensional coherence as the basis of biological intelligence](/papers/high-dimensional-coherence). The manuscript is currently at minor revisions, and the version in the [repository](https://github.com/todd866/intelligence-biosystems) reflects the current revision.*
