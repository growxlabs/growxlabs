import { documentRepository } from "@/lib/repositories/editor/document.repository";
import { slideRepository } from "@/lib/repositories/editor/slide.repository";
import { layerRepository } from "@/lib/repositories/editor/layer.repository";
import { versionRepository } from "@/lib/repositories/editor/asset.repository";
import { LAYER_REGISTRY } from "@/lib/editor/registry/layerRegistry";
import { EditorBootstrapResponse, EditorDocument, LayerType } from "@/types/editorContracts";

export class DocumentService {
  async getBootstrapData(documentId: string, orgId: string): Promise<EditorBootstrapResponse | null> {
    const document = await documentRepository.findById(documentId, orgId);
    if (!document) return null;

    const slides = await slideRepository.findByDocumentId(documentId);
    const layers = await layerRepository.findByDocumentId(documentId);

    const layersBySlide: Record<string, any[]> = {};
    for (const slide of slides) {
      layersBySlide[slide.id] = layers.filter((l) => l.slideId === slide.id);
    }

    return {
      document,
      slides,
      layersBySlide,
      assets: [],
      permissions: {
        canEdit: true,
        canExport: true,
        canShare: true,
        role: "owner"
      },
      latestVersion: document.version
    };
  }

  async createNewDocument(orgId: string, userId: string, name?: string): Promise<EditorDocument> {
    const doc = await documentRepository.create({
      organisationId: orgId,
      name: name || "Untitled Editorial Carousel",
      createdBy: userId,
      updatedBy: userId
    });

    // Create 2 default slides
    const slide1 = await slideRepository.create({
      documentId: doc.id,
      name: "Cover Slide",
      position: 0
    });

    const slide2 = await slideRepository.create({
      documentId: doc.id,
      name: "Main Slide",
      position: 1
    });

    // Populate Slide 1 with default Editorial layers
    const defaultLayerTypes: { type: LayerType; name: string; y: number; height?: number }[] = [
      { type: "category", name: "Category Tag", y: 60, height: 30 },
      { type: "headline", name: "Headline Title", y: 110, height: 100 },
      { type: "featuredImage", name: "Featured Media", y: 240, height: 400 },
      { type: "body", name: "Body Text", y: 660, height: 120 },
      { type: "bullets", name: "Bullets List", y: 800, height: 160 },
      { type: "quote", name: "Quote Box", y: 980, height: 120 },
      { type: "cta", name: "CTA Button", y: 1120, height: 50 },
      { type: "footer", name: "Footer", y: 1280, height: 40 }
    ];

    let pos = 0;
    for (const item of defaultLayerTypes) {
      const reg = LAYER_REGISTRY[item.type];
      await layerRepository.create({
        documentId: doc.id,
        slideId: slide1.id,
        layerType: item.type,
        name: item.name,
        position: pos++,
        x: 72,
        y: item.y,
        width: 936,
        height: item.height || 60,
        visible: true,
        locked: false,
        properties: reg ? { ...reg.defaultProperties } : {}
      });
    }

    // Create initial snapshot version
    await versionRepository.create(doc.id, 1, userId, {
      document: doc,
      slideId: slide1.id
    }, "Initial document creation");

    return doc;
  }
}

export const documentService = new DocumentService();
