import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';
import { UserStateService } from '../../../services/user-state.service';

@Component({
  selector: 'app-payment-feedback',
  standalone: true,
  imports: [],
  templateUrl: './payment-feedback.component.html',
  styleUrl: './payment-feedback.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PaymentFeedbackComponent {

  constructor(
    public paymentService: PaymentService,
    public userService: UserStateService,
  ){

  }

}
