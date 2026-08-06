import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const DEFAULT_STATE: WindowState = {
  width: 1400,
  height: 900,
  isMaximized: false,
};

export class WindowStateStore {
  private filePath: string | null = null;
  private state: WindowState = DEFAULT_STATE;

  private getFilePath(): string {
    if (!this.filePath) {
      const userDataPath = app.getPath('userData');
      this.filePath = path.join(userDataPath, 'growxlabs-window-state.json');
    }
    return this.filePath;
  }

  public get(): WindowState {
    try {
      const fp = this.getFilePath();
      if (fs.existsSync(fp)) {
        const data = fs.readFileSync(fp, 'utf-8');
        const parsed = JSON.parse(data);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // Return default state on error
    }
    return DEFAULT_STATE;
  }

  public set(newState: Partial<WindowState>): void {
    this.state = { ...this.get(), ...newState };
    try {
      const fp = this.getFilePath();
      const dir = path.dirname(fp);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fp, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save window state:', err);
    }
  }
}
