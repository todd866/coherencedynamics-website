---
slug: why-biology-cant-be-falsified
title: Why Biology Can't Be Falsified
subtitle: And why that's a feature, not a bug
date: 2025-12-29
tags:
  - falsifiability
  - philosophy of science
  - dimensionality
  - epistemology
  - biology
summary: Karl Popper gave us a clean criterion for science—if it can't be falsified, it isn't science. But what happens when the systems we study are too complex for any test to capture? Biology operates in a regime where falsifiability breaks down, and understanding why reveals something deep about the limits of scientific knowledge.
relatedPapers:
  - falsifiability
---

Karl Popper's falsifiability criterion is elegant: a hypothesis is scientific if and only if it can, in principle, be shown false. Simple. Clean. It distinguishes science from pseudoscience with one bright line.

But there's a problem. The criterion assumes you can run a decisive test. And for much of biology, you can't.

Not because we lack technology. Because of physics.

---

## The Cylinder Problem

Imagine a cylinder. Now shine a light on it from one direction—you see a circle. Shine a light from another direction—you see a rectangle.

Two observers, looking at different shadows, would disagree about the object's shape. One says "it's circular," the other says "it's rectangular." Both are *correct given their projection*. Neither can falsify the other because they're not making claims in the same dimensional space.

This is what happens in science, constantly.

When you design an experiment, you're choosing a projection. You're deciding which variables to measure, what precision is sufficient, how to structure the question. These choices collapse a high-dimensional reality into something you can observe.

Different researchers, using different projections, can reach incompatible conclusions about the same underlying system. Their disagreement isn't about evidence—it's about geometry.

---

## Three Levels of Breakdown

The paper ["The Limits of Falsifiability"](/papers/falsifiability) identifies three distinct levels where Popper's framework fails:

**1. Physical measurement limits.**

The Landauer principle says recording one bit of information requires at least kT ln 2 of energy—about 3 × 10⁻²¹ joules at body temperature. Many biological patterns exist *below* this threshold.

Here's a concrete example. Weak electric fields in the brain (around 1 mV/mm) shift neural spike timing across populations. These fields are causally important—they coordinate network activity. But when you calculate the energy they impart to a single ion channel's voltage sensor, you get about 6 × 10⁻²³ joules.

That's **2% of the Landauer limit**.

A binary detector at the single-channel level would read only thermal noise. The signal is real and causally potent, but below the threshold for reliable bit recording. It's only detectable because many channels integrate the effect collectively.

**2. Dimensional projection loss.**

A binary test—yes or no, significant or not—extracts exactly 1 bit of information.

A modest neural circuit with 100 neurons, each in one of 10 distinguishable states, has an information content of about 332 bits (100 × log₂(10)). A single binary test preserves less than 0.3% of this—discarding over 99.7% of the system's information.

This isn't a limitation of current methods. It's an information-theoretic fact about projection.

**3. Framework dependence.**

Before any measurement occurs, you've already made choices: what counts as a test, what counts as evidence, how the question is structured. These framework choices are themselves a dimensional reduction—a projection of the space of possible framings onto one particular framing.

The framework can't be tested from within the framework. It's the lens through which you see, not something the lens shows you.

---

## Why Physics "Works"

If this is all true, why does physics seem to escape these problems?

Because physics has historically selected for systems where they don't bite.

The domains we call "physics" are precisely those where:
- Dimensionality is low or effectively reducible
- Measurement is clean and repeatable
- Framework assumptions are uncontested
- Projection loss is small

The "unreasonable effectiveness of mathematics in the natural sciences" (Wigner's famous observation) isn't a deep truth about reality. It's selection bias. We call "physics" the domains where math works, and give everything else other names.

Even within physics, the hard problems—turbulence, strongly correlated many-body systems, climate dynamics—are precisely those where dimensionality is high and framework choices become contested.

Biology is where the selection bias breaks down. Living systems maintain high-dimensional internal states that exceed observational access by design. That's part of what makes them alive.

---

## What About Bayesianism?

A sophisticated reader might object: "Popper is 1959. Modern statistics uses Bayesian inference, which maintains full probability distributions rather than forcing binary decisions."

This doesn't escape the problem.

Bayesian inference faces its own high-dimensional crisis. The curse of dimensionality makes posterior computation intractable. Priors become effectively uninformative or encode unjustified assumptions. MCMC samplers fail to mix. Variational approximations introduce uncontrolled bias.

More fundamentally: if you can't compute the posterior—or even represent it—Bayesian analysis can't begin. The promise of "maintaining full distributions" is vacuous when the distribution lives in a space too large to explore.

In high-dimensional biological systems, Bayesian inference projects onto a tractable subspace, just as frequentist methods do. The framework dependence runs deeper than the choice of statistical paradigm.

---

## Not Despair, But Precision

This isn't a counsel of despair. It's a call for precision about when falsifiability applies and when it doesn't.

**Falsifiability works well when:**
- System dimensionality is low
- Energy scales exceed measurement thresholds
- Framework assumptions are shared

**Falsifiability breaks down when:**
- Systems are high-dimensional
- Relevant patterns exist near or below Landauer limits
- Framework assumptions are contested

Enzyme kinetics admits clean falsification. Consciousness may not.

This suggests a shift from universal falsifiability to **scale-dependent falsifiability**—recognizing that the criterion applies in some regimes and fails in others, and being explicit about which regime you're in.

---

## The Practical Upshot

For biologists: don't expect disagreements in complex systems to resolve through more data. When projection loss is severe, more data doesn't help. You need framework negotiation—explicit discussion of what assumptions are being made and whether they're shared.

For philosophers: Popper's criterion is a special case that applies when dimensionality is low and energy scales are high. Extending it to all of science overgeneralizes from physics to domains where physics's selection bias breaks down.

For everyone: persistent disagreement in biology, ecology, neuroscience, and medicine isn't necessarily irrationality. It may be the geometric consequence of observers occupying different projections of a shared high-dimensional reality.

The cylinder casts different shadows on different walls. Both shadows are real. Neither is the cylinder.

---

*This post is based on [The Limits of Falsifiability in High-Dimensional Systems](/papers/falsifiability), published in BioSystems (2025). Version 2.0, with expanded treatment of framework dependence and the sub-Landauer domain, is [available here](/papers/falsifiability).*
