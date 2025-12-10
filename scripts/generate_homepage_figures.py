#!/usr/bin/env python3
"""Generate polished homepage figures for coherencedynamics.com"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.patches as mpatches

# Set up professional styling - use system sans-serif with proper weights
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['SF Pro Display', 'Helvetica Neue', 'Arial']
plt.rcParams['font.weight'] = 'regular'
plt.rcParams['axes.labelweight'] = 'regular'
plt.rcParams['axes.titleweight'] = 'semibold'

# Dark theme colors
DARK_BG = '#000000'
PANEL_BG = '#ffffff'
TEXT_LIGHT = '#f1f5f9'
TEXT_MUTED = '#94a3b8'
RED = '#ef4444'
GREEN = '#22c55e'
ORANGE = '#f97316'
CYAN = '#06b6d4'
PURPLE = '#a855f7'


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
    """Create the main hero image: Bits vs Dimensions comparison"""

    fig = plt.figure(figsize=(16, 10), facecolor=DARK_BG)

    # Title text sizes - even larger
    title_size = 42
    subtitle_size = 26
    tagline_size = 28

    # Left panel: Bits (scattered points)
    ax1 = fig.add_axes([0.02, 0.15, 0.46, 0.7], facecolor=PANEL_BG)

    np.random.seed(42)
    n_points = 150
    x = np.random.randn(n_points) * 0.8
    y = np.random.randn(n_points) * 0.8
    colors = plt.cm.Set1(np.random.randint(0, 8, n_points))

    ax1.scatter(x, y, c=colors, s=80, alpha=0.8, edgecolors='white', linewidths=0.5)
    ax1.set_xlim(-2.5, 2.5)
    ax1.set_ylim(-2.5, 2.5)
    ax1.axis('off')

    # Right panel: Dimensions (Lorenz attractor)
    ax2 = fig.add_axes([0.52, 0.15, 0.46, 0.7], facecolor=PANEL_BG)

    lx, ly, lz = generate_lorenz_attractor(8000)

    # Color by time for gradient effect
    t = np.linspace(0, 1, len(lx))
    points = np.array([lx, ly]).T.reshape(-1, 1, 2)
    segments = np.concatenate([points[:-1], points[1:]], axis=1)

    # Plot with color gradient
    for i in range(0, len(lx)-1, 10):
        color = plt.cm.viridis(t[i])
        ax2.plot(lx[i:i+12], ly[i:i+12], color=color, linewidth=1.2, alpha=0.9)

    ax2.set_xlim(-25, 25)
    ax2.set_ylim(-30, 30)
    ax2.axis('off')

    # Panel titles - clean, professional styling
    fig.text(0.25, 0.90, 'BITS', fontsize=title_size, fontweight=600,
             color=RED, ha='center', va='center')
    fig.text(0.25, 0.86, 'Discrete  •  Isolated  •  O(n) cost',
             fontsize=subtitle_size, color=RED, ha='center', va='center', alpha=0.85,
             fontweight=300)

    fig.text(0.75, 0.90, 'DYNAMICS', fontsize=title_size, fontweight=600,
             color=GREEN, ha='center', va='center')
    fig.text(0.75, 0.86, 'Continuous  •  Coherent  •  O(1) cost',
             fontsize=subtitle_size, color=GREEN, ha='center', va='center', alpha=0.85,
             fontweight=300)

    # Bottom tagline - clean styling
    tagline = "High-dimensional systems are coherent systems. Bits are incoherent."

    # Create rounded rectangle for tagline
    bbox_props = dict(boxstyle="round,pad=0.5", facecolor='#111111',
                      edgecolor='#333333', linewidth=2)
    fig.text(0.5, 0.05, tagline, fontsize=tagline_size, fontweight='regular',
             color=TEXT_LIGHT, ha='center', va='center', bbox=bbox_props)

    plt.savefig('../public/images/high-dimensional-coherence.png',
                dpi=150, facecolor=DARK_BG, bbox_inches='tight', pad_inches=0.3)
    plt.close()
    print("Created: high-dimensional-coherence.png")


def create_measurement_image():
    """Create the measurement/projection image"""

    fig = plt.figure(figsize=(16, 9), facecolor=DARK_BG)

    # Text sizes - larger
    title_size = 36
    label_size = 26
    annotation_size = 22

    # Left panel: Torus (high-D state) - dark background to match
    ax1 = fig.add_axes([0.02, 0.1, 0.45, 0.75], facecolor=DARK_BG, projection='3d')

    # Generate torus
    u = np.linspace(0, 2 * np.pi, 60)
    v = np.linspace(0, 2 * np.pi, 60)
    u, v = np.meshgrid(u, v)
    R, r = 2, 0.8
    x = (R + r * np.cos(v)) * np.cos(u)
    y = (R + r * np.cos(v)) * np.sin(u)
    z = r * np.sin(v)

    ax1.plot_surface(x, y, z, cmap='viridis', alpha=0.9, linewidth=0.2,
                     edgecolor='gray', antialiased=True)

    # Add trajectory on torus
    t = np.linspace(0, 8*np.pi, 500)
    traj_u = t
    traj_v = t * 0.618  # Golden ratio for nice pattern
    traj_x = (R + r * np.cos(traj_v)) * np.cos(traj_u)
    traj_y = (R + r * np.cos(traj_v)) * np.sin(traj_u)
    traj_z = r * np.sin(traj_v)
    ax1.plot(traj_x, traj_y, traj_z, color='#f97316', linewidth=2, alpha=0.8)

    ax1.set_xlim(-3, 3)
    ax1.set_ylim(-3, 3)
    ax1.set_zlim(-2, 2)
    ax1.axis('off')
    ax1.view_init(elev=25, azim=45)
    ax1.set_facecolor(DARK_BG)
    ax1.xaxis.pane.fill = False
    ax1.yaxis.pane.fill = False
    ax1.zaxis.pane.fill = False

    # Right panel: Projected signals
    ax2 = fig.add_axes([0.55, 0.1, 0.42, 0.75], facecolor=DARK_BG)

    # Generate noisy projections of torus trajectory
    np.random.seed(42)
    t_proj = np.linspace(0, 8*np.pi, 500)

    # Two different "measurements" (projections)
    signal1 = np.sin(t_proj) + 0.3 * np.sin(3*t_proj) + 0.15 * np.random.randn(len(t_proj))
    signal2 = np.cos(t_proj * 0.618) + 0.2 * np.cos(2*t_proj) + 0.15 * np.random.randn(len(t_proj))

    ax2.plot(t_proj, signal1 + 2.5, color=CYAN, linewidth=1.5, alpha=0.9)
    ax2.plot(t_proj, signal2 - 0.5, color=PURPLE, linewidth=1.5, alpha=0.9)

    # Dashed line between
    ax2.axhline(y=1, color='#475569', linestyle='--', linewidth=1.5, alpha=0.6)

    ax2.set_xlim(0, 8*np.pi)
    ax2.set_ylim(-2.5, 5)
    ax2.axis('off')

    # Titles - clean, professional styling
    fig.text(0.25, 0.92, 'Biological Dynamics', fontsize=title_size, fontweight=600,
             color=GREEN, ha='center')
    fig.text(0.25, 0.87, '(High-dimensional, Coherent)', fontsize=label_size,
             color=GREEN, ha='center', alpha=0.85, fontweight=300)

    fig.text(0.76, 0.92, 'Discrete Observations', fontsize=title_size, fontweight=600,
             color=ORANGE, ha='center')
    fig.text(0.76, 0.87, '(Low-dimensional, Bits)', fontsize=label_size,
             color=ORANGE, ha='center', alpha=0.85, fontweight=300)

    # Arrow with MEASURE label - clean styling
    arrow_y = 0.5
    fig.text(0.485, arrow_y + 0.05, 'MEASURE', fontsize=label_size, fontweight=600,
             color=ORANGE, ha='center')

    # Draw arrow
    arrow = mpatches.FancyArrowPatch(
        (0.47, arrow_y), (0.54, arrow_y),
        arrowstyle='->', mutation_scale=25,
        color=ORANGE, linewidth=4,
        transform=fig.transFigure, figure=fig
    )
    fig.patches.append(arrow)

    # Bottom annotation - larger, in a subtle box
    bbox_props = dict(boxstyle="round,pad=0.4", facecolor='#111111',
                      edgecolor='none', alpha=0.8)
    fig.text(0.76, 0.08, 'Structure lost in projection', fontsize=annotation_size,
             color=TEXT_MUTED, ha='center', style='italic', bbox=bbox_props)

    plt.savefig('../public/images/measurement-changes-system.png',
                dpi=150, facecolor=DARK_BG, bbox_inches='tight', pad_inches=0.2)
    plt.close()
    print("Created: measurement-changes-system.png")


if __name__ == '__main__':
    print("Generating homepage figures...")
    create_hero_image()
    create_measurement_image()
    print("Done!")
