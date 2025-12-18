export interface FullPaperContent {
  abstract: string;
  sections: {
    title: string;
    content: string;
  }[];
  references?: string[];
}

const fullPapers: Record<string, FullPaperContent> = {
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

2. **Protocol efficiency:** Geometric structure in the control landscape reduces *irreversible* dissipation during finite-time operations. This is not a conserved resource but a property of the transformation path.`
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
  }
};

export function getFullPaperContent(slug: string): FullPaperContent | undefined {
  return fullPapers[slug];
}

export function hasFullPaperContent(slug: string): boolean {
  return slug in fullPapers;
}
