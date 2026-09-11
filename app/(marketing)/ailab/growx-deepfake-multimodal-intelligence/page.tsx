import { ArrowLeft } from "lucide-react";
import { GrowxArrowRight } from "@/components/icons";
import { Link } from "@/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import Image from "next/image";

export const metadata = {
  title: "GrowX Deepfake — Multimodal Real-Time Detection | GrowxLabs",
  description:
    "A machine intelligence system built to detect synthetic media and deepfakes, classifying images into Real, AI-Generated, and Deepfake.",
};

interface TechSpec {
  parameter: string;
  detail: string;
  isHighlight?: boolean;
}

const TECH_SPECS: TechSpec[] = [
  { parameter: "Vision Model", detail: "DINOv2 Vision Transformer (86M parameters)" },
  { parameter: "Latent Vector", detail: "768-D Feature Embedding" },
  { parameter: "Input Resolution", detail: "224 × 224 pixels" },
  { parameter: "Detection Classes", detail: "Real, AI-Generated, Deepfake (3 Classes)" },
  { parameter: "Benchmark Accuracy", detail: "96.89%", isHighlight: true },
  { parameter: "Macro F1 Score", detail: "0.9688", isHighlight: true },
  { parameter: "Real False Positive Rate", detail: "0.048 (under 5%)" },
  { parameter: "Evaluation Dataset", detail: "17,978 verified images" },
  { parameter: "3D Dimensional Projection", detail: "UMAP-3D & PCA-3D real-time coordinate mapping" },
  { parameter: "Observatory Workstation", detail: "3D coordinate inspection & cluster analysis" },
];

export default function GrowXDeepfakePage() {
  return (
    <div className="bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO ═══ */}
      <PageHero
        title="GrowX Deepfake"
        viewingText="GROWX DEEPFAKE"
        exploreText="RESEARCH"
        tagline="MACHINE INTELLIGENCE"
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 pb-4 border-t border-neutral-800/80">
        <Link
          href="/ailab"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>AI LAB / GROWX DEEPFAKE</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-24 md:space-y-32">
        
        {/* ══════════════════════════════════════════════════════════════════
            HERO PARAMETERS STRIP
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block shrink-0 pt-1">
              // APPLIED RESEARCH
            </span>
            <div className="max-w-xl">
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed font-normal">
                A real-time security layer running directly on your device to verify whether the person you are speaking with on video calls is genuinely human.
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-8 sm:gap-14 font-mono text-xs tracking-wider">
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">PROJECT</span>
              <span className="text-foreground font-bold uppercase">Deepfake Detection</span>
            </div>
            <div>
              <span className="text-muted-foreground/60 block text-[10px] uppercase">BACKBONE</span>
              <span className="text-foreground font-bold uppercase">DINOv2 (86M)</span>
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
            01 — OVERVIEW (2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
                // 01 OVERVIEW
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-[42px] text-foreground tracking-tight leading-[1.12]">
                An antivirus for video calls and digital identity.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              <p>
                This project is building a real-time security layer—like an antivirus for video calls—that runs directly on your device to verify whether the person you are looking at and speaking with is genuinely human.
              </p>
              <p>
                Instead of simply guessing from pictures, it continuously checks real-world physical rules that AI cannot easily fake, such as whether the face naturally moves with the skull bone, how skin reflects light, and whether spoken words match exact lip movements. Its purpose is to run quietly in the background during video calls, online banking, job interviews, and dating apps, instantly alerting you if someone is using a face swap, cloned voice, or synthetic avatar to impersonate a person.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — SPECIFICATIONS (Clean Editorial Table)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 02 SPECIFICATIONS
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Technical Specifications
            </h2>
          </div>

          <div className="border-y border-neutral-800 divide-y divide-neutral-800/80">
            <div className="py-3.5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <span>Parameter</span>
              <span className="text-right">Detail</span>
            </div>
            {TECH_SPECS.map((spec) => (
              <div
                key={spec.parameter}
                className="py-4 sm:py-4.5 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.02]"
              >
                <span className="text-foreground font-medium text-sm sm:text-base">
                  {spec.parameter}
                </span>
                <span
                  className={`text-sm sm:text-base text-right ${
                    spec.isHighlight ? "text-primary font-bold font-mono" : "text-neutral-400"
                  }`}
                >
                  {spec.detail}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — ARCHITECTURE (System Architecture Schematic)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 03 ARCHITECTURE
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              System Architecture Schematic
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              An end-to-end multi-stage neural pipeline from live biometric ingestion to 768-D latent projection, 3D manifold learning, and real-time 3-class probabilistic verification.
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-neutral-800/80 bg-[#07070A] overflow-hidden shadow-2xl">
            {/* Window Header */}
            <div className="h-10 px-4 bg-[#0E0E14] border-b border-neutral-800/80 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-white/10 font-mono text-[11px] sm:text-xs text-neutral-300">
                <span className="text-neutral-500">growx/</span>
                <span className="text-foreground font-semibold">deepfake-architecture</span>
              </div>
              <div className="font-mono text-[10px] text-neutral-400">
                <span className="text-primary font-bold">v2.1 SCHEMATIC</span>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="relative aspect-[16/9] w-full bg-[#04060C]">
              <Image
                src="/images/ailab/deepfake-architecture.png"
                alt="GrowX Deepfake AI Detection Platform — End-to-End System Architecture Schematic"
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain p-2 sm:p-4"
                priority
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — FEATURES (Clean Border-Divided Columns — No Boxed Cards)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-12">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 04 FEATURES
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Core Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-neutral-800/80">
            {/* Feature 1 */}
            <div className="space-y-3 md:pr-8">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary block">
                01 / DETECTION
              </span>
              <h3 className="font-serif font-bold text-2xl text-foreground">
                3-Class Verification
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Accurately separates authentic camera captures from fully synthetic AI creations and targeted face-swaps or deepfakes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3 pt-8 md:pt-0 md:px-8">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary block">
                02 / VISUALIZATION
              </span>
              <h3 className="font-serif font-bold text-2xl text-foreground">
                3D Embedding Manifold
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Maps high-dimensional representations into 3D coordinate space, revealing clear spatial separation between authentic and synthetic clusters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3 pt-8 md:pt-0 md:pl-8">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary block">
                03 / EVIDENCE
              </span>
              <h3 className="font-serif font-bold text-2xl text-foreground">
                Nearest-Neighbor Proof
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pairs every classification outcome with the closest matching images from training benchmarks to ground decisions in verifiable visual evidence.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            05 — CLOSING CTA
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-20 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Have questions about GrowX Deepfake?
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Reach out to test our models, review live benchmarks, or integrate real-time call verification into your product.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all shadow-md group"
            >
              <span>Contact GrowxLabs</span>
              <GrowxArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
