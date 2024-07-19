import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './feedback-modal.component.html',
  styleUrl: './feedback-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackModalComponent { }
