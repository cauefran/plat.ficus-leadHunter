import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';

@Component({
  selector: 'app-solutions',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,

})
export class SolutionsComponent {

}
