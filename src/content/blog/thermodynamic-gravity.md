---
slug: thermodynamic-gravity
title: What Should Quantum Gravity Quantize?
subtitle: Maybe not what you think
date: 2026-01-03
tags:
  - physics
  - quantum gravity
  - thermodynamics
  - general relativity
summary: Jacobson showed Einstein's equation emerges from horizon thermodynamics. But that left a question open — what should be quantized? The answer might reframe the entire quantum gravity program.
relatedPapers:
  - thermodynamic-gravity
---

In 1995, Ted Jacobson did something remarkable. He showed that Einstein's equation — the governing law of general relativity — could be *derived* from thermodynamics applied to local patches of spacetime. Heat flow across a tiny horizon, combined with the entropy-area relationship from black hole physics, gives you Einstein's equation as an equation of state.

This was stunning. It suggested gravity isn't a fundamental force like electromagnetism. It's emergent — like pressure in a gas, which isn't fundamental but arises from the collective behavior of molecules.

But Jacobson's derivation left a question hanging: if gravity is thermodynamic, *what should be quantized* to get quantum gravity?

---

## The Standard Options

The obvious candidates are:

**The metric itself.** This is the traditional approach — treat spacetime geometry as a quantum field, quantize it, and see what happens. The problem: we've been trying this for 70 years and it doesn't work cleanly. The infinities don't go away the way they do in electromagnetism.

**Horizon microstates.** This is the string theory / loop quantum gravity approach — posit that horizons have microscopic degrees of freedom (like atoms in a gas), and the thermodynamics emerges from counting these microstates. The problem: nobody knows what these microstates actually are. "Microstates" is a placeholder for "the thing we need to explain the entropy."

There's a third option that's been hiding in plain sight.

---

## The Interface Itself

What if we've been thinking about this wrong?

Jacobson's derivation uses a local Rindler horizon — a tiny null surface defined by an accelerating observer. Heat flows across it. The Clausius relation (δQ = TδS) holds. Einstein's equation falls out.

But here's the reframe: that Clausius relation isn't *thermodynamics*. It's an **admissibility constraint**.

Think of it this way. The null surface isn't a physical system with microstates and temperature. It's a *checkpoint*. It's asking: "Is this metric deformation consistent with the rules?" The Clausius relation is the certification criterion. If δQ = TδS, the deformation is admissible. If not, something's wrong.

Classical general relativity is what you get when every checkpoint certifies perfectly — when every local null surface reports "admissible." Einstein's equation is just the statement that all these local certifications are mutually consistent.

---

## The Clausius Residual

Make this precise. Define:

> Δ_Σ ≡ δQ − TδS

This is the *Clausius residual* — the amount by which a local patch fails to satisfy the admissibility constraint.

In classical GR: ⟨Δ_Σ⟩ = 0. The expectation value vanishes. All checkpoints certify.

In quantum gravity: Var(Δ_Σ) > 0. The residual fluctuates. The checkpoint has finite resolution — it can't certify arbitrarily small differences.

This is where quantization enters. Not in the metric. Not in mysterious microstates. In the *interface layer itself* — the certification process that checks whether metric deformations are admissible.

---

## Two Correction Channels

If the certification interface has finite resolution, two things happen:

**1. Stochastic noise.** The Raychaudhuri equation — which governs how light rays focus in curved spacetime — picks up a noise term. This isn't noise from matter fluctuations. It's noise from *certification fluctuations*. The checkpoint can't decide perfectly, and that uncertainty shows up as random focusing/defocusing of geodesics.

The amplitude scales as ℓ_P²/A — Planck length squared over area. At macroscopic scales, this is negligible. Near Planck-scale horizons, it becomes significant.

**2. Higher-curvature corrections.** When certification is slow (non-equilibrium), the effective action picks up higher-derivative terms. This is the standard effective field theory story, but now with a clear origin: certification that doesn't keep up with rapid metric changes produces a dissipative correction.

---

## What ℏ Means

Here's a satisfying consequence. Planck's constant ℏ — the fundamental quantum of action — gets a clean interpretation: it sets the *resolution scale* of the certification interface.

The minimum distinguishable area increment at a checkpoint is ΔA_min ~ Gℏ. Combine this with the Bekenstein-Hawking relation (entropy goes as area/4Gℏ), and you get ΔS_min ~ 1. One bit of certification precision.

This is why ℏ appears in gravity at all. It's not that spacetime "knows about" quantum mechanics. It's that the checkpoints — the admissibility interfaces — have a built-in resolution limit set by ℏ.

---

## Why This Matters

This reframe changes what we're looking for.

**Old question:** What are the microstates of a black hole horizon?

**New question:** What physical process implements the certification? What's doing the checking?

This is more tractable. We're not trying to find hidden degrees of freedom in spacetime. We're asking: when matter falls through a null surface, what mechanism ensures the resulting geometry is admissible?

The answer might involve entanglement across the horizon, or constraints from the matter sector, or something we haven't thought of. But at least we know *what kind* of answer we're looking for.

---

## The Hydrodynamics Analogy

Gravity is classical for the same reason hydrodynamics is classical. Both are *equations of state* — relationships that hold when you average over many microscopic details.

You don't quantize hydrodynamics by making water molecules quantum. You recognize that hydrodynamics breaks down at small scales, and the breakdown follows predictable patterns (viscosity, noise, etc.).

Similarly, you don't quantize gravity by making spacetime quantum. You recognize that the certification interface breaks down at small scales, and the breakdown follows predictable patterns (stochastic focusing noise, higher-curvature corrections).

The metric stays classical. What's quantum is the resolution limit of the admissibility check.

---

## What's Next

This framework makes specific predictions about the stochastic noise channel — noise that's independent of matter fluctuations, with a specific amplitude scaling. It also predicts how non-equilibrium certification generates higher-curvature terms in the effective action.

Whether these predictions can be tested anytime soon is another question. But at least we know *what* we're predicting, and *why*.

Sometimes the right question isn't "how do we quantize this?" but "what should we be quantizing in the first place?"

---

*This post summarizes [Gravity as Constraint Compliance](/papers/thermodynamic-gravity), currently in preparation for Foundations of Physics. The paper develops the full mathematical framework including seven explicit postulates, a formal definition of certification, and comparison with existing approaches (Jacobson, Eling-Jacobson, Einstein-Langevin stochastic gravity).*
