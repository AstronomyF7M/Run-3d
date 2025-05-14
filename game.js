// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player setup
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.y = 1; // Start above the ground

// Tunnel setup
const tunnelSegments = [];
const tunnelLength = 10;
const tunnelWidth = 5;
const numSegments = 5;

function createTunnelSegment(zPos) {
  const tunnelGroup = new THREE.Group();
  const tunnelMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

  // Tunnel floor
  const floorGeometry = new THREE.BoxGeometry(tunnelWidth, 0.1, tunnelLength);
  const floor = new THREE.Mesh(floorGeometry, tunnelMaterial);
  floor.position.y = -0.5;
  floor.position.z = zPos;
  tunnelGroup.add(floor);

  // Randomly create holes
  const holeProbability = 0.3;
  if (Math.random() < holeProbability) {
    const holeGeometry = new THREE.BoxGeometry(tunnelWidth / 3, 0.1, tunnelLength / 3);
    const hole = new THREE.Mesh(holeGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    hole.position.y = -0.4; // Slightly below the floor
    hole.position.z = zPos;
    tunnelGroup.add(hole);
  }

  tunnelSegments.push(tunnelGroup);
  scene.add(tunnelGroup);
}

// Initial tunnel setup
for (let i = 0; i < numSegments; i++) {
  createTunnelSegment(-i * tunnelLength);
}

// Lighting (optional for visuals)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 5, 10);
scene.add(directionalLight);

// Game state
let moveSpeed = 0.1;
let isJumping = false;
let jumpVelocity = 0;
const gravity = -0.01;

// Handle player input
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isJumping) {
    isJumping = true;
    jumpVelocity = 0.2; // Initial jump velocity
  }
});

// Game loop
function animate() {
  requestAnimationFrame(animate);

  // Move player forward
  player.position.z -= moveSpeed;

  // Handle player jumping
  if (isJumping) {
    player.position.y += jumpVelocity;
    jumpVelocity += gravity; // Apply gravity

    if (player.position.y <= 1) {
      player.position.y = 1; // Reset to ground level
      isJumping = false;
    }
  }

  // Move tunnels and recycle them
  tunnelSegments.forEach((segment) => {
    segment.position.z -= moveSpeed;

    // Recycle tunnel segments
    if (segment.position.z < camera.position.z - tunnelLength * numSegments) {
      segment.position.z += tunnelLength * numSegments;
    }
  });

  // Update camera position to follow player
  camera.position.z = player.position.z + 5;
  camera.position.y = player.position.y + 2;

  // Render the scene
  renderer.render(scene, camera);
}

animate();
