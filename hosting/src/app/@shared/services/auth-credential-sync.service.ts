import { Injectable } from '@angular/core';
import * as cryptojs from 'crypto-js';

import { IToolsService } from './iTools.service';

@Injectable({ providedIn: 'root' })
export class AuthCredentialSyncService {
  constructor(private readonly iToolsService: IToolsService) {}

  public async ensureSupportAccount(email: string, password: string): Promise<void> {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password ?? '').toString().trim();

    if (!normalizedEmail || !normalizedPassword) {
      return;
    }

    try {
      await this.iToolsService.ready();
      const passwordHash = cryptojs.SHA256(normalizedPassword).toString();
      const authCollection = this.iToolsService.database().collection('#SYSTEM_AUTHENTICATE#');
      const existing = await authCollection
        .where([{ field: 'email', operator: '=', value: normalizedEmail }])
        .limit(1)
        .get();

      if (!existing.docs.length) {
        await authCollection.doc().update({
          email: normalizedEmail,
          password: passwordHash
        });
        return;
      }

      const currentData = existing.docs[0].data();
      if (currentData?.password !== passwordHash) {
        await authCollection.doc(existing.docs[0].id).update({ password: passwordHash });
      }
    } catch (error) {
      console.warn('[AuthCredentialSyncService] ensureSupportAccount error:', error);
    }
  }

  public async persistAuthHash(email: string, plainPassword: string): Promise<void> {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (plainPassword ?? '').toString().trim();

    if (!normalizedEmail || !normalizedPassword) {
      return;
    }

    try {
      await this.iToolsService.ready();
      const passwordHash = cryptojs.SHA256(normalizedPassword).toString();
      const authCollection = this.iToolsService.database().collection('#SYSTEM_AUTHENTICATE#');
      const existing = await authCollection
        .where([{ field: 'email', operator: '=', value: normalizedEmail }])
        .limit(1)
        .get();

      if (!existing.docs.length) {
        await authCollection.doc().update({
          email: normalizedEmail,
          password: passwordHash
        });
        return;
      }

      const currentData = existing.docs[0].data();
      if (currentData?.password !== passwordHash) {
        await authCollection.doc(existing.docs[0].id).update({ password: passwordHash });
      }
    } catch (error) {
      console.error('[AuthCredentialSyncService] persistAuthHash error:', error);
    }
  }
}
