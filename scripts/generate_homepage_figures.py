#!/usr/bin/env python3
"""Generate polished homepage figures for coherencedynamics.com

Design principles:
- Pure black background (#000000) to match site
- Minimal text, let visuals speak
- Consistent typography (Helvetica Neue or system sans-serif)
- Consistent color palette: red for bits/digital, green for dynamics/biological
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Use Inter for clean, modern web look
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif']
plt.rcParams['font.weight'] = 'normal'
plt.rcParams['text.color'] = '#f1f5f9'
plt.rcParams['axes.labelcolor'] = '#f1f5f9'

# Color palette
BLACK = '#000000'
WHITE = '#f1f5f9'
GRAY = '#6b7280'
RED = '#ef4444'
GREEN = '#22c55e'
ORANGE = '#f97316'
CYAN = '#06b6d4'


def generate_lorenz_attractor(n_points=10000):
    """Generate Lorenz attractor trajectory"""
    dt = 0.01
    sigma, rho, beta = 10, 28, 8/3

    x, y, z = np.zeros(n_points), np.zeros(n_points), np.zeros(n_points)
    x[0], y[0], z[0] = 1.0, 1.0, 1.0

    for i in range(1, n_points):
        x[i] = x[i-1] + dt * sigma * (y[i-1] - x[i-1])
        y[i] = y[i-1] + dt * (x[i-1] * (rho - z[i-1]) - y[i-1])
        z[i] = z[i-1] + dt * (x[i-1] * y[i-1] - beta * z[i-1])

    return x, y, z


def create_hero_image():
    """Create the main hero image: Bits vs Dynamics comparison

    Clean, minimal design with two side-by-side visualizations
    """

    fig = plt.figure(figsize=(16, 9), facecolor=BLACK)

    # Consistent sizing - larger for impact
    title_size = 64
    subtitle_size = 32

    # Left panel: Bits (scattered random points - chaos, no structure)
    # Reduced height to avoid overlapping with text above
    ax1 = fig.add_axes([0.03, 0.12, 0.44, 0.62], facecolor=BLACK)

    np.random.seed(42)
    n_points = 200
    # Tighter spread to keep points contained
    x = np.random.randn(n_points) * 0.9
    y = np.random.randn(n_points) * 0.9

    # Random colors - no coherence
    colors = [plt.cm.Set1(i % 9) for i in range(n_points)]
    sizes = np.random.uniform(30, 100, n_points)

    ax1.scatter(x, y, c=colors, s=sizes, alpha=0.7, edgecolors='none')
    ax1.set_xlim(-2.5, 2.5)
    ax1.set_ylim(-2.5, 2.5)
    ax1.axis('off')

    # Right panel: Dynamics (Lorenz attractor - structured, coherent)
    ax2 = fig.add_axes([0.53, 0.12, 0.44, 0.62], facecolor=BLACK)

    lx, ly, lz = generate_lorenz_attractor(10000)

    # Color gradient by time
    t = np.linspace(0, 1, len(lx))
    for i in range(0, len(lx)-1, 8):
        # Green color gradient
        intensity = 0.4 + 0.6 * t[i]
        color = (34/255 * intensity, 197/255 * intensity, 94/255 * intensity, 0.8)
        ax2.plot(lx[i:i+10], ly[i:i+10], color=color, linewidth=1.0)

    ax2.set_xlim(-25, 25)
    ax2.set_ylim(-30, 30)
    ax2.axis('off')

    # Labels - clean, minimal
    fig.text(0.25, 0.88, 'BITS', fontsize=title_size, fontweight='bold',
             color=RED, ha='center', va='center')
    fig.text(0.25, 0.82, 'Discrete  ·  Isolated  ·  O(n) cost',
             fontsize=subtitle_size, color=RED, ha='center', va='center', alpha=0.7)

    fig.text(0.75, 0.88, 'DYNAMICS', fontsize=title_size, fontweight='bold',
             color=GREEN, ha='center', va='center')
    fig.text(0.75, 0.82, 'Continuous  ·  Coherent  ·  O(1) cost',
             fontsize=subtitle_size, color=GREEN, ha='center', va='center', alpha=0.7)

    # Bottom tagline
    fig.text(0.5, 0.04,
             'High-dimensional systems are coherent systems. Bits are not.',
             fontsize=26, color=WHITE, ha='center', va='center', alpha=0.9)

    plt.savefig('../public/images/high-dimensional-coherence.png',
                dpi=150, facecolor=BLACK, bbox_inches='tight', pad_inches=0.2)
    plt.close()
    print("Created: high-dimensional-coherence.png")


def create_measurement_image():
    """Create the measurement/projection image

    Shows high-dimensional dynamics being projected to low-dimensional observations
    """

    fig = plt.figure(figsize=(16, 9), facecolor=BLACK)

    # Match hero image sizing for consistency
    title_size = 64
    subtitle_size = 32

    # Left panel: Torus with many trajectories (high-dimensional state)
    # Reduced height to avoid overlapping with text above
    ax1 = fig.add_axes([0.03, 0.12, 0.42, 0.62], facecolor=BLACK, projection='3d')

    R, r = 2.2, 0.8

    # Draw many trajectories to fill the torus surface
    n_trajectories = 40
    for i in range(n_trajectories):
        # Each trajectory starts at different phase
        phase_u = i * 2 * np.pi / n_trajectories
        phase_v = i * 0.3  # Offset in the other direction too

        t = np.linspace(0, 6*np.pi, 400)
        traj_u = t + phase_u
        traj_v = t * 0.618 + phase_v

        traj_x = (R + r * np.cos(traj_v)) * np.cos(traj_u)
        traj_y = (R + r * np.cos(traj_v)) * np.sin(traj_u)
        traj_z = r * np.sin(traj_v)

        # Vary brightness slightly for depth
        brightness = 0.5 + 0.5 * (i / n_trajectories)
        ax1.plot(traj_x, traj_y, traj_z,
                color=(34/255 * brightness, 197/255 * brightness, 94/255 * brightness, 0.7),
                linewidth=0.8)

    ax1.set_xlim(-3.5, 3.5)
    ax1.set_ylim(-3.5, 3.5)
    ax1.set_zlim(-2, 2)
    ax1.axis('off')
    ax1.view_init(elev=25, azim=30)
    ax1.set_facecolor(BLACK)
    ax1.xaxis.pane.fill = False
    ax1.yaxis.pane.fill = False
    ax1.zaxis.pane.fill = False
    ax1.set_box_aspect([1, 1, 0.5])

    # Right panel: Projected time series
    ax2 = fig.add_axes([0.55, 0.12, 0.42, 0.62], facecolor=BLACK)

    # Generate projections
    np.random.seed(42)
    t_proj = np.linspace(0, 10*np.pi, 800)

    # Two 1D projections of the torus trajectory
    signal1 = np.sin(t_proj) + 0.3 * np.sin(3*t_proj)
    signal2 = np.cos(t_proj * 0.618) + 0.2 * np.cos(2*t_proj)

    # Add measurement noise
    signal1 += 0.1 * np.random.randn(len(t_proj))
    signal2 += 0.1 * np.random.randn(len(t_proj))

    ax2.plot(t_proj, signal1 + 2.5, color=CYAN, linewidth=1.2, alpha=0.9)
    ax2.plot(t_proj, signal2 - 0.5, color=ORANGE, linewidth=1.2, alpha=0.9)

    # Separator
    ax2.axhline(y=1, color=GRAY, linestyle='--', linewidth=1, alpha=0.4)

    ax2.set_xlim(0, 10*np.pi)
    ax2.set_ylim(-2.5, 5)
    ax2.axis('off')

    # Labels - matching hero image style
    fig.text(0.24, 0.88, 'DYNAMICS', fontsize=title_size, fontweight='bold',
             color=GREEN, ha='center')
    fig.text(0.24, 0.83, 'High-dimensional  ·  Coherent',
             fontsize=subtitle_size, color=GREEN, ha='center', alpha=0.7)

    fig.text(0.76, 0.88, 'OBSERVATIONS', fontsize=title_size, fontweight='bold',
             color=ORANGE, ha='center')
    fig.text(0.76, 0.83, 'Low-dimensional  ·  Projected',
             fontsize=subtitle_size, color=ORANGE, ha='center', alpha=0.7)

    # Arrow
    arrow = mpatches.FancyArrowPatch(
        (0.46, 0.5), (0.53, 0.5),
        arrowstyle='->', mutation_scale=20,
        color=GRAY, linewidth=2,
        transform=fig.transFigure, figure=fig
    )
    fig.patches.append(arrow)
    fig.text(0.495, 0.56, 'MEASURE', fontsize=14, fontweight='bold',
             color=GRAY, ha='center', alpha=0.8)

    # Bottom text
    fig.text(0.5, 0.04,
             'Structure is lost in projection. The map is not the territory.',
             fontsize=26, color=WHITE, ha='center', va='center', alpha=0.9)

    plt.savefig('../public/images/measurement-changes-system.png',
                dpi=150, facecolor=BLACK, bbox_inches='tight', pad_inches=0.2)
    plt.close()
    print("Created: measurement-changes-system.png")


if __name__ == '__main__':
    print("Generating homepage figures...")
    create_hero_image()
    create_measurement_image()
    print("Done!")
