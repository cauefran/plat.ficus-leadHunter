import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentComponent } from './payment/payment.component';
import { UserStateService } from '../../services/user-state.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PlansComponent implements OnInit {

  @ViewChild('paymentRef', {static: true}) paymentRef!: ElementRef;

  public planCards: Array<any>;
  public planBenefits!: Array<any>;
  public textContent!: string;
  public isLogged: boolean = false;


  constructor(
    public matDialog: MatDialog,
    private _userService: UserStateService,
    private _router: Router,
  ){
    this.planCards = [
      {title: 'Gratuito', price: '-', bOne: '50 pesquisas', bTwo: '10 Resultados por pesquisa', bThree: 'Não pesquisa por sócio'},
      {title: 'Básico', price: '99.90', bOne: 'Pesquisas e resultados ilimitados', bTwo: 'Não exporta excel'},
      {title: 'Completo', price: '129.90', bOne: 'Ilimitado'},
    ]

  }

  ngOnInit(){
    console.log(window.paypal);
    this.isLogged = this._userService.returnUserStatus();
  }

  public openPaymentModal(element: any): void {
    if(this._userService.returnUserStatus()){
      console.log('element', element);
      this.matDialog.open(PaymentComponent, {data: element});
    } else {
      this._router.navigateByUrl('login');
    }
  }

}
