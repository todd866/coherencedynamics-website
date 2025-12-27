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
draft: false
---

## The Setup

*This post extends the ideas from [Time From Dimensions](/blog/time-from-dimensions). If you haven't read that, the short version: time = correlation accumulation rate through a dimensional aperture. Squeeze the aperture, slow the clock.*

> **Dimension glossary**:
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

We simulate 50 coupled harmonic oscillators—a high-dimensional dynamical system with rich internal correlations. Two observers watch the same dynamics:

- **External observer**: Aperture weights decay exponentially with mode frequency. As "radius" decreases (approaching the horizon-analogue), high-frequency modes are progressively filtered out.
- **Infalling observer**: Aperture weights stay uniform. Full access to all modes at all times.

The results are striking. As the external observer approaches the horizon:
- Their effective dimension $k_{eff}$ drops from ~20 to ~3
- Their correlation rate $\dot{\tau}$ drops proportionally
- Their accumulated time asymptotes—the clock freezes
- Meanwhile, the infalling observer's metrics stay flat

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

## Part II: The Simulation Framework

### State space

We use N coupled oscillators with state vector $\mathbf{x} \in \mathbb{R}^{2N}$ (position and momentum for each oscillator).

The coupling creates correlations across modes. In the full state space, the system traces out a trajectory on a high-dimensional manifold.

### Observer apertures

Define an observer's aperture as a weight vector $\mathbf{w}$ that determines access to each mode:

$$\mathbf{x}_{obs} = \mathbf{w} \odot \mathbf{x}$$

For the external observer, weights depend on "radius" r:
- At large r: $w_i \approx 1$ (full access)
- As r → 0: high-frequency modes suppressed, $w_i \to 0$ for large i
- At horizon: only low-frequency (surface) modes visible

For the infalling observer, $w_i = 1$ always.

### The four observables

For each observer, we compute:

**1. Effective dimension** (participation ratio):
$$k_{eff} = \frac{(\sum_i w_i)^2}{\sum_i w_i^2}$$

**2. Accessible entropy** (log-determinant of weighted covariance):
$$S_{acc} = \frac{1}{2} \log \det C_{obs}$$

where $C_{obs}$ is the covariance of accessible states.

**3. Correlation rate** (Fisher speed / distinguishability rate):
$$\dot{\tau} = \sqrt{\sum_i w_i \dot{x}_i^2}$$

**4. Thermodynamic cost** (Landauer erasure):
$$Q = \sum_t \max(0, S_{acc}(t-1) - S_{acc}(t))$$

The erasure cost accumulates whenever the aperture squeezes and accessible entropy drops.

### The horizon as computational bottleneck

The "horizon" in our model is where the external observer's aperture collapses. This produces:

- **k_eff → 2**: dimensional collapse to surface modes
- **S_acc drops**: accessible entropy decreases
- **Q spikes**: thermodynamic cost of erasure increases
- **τ rate → 0**: correlation accumulation freezes

The infalling observer sees none of this. Same dynamics, different aperture, different thermodynamics.

> This is Jacobson's insight made operational: the horizon is where maintaining a coarse-grained description becomes thermodynamically expensive. Time freezes because the computational cost of tracking correlations goes to infinity.

---

## Part III: Results

The simulation produces four key figures (available in the [GitHub repo](https://github.com/todd866/black-hole-aperture)):

### Figure 1: Time dilation during infall

As the external observer's "radius" decreases, their effective dimension $k_{eff}$ drops and their accumulated proper time $\tau$ asymptotes. The infalling observer's time continues linearly. Same dynamics, different clocks.

The time dilation factor tracks the aperture: when $k_{eff}$ drops by half, the correlation rate drops by half. This is the core prediction—squeeze k, slow time.

### Figure 2: Thermodynamic cost

The external observer's accessible entropy $S_{acc}$ drops as their aperture closes. Each drop represents information erasure—degrees of freedom traced out. The cumulative Landauer cost Q spikes near the horizon.

This is why the horizon is special: the thermodynamic cost of maintaining a coarse-grained description becomes extreme. Time freezes because correlation tracking becomes infinitely expensive.

### Figure 3: LIGO connection

We also simulate a merger: two oscillator systems approach, merge, and ring down. The external observer sees:
- **Inspiral**: gradual aperture contraction, frequency chirp
- **Merger**: rapid dimensional collapse
- **Ringdown**: damped oscillations as the aperture stabilizes

The ringdown frequency and damping encode the merged system's dimensional structure—qualitatively matching LIGO observations.

### Figure 4: Schwarzschild comparison

We plot our aperture-based time dilation against the GR prediction $\sqrt{1 - r_s/r}$. The curves track each other. This isn't a derivation—but it shows the aperture framework reproduces the right functional form.

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

*The full simulation code and paper are available at [github.com/todd866/black-hole-aperture](https://github.com/todd866/black-hole-aperture).*
