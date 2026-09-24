const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});


// Amenities accordion
document.querySelectorAll('.amenity-row').forEach((row) => {
  row.addEventListener('click', () => {
    document.querySelectorAll('.amenity-row').forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-expanded', 'false');
      item.querySelector('.amenity-toggle').textContent = '+';
    });
    row.classList.add('active');
    row.setAttribute('aria-expanded', 'true');
    row.querySelector('.amenity-toggle').textContent = '×';
  });
});


// Reviews marquee: hovering the review strip pauses the continuous right-to-left loop.
const reviewsMarquee = document.querySelector('.reviews-marquee');
if (reviewsMarquee) {
  reviewsMarquee.addEventListener('mouseenter', () => reviewsMarquee.classList.add('is-paused'));
  reviewsMarquee.addEventListener('mouseleave', () => reviewsMarquee.classList.remove('is-paused'));
}


/* Home Final CTA — float the 3D feather upward before opening Enquiry. */
(function(){
  const enquireButton = document.querySelector('.final-cta-primary[href="cta.html"]');
  if (!enquireButton) return;

  let navigating = false;

  enquireButton.addEventListener('click', async (event) => {
    if (navigating) return;
    event.preventDefault();
    navigating = true;
    enquireButton.setAttribute('aria-disabled', 'true');

    try {
      if (typeof window.kanhaFeatherExit === 'function') {
        await window.kanhaFeatherExit();
      } else {
        await new Promise(resolve => setTimeout(resolve, 900));
      }
    } finally {
      document.body.classList.add('is-leaving');
      window.setTimeout(() => {
        window.location.assign('cta.html');
      }, 600);
    }
  });
})();


/* Final CTA — Three.js interactive peacock feather */
(function(){
  const host = document.getElementById('feather3d');
  if (!host) return;

  const moduleScript = document.createElement('script');
  moduleScript.type = 'module';
  moduleScript.textContent = `
    import * as THREE from 'https://esm.sh/three@0.160.0';
    import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

    const host = document.getElementById('feather3d');
    if (!host) throw new Error('3D feather host not found');

    const canvas = document.createElement('canvas');
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0.1, 0.05, 7.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    scene.add(new THREE.HemisphereLight(0xfff7e9, 0x33443d, 2.2));
    const key = new THREE.DirectionalLight(0xffe5b5, 3.4);
    key.position.set(3, 5, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8ad8d0, 1.8);
    fill.position.set(-4, 2, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffc86a, 1.6);
    rim.position.set(4, 1, -4);
    scene.add(rim);

    const group = new THREE.Group();
    group.rotation.z = -0.08;
    group.position.set(0.02, -0.23, 0);
    scene.add(group);

    const loader = new GLTFLoader();
    loader.load(
      'assets/kanha-peacock-feather.glb',
      (gltf) => {
        const model = gltf.scene;

        // Fit the feather to the CTA stage instead of relying on the GLB's raw units.
        // The source model is authored at a much larger scale than the web scene.
        const sourceBounds = new THREE.Box3().setFromObject(model);
        const sourceSize = new THREE.Vector3();
        const sourceCenter = new THREE.Vector3();
        sourceBounds.getSize(sourceSize);
        sourceBounds.getCenter(sourceCenter);
        const desiredHeight = 1.82;
        const fitScale = desiredHeight / Math.max(sourceSize.y, 0.001);
        model.scale.setScalar(fitScale);

        // Center the actual mesh after scaling so its size is predictable.
        const fittedBounds = new THREE.Box3().setFromObject(model);
        const fittedCenter = new THREE.Vector3();
        fittedBounds.getCenter(fittedCenter);
        model.position.x -= fittedCenter.x;
        model.position.y -= fittedCenter.y;
        model.position.z -= fittedCenter.z;

        model.rotation.y = -0.12;
        model.rotation.x = 0.02;
        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        group.add(model);
      },
      undefined,
      (err) => console.error('3D peacock feather failed to load:', err)
    );

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    host.addEventListener('pointermove', (event) => {
      const rect = host.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.32;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -0.20;
    });
    host.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });

    function resize(){
      const width = host.clientWidth || 600;
      const height = host.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    window.addEventListener('resize', resize, { passive:true });
    resize();

    const clock = new THREE.Clock();
    let exitProgress = 0;
    let exiting = false;
    let exitResolve = null;
    const ctaInner = document.querySelector('.final-cta-inner');
    const EXIT_DURATION = 1.45;
    const EXIT_START_Y = -0.23;
    const EXIT_END_Y = 0.47;
    const EXIT_START_Z = 0;
    const EXIT_END_Z = 0.18;

    // Public hook used by the Home CTA button. The feather now stays in the
    // right-side visual area and rises gently upward/forward, rather than
    // flying across the copy. The copy fades away underneath it.
    window.kanhaFeatherExit = function(){
      if (exiting) {
        return new Promise(resolve => { exitResolve = resolve; });
      }

      exiting = true;
      exitProgress = 0;
      targetX = 0;
      targetY = 0;
      ctaInner?.classList.add('feather-exit-active');

      return new Promise(resolve => {
        exitResolve = resolve;
      });
    };

    function easeInOutCubic(v){
      return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
    }

    function animate(){
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      if (exiting) {
        exitProgress = Math.min(exitProgress + (1 / 60) / EXIT_DURATION, 1);
        const eased = easeInOutCubic(exitProgress);

        // Float upward and slightly forward, with only a restrained rotation
        // and scale change so the feather remains elegant and recognizable.
        group.position.x = 0.02;
        group.position.y = EXIT_START_Y + (EXIT_END_Y - EXIT_START_Y) * eased;
        group.position.z = EXIT_START_Z + (EXIT_END_Z - EXIT_START_Z) * eased;
        group.rotation.y = currentX - (0.12 * eased);
        group.rotation.x = currentY + (0.06 * eased);
        group.rotation.z = -0.08 + (0.08 * eased);
        group.scale.setScalar(1 + (0.045 * eased));

        if (exitProgress >= 1 && exitResolve) {
          const resolve = exitResolve;
          exitResolve = null;
          resolve();
        }
      } else {
        group.rotation.y = currentX + Math.sin(t * 0.52) * 0.025;
        group.rotation.x = currentY + Math.sin(t * 0.75) * 0.012;
        group.rotation.z = -0.08 + Math.sin(t * 0.55) * 0.012;
        group.position.x = 0.02;
        group.position.y = -0.23 + Math.sin(t * 0.9) * 0.012;
        group.position.z = 0;
        group.scale.setScalar(1);
      }

      renderer.render(scene, camera);
    }
    animate();
  `;
  document.body.appendChild(moduleScript);
})();
