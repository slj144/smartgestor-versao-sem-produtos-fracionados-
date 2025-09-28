import { Component, OnInit } from '@angular/core';
import { UpdatesService, ISystemUpdate } from '@shared/services/updates.service';
import { Utilities } from '@shared/utilities/utilities';

@Component({
  selector: 'updates-banner',
  templateUrl: './updates-banner.component.html',
  styleUrls: ['./updates-banner.component.scss']
})
export class UpdatesBannerComponent implements OnInit {
  update: ISystemUpdate | null = null;
  visible = false;

  constructor(private updatesService: UpdatesService) {}

  async ngOnInit() {
    try {
      const latest = await this.updatesService.latest();
      if (!latest) return;
      const lastSeen = this.updatesService.lastSeen();
      this.update = latest;
      this.visible = latest._id !== lastSeen && !!latest.enabled;
    } catch {}
  }

  onClearCache() {
    // Clear caches and reload to ensure new assets
    Utilities.clearCache(true);
  }

  onDismiss() {
    if (this.update?._id) {
      this.updatesService.markSeen(this.update._id);
    }
    this.visible = false;
  }
}

