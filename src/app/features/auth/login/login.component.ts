import { CommonModule } from '@angular/common';
import { AfterContentChecked, ChangeDetectionStrategy, Component, OnChanges, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { sha256 } from 'js-sha256';
import { ILogin } from '../../../shared/interfaces/login.interface';
import { IServerNonce } from '../../../shared/interfaces/serverNonce.interface';
import { ISession } from '../../../shared/interfaces/session.interface';
import moment from 'moment';

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
  public hide: boolean = true;
  public systemNonce!: string;
  public clientNonce!: string;
  public encryptedPassword!: string;
  public errorMessage = '';
  public systemKey!: string;
  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
  ){
    this.form =  this._formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
    })
    
  }

  public get F_login (): AbstractControl { return this.form.get('login') as AbstractControl; }
  public get F_password (): AbstractControl { return this.form.get('password') as AbstractControl; }


  ngOnInit(){

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
    //Logar no sistema.
    //Logar usuário.
    const path = `retaguarda_prospect/usuarios/PegarUrlDoUsuario?usuarioOuEmail=${this.F_login.value}`;
    this._authService.path.next(path);
    this._authService.requestSystemLogin();
    setTimeout(() => {this.doLogin() }, 2500);
      // const salt = `salt${this.F_password.value}`;
      // const hashSalt = sha256(salt);
  }

  public doLogin(): void {
    //pegar url do user getUserUrl()
    //Usar URL retornada como path no método generateSystemSignatureSession(res, path);
    //fazer o processo de login do user, o mesmo do sistema.

    this._authService.systemKey.subscribe((res) => {
      console.log(res, 'res signature seassion');
      this.systemKey = res;

    });
    console.log(this.systemKey, 'this.systemKey');

    this._authService.getUserUrl(this.F_login.value, this.systemKey).subscribe((res) => {
     if(res){
      console.log('res getUserURL', res);
      const PATH = res?.result?.path;
      console.log('PATH getUserURL', PATH);

      //  this.goTo('dashboard');
       console.log('Sucesso');
       return;
     }
    }, () => {
      console.log('Deu Errado');
    });
  
  
  }

}
