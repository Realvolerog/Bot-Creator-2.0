// Service for tracking, logging, and inspecting all network payloads and responses

export interface NetworkPayloadLog {
  id: string;
  timestamp: string; // e.g. "12:05:32"
  fullDate: string; // ISO string
  endpoint: string;
  label: string;
  method: string;
  payload: any;
  response?: any;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  errorMessage?: string;
  durationMs?: number;
}

const MAX_LOGS = 60;
const STORAGE_KEY = 'protalk_payload_logs';

class PayloadLoggerService {
  private logs: NetworkPayloadLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.logs = JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn('Failed to load payload logs from sessionStorage', e);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Keep storage size reasonable
        const toSave = this.logs.slice(0, 30);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch (e) {
      console.warn('Failed to save payload logs to sessionStorage', e);
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in payload logger listener', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public logRequest(entry: {
    endpoint: string;
    label: string;
    method?: string;
    payload: any;
  }): string {
    const now = new Date();
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timeStr = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Deep clone payload to avoid mutation issues
    let safePayload: any = null;
    try {
      safePayload = entry.payload ? JSON.parse(JSON.stringify(entry.payload)) : null;
    } catch {
      safePayload = entry.payload;
    }

    const newLog: NetworkPayloadLog = {
      id,
      timestamp: timeStr,
      fullDate: now.toISOString(),
      endpoint: entry.endpoint,
      label: entry.label,
      method: (entry.method || 'POST').toUpperCase(),
      payload: safePayload,
      status: 'pending',
    };

    // Newest on top
    this.logs.unshift(newLog);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    this.saveToStorage();
    this.notify();
    return id;
  }

  public updateLog(
    id: string,
    update: {
      status?: 'pending' | 'success' | 'error';
      statusCode?: number;
      response?: any;
      errorMessage?: string;
      durationMs?: number;
    }
  ) {
    const item = this.logs.find((l) => l.id === id);
    if (!item) return;

    if (update.status !== undefined) item.status = update.status;
    if (update.statusCode !== undefined) item.statusCode = update.statusCode;
    if (update.errorMessage !== undefined) item.errorMessage = update.errorMessage;
    if (update.durationMs !== undefined) item.durationMs = update.durationMs;

    if (update.response !== undefined) {
      try {
        item.response = JSON.parse(JSON.stringify(update.response));
      } catch {
        item.response = update.response;
      }
    }

    this.saveToStorage();
    this.notify();
  }

  public getLogs(): NetworkPayloadLog[] {
    return [...this.logs];
  }

  public getLatestLog(): NetworkPayloadLog | null {
    return this.logs[0] || null;
  }

  public clearLogs() {
    this.logs = [];
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }
}

export const payloadLogger = new PayloadLoggerService();
