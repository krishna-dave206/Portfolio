import * as THREE from "three";

const canvas = document.querySelector("#space");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
const pointer = { x: 0, y: 0 };
let scrollProgress = 0;

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 8;

const group = new THREE.Group();
scene.add(group);

const primaryMaterial = new THREE.MeshStandardMaterial({
  color: 0x4fd7c5,
  metalness: 0.48,
  roughness: 0.28,
  emissive: 0x0f3834,
  emissiveIntensity: 0.35
});

const warmMaterial = new THREE.MeshStandardMaterial({
  color: 0xffb86b,
  metalness: 0.42,
  roughness: 0.34,
  emissive: 0x3c2110,
  emissiveIntensity: 0.28
});

const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0x88a8ff,
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide
});

const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), primaryMaterial);
const satellite = new THREE.Mesh(new THREE.TorusKnotGeometry(0.36, 0.095, 110, 12), warmMaterial);
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.012, 16, 180), ringMaterial);
const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(3.18, 0.009, 16, 180), ringMaterial);

satellite.position.set(2.52, 0.3, 0.45);
ring.rotation.set(1.16, 0.22, 0.68);
ringTwo.rotation.set(1.72, -0.55, 0.22);
group.add(core, satellite, ring, ringTwo);

const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 720;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i += 1) {
  const radius = 4 + Math.random() * 10;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);
}

particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  particlesGeometry,
  new THREE.PointsMaterial({
    color: 0xd9f2ff,
    size: 0.025,
    transparent: true,
    opacity: 0.58
  })
);
scene.add(particles);

const ambient = new THREE.AmbientLight(0xffffff, 0.52);
const key = new THREE.PointLight(0x4fd7c5, 24, 22);
const fill = new THREE.PointLight(0xffb86b, 16, 18);
key.position.set(-3, 3, 5);
fill.position.set(5, -2, 4);
scene.add(ambient, key, fill);

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? window.scrollY / max : 0;
}

window.addEventListener("resize", onResize);
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  const glow = document.querySelector(".cursor-glow");
  if (glow) {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }
});

const reveals = document.querySelectorAll(".reveal");
reveals.forEach((element) => {
  const delay = element.getAttribute("data-delay");
  if (delay) element.style.setProperty("--delay", `${delay}ms`);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
);

reveals.forEach((element) => observer.observe(element));

const marqueeTrack = document.querySelector(".marquee-track");
if (marqueeTrack) {
  marqueeTrack.innerHTML += marqueeTrack.innerHTML;
}

function animate(time) {
  const t = time * 0.001;
  group.rotation.y = t * 0.18 + pointer.x * 0.22 + scrollProgress * 2.2;
  group.rotation.x = Math.sin(t * 0.35) * 0.12 + pointer.y * 0.16;
  group.position.y = -0.5 + scrollProgress * 1.4;
  group.position.x = window.innerWidth > 900 ? 2.55 : 0;
  core.rotation.x += 0.004;
  core.rotation.y += 0.006;
  satellite.position.x = Math.cos(t * 0.9) * 2.52;
  satellite.position.z = Math.sin(t * 0.9) * 1.25;
  satellite.rotation.x += 0.01;
  satellite.rotation.y += 0.014;
  particles.rotation.y = t * 0.025;
  particles.rotation.x = scrollProgress * 0.5;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
