'use client';

/**
 * SurfaceCurvatureDemo - "The Cost of Surface Curvature"
 *
 * 3D visualization: particles confined to a 2D surface embedded in 3D space.
 * User controls surface shape (flat, sphere, saddle) and sees thermodynamic cost.
 *
 * Uses Three.js for 3D rendering.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === TYPES ===
interface Particle3D {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  heat: number;
  mesh: THREE.Mesh;
}

// === CONSTANTS ===
const N_PARTICLES = 200;
const TEMPERATURE = 0.02;
const STIFFNESS = 2.0;
const DAMPING = 0.85;
const GRID_SIZE = 40;

type SurfaceType = 'flat' | 'sphere' | 'saddle' | 'wave';

export default function SurfaceCurvatureDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const surfaceMeshRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number>();
  const historyRef = useRef<number[]>(new Array(100).fill(0));

  const [surfaceType, setSurfaceType] = useState<SurfaceType>('flat');
  const [curvatureStrength, setCurvatureStrength] = useState(0.5);
  const [avgDissipation, setAvgDissipation] = useState(0);

  // Surface height function
  const getSurfaceHeight = useCallback((x: number, z: number, type: SurfaceType, strength: number): number => {
    const r2 = x * x + z * z;
    switch (type) {
      case 'flat':
        return 0;
      case 'sphere':
        // Paraboloid approximation of sphere cap (positive curvature)
        return -strength * r2 * 0.5;
      case 'saddle':
        // Hyperbolic paraboloid (negative Gaussian curvature)
        return strength * (x * x - z * z) * 0.3;
      case 'wave':
        // Sinusoidal surface
        return strength * Math.sin(x * 2) * Math.sin(z * 2) * 0.3;
      default:
        return 0;
    }
  }, []);

  // Mean curvature (approximation)
  const getMeanCurvature = useCallback((x: number, z: number, type: SurfaceType, strength: number): number => {
    const eps = 0.05;
    const h = getSurfaceHeight(x, z, type, strength);
    const hxp = getSurfaceHeight(x + eps, z, type, strength);
    const hxm = getSurfaceHeight(x - eps, z, type, strength);
    const hzp = getSurfaceHeight(x, z + eps, type, strength);
    const hzm = getSurfaceHeight(x, z - eps, type, strength);

    const hxx = (hxp - 2 * h + hxm) / (eps * eps);
    const hzz = (hzp - 2 * h + hzm) / (eps * eps);

    // Simplified mean curvature for small gradients
    return Math.abs(hxx + hzz) * 0.5;
  }, [getSurfaceHeight]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(3, 2.5, 3);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(4, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Create surface mesh
    const surfaceGeometry = new THREE.PlaneGeometry(4, 4, GRID_SIZE, GRID_SIZE);
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surfaceMesh.rotation.x = -Math.PI / 2;
    scene.add(surfaceMesh);
    surfaceMeshRef.current = surfaceMesh;

    // Wireframe overlay
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const wireframeMesh = new THREE.Mesh(surfaceGeometry, wireframeMaterial);
    wireframeMesh.rotation.x = -Math.PI / 2;
    scene.add(wireframeMesh);

    // Create particles
    const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const particles: Particle3D[] = [];

    for (let i = 0; i < N_PARTICLES; i++) {
      const x = (Math.random() - 0.5) * 3;
      const z = (Math.random() - 0.5) * 3;
      const y = 0;

      const material = new THREE.MeshStandardMaterial({ color: 0x3296ff });
      const mesh = new THREE.Mesh(particleGeometry, material);
      mesh.position.set(x, y, z);
      scene.add(mesh);

      particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          0,
          (Math.random() - 0.5) * 0.1
        ),
        heat: 0,
        mesh,
      });
    }
    particlesRef.current = particles;

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const scene = sceneRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const particles = particlesRef.current;
      const surfaceMesh = surfaceMeshRef.current;

      // Update surface geometry
      if (surfaceMesh) {
        const geometry = surfaceMesh.geometry as THREE.PlaneGeometry;
        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = getSurfaceHeight(x, y, surfaceType, curvatureStrength);
          positions.setZ(i, z);
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      }

      // Physics update
      let totalDissipation = 0;

      particles.forEach((p) => {
        // Brownian noise
        p.velocity.x += (Math.random() - 0.5) * TEMPERATURE;
        p.velocity.z += (Math.random() - 0.5) * TEMPERATURE;

        // Update position
        p.position.add(p.velocity.clone().multiplyScalar(0.1));

        // Boundary wrap
        if (p.position.x > 2) p.position.x = -2;
        if (p.position.x < -2) p.position.x = 2;
        if (p.position.z > 2) p.position.z = -2;
        if (p.position.z < -2) p.position.z = 2;

        // Surface constraint
        const targetY = getSurfaceHeight(p.position.x, p.position.z, surfaceType, curvatureStrength);
        const distY = p.position.y - targetY;
        const forceY = -STIFFNESS * distY;

        p.velocity.y += forceY * 0.1;
        p.velocity.multiplyScalar(DAMPING);
        p.position.y += p.velocity.y * 0.1;

        // Calculate work (proportional to force magnitude)
        const localCurvature = getMeanCurvature(p.position.x, p.position.z, surfaceType, curvatureStrength);
        const work = Math.abs(forceY) * 2 + localCurvature * 0.5;
        p.heat = Math.min(1, work);
        totalDissipation += p.heat;

        // Update mesh
        p.mesh.position.copy(p.position);

        // Color based on heat (blue -> red)
        const r = Math.floor(50 + p.heat * 205);
        const g = Math.floor(150 - p.heat * 100);
        const b = Math.floor(255 - p.heat * 205);
        (p.mesh.material as THREE.MeshStandardMaterial).color.setRGB(r / 255, g / 255, b / 255);
      });

      const avgDiss = totalDissipation / N_PARTICLES;
      setAvgDissipation(avgDiss);

      // Update history for graph
      historyRef.current.shift();
      historyRef.current.push(avgDiss);

      // Render dissipation graph
      const graphCanvas = graphRef.current;
      const gCtx = graphCanvas?.getContext('2d');
      if (gCtx && graphCanvas) {
        gCtx.clearRect(0, 0, 200, 60);
        gCtx.fillStyle = '#0f172a';
        gCtx.fillRect(0, 0, 200, 60);

        gCtx.strokeStyle = '#1e293b';
        gCtx.lineWidth = 1;
        gCtx.beginPath();
        gCtx.moveTo(0, 30);
        gCtx.lineTo(200, 30);
        gCtx.stroke();

        gCtx.beginPath();
        gCtx.moveTo(0, 60 - historyRef.current[0] * 40);
        for (let i = 1; i < 100; i++) {
          gCtx.lineTo(i * 2, 60 - historyRef.current[i] * 40);
        }
        const severity = historyRef.current[99];
        gCtx.strokeStyle = severity > 0.8 ? '#ef4444' : severity > 0.4 ? '#f59e0b' : '#22c55e';
        gCtx.lineWidth = 2;
        gCtx.stroke();
      }

      controls?.update();
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [surfaceType, curvatureStrength, getSurfaceHeight, getMeanCurvature]);

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-sm">
      {/* HUD Header */}
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <h3 className="text-slate-400 text-xs tracking-widest uppercase">3D Surface</h3>
          <h2 className="text-slate-100 font-bold text-lg">2D Manifold Projection Cost</h2>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500">DIMENSIONAL WORK</span>
            <canvas
              ref={graphRef}
              width={200}
              height={60}
              className="border border-slate-700 rounded bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
        style={{ height: '400px' }}
      />

      {/* Controls */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-xs mb-2 block">Surface Type</label>
          <div className="flex gap-2">
            {(['flat', 'sphere', 'saddle', 'wave'] as SurfaceType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSurfaceType(type)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  surfaceType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-xs mb-2 block">
            Curvature Strength: {curvatureStrength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={curvatureStrength}
            onChange={(e) => setCurvatureStrength(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${avgDissipation > 0.8 ? 'bg-red-500 animate-pulse' : avgDissipation > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className={avgDissipation > 0.8 ? 'text-red-400' : avgDissipation > 0.4 ? 'text-amber-400' : 'text-emerald-400'}>
            {avgDissipation > 0.8 ? 'HIGH DISSIPATION' : avgDissipation > 0.4 ? 'MODERATE' : 'OPTIMAL'}
          </span>
        </div>
        <span className="text-slate-500">
          Mean curvature cost: {avgDissipation.toFixed(3)}
        </span>
      </div>

      {/* Caption */}
      <p className="mt-4 text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
        <strong>3D Brownian motion confined to a 2D surface.</strong>{' '}
        Select surface type (flat, sphere, saddle, wave) and adjust curvature strength.
        Particles heat up (turn <span className="text-red-400">red</span>) where local mean curvature is high,
        visualizing the thermodynamic cost of maintaining a curved low-dimensional representation.
        Drag to rotate the view.
      </p>
    </div>
  );
}
