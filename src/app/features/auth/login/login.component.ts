import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../../../shared/modals/feedback-modal/feedback-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public loggedIn!: boolean;
  public loading = signal(false)
  public hide: boolean = true;
  public systemNonce!: string;
  public clientNonce!: string;
  public encryptedPassword!: string;
  public errorMessage = '';
  public systemKey!: string;
  hidePassword = signal(true);
  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog,
  ){
    this.form =  this._formBuilder.group({
      login: ['', [Validators.required, Validators.email, Validators.pattern(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)]],
      password: ['', [Validators.required]],
    })

  }

  public get F_login (): AbstractControl { return this.form.get('login') as AbstractControl; }
  public get F_password (): AbstractControl { return this.form.get('password') as AbstractControl; }


  ngOnInit(){

  }

  ngAfterViewChecked(): void {
    if(this.loading()){
      this.form.disable();
    } else if(!this.loading()){
      this.form.enable();
    }
  }

  ngDoCheck(): void {
    this.listenToLoading()
  }


  public clickEvent(event: MouseEvent) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }

  public goTo(page: string): void {
    this._router.navigateByUrl(page);
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.requestSystemLogin();
  }

  public requestSystemLogin(): void {
    this._authService.loading.next(true);
    const path = `retaguarda_prospect/usuarios/PegarUrlDoUsuario?usuarioOuEmail=${this.F_login.value}`;
    this._authService.path.next(path);
    this._authService.requestSystemLogin();
    setTimeout(() => {this.doLogin() }, 2500);
  }

  public listenToLoading(): void {
    this._authService.loading.subscribe((res) => this.loading.set(res));
    }

    public doLogin(): void {
    this._authService.systemKey.subscribe((res) => {
      this.systemKey = res;
    });

    this._authService.getUserUrl(this.F_login.value, this.systemKey).subscribe((res) => {
      if(res){
      const PATH = res?.result?.info.url;
      const USER = res?.result?.info.usuario;
      localStorage.setItem('PATH_USER', PATH);
      this._authService.userPath.set(PATH);

      const payloadUserLogin = {
        user: USER,
        password: this.F_password.value,
        path: PATH,
      }
      setTimeout(() => {this._authService.requestUserLogin(payloadUserLogin);
      }, 1500);
    }
    }, () => {
      this._dialog.open(FeedbackModalComponent, {
        data: {
          title: 'Erro!',
          text: 'Erro ao logar Usuário!',
          aditionalText:' Verifique os dados e tente novamente.'
        }
          }).afterClosed().subscribe(() => {
            this.loading.set(false);
          });
    });
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


  public getErrorMessageLogin() {
    if (this.F_login.hasError('required')) {
      return 'Email é obrigatório';
    }

    if(this.F_login.errors?.pattern){
      return 'Email inválido';
    }

    return this.F_login.hasError('email') ? 'Email inválido' : '';
  }



}
