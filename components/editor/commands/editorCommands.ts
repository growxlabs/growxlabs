import { EditorLayer, EditorOperationPayload } from "@/types/editorContracts";

export interface IEditorCommand {
  id: string;
  type: string;
  entityId: string;
  timestamp: number;
  execute(): EditorOperationPayload;
  getInverse(): IEditorCommand;
}

export class UpdateLayerPropertyCommand implements IEditorCommand {
  id: string;
  type = "layer.update";
  timestamp: number;

  constructor(
    public entityId: string,
    public changes: Record<string, any>,
    public previousValues: Record<string, any>
  ) {
    this.id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.timestamp = Date.now();
  }

  execute(): EditorOperationPayload {
    return {
      clientOperationId: this.id,
      type: this.type,
      entityType: "layer",
      entityId: this.entityId,
      changes: this.changes,
      inverseChanges: this.previousValues
    };
  }

  getInverse(): IEditorCommand {
    return new UpdateLayerPropertyCommand(
      this.entityId,
      this.previousValues,
      this.changes
    );
  }
}

export class MoveLayerCommand implements IEditorCommand {
  id: string;
  type = "layer.move";
  timestamp: number;

  constructor(
    public entityId: string,
    public newPos: { x: number; y: number },
    public prevPos: { x: number; y: number }
  ) {
    this.id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.timestamp = Date.now();
  }

  execute(): EditorOperationPayload {
    return {
      clientOperationId: this.id,
      type: this.type,
      entityType: "layer",
      entityId: this.entityId,
      changes: this.newPos,
      inverseChanges: this.prevPos
    };
  }

  getInverse(): IEditorCommand {
    return new MoveLayerCommand(this.entityId, this.prevPos, this.newPos);
  }
}
