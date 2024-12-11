import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../../shared/modules/material.module';
import moment from 'moment';
import { DashboardService } from '../../../../../services/dashboard.service';
import { AuthService } from '../../../../../services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { IPgfn } from '../../../../../../shared/interfaces/pgfn.interface';
import { DebtTableComponent } from './components/debt-table/debt-table.component';
import { PgfnTableComponent } from './components/pgfn-table/pgfn-table.component';


@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class DetailsModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DetailsModalComponent>);
  public data = inject<any>(MAT_DIALOG_DATA);

  public userPath = '';
  public userSignatureSession = '';
  public activeDebt = new BehaviorSubject([]);
  public pgfnList = new BehaviorSubject(Array<IPgfn>);
  public pgfnListDisplay!: Array<IPgfn>;

  public socios: Array<any>;
  constructor(
    private _dashboardService: DashboardService,
    private _authService: AuthService,
    public _dialog: MatDialog,
  ) {
    this.socios = this.data.socios;
  }

  ngOnInit() {
    this.socios = this.data.socios;
    console.log('data details: ', this.data);
    console.log('this.socios: ', this.socios);
    this.getRequestsTimeStamp();
  }

  onClose(): void {
    this.dialogRef.close();
  }
  public formatPhone(phone: string): String{
    const first = phone.slice(0,4)
    const second = phone.slice(5)
    return `${first}-${second}`;
  }

  public getCompanyDebtDetails(): void {
    this.userPath = this._authService.userPath().length > 0 ? this._authService.userPath() : String(localStorage.getItem('PATH_USER'));
    const SessionSearchPath = `${this.userPath}/DividaAtiva/PegarParcelamentosDividaAtiva`;
    const userLoginData = this._authService.userLoginData().length > 0 ? this._authService.userLoginData() : String(localStorage.getItem('LOGIN_KEY'));
    this._authService.userSessionPath.set(SessionSearchPath);
    this._authService.generateUserSignatureSession(userLoginData);

    this._authService.userKey.subscribe((res) => {
      this.userSignatureSession = res;
    });

    console.log('CPJCNPJ: ', this.data?.cnpj);

    const dados = {
      cpfCnpj : this.data?.cnpj,
    }
    this._dashboardService.getParcelamentoDividaAtiva(dados, this.userPath, this.userSignatureSession).subscribe((res: any) => {
        if(!res){
          this.activeDebt.next([]);
          return;
        }
        this.activeDebt.next(res.result);
        console.log(' active debt', this.activeDebt.value);
    }, () => {
        this.activeDebt.next([]);
    })
  }
  public getCompanyPgfnList(): void {
    this.userPath = this._authService.userPath().length > 0 ? this._authService.userPath() : String(localStorage.getItem('PATH_USER'));
    const SessionSearchPath = `${this.userPath}/DividaAtiva/PegarValorListaPGFN`;
    const userLoginData = this._authService.userLoginData().length > 0 ? this._authService.userLoginData() : String(localStorage.getItem('LOGIN_KEY'));
    this._authService.userSessionPath.set(SessionSearchPath);
    this._authService.generateUserSignatureSession(userLoginData);

    this._authService.userKey.subscribe((res) => {
      this.userSignatureSession = res;
    });

    console.log('CPJCNPJ: ', this.data?.cnpj);

    const dados = {
      cpfCnpj : this.data?.cnpj,
    }
    this._dashboardService.getPgfn(dados, this.userPath, this.userSignatureSession).subscribe((res: any) => {
      if(!res){
        this.pgfnListDisplay = [];
        return;
      }
        this.pgfnList.next(res?.result);
        console.log('pgfn list', this.pgfnList.value);
        this.pgfnListDisplay = res?.result;
    }, () => {
      this.pgfnListDisplay = [];
    })
  }

  // public getSocios(): void {
  //   this.userPath = this._authService.userPath().length > 0 ? this._authService.userPath() : String(localStorage.getItem('PATH_USER'));
  //   const SessionSearchPath = `${this.userPath}/Empresa/PegarSocios`;
  //   const userLoginData = this._authService.userLoginData().length > 0 ? this._authService.userLoginData() : String(localStorage.getItem('LOGIN_KEY'));
  //   this._authService.userSessionPath.set(SessionSearchPath);
  //   this._authService.generateUserSignatureSession(userLoginData);

  //   this._authService.userKey.subscribe((res) => {
  //     this.userSignatureSession = res;
  //   });

  //   console.log('CPJCNPJ: ', this.data?.cnpj);

  //   const dados = {
  //     identificadorConsulta: '11222',
  //   }
  //   this._dashboardService.filterSocio(this.userPath, dados, this.userSignatureSession).subscribe((res: any) => {
  //     console.log('pgfn res: ', res);
  //   })
  // }

  public getRequestsTimeStamp(): void {
    this.getCompanyDebtDetails()
    setTimeout(() => {this.getCompanyPgfnList()}, 2500)
    // setTimeout(() => {this.getSocios()}, 3500)
  }

  public openDebtDialog(): void {
    this._dialog.open(DebtTableComponent, {
      data: this.activeDebt.value
    })
  }

  public openPgfnDialog(): void {
    this._dialog.open(PgfnTableComponent, {
      data: this.pgfnListDisplay
    })
  }
}
