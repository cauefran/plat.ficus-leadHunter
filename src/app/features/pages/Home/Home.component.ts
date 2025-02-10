import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlansComponent } from '../plans/plans.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    PlansComponent,
  ],
  templateUrl: './Home.component.html',
  styleUrl: './Home.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HomeComponent {

}
