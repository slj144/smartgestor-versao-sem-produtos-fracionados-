import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PendingActivitiesService } from '@shared/services/pending-activities.service';
import { Utilities } from '@shared/utilities/utilities';

@Component({
    selector: 'activity-bell',
    templateUrl: './activity-bell.component.html',
    styleUrls: ['./activity-bell.component.scss']
})
export class ActivityBellComponent implements OnInit {
    public pendingActivities: any[] = [];
    public showList = false;

    constructor(
        private pendingService: PendingActivitiesService,
        private router: Router
    ) { }
    ngOnInit(): void {
        this.pendingService.pendingActivities$.subscribe((acts) => {
            this.pendingActivities = acts;
        });
    }

    toggleList(): void {
        this.showList = !this.showList;
    }

    view(activityId: string): void {
        // Fechar a lista e navegar para a tela de atividades
        this.showList = false;
        this.router.navigate([
            `/${Utilities.projectId}/crm/atividades`
        ], { queryParams: { atividade: activityId } });
        this.showList = false;
    }
}