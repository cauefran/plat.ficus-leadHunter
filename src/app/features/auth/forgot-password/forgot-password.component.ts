import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/modules/material.module';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ForgotPasswordComponent implements OnInit {
  public formError: any;
  public form: FormGroup;
  public error: string = '';

  constructor(
    private _formBuilder: FormBuilder,
  ){
    this.form =  this._formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)]],
      confirmEmail: ['', [Validators.required, Validators.email, Validators.pattern(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)]],
      document: ['', [Validators.required, Validators.pattern('([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})')]],
    })
  }

  // public get F_password (): AbstractControl { return this.form.get('password') as AbstractControl; }
  public get F_email (): AbstractControl { return this.form.get('email') as AbstractControl; }
  public get F_confirmEmail (): AbstractControl { return this.form.get('confirmEmail') as AbstractControl; }
  public get F_document (): AbstractControl { return this.form.get('document') as AbstractControl; }


  ngOnInit(): void {


  }

  ngAfterViewChecked(): void {
    this.checkConfirmEmail();

  }

  public checkConfirmEmail(): void {
    if(this.F_email.value && this.F_confirmEmail.valueChanges){
      if(this.F_confirmEmail.dirty && this.F_confirmEmail.value !== this.F_email.value){
        this.F_confirmEmail.invalid;
        this.error = 'Emails precisam ser identicos!'
      } else if(this.F_confirmEmail.value === this.F_email.value){
        this.F_confirmEmail.valid;
      }

    }
  }


}
