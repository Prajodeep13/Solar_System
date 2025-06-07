document.addEventListener('DOMContentLoaded', () => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 100);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 30;
    controls.maxDistance = 300;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 1, 200);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Create celestial bodies
    const celestialBodies = {};
    
    // Sun - now with proper 3D appearance
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1,
        specular: 0xffff00,
        shininess: 30
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = "Sun";
    scene.add(sun);
    celestialBodies.sun = sun;
    sunLight.position.copy(sun.position);
    
    // Add subtle sun glow effect
    const sunGlowGeometry = new THREE.SphereGeometry(5.5, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);
    
    // Add Sun label
    const sunLabel = document.createElement('div');
    sunLabel.className = 'planet-label';
    sunLabel.textContent = "Sun";
    sunLabel.id = 'label-sun';
    document.getElementById('container').appendChild(sunLabel);
    
    // Store Sun data
    sun.userData = {
        name: "Sun",
        distance: 0,
        baseSpeed: 0,
        currentSpeed: 0,
        angle: 0,
        label: sunLabel
    };
    
    // Planet data (relative sizes and distances)
    const planetData = [
        { name: "Mercury", color: 0x8c8c8c, size: 0.4, distance: 15, speed: 1.6 },
        { name: "Venus", color: 0xe6c229, size: 0.6, distance: 20, speed: 1.2 },
        { name: "Earth", color: 0x3498db, size: 0.6, distance: 25, speed: 1 },
        { name: "Mars", color: 0xe74c3c, size: 0.5, distance: 30, speed: 0.8 },
        { name: "Jupiter", color: 0xf39c12, size: 1.2, distance: 40, speed: 0.4, hasRing: true, ringColor: 0xc2b280, ringSize: 1.5 },
        { name: "Saturn", color: 0xf1c40f, size: 1.0, distance: 50, speed: 0.3, hasRing: true, ringColor: 0xc2b280, ringSize: 2.0 },
        { name: "Uranus", color: 0x1abc9c, size: 0.8, distance: 60, speed: 0.2, hasRing: true, ringColor: 0x88aadd, ringSize: 1.3 },
        { name: "Neptune", color: 0x2980b9, size: 0.8, distance: 70, speed: 0.15, hasRing: true, ringColor: 0x5599cc, ringSize: 1.3 }
    ];
    
    // Create planets
    planetData.forEach(planet => {
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: planet.color,
            shininess: 5
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position planet at its orbital distance
        mesh.position.x = planet.distance;
        
        // Add to scene and celestialBodies object
        scene.add(mesh);
        celestialBodies[planet.name.toLowerCase()] = mesh;
        
        // Add rings for gas giants
        if (planet.hasRing) {
            const ringGeometry = new THREE.RingGeometry(planet.size * 1.2, planet.size * planet.ringSize, 64);
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: planet.ringColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7,
                specular: 0xffffff,
                shininess: 30
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            mesh.add(ring);
        }
        
        // Create complete orbit path (visible ring)
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x222222, // Darker color for orbits
            transparent: true,
            opacity: 0.5,    // Reduced opacity
            linewidth: 1
        });
        
        const points = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                planet.distance * Math.cos(theta),
                0,
                planet.distance * Math.sin(theta)
            ));
        }
        
        orbitGeometry.setFromPoints(points);
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
        
        // Create label element
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = planet.name;
        label.id = `label-${planet.name.toLowerCase()}`;
        document.getElementById('container').appendChild(label);
        
        // Store additional data on the mesh
        mesh.userData = {
            name: planet.name,
            distance: planet.distance,
            baseSpeed: planet.speed,
            currentSpeed: planet.speed,
            angle: Math.random() * Math.PI * 2,
            label: label,
            orbit: orbit
        };
        
        // Create speed control for each planet
        const planetControl = document.createElement('div');
        planetControl.className = 'planet-control';
        planetControl.dataset.planet = planet.name.toLowerCase();
        planetControl.innerHTML = `
            <div class="planet-control-header">
                <span>${planet.name}</span>
                <span class="planet-speed-value">${planet.speed.toFixed(1)}</span>
            </div>
            <input type="range" class="planet-speed" min="0" max="3" step="0.1" value="${planet.speed}">
        `;
        document.getElementById('planet-controls').appendChild(planetControl);
    });
    
    // Adjust controls container to prevent overflow
    const controlsContainer = document.getElementById('planet-controls');
    controlsContainer.style.maxHeight = `${window.innerHeight - 200}px`;
    controlsContainer.style.overflowY = 'auto';
    
    // Animation state
    let isPaused = false;
    let globalSpeed = 1;
    let hoveredPlanet = null;
    
    // Event listeners for controls
    document.getElementById('global-speed').addEventListener('input', (e) => {
        globalSpeed = parseFloat(e.target.value);
        document.getElementById('global-speed-value').textContent = globalSpeed.toFixed(1);
    });
    
    document.getElementById('pause-btn').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pause-btn').textContent = isPaused ? '▶' : '⏸';
    });
    
    document.getElementById('controls-toggle').addEventListener('click', () => {
        const controlsPanel = document.getElementById('controls');
        const toggleIcon = document.getElementById('controls-toggle');
        if (controlsPanel.style.display === 'none') {
            controlsPanel.style.display = 'block';
            toggleIcon.textContent = '▼ Controls';
        } else {
            controlsPanel.style.display = 'none';
            toggleIcon.textContent = '► Controls';
        }
    });
    
    // Delegate planet speed change events to the container
    document.getElementById('planet-controls').addEventListener('input', (e) => {
        if (e.target.classList.contains('planet-speed')) {
            const planetControl = e.target.closest('.planet-control');
            const planetName = planetControl.dataset.planet;
            const value = parseFloat(e.target.value);
            celestialBodies[planetName].userData.currentSpeed = value;
            
            // Update the displayed value
            planetControl.querySelector('.planet-speed-value').textContent = value.toFixed(1);
        }
    });
    
    // Mouse interaction for labels
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    window.addEventListener('mousemove', (event) => {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Adjust controls container height
        controlsContainer.style.maxHeight = `${window.innerHeight - 200}px`;
    });
    
    // Animation loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        
        if (!isPaused) {
            // Rotate the sun with a nice 3D effect
            sun.rotation.y += 0.005 * delta * 60;
            sunGlow.rotation.y += 0.002 * delta * 60; // Slightly different rotation for glow
            
            // Update planet positions
            Object.keys(celestialBodies).forEach(key => {
                const body = celestialBodies[key];
                if (body.userData && body.userData.distance > 0) { // Skip sun
                    // Update planet position
                    body.userData.angle += body.userData.currentSpeed * delta * globalSpeed * 0.1;
                    body.position.x = Math.cos(body.userData.angle) * body.userData.distance;
                    body.position.z = Math.sin(body.userData.angle) * body.userData.distance;
                    body.rotation.y += 0.01 * delta * 60;
                }
            });
        }
        
        // Update controls
        controls.update();
        
        // Raycasting for labels
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Object.values(celestialBodies));
        
        // Hide all labels first
        document.querySelectorAll('.planet-label').forEach(label => {
            label.style.display = 'none';
        });
        
        // Show label for intersected object
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.userData && obj.userData.label) {
                // Calculate screen position
                const vector = new THREE.Vector3();
                vector.setFromMatrixPosition(obj.matrixWorld);
                vector.project(camera);
                
                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
                
                obj.userData.label.style.left = `${x}px`;
                obj.userData.label.style.top = `${y}px`;
                obj.userData.label.style.display = 'block';
                
                // Highlight the corresponding control
                if (hoveredPlanet !== obj.userData.name.toLowerCase()) {
                    if (hoveredPlanet) {
                        document.querySelector(`.planet-control[data-planet="${hoveredPlanet}"]`)?.classList.remove('highlighted');
                    }
                    hoveredPlanet = obj.userData.name.toLowerCase();
                    document.querySelector(`.planet-control[data-planet="${hoveredPlanet}"]`)?.classList.add('highlighted');
                }
            }
        } else {
            if (hoveredPlanet) {
                document.querySelector(`.planet-control[data-planet="${hoveredPlanet}"]`)?.classList.remove('highlighted');
                hoveredPlanet = null;
            }
        }
        
        // Always show Sun label (but only if not hovering another planet)
        if (!hoveredPlanet || hoveredPlanet === 'sun') {
            const sunVector = new THREE.Vector3();
            sunVector.setFromMatrixPosition(sun.matrixWorld);
            sunVector.project(camera);
            const sunX = (sunVector.x * 0.5 + 0.5) * window.innerWidth;
            const sunY = (sunVector.y * -0.5 + 0.5) * window.innerHeight;
            sunLabel.style.left = `${sunX}px`;
            sunLabel.style.top = `${sunY}px`;
            sunLabel.style.display = 'block';
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
});