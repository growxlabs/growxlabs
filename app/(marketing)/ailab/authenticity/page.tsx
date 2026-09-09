import { ArrowLeft } from "lucide-react";
import { GrowxArrowRight, GrowxAuthenticity } from "@/components/icons";
import { Link } from "@/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { AIReadActions } from "@/components/marketing/AIReadActions";

export const metadata = {
  title: "Authenticity Intelligence — DINOv2 Deepfake Detection | GrowxLabs AI Lab",
  description:
    "A multi-tier machine intelligence system for multimodal digital authenticity and deepfake detection built on self-supervised DINOv2 vision representations.",
};

export default function AuthenticityIntelligencePage() {
  return (
    <div className="bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO ═══ */}
      <PageHero
        title="Authenticity Intelligence"
        viewingText="AUTHENTICITY"
        exploreText="RESEARCH"
        tagline="DINOV2 VISION"
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-4 border-t border-neutral-800/80">
        <Link
          href="/ailab"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>AI LAB / AUTHENTICITY INTELLIGENCE</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-24 md:space-y-32">
        
        {/* ══════════════════════════════════════════════════════════════════
            01 — HERO METADATA & PARAMETERS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10">
          <div className="space-y-4 max-w-4xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // APPLIED RESEARCH · MACHINE INTELLIGENCE
            </span>
            <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl leading-relaxed font-normal max-w-3xl">
              A multi-tier machine intelligence system for multimodal digital authenticity and deepfake detection — classifying media into Real, Synthetic, and Deepfake using self-supervised foundation representations.
            </p>
          </div>

          {/* Metadata Parameters Strip */}
          <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-8 sm:gap-14 font-mono text-xs tracking-wider">
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">BACKBONE</span>
              <span className="text-foreground font-bold uppercase">DINOv2-base (86M)</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">LATENT SPACE</span>
              <span className="text-foreground font-bold uppercase">768-D CLS Token</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">ACCURACY</span>
              <span className="text-primary font-bold">96.89%</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">MACRO F1</span>
              <span className="text-primary font-bold">0.9688</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">TEST DATASET</span>
              <span className="text-foreground font-bold uppercase">17,978 Images</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">STATUS</span>
              <span className="text-foreground font-bold uppercase">Research Active</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — OVERVIEW (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
                // 01 OVERVIEW
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-[42px] text-foreground tracking-tight leading-[1.12]">
                Detecting synthetic manipulation from representations.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Traditional deepfake detectors overfit to specific generation artifacts — subtle blur, pixel grids, or frequency signatures of particular GANs or diffusion models. When a new generator appears, these detectors fail.
              </p>
              <p>
                Our system takes a representation-first approach. We freeze Meta&apos;s self-supervised DINOv2 vision transformer (86M parameters) to extract general visual structure into a 768-dimensional embedding space. A minimalist linear head (only 2,307 trainable parameters) maps these embeddings into three distinct classes: <span className="text-foreground font-medium">Real</span>, <span className="text-foreground font-medium">AI-Generated</span>, and <span className="text-foreground font-medium">Deepfake</span> — reaching 96.89% accuracy while keeping representations general and resilient to unseen generators.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — SPECIFICATIONS TABLE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 02 SPECIFICATIONS
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Technical Parameters
            </h2>
          </div>

          <div className="border border-neutral-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left divide-y divide-neutral-800">
              <thead className="bg-[#111114]">
                <tr>
                  <th className="px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500">Parameter</th>
                  <th className="px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-right">Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-[#0A0A0D] text-sm">
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Backbone Architecture</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">facebook/dinov2-base (86M ViT, Frozen)</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Latent Representation</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">768-D CLS Token</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Classification Head</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">Linear(768 → 3), 2,307 parameters</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Target Classes</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Artificial (0), Deepfake (1), Real (2)</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Evaluation Accuracy</td>
                  <td className="px-6 py-4 text-primary font-bold text-right font-mono">96.89%</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Macro F1 Score</td>
                  <td className="px-6 py-4 text-primary font-bold text-right font-mono">0.9688</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Real False Positive Rate (FPR)</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">0.048</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Benchmark Dataset</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">17,978 Images (224×224 normalized)</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Dimensionality Reduction</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">UMAP-3D &amp; PCA-3D Real-Time Projection</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Observatory Workstation</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">React + Three.js / R3F + Zustand</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Public Foundation Story</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">Next.js + Three.js + GSAP ScrollTrigger</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — SYSTEM ARCHITECTURE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 03 SYSTEM ARCHITECTURE
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Representation Pipeline
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl font-mono">
              From raw media inputs to frozen latent vectors, classification logits, and 3D coordinate space.
            </p>
          </div>

          {/* Architecture Blueprint Card */}
          <div className="w-full bg-[#0A0A0D] border border-neutral-800 rounded-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* STEP 1 */}
              <div className="p-6 bg-[#0E0E12] border border-neutral-800/80 rounded-xl space-y-3">
                <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                  01 // INPUT
                </span>
                <h4 className="text-foreground font-bold text-base">Media Ingestion</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  224×224 normalized image frames. Preprocessed with standard ImageNet normalization.
                </p>
                <div className="pt-2">
                  <span className="font-mono text-[10px] text-neutral-600 uppercase">Shape: [3, 224, 224]</span>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="p-6 bg-[#0E0E12] border border-neutral-800/80 rounded-xl space-y-3">
                <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                  02 // BACKBONE
                </span>
                <h4 className="text-foreground font-bold text-base">Frozen DINOv2</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  86M parameter Vision Transformer (ViT-Base). Extracts 768-D CLS token representation without backprop.
                </p>
                <div className="pt-2">
                  <span className="font-mono text-[10px] text-neutral-600 uppercase">Frozen Weights</span>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="p-6 bg-[#0E0E12] border border-neutral-800/80 rounded-xl space-y-3">
                <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                  03 // HEAD &amp; PROJECTION
                </span>
                <h4 className="text-foreground font-bold text-base">Classification &amp; UMAP</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Linear head (768 → 3) outputs class probabilities. Parallel UMAP-3D/PCA maps to 3D coordinate space.
                </p>
                <div className="pt-2">
                  <span className="font-mono text-[10px] text-neutral-600 uppercase">2,307 Trainable Params</span>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="p-6 bg-[#0E0E12] border border-neutral-800/80 rounded-xl space-y-3">
                <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                  04 // OUTPUTS
                </span>
                <h4 className="text-foreground font-bold text-base">Two Surfaces</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Internal 3D Research Observatory for cluster analysis + Public Foundation Story cinematic narrative.
                </p>
                <div className="pt-2">
                  <span className="font-mono text-[10px] text-primary uppercase">Real · Artificial · Deepfake</span>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800/60 flex flex-wrap items-center justify-between text-xs font-mono text-neutral-500 gap-4">
              <span>INPUT → FROZEN TRANSFORMER → 768-D LATENT SPACE → 3-CLASS DECISION</span>
              <span className="text-primary">FROZEN REPRESENTATION SPACE · NO BACKPROP ON BACKBONE</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            05 — THE TWO SURFACES
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-12">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 04 PLATFORM SURFACES
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Two Operational Surfaces
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl font-mono">
              Scientific exploration internally, cinematic communication publicly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* SURFACE 1: RESEARCH OBSERVATORY */}
            <div className="border border-neutral-800 bg-[#0A0A0D] rounded-2xl p-8 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase block">
                  Internal Scientific Workstation
                </span>
                <h3 className="font-serif font-black text-2xl text-foreground tracking-tight">
                  DINOv2 Research Observatory
                </h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                An internal 3D analytical workstation built with React, Three.js, and Zustand for inspecting high-dimensional latent space behavior across training runs.
              </p>
              <div className="space-y-3 pt-2 font-mono text-xs text-neutral-400">
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>3D Manifold Point Cloud:</strong> 900 anchor embeddings rendered via GPU InstancedMesh with class color coding.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>Cluster Diagnostics:</strong> Real-time centroid tracking, cluster spread variance, and pairwise distance matrices.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>Topological Modes:</strong> Density scoring (kNN k=7) and cross-class boundary overlap analysis.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>Embedded CLI Terminal:</strong> Interactive command line for focus, filter, inspect, and projection control.</span>
                </div>
              </div>
            </div>

            {/* SURFACE 2: FOUNDATION STORY */}
            <div className="border border-neutral-800 bg-[#0A0A0D] rounded-2xl p-8 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase block">
                  Public Cinematic Narrative
                </span>
                <h3 className="font-serif font-black text-2xl text-foreground tracking-tight">
                  Foundation Story Platform
                </h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A public-facing 3D scroll-driven narrative that visualizes how multiple isolated authenticity signals converge into a unified intelligence foundation.
              </p>
              <div className="space-y-3 pt-2 font-mono text-xs text-neutral-400">
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>10-Stage Scroll Choreography:</strong> Natural scroll progress binding GSAP ScrollTrigger to camera spline waypoints.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>Custom GLSL Shaders:</strong> Hardware-accelerated vertex noise, drift, and spherical alpha falloff shaders.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>Signal Field Convergence:</strong> Modality clusters representing facial landmarks, audio spectrum, optical flow, and physiology.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">·</span>
                  <span><strong>Anomaly Wavefront:</strong> Dynamic cross-modal anomaly injection showing real-time confidence resolution.</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            06 — CLOSING CTA
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                GrowxLabs Machine Intelligence Lab
              </span>
              <p className="text-foreground font-bold text-lg">
                Interested in our machine intelligence research or representation models?
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#C0F0FB] text-black px-6 py-3.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors shrink-0"
            >
              <span>Get In Touch</span>
              <GrowxArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* AI Read Actions Component */}
        <AIReadActions />

      </main>
    </div>
  );
}
