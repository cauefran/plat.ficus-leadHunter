import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  public transactionId = new BehaviorSubject('');
  public isPaid = signal(false);


  constructor() { }

  public getTransactionId(id: string): void {
    this.transactionId.next(id);
  }
  public returnTransactionId(): string {
    return this.transactionId.value;
  }

}
