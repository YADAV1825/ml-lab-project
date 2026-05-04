import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, CheckCircle2, Loader2, BarChart2 } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ─── Pure Three.js 3D Scatter Component ─── */
function ThreeScatter({ trainingResults }) {
  const mountRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !trainingResults) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf0f4ff, 12, 30);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(6, 5, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.maxDistance = 15;
    controls.minDistance = 3;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xa855f7, 0.4);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Grid
    const grid = new THREE.GridHelper(12, 20, 0xc7d2fe, 0xe0e7ff);
    grid.position.y = -3;
    scene.add(grid);

    // Axes
    const axisLen = 4;
    const axisColors = [0x6366f1, 0xa855f7, 0x2dd4bf];
    const axisDirections = [
      [new THREE.Vector3(0,0,0), new THREE.Vector3(axisLen,0,0)],
      [new THREE.Vector3(0,0,0), new THREE.Vector3(0,axisLen,0)],
      [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,axisLen)],
    ];
    axisDirections.forEach((pts, i) => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: axisColors[i], linewidth: 2 });
      scene.add(new THREE.Line(geom, mat));
    });

    // Data points
    const clusterColors = [0x6366f1, 0xf59e0b, 0x10b981, 0xef4444, 0x8b5cf6, 0xec4899];
    const actual = trainingResults.actual || [];
    const predicted = trainingResults.predicted || [];
    const maxPts = Math.min(actual.length, 80);
    const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pointMeshes = [];

    if (actual.length > 0) {
      const aMax = Math.max(...actual.map(Math.abs), 1);
      const pMax = Math.max(...predicted.map(Math.abs), 1);

      for (let i = 0; i < maxPts; i++) {
        const x = (actual[i] / aMax) * 3;
        const y = (predicted[i] / pMax) * 3;
        const z = ((actual[i] - predicted[i]) / aMax) * 2;
        const label = trainingResults.task_type === 'classification' ? predicted[i] : 0;
        const colorIdx = Math.abs(Math.round(label)) % clusterColors.length;
        const mat = new THREE.MeshStandardMaterial({
          color: clusterColors[colorIdx],
          roughness: 0.2,
          metalness: 0.6,
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.set(x, y, z);
        mesh.userData = { baseY: y, offset: x * 2 };
        scene.add(mesh);
        pointMeshes.push(mesh);
      }
    }

    // Cluster centers (octahedrons)
    if (trainingResults.cluster_centers) {
      const octGeo = new THREE.OctahedronGeometry(0.25, 0);
      const octGeoInner = new THREE.OctahedronGeometry(0.18, 0);
      trainingResults.cluster_centers.forEach((c, i) => {
        const color = clusterColors[i % clusterColors.length];
        // Wireframe
        const wireMat = new THREE.MeshStandardMaterial({ color, wireframe: true, transparent: true, opacity: 0.8 });
        const wire = new THREE.Mesh(octGeo, wireMat);
        wire.position.set(c[0] || 0, c[1] || 0, c.length > 2 ? c[2] : 0);
        scene.add(wire);
        // Solid inner
        const solidMat = new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.5 });
        const solid = new THREE.Mesh(octGeoInner, solidMat);
        solid.position.copy(wire.position);
        scene.add(solid);
      });
    }

    // Animation loop
    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      
      pointMeshes.forEach((mesh) => {
        mesh.position.y = mesh.userData.baseY + Math.sin(t * 0.8 + mesh.userData.offset) * 0.03;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [trainingResults]);

  return <div ref={mountRef} className="w-full h-full" />;
}

/* ─── Metric Card ─── */
function MetricCard({ label, value, color, suffix = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="metric-card p-4">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}{suffix}</div>
    </motion.div>
  );
}

