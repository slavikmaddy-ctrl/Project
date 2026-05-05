const Empire3D = {
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    mouse: { x: 0, y: 0 },
    targetMouse: { x: 0, y: 0 },
    
    initHeroVisualizer() {
        const container = document.querySelector('.hero-section, section.relative.h-screen');
        if (!container) return;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'hero-canvas';
        container.insertBefore(canvas, container.firstChild);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.camera.position.z = 30;
        
        this.rings = [];
        const ringCount = 5;
        
        for (let i = 0; i < ringCount; i++) {
            const geometry = new THREE.TorusGeometry(5 + i * 3, 0.1, 16, 100);
            const material = new THREE.MeshBasicMaterial({ 
                color: i % 2 === 0 ? 0xffffff : 0xdc2626,
                transparent: true,
                opacity: 0.3 - (i * 0.05),
                wireframe: true
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { 
                originalScale: 1, 
                speed: 0.02 + i * 0.01,
                offset: i * 1.5
            };
            this.scene.add(ring);
            this.rings.push(ring);
        }
        
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 50;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
        
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.animateHero();
    },
    
    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    animateHero() {
        if (!this.renderer) return;
        
        requestAnimationFrame(() => this.animateHero());
        
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        
        const time = Date.now() * 0.001;
        
        this.rings.forEach((ring, i) => {
            ring.rotation.z += ring.userData.speed;
            
            const pulse = Math.sin(time * 2 + ring.userData.offset) * 0.5 + 0.5;
            const scale = ring.userData.originalScale + pulse * 0.2;
            ring.scale.set(scale, scale, scale);
            
            ring.position.x = this.mouse.x * 2;
            ring.position.y = this.mouse.y * 2;
            
            ring.material.opacity = (0.3 - (i * 0.05)) * (0.5 + pulse * 0.5);
        });
        
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x = this.mouse.y * 0.2;
        }
        
        this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);
        
        this.renderer.render(this.scene, this.camera);
    },

    
    initProductCards() {
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            card.classList.add('product-3d-container');
            const inner = card.querySelector('.relative') || card.firstElementChild;
            if (inner) inner.classList.add('product-3d-card');
            
            card.addEventListener('mousemove', (e) => this.onCardMove(e, card));
            card.addEventListener('mouseleave', () => this.onCardLeave(card));
        });
    },
    
    onCardMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        const inner = card.querySelector('.product-3d-card');
        if (inner) {
            inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }
    },
    
    onCardLeave(card) {
        const inner = card.querySelector('.product-3d-card');
        if (inner) {
            inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        }
    },

    
    initFooterParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        document.body.appendBefore(canvas, document.body.firstChild);
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.4), 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        camera.position.z = 30;
        
        const noteCount = 15;
        const notes = [];
        const noteShapes = [
            new THREE.TorusGeometry(0.5, 0.2, 8, 16),
            new THREE.OctahedronGeometry(0.6),
            new THREE.ConeGeometry(0.4, 0.8, 4)
        ];
        
        for (let i = 0; i < noteCount; i++) {
            const geometry = noteShapes[Math.floor(Math.random() * noteShapes.length)];
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xffffff : 0xdc2626,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.3,
                wireframe: true
            });
            
            const note = new THREE.Mesh(geometry, material);
            note.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            note.userData = {
                speedY: 0.02 + Math.random() * 0.03,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                wobble: Math.random() * Math.PI * 2
            };
            
            scene.add(note);
            notes.push(note);
        }
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            notes.forEach(note => {
                note.position.y += note.userData.speedY;
                note.rotation.x += note.userData.rotationSpeed;
                note.rotation.y += note.userData.rotationSpeed;
                
                // Колебания
                note.position.x += Math.sin(Date.now() * 0.001 + note.userData.wobble) * 0.02;
                
                // Перемещаем вниз если ушли вверх
                if (note.position.y > 15) {
                    note.position.y = -15;
                    note.position.x = (Math.random() - 0.5) * 60;
                }
            });
            
            renderer.render(scene, camera);
        };
        
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / (window.innerHeight * 0.4);
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
        });
    },

    
    initGlitchEffect() {
        const logo = document.querySelector('h1.animate-pulse, .preloader-title');
        if (!logo) return;
        
        logo.setAttribute('data-text', logo.textContent);
        logo.classList.add('glitch-text');
        
        // Случайный глитч
        setInterval(() => {
            if (Math.random() > 0.95) {
                logo.style.animation = 'none';
                logo.offsetHeight; // Trigger reflow
                logo.style.animation = '';
            }
        }, 3000);
    },

    
    init() {
        if (!this.checkWebGL()) {
            console.log('WebGL not supported, skipping 3D effects');
            return;
        }
        
        this.initHeroVisualizer();
        this.initProductCards();
        this.initFooterParticles();
        this.initGlitchEffect();
        
        console.log('🎨 EMPIRE 3D effects initialized');
    },
    
    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        Empire3D.init();
    }, 1000);
});

window.Empire3D = Empire3D;

Стили:
#hero-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    opacity: 0.6;
}

#hero-canvas.interactive {
    pointer-events: auto;
}

.product-3d-container {
    position: relative;
    transform-style: preserve-3d;
    perspective: 1000px;
}

.product-3d-card {
    transition: transform 0.1s ease-out;
    transform-style: preserve-3d;
}

.product-3d-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        105deg,
        transparent 40%,
        rgba(255, 255, 255, 0.1) 45%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.1) 55%,
        transparent 60%
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
    pointer-events: none;
    border-radius: inherit;
}

.product-3d-card:hover::before {
    transform: translateX(100%);
}

#particles-canvas {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40vh;
    z-index: -1;
    pointer-events: none;
    opacity: 0.4;
}

.glitch-text {
    position: relative;
}

.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch-text::before {
    animation: glitch-1 2s infinite linear alternate-reverse;
    color: #dc2626;
    z-index: -1;
}

.glitch-text::after {
    animation: glitch-2 3s infinite linear alternate-reverse;
    color: #00ffff;
    z-index: -2;
}

@keyframes glitch-1 {
    0%, 100% { clip-path: inset(0 0 95% 0); transform: translate(-2px, -2px); }
    20% { clip-path: inset(30% 0 50% 0); transform: translate(2px, 2px); }
    40% { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 2px); }
    60% { clip-path: inset(10% 0 80% 0); transform: translate(2px, -2px); }
    80% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 2px); }
}

@keyframes glitch-2 {
    0%, 100% { clip-path: inset(95% 0 0 0); transform: translate(2px, 2px); }
    20% { clip-path: inset(50% 0 30% 0); transform: translate(-2px, -2px); }
    40% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -2px); }
    60% { clip-path: inset(80% 0 10% 0); transform: translate(-2px, 2px); }
    80% { clip-path: inset(5% 0 80% 0); transform: translate(2px, -2px); }
}

@keyframes preloader-spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes preloader-spin-reverse {
    to { transform: translate(-50%, -50%) rotate(-360deg); }
}

@keyframes preloader-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
}
