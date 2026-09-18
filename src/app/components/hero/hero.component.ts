import {
  Component,
  inject,
  signal,
  effect,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConsultationService } from '../../services/consultation.service';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { SamuelResultComponent } from '../samuel-result/samuel-result.component';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    DialogModule,
    SamuelResultComponent,
  ],
  templateUrl: './hero.component.html',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private zone       = inject(NgZone);
  modalService       = inject(ConsultationService);
  samuel             = inject(SamuelDiagnosisService);

  showDemoVideo = signal(false);
  freeText = '';

  @ViewChild('heroSection') heroSection!: ElementRef<HTMLElement>;
  @ViewChild('heroCanvas')  heroCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLDivElement>;

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mixer?: THREE.AnimationMixer;
  private clock = new THREE.Clock();

  // Model dimensions
  private modelMaxDim = 1.0;
  private modelHeight = 1.0;

  // Mapped animations
  private actions: { [key: string]: THREE.AnimationAction } = {};

  // Animation cycle state
  private anim1LoopCount = 0;
  private isGreeting = false;
  private readonly ANIM1_LOOPS_BEFORE_GREET = 3;
  private hasScrolledOut = false;
  private mixerLoopFn?: (e: any) => void;
  private mixerFinishedFn?: (e: any) => void;

  // Mouse parallax
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  // Cleanup refs
  private rafId: number | null = null;
  private onResizeFn?: () => void;
  private onMouseMoveFn?: (e: MouseEvent) => void;
  private resizeObserver?: ResizeObserver;
  private hasInitializedHome = false;

  constructor() {
    effect(() => {
      // Track reactive signals to auto-scroll chat
      this.samuel.messages();
      this.samuel.isThinking();
      this.samuel.showResult();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  /* ════════════════════════════════════
     Lifecycle
     ════════════════════════════════════ */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => {
      const nav = document.querySelector<HTMLElement>('.samts-nav');
      if (nav) {
        nav.style.transition = 'opacity .6s ease, transform .6s ease';
        nav.style.opacity = '1';
        nav.style.transform = 'translateY(0)';
      }

      this.initThree();
      this.setupMouseMoveListener();
      this.setupResizeListener();
      this.loadModel();
    });

    // Auto-start Samuel AI conversation directly on page load (only once)
    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      setTimeout(() => {
        this.samuel.startHome();
      }, 400);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /* ════════════════════════════════════
     Three.js Init
     ════════════════════════════════════ */
  private initThree(): void {
    const canvas = this.heroCanvasRef.nativeElement;
    const section = this.heroSection.nativeElement;

    const W = section.clientWidth  || window.innerWidth;
    const H = section.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    this.camera.position.set(0, 1.35, 2.8);
    this.camera.lookAt(-0.35, 1.1, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting setup for crisp character presentation
    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
    rimLight.position.set(-4, 4, -3);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 0.8);
    fillLight.position.set(0, -2, 3);
    this.scene.add(fillLight);

    // Start RAF render loop immediately so canvas stays alive and reactive
    this.startLoop();
  }

  /* ════════════════════════════════════
     Load GLB
     ════════════════════════════════════ */
  private loadModel(): void {
    const loader = new GLTFLoader();
    const urls = ['3d/SAMTS.glb', '/3d/SAMTS.glb', '3d/samts-character.glb'];
    let attempt = 0;

    const tryLoad = (url: string) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          model.traverse((node: any) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.material) {
                node.material.roughness = 0.35;
                node.material.metalness = 0.15;
              }
            }
          });

          // Center model at origin, normalize scale to target height (2.7 units)
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());

          const targetHeight = 2.7;
          const scale = targetHeight / (size.y || 1);
          model.scale.set(scale, scale, scale);

          // Re-calculate bounding box after scale
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

          model.position.x -= scaledCenter.x;
          model.position.z -= scaledCenter.z;
          model.position.y -= scaledBox.min.y;

          // Physical shift centered in the left open canvas area
          model.position.x = -0.35;

          // Rotate model to 3/4 side profile upright
          model.rotation.y = 0.35;

          this.modelMaxDim = 2.7;
          this.modelHeight = 2.7;

          this.scene.add(model);

          // Mixer + clips
          this.mixer = new THREE.AnimationMixer(model);
          this.mapClips(gltf.animations);

          // Camera fit
          this.fitCamera();

          // Setup repetition cycle (anim 1 loop -> anim 2 greet -> anim 1)
          this.setupAnimationCycle();
        },
        undefined,
        (err) => {
          console.warn(`[SAMTS] Could not load ${url}:`, err);
          if (++attempt < urls.length) {
            tryLoad(urls[attempt]);
          } else {
            console.error('[SAMTS] All model URLs failed.');
          }
        }
      );
    };

    tryLoad(urls[0]);
  }

  /* ════════════════════════════════════
     Map clips by index & name
     ════════════════════════════════════ */
  private mapClips(clips: THREE.AnimationClip[]): void {
    console.log('[SAMTS] GLB animations found:', clips.map((c, i) => `${i}: "${c.name}"`));
    if (clips.length === 0) return;

    let anim1Clip = clips[0];
    let anim2Clip = clips.length > 1 ? clips[1] : clips[0];
    let outroClip = clips.length > 2 ? clips[clips.length - 1] : anim2Clip;

    clips.forEach((clip) => {
      const clean = clip.name.replace(/^F\s+/, '').trim().toLowerCase();

      if (clean === 'animacion1' || clean === 'anim1' || clean === 'idle') {
        anim1Clip = clip;
      }

      if (
        clean === 'animacion1.001' ||
        clean === 'animacion2' ||
        clean === 'anim2' ||
        clean.includes('salud') ||
        clean.includes('greet') ||
        clean.includes('walk')
      ) {
        anim2Clip = clip;
      }

      if (clean === 'animacion4.002' || clean === 'animacion4' || clean.includes('outro')) {
        outroClip = clip;
      }
    });

    const act1 = this.mixer!.clipAction(anim1Clip);
    act1.loop = THREE.LoopRepeat;
    act1.enabled = true;

    const act2 = this.mixer!.clipAction(anim2Clip);
    act2.loop = THREE.LoopOnce;
    act2.clampWhenFinished = true;
    act2.enabled = true;

    const actOutro = this.mixer!.clipAction(outroClip);
    actOutro.loop = THREE.LoopOnce;
    actOutro.clampWhenFinished = true;
    actOutro.enabled = true;

    this.actions['anim1'] = act1;
    this.actions['anim2'] = act2;
    this.actions['outro'] = actOutro;

    // Legacy fallback aliases
    this.actions['idle'] = act1;
    this.actions['walk'] = act2;
  }

  /* ════════════════════════════════════
     Animation Cycle:
     Loop Animation 1 -> After N repetitions -> Trigger Animation 2 (Greeting) -> Back to Animation 1
     ════════════════════════════════════ */
  private setupAnimationCycle(): void {
    if (!this.mixer) return;

    const anim1 = this.actions['anim1'];
    const anim2 = this.actions['anim2'];
    if (!anim1 || !anim2) return;

    // Start with Animation 1 active at weight 1
    anim1.setEffectiveWeight(1);
    anim1.play();
    anim2.setEffectiveWeight(0);
    anim2.play();

    this.anim1LoopCount = 0;
    this.isGreeting = false;

    // Listener for loop repetitions of Anim 1
    this.mixerLoopFn = (e: any) => {
      if (this.hasScrolledOut || this.isGreeting) return;

      if (e.action === anim1) {
        this.anim1LoopCount++;
        console.log(`[SAMTS] Animación 1 repetición ${this.anim1LoopCount}/${this.ANIM1_LOOPS_BEFORE_GREET}`);

        if (this.anim1LoopCount >= this.ANIM1_LOOPS_BEFORE_GREET) {
          this.anim1LoopCount = 0;
          this.triggerGreet();
        }
      }
    };

    // Listener for completion of Anim 2 (Greeting)
    this.mixerFinishedFn = (e: any) => {
      if (e.action === anim2) {
        console.log('[SAMTS] Animación 2 (Saludo) completada. Volviendo a Animación 1.');
        this.returnToAnim1();
      }
    };

    this.mixer.addEventListener('loop', this.mixerLoopFn);
    this.mixer.addEventListener('finished', this.mixerFinishedFn);
  }

  private triggerGreet(): void {
    const anim1 = this.actions['anim1'];
    const anim2 = this.actions['anim2'];
    if (!anim1 || !anim2 || this.hasScrolledOut) return;

    this.isGreeting = true;

    anim2.reset();
    anim2.setEffectiveWeight(1);
    anim1.crossFadeTo(anim2, 0.4, true);
    anim2.play();
  }

  private returnToAnim1(): void {
    const anim1 = this.actions['anim1'];
    const anim2 = this.actions['anim2'];
    if (!anim1 || !anim2) return;

    if (this.hasScrolledOut) {
      this.isGreeting = false;
      return;
    }

    anim1.reset();
    anim1.setEffectiveWeight(1);
    anim2.crossFadeTo(anim1, 0.4, true);
    anim1.play();
    this.isGreeting = false;
  }

  /* ════════════════════════════════════
     Outro animation on scroll-out
     ════════════════════════════════════ */
  private setupScrollOut(): void {
    if (!this.heroSection) return;

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.heroSection.nativeElement,
      start: 'bottom 80%',
      onEnterBack: () => {
        if (this.hasScrolledOut) {
          this.hasScrolledOut = false;
          this.anim1LoopCount = 0;
          const outro = this.actions['outro'];
          const anim1 = this.actions['anim1'];
          if (outro && anim1) {
            anim1.reset();
            anim1.setEffectiveWeight(1);
            outro.crossFadeTo(anim1, 0.5, true);
            anim1.play();
          }
          this.isGreeting = false;
        }
      },
      onLeave: () => {
        this.triggerOutro();
      },
    });
  }

  private triggerOutro(): void {
    if (this.hasScrolledOut) return;
    this.hasScrolledOut = true;

    const outro = this.actions['outro'];
    const anim1 = this.actions['anim1'];
    const anim2 = this.actions['anim2'];

    if (!outro || !this.mixer) return;

    const current = this.isGreeting ? anim2 : anim1;
    if (current) {
      outro.reset();
      outro.setEffectiveWeight(1);
      current.crossFadeTo(outro, 0.5, true);
      outro.play();
    }
  }

  /* ════════════════════════════════════
     Render loop
     ════════════════════════════════════ */
  private startLoop(): void {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.05); // cap delta
      if (this.mixer) this.mixer.update(delta);
      this.animateCamera();
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  /* ════════════════════════════════════
     Camera — framed at normalized model (balanced scale)
     ════════════════════════════════════ */
  private fitCamera(): void {
    const section  = this.heroSection.nativeElement;
    const isMobile = window.innerWidth < 768;

    const W = section.clientWidth  || window.innerWidth;
    const H = section.clientHeight || window.innerHeight;

    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();

    // Camera framed at optimal balanced scale
    const camZ = isMobile ? 3.5 : 2.8;
    const camY = isMobile ? 1.2 : 1.35;
    const camX = 0;

    const targetX = isMobile ? 0 : -0.35;
    const targetY = 1.1;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(targetX, targetY, 0);

    // Always re-sync renderer size
    this.renderer.setSize(W, H);
  }

  private animateCamera(): void {
    if (!this.camera) return;

    const isMobile = window.innerWidth < 768;
    const camZ = isMobile ? 3.5 : 2.8;
    const camY = isMobile ? 1.2 : 1.35;
    const camX = 0;

    const targetX = isMobile ? 0 : -0.35;
    const targetY = 1.1;

    // Smooth mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const px = this.mouseX * 0.08;
    const py = this.mouseY * 0.08;

    // Lerp camera toward target
    this.camera.position.x += (camX + px - this.camera.position.x) * 0.07;
    this.camera.position.y += (camY + py - this.camera.position.y) * 0.07;
    this.camera.position.z += (camZ      - this.camera.position.z) * 0.07;
    this.camera.lookAt(targetX, targetY, 0);
  }

  /* ════════════════════════════════════
     Helpers
     ════════════════════════════════════ */
  private setupMouseMoveListener(): void {
    this.onMouseMoveFn = (e: MouseEvent) => {
      this.targetMouseX =  (e.clientX / window.innerWidth)  * 2 - 1;
      this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', this.onMouseMoveFn, { passive: true });
  }

  private setupResizeListener(): void {
    this.onResizeFn = () => {
      this.fitCamera();
    };
    window.addEventListener('resize', this.onResizeFn, { passive: true });

    if (typeof ResizeObserver !== 'undefined' && this.heroSection) {
      this.resizeObserver = new ResizeObserver(() => {
        this.fitCamera();
      });
      this.resizeObserver.observe(this.heroSection.nativeElement);
    }
  }

  /* ════════════════════════════════════
     Cleanup
     ════════════════════════════════════ */
  private cleanup(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);

    if (this.mixer) {
      if (this.mixerLoopFn) this.mixer.removeEventListener('loop', this.mixerLoopFn);
      if (this.mixerFinishedFn) this.mixer.removeEventListener('finished', this.mixerFinishedFn);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.onResizeFn)    window.removeEventListener('resize',    this.onResizeFn);
    if (this.onMouseMoveFn) window.removeEventListener('mousemove', this.onMouseMoveFn);

    this.scene?.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
    this.renderer?.dispose();
  }

  /* ─── Actions ─── */
  openConsultation(): void { this.modalService.open(); }
  playDemo(): void { this.showDemoVideo.set(true); }
  closeDemo(): void { this.showDemoVideo.set(false); }

  onQuickReply(value: string): void {
    this.samuel.submitAnswer(value);
  }

  onSendText(): void {
    const text = this.freeText.trim();
    if (!text) return;
    this.freeText = '';
    this.samuel.submitAnswer(text);
  }

  onWhatsApp(): void {
    const msg = encodeURIComponent(this.samuel.buildWhatsAppMessage());
    const phone = '573000000000'; // Configurable WhatsApp
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  onRequestQuote(): void {
    this.modalService.open();
  }

  onRestart(): void {
    this.samuel.restart();
  }

  onSelectSolution(plan: any): void {
    this.onRequestQuote();
  }

  private scrollToBottom(): void {
    if (this.messagesEl?.nativeElement) {
      const el = this.messagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
