import { Injectable } from '@angular/core';
import { IToolsService } from '@shared/services/iTools.service';
import { Utilities } from '@shared/utilities/utilities';
import { iTools } from '@assets/tools/iTools';

export interface ISystemUpdate {
  _id?: string;
  title: string;
  message: string;
  requireCacheClear?: boolean;
  version?: string;
  enabled?: boolean; // if false, do not show
  createdAt?: any;
  createdBy?: any;
}

@Injectable({ providedIn: 'root' })
export class UpdatesService {
  constructor(private iToolsService: IToolsService) {}

  // Use a central project ('projects-manager') so all tenants see the same updates
  private managerCollection() {
    const manager = new iTools();
    manager.initializeApp({ projectId: 'projects-manager' });
    return { db: manager, coll: manager.database().collection('SystemUpdates') };
  }

  public async publish(update: ISystemUpdate): Promise<string> {
    const id = `upd_${Date.now()}`;
    const payload: ISystemUpdate = {
      _id: id,
      title: update.title?.trim(),
      message: update.message?.trim(),
      requireCacheClear: !!update.requireCacheClear,
      version: update.version || '',
      enabled: update.enabled !== false, // default true
      createdAt: new Date(),
      createdBy: Utilities.operator
    };

    const { db, coll } = this.managerCollection();
    const batch = db.database().batch();
    batch.update(coll.doc(id), payload, { merge: true });
    await batch.commit();
    try { await db.close(); } catch {}
    return id;
  }

  public async list(limit = 20): Promise<ISystemUpdate[]> {
    const { db, coll } = this.managerCollection();
    const res = await coll.orderBy({ createdAt: -1 }).limit(limit).get();
    try { await db.close(); } catch {}
    return res.docs.map((d: any) => d.data());
  }

  public async latest(): Promise<ISystemUpdate | null> {
    const { db, coll } = this.managerCollection();
    const res = await coll
      .where([{ field: 'enabled', operator: '=', value: true }])
      .orderBy({ createdAt: -1 })
      .limit(1)
      .get();
    const out = res.docs.length > 0 ? res.docs[0].data() : null;
    try { await db.close(); } catch {}
    return out;
  }

  public async delete(id: string): Promise<void> {
    const { db, coll } = this.managerCollection();
    const batch = db.database().batch();
    batch.delete(coll.doc(id));
    await batch.commit();
    try { await db.close(); } catch {}
  }

  // Per-tenant last seen helper
  public markSeen(id: string) {
    const key = this.seenKey();
    window.localStorage.setItem(key, id);
  }

  public lastSeen(): string {
    return window.localStorage.getItem(this.seenKey()) || '';
  }

  private seenKey(): string {
    const tenant = Utilities.projectId || 'global';
    return `LastSeenUpdate_${tenant}`;
  }
}
