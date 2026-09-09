import { ArrowLeft } from "lucide-react";
import { GrowxArrowRight } from "@/components/icons";
import { Link } from "@/navigation";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata = {
  title: "Authenticity Intelligence — Deepfake Detection | GrowxLabs",
  description:
    "A machine intelligence system built to detect synthetic media and deepfakes, classifying images into Real, AI-Generated, and Deepfake.",
};

export default function AuthenticityIntelligencePage() {
  return (
    <div className="bg-black text-foreground min-h-screen">
      {/* ═══ PAGE HERO ═══ */}
      <PageHero
        title="Authenticity Intelligence"
        viewingText="AUTHENTICITY"
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
          <span>AI LAB / AUTHENTICITY INTELLIGENCE</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-24 md:space-y-32">
        
        {/* ══════════════════════════════════════════════════════════════════
            HERO PARAMETERS STRIP (Matching GrowX Crawl)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-8">
          <div className="space-y-4 max-w-4xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // APPLIED RESEARCH
            </span>
            <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl leading-relaxed font-normal max-w-3xl">
              A machine intelligence system built to verify whether an image is genuine, synthetic, or manipulated — classifying media into Real, AI-Generated, and Deepfake.
            </p>
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
            01 — OVERVIEW (Exact GrowX Crawl 2-Column Editorial Layout)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
                // 01 OVERVIEW
              </span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-[42px] text-foreground tracking-tight leading-[1.12]">
                Verifying digital authenticity from visual representations.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Authenticity Intelligence is a deepfake and synthetic media detection system developed inside GrowxLabs. It analyzes image inputs and categorizes each into one of three distinct classes: Real photos, AI-generated images, or manipulated deepfakes.
              </p>
              <p>
                Instead of searching for temporary generator artifacts that quickly become obsolete, the system uses foundation vision representations from DINOv2. By evaluating high-dimensional visual structure, it separates authentic camera captures from synthetic creations with 96.89% accuracy across a benchmark of 17,978 images.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            02 — SPECIFICATIONS (Exact GrowX Crawl Table Design)
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

          <div className="border border-neutral-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left divide-y divide-neutral-800">
              <thead className="bg-[#111114]">
                <tr>
                  <th className="px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500">Parameter</th>
                  <th className="px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-[#0A0A0D] text-sm">
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Vision Model</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">DINOv2 Vision Transformer (86M parameters)</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Latent Vector</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">768-D Feature Embedding</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Input Resolution</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">224 × 224 pixels</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Detection Classes</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">Real, AI-Generated, Deepfake (3 Classes)</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Benchmark Accuracy</td>
                  <td className="px-6 py-4 text-primary font-bold text-right font-mono">96.89%</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Macro F1 Score</td>
                  <td className="px-6 py-4 text-primary font-bold text-right font-mono">0.9688</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Real False Positive Rate</td>
                  <td className="px-6 py-4 text-neutral-400 text-right font-mono text-xs">0.048 (under 5%)</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Evaluation Dataset</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">17,978 verified images</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">3D Dimensional Projection</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">UMAP-3D &amp; PCA-3D real-time coordinate mapping</td>
                </tr>
                <tr className="hover:bg-[#111116] transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">Observatory Workstation</td>
                  <td className="px-6 py-4 text-neutral-400 text-right">3D coordinate inspection &amp; cluster analysis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            03 — FEATURES (Matching GrowX Crawl Quality)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-16 space-y-8">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary block">
              // 03 CAPABILITIES
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Core Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-7 sm:p-8 bg-[#0A0A0D] border border-neutral-800 rounded-xl space-y-3">
              <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                01 // CLASSIFICATION
              </span>
              <h3 className="text-foreground font-bold text-xl">3-Class Detection</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Accurately distinguishes between genuine camera captures, synthetically generated images, and modified face-swaps or deepfakes.
              </p>
            </div>

            <div className="p-7 sm:p-8 bg-[#0A0A0D] border border-neutral-800 rounded-xl space-y-3">
              <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                02 // VISUALIZATION
              </span>
              <h3 className="text-foreground font-bold text-xl">3D Cluster Analysis</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Projects image embeddings into an interactive 3D point cloud, revealing clear separation between authentic and synthetic media groups.
              </p>
            </div>

            <div className="p-7 sm:p-8 bg-[#0A0A0D] border border-neutral-800 rounded-xl space-y-3">
              <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                03 // VERIFICATION
              </span>
              <h3 className="text-foreground font-bold text-xl">Nearest-Neighbor Evidence</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Pairs every decision with the closest visual matches in the training dataset to provide clear, inspectable reference evidence.
              </p>
            </div>

            <div className="p-7 sm:p-8 bg-[#0A0A0D] border border-neutral-800 rounded-xl space-y-3">
              <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase block">
                04 // PRESENTATION
              </span>
              <h3 className="text-foreground font-bold text-xl">3D Narrative Experience</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A public interactive experience showing how multiple detection signals combine into unified authenticity intelligence.
              </p>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            04 — CLOSING CTA (Exact GrowX Crawl Closing Pattern)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-neutral-800 pt-20 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              Have questions about Authenticity Intelligence?
            </h2>
            <p className="text-muted-foreground text-base">
              Connect with GrowxLabs to learn more about our machine intelligence research and models.
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