/* ─── Main Visualization Panel ─── */
const VisualizationPanel = ({ trainingResults, selectedModel, isTraining }) => {
  if (isTraining) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Training Model...</h2>
        <p className="text-slate-400 text-sm mt-2">Please wait while the model computes</p>
      </div>
    );
  }

  if (!trainingResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
          <Activity size={36} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-400 mb-2">No Results Yet</h2>
        <p className="text-slate-400 text-sm">Train a model to see visualizations here</p>
      </div>
    );
  }

  const cmData = (trainingResults.confusion_matrix || []).map((row, i) => {
    const data = { name: `Class ${i}` };
    row.forEach((val, j) => { data[`Pred ${j}`] = val; });
    return data;
  });

  const regressionData = (trainingResults.actual || []).map((act, i) => ({
    name: i, Actual: act, Predicted: trainingResults.predicted[i]
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Header + Summary Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Results</h1>
            <p className="text-slate-400 text-sm font-medium">Analysis for {selectedModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
          <CheckCircle2 size={18} />
          <span className="font-bold text-sm">
            {trainingResults.accuracy ? `${(trainingResults.accuracy * 100).toFixed(1)}%` : trainingResults.mse ? `MSE ${trainingResults.mse.toFixed(4)}` : 'Done'}
          </span>
        </div>
      </div>

      {/* 3D Interactive Scatter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="canvas-container relative" style={{ height: 420 }}>
        <div className="absolute top-4 left-5 z-10 px-3 py-1.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 text-xs font-semibold text-slate-500">
          🖱️ Drag to rotate · Scroll to zoom
        </div>
        <ThreeScatter trainingResults={trainingResults} />
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trainingResults.accuracy !== undefined && <MetricCard label="Accuracy" value={(trainingResults.accuracy * 100).toFixed(1)} color="text-indigo-600" suffix="%" />}
        {trainingResults.precision !== undefined && <MetricCard label="Precision" value={(trainingResults.precision * 100).toFixed(1)} color="text-emerald-600" suffix="%" />}
        {trainingResults.recall !== undefined && <MetricCard label="Recall" value={(trainingResults.recall * 100).toFixed(1)} color="text-amber-600" suffix="%" />}
        {trainingResults.f1 !== undefined && <MetricCard label="F1 Score" value={(trainingResults.f1 * 100).toFixed(1)} color="text-purple-600" suffix="%" />}
        {trainingResults.mse !== undefined && <MetricCard label="MSE" value={trainingResults.mse.toFixed(4)} color="text-red-500" />}
        {trainingResults.mae !== undefined && <MetricCard label="MAE" value={trainingResults.mae.toFixed(4)} color="text-orange-500" />}
        {trainingResults.r2 !== undefined && <MetricCard label="R² Score" value={(trainingResults.r2 * 100).toFixed(1)} color="text-indigo-600" suffix="%" />}
        {trainingResults.roc_auc !== undefined && <MetricCard label="ROC AUC" value={(trainingResults.roc_auc * 100).toFixed(1)} color="text-pink-600" suffix="%" />}
        {trainingResults.inertia && <MetricCard label="Inertia" value={trainingResults.inertia.toFixed(1)} color="text-violet-600" />}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {trainingResults.task_type === 'classification' && cmData.length > 0 && (
          <div className="glass-card-static p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Confusion Matrix</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0', borderRadius: 12 }} />
                  <Legend />
                  {Object.keys(cmData[0] || {}).filter(k => k !== 'name').map((key, i) => (
                    <Bar key={key} dataKey={key} fill={i % 2 === 0 ? '#6366f1' : '#a855f7'} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {trainingResults.task_type === 'regression' && regressionData.length > 0 && (
          <div className="glass-card-static p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Actual vs Predicted</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={regressionData}>
                  <defs>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0', borderRadius: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="Actual" stroke="#6366f1" fill="url(#gActual)" />
                  <Area type="monotone" dataKey="Predicted" stroke="#f59e0b" fill="url(#gPredicted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Parameters Used */}
        <div className="glass-card-static p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Parameters Used</h3>
          <pre className="text-xs text-slate-500 bg-slate-50/60 p-4 rounded-xl overflow-auto whitespace-pre-wrap font-mono">
            {JSON.stringify(trainingResults.params_used, null, 2)}
          </pre>
        </div>
      </div>

      {/* Generated Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {trainingResults.tree_image && (
          <div className="glass-card-static p-5 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Decision Tree Graph</h3>
            <div className="w-full overflow-auto rounded-xl bg-white/80 border border-white/50">
              <img src={`data:image/png;base64,${trainingResults.tree_image}`} alt="Decision Tree" className="max-w-none p-4" />
            </div>
          </div>
        )}
        {trainingResults.learning_curve_image && (
          <div className="glass-card-static p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Learning Curve</h3>
            <div className="flex justify-center rounded-xl bg-white/80 border border-white/50 overflow-hidden">
              <img src={`data:image/png;base64,${trainingResults.learning_curve_image}`} alt="Learning Curve" className="max-w-full h-auto p-3" />
            </div>
          </div>
        )}
        {trainingResults.diagnostic_image && (
          <div className="glass-card-static p-5">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              {trainingResults.task_type === 'regression' ? 'Residuals Plot' : 'ROC Curve'}
            </h3>
            <div className="flex justify-center rounded-xl bg-white/80 border border-white/50 overflow-hidden">
              <img src={`data:image/png;base64,${trainingResults.diagnostic_image}`} alt="Diagnostic" className="max-w-full h-auto p-3" />
            </div>
          </div>
        )}
        {trainingResults.gradient_3d_image && (
          <div className="glass-card-static p-5 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-3">3D Loss Landscape</h3>
            <div className="flex justify-center rounded-xl bg-white/80 border border-white/50 overflow-hidden">
              <img src={`data:image/png;base64,${trainingResults.gradient_3d_image}`} alt="3D Gradient" className="max-w-full h-auto p-3" />
            </div>
          </div>
        )}
        {trainingResults.extra_image && (
          <div className="glass-card-static p-5 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Feature Importances / Coefficients</h3>
            <div className="flex justify-center rounded-xl bg-white/80 border border-white/50 overflow-hidden">
              <img src={`data:image/png;base64,${trainingResults.extra_image}`} alt="Feature Insight" className="max-w-full h-auto p-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizationPanel;
