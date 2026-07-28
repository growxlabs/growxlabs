import { layerRepository } from "@/lib/repositories/editor/layer.repository";
import { documentRepository } from "@/lib/repositories/editor/document.repository";
import { LAYER_REGISTRY } from "@/lib/editor/registry/layerRegistry";
import { EditorLayer, EditorOperationPayload } from "@/types/editorContracts";

export class LayerService {
  async processBatchOperations(
    documentId: string,
    baseVersion: number,
    operations: EditorOperationPayload[]
  ): Promise<{ newVersion: number; updatedLayers: EditorLayer[] }> {
    const doc = await documentRepository.findById(documentId);
    if (!doc) {
      throw new Error("Document not found");
    }

    // Optimistic concurrency check
    if (doc.version !== baseVersion) {
      throw new Error(`EDITOR_VERSION_CONFLICT: Client base version ${baseVersion} does not match server version ${doc.version}`);
    }

    const updatedLayers: EditorLayer[] = [];

    for (const op of operations) {
      if (op.entityType === "layer" && op.entityId) {
        const existingLayer = await layerRepository.findById(op.entityId);
        if (!existingLayer) continue;

        // Apply property updates
        const updatedProps = {
          ...existingLayer.properties,
          ...(op.changes.properties || op.changes)
        };

        // Validate via Layer Registry if layerType is known
        const reg = LAYER_REGISTRY[existingLayer.layerType];
        if (reg && reg.propertySchema) {
          const parseResult = reg.propertySchema.safeParse(updatedProps);
          if (!parseResult.success) {
            console.warn(`Layer validation warning for ${existingLayer.id}:`, parseResult.error);
          }
        }

        const updates: Partial<EditorLayer> = {
          properties: updatedProps
        };

        if (op.changes.x !== undefined) updates.x = op.changes.x;
        if (op.changes.y !== undefined) updates.y = op.changes.y;
        if (op.changes.width !== undefined) updates.width = op.changes.width;
        if (op.changes.height !== undefined) updates.height = op.changes.height;
        if (op.changes.rotation !== undefined) updates.rotation = op.changes.rotation;
        if (op.changes.opacity !== undefined) updates.opacity = op.changes.opacity;
        if (op.changes.visible !== undefined) updates.visible = op.changes.visible;
        if (op.changes.locked !== undefined) updates.locked = op.changes.locked;

        const updated = await layerRepository.update(op.entityId, updates);
        updatedLayers.push(updated);
      }
    }

    // Increment document version atomically
    const newVersion = await documentRepository.incrementVersion(documentId, baseVersion);

    return {
      newVersion,
      updatedLayers
    };
  }
}

export const layerService = new LayerService();
