import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, DoCheck, OnDestroy, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { AuthService } from '../../services/auth.service';
import { ICreateAccount } from '../../../shared/interfaces/createAccount/new-account.interface';
import { sha256 } from 'js-sha256';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../../../shared/modals/feedback-modal/feedback-modal.component';
import { ERequestResult } from '../../../shared/enums/request-result.enum';
@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxMaskDirective,
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent implements OnInit {
  public formError: any;
  public form: FormGroup;
  public systemKey!: string;
  public teste: any;
  hide = signal(true);
  errorMessage = signal('');

  isLinear = false;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog,
  ){
    this.form =  this._formBuilder.group({
      company: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)]],
      document: ['', [Validators.required, Validators.pattern('([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})')]],
    })

  }
  public get F_password (): AbstractControl { return this.form.get('password') as AbstractControl; }
  public get F_email (): AbstractControl { return this.form.get('email') as AbstractControl; }
  public get F_company (): AbstractControl { return this.form.get('company') as AbstractControl; }
  public get F_document (): AbstractControl { return this.form.get('document') as AbstractControl; }

  public ngOnInit() {
  }

  public clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  public goTo(page: string): void {
    this._router.navigateByUrl(page);
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();
    if(this.form.invalid){
      return;
    }
    this.requestSystemLogin();
  }
  public requestSystemLogin(): void {
    const path = 'retaguarda_prospect/usuarios/CadastrarUsuario';
    this._authService.path.next(path);
    this._authService.requestSystemLogin();
    const salt = `salt${this.F_password.value}`;
    const hashSalt = sha256(salt);
    const PAYLOAD = {
      cnpjCpf: this.F_document.value,
      email: this.F_email.value,
      senhaHashed: hashSalt,
      usuario: this.F_email.value
    } as ICreateAccount;
    this._authService.systemKey.subscribe((res) => {
      this.systemKey = res;
    });
    this.createAccount(PAYLOAD);
  }

  public createAccount(payload: any): void {
    setTimeout(() => {
      this._authService.createNewAccount(payload, this.systemKey).subscribe((res) => {
        if(res.result.ret !== ERequestResult.SUCCESS){
          this._dialog.open(FeedbackModalComponent, {
            data: {
              title: 'Erro!',
              text: 'Erro ao cadastrar Usuário! Verifique os dados e tente novamente'
            }
              });
              return;
        }
        this._dialog.open(FeedbackModalComponent, {
        data: {
          title: 'Sucesso!',
          ret: res.result.ret,
          aditionalText: 'Ao fechar você será redirecionado para o login',
          text: 'Usuário cadastrado com sucesso!'
        }
          }).afterClosed().subscribe(() =>{
            this.goTo('login');
          });
      }, () => {
        this._dialog.open(FeedbackModalComponent, {
          data: {
            title: 'Erro!',
            text: 'Erro ao cadastrar usuário! Tente mais tarde'
          }
            });
      });
    }, 2000)

  }


  public getErrorMessagePassword() {
    if (this.F_password.hasError('required')) {
      return 'Senha é obrigatório';
    }
    if (this.F_password.dirty && this.F_password.value.length < 6) {
      return 'Senha deve conter no mínimo 6 caracteres';
    }

    return this.F_password.hasError('password') ? 'Senha inválida' : '';
  }

  public getErrorMessageEmail() {
    if (this.F_email.hasError('required')) {
      return 'Email é obrigatório';
    }

    if(this.F_email.errors?.pattern){
      return 'Email inválido';
    }

    return this.F_email.hasError('email') ? 'Email inválido' : '';
  }

  public getErrorMessageDocument() {
    if (this.F_document.hasError('required')) {
      return 'Documento é obrigatório';
    }

    if(this.F_document.errors?.pattern){
      return 'Documento inválido';
    }

    return this.F_document.hasError('document') ? 'Documento inválido' : '';
  }

  public getErrorMessageUserName() {
    if (this.F_company.hasError('required')) {
      return 'Nome é obrigatório';
    }

    return this.F_company.hasError('company') ? 'Nome inválido' : '';
  }


}
