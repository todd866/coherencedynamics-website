---
slug: black-hole-aperture
title: Black Hole as Aperture
subtitle: Simulating observer-relative time without invoking GR
date: 2025-12-29
tags:
  - black holes
  - dimensionality
  - simulation
  - time
  - physics
summary: A toy model where the same dynamics produce frozen time for one observer and flowing time for another—just by changing which correlations they can access.
relatedPapers:
  - high-dimensional-coherence
  - falsifiability
  - minimal-embedding
draft: true
---

## Part I: Without the Math

*This is Part 4 of a series. [Part 1](/blog/quantum-mechanics-without-math) introduced projection. [Part 2](/blog/quantum-gravity-without-the-paradox) dissolved the QG paradox. [Part 3](/blog/time-from-dimensions) connected aperture to time.*

> **Dimension glossary** (used throughout this series):
> - **D** (Hilbert/state dimension): size of the full state space
> - **d** (spacetime dimension): 3+1 in our classical description
> - **k** (aperture): effective degrees of freedom accessible to a given observer+interface

In [Part 3](/blog/time-from-dimensions), we claimed that time = correlation accumulation rate through a dimensional aperture. Squeeze the aperture, slow the clock.

Now we test it.

---

### The setup

Black holes are the cleanest test case because they separate observer and dynamics violently:

- **Same underlying state** (the infalling matter, the Hawking radiation, whatever's happening)
- **Different observers** with different access to that state
- **Radically different experienced time**

The external observer sees the infalling astronaut freeze at the horizon. The astronaut experiences nothing special—time flows normally, they cross the horizon, they eventually hit the singularity.

Standard GR explains this via spacetime geometry. But our framework says something simpler:

> The observers have different apertures. Different k → different correlation rates → different clocks.

Can we reproduce this without invoking GR at all?

---

### The model

We simulate a high-dimensional dynamical system (N coupled oscillators) and define two "observers":

**External observer:**
- Can only access modes that "escape" (low-frequency, long-wavelength)
- Aperture shrinks as "radius" decreases (approaching the horizon-analogue)
- At the horizon, k → 2 (surface-confined)

**Infalling observer:**
- Maintains access to all local modes
- Aperture stays at k = 3 (or higher)
- No special behavior at the horizon

Both observers watch the same underlying dynamics. They just see different projections.

<!-- SIMULATION: black-hole-observers -->

---

### What the simulation shows

[TODO: describe what we actually see once the sim is built]

The key predictions:
1. External observer's effective dimension drops as "radius" decreases
2. External observer's correlation accumulation rate drops proportionally
3. At the horizon-analogue, external clock freezes (correlation rate → 0)
4. Infalling observer's dimension and correlation rate stay constant
5. Same underlying dynamics, different apertures, different clocks

If this works, we've reproduced the phenomenology of black hole time dilation without:
- Einstein's field equations
- Schwarzschild metric
- Penrose diagrams
- Any mention of gravity

Just: high-D dynamics + observer-dependent aperture + correlation-based clock.

---

### Why this matters

This isn't claiming GR is wrong. It's showing that the time dilation phenomenology might be downstream of something more general:

> **Observer-relative dimensional access determines correlation rate determines experienced time.**

GR happens to produce aperture squeezing via spacetime geometry. But the relationship between aperture and time might be the more fundamental thing.

If so, the same math that describes black hole complementarity also describes:
- Neural attention bottlenecks
- Adaptive controllers with variable state access
- Any system where different interfaces see different effective dimensions

That's the universality claim. The simulation is the test.

---

## Part II: The Simulation Details

### State space

We use N coupled oscillators with state vector $\mathbf{x} \in \mathbb{R}^{2N}$ (position and momentum for each oscillator).

The coupling creates correlations across modes. In the full state space, the system traces out a trajectory on a high-dimensional manifold.

### Observer apertures

Define an observer's aperture as a projection matrix $P_\theta$ that selects which modes are accessible:

$$\mathbf{x}_{obs} = P_\theta \mathbf{x}$$

For the external observer, $P_\theta$ depends on "radius" r:
- At large r: $P$ is close to identity (full access)
- As r → r_horizon: $P$ projects onto a 2D subspace (surface modes only)

For the infalling observer, $P$ stays close to identity regardless of position.

### Effective dimension

For each observer, compute the covariance matrix of accessible states:

$$C_{obs} = \langle \mathbf{x}_{obs} \mathbf{x}_{obs}^T \rangle$$

Effective dimension via participation ratio:

$$k_{eff} = \frac{(\text{tr } C)^2}{\text{tr } C^2}$$

### Correlation clock

Define time operationally as the rate of distinguishable state change. We use the Fisher information speed:

$$\dot{\tau} = \sqrt{\dot{\mathbf{x}}_{obs}^T G \dot{\mathbf{x}}_{obs}}$$

where G is the Fisher information metric on the observable subspace.

Alternatively, measure mutual information growth between the observer's state and a reference register.

### The horizon

The "horizon" in our model is the radius where the external observer's aperture collapses to k = 2. This is defined by construction, not derived.

The question is: does this aperture collapse produce the same phenomenology as GR predicts? Specifically:
- Does the external clock freeze?
- Does the infalling clock continue?
- Is the underlying dynamics unchanged?

---

## Part III: Results

[TODO: actual simulation results and figures]

### Figure 1: Effective dimension vs radius

[External observer k drops, infalling stays constant]

### Figure 2: Correlation rate vs radius

[External rate → 0 at horizon, infalling stays constant]

### Figure 3: Accumulated time for both observers

[External time asymptotes, infalling time continues linearly]

### Figure 4: Phase space trajectories

[Same underlying trajectory, different observable projections]

---

## The Punchline

The simulation demonstrates:

1. **Same dynamics** — both observers watch the same underlying system
2. **Different apertures** — external access shrinks, infalling access doesn't
3. **Different clocks** — external time freezes, infalling time flows
4. **No GR required** — just high-D dynamics + projection + correlation-based time

This doesn't prove that black holes *are* aperture effects. It proves that aperture effects *can reproduce* the black hole phenomenology.

The math is substrate-agnostic. If it works here, it works anywhere observers have different dimensional access to shared dynamics.

> **One-sentence synthesis:** Black hole time dilation is what observer-relative aperture contraction looks like when the underlying dynamics are high-dimensional and time is defined by correlation accumulation.

---

*This is Part 4 of a series. See [Part 1](/blog/quantum-mechanics-without-math), [Part 2](/blog/quantum-gravity-without-the-paradox), and [Part 3](/blog/time-from-dimensions).*

*The simulation code is available at [GitHub link TBD].*
