import {AfterViewChecked, ChangeDetectionStrategy, Component, DoCheck, Inject, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../../shared/modules/material.module';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthService } from '../../../../features/services/auth.service';
import { UserStateService } from '../../../../features/services/user-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthService],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  viewProviders: [AuthService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HeaderComponent implements OnInit, DoCheck, AfterViewChecked {

  public hidden: boolean = false;
  public userName = '';
  public isLogged: boolean;
  public user: any;
  public userStatus: boolean = false;
  public localStorage: any;
  // public userState: Observable<any>;
  constructor(
    private _router: Router,
    private _authService: AuthService,
    @Inject(DOCUMENT) private _document: Document,
    public userStateService: UserStateService,
  ) {
    this.localStorage = this._document.defaultView?.localStorage;
    this.isLogged = this.userStateService.returnUserStatus();
  }

  ngOnInit() {
  }

  ngAfterViewChecked(): void {
    this.isLogged = this.userStateService.returnUserStatus();
  }

  ngDoCheck(): void {
    this.isLogged = this.userStateService.returnUserStatus();
  }

  public toggle(): boolean {
    return this.hidden = !this.hidden;

  }
  public goTo(page: string): void {
    this._router.navigateByUrl(page);
  }
  public logIn(): void {
    this.goTo('login');
  }

  public logUserOut(): void {
    const path = `retaguarda_prospect/usuarios/Logout?usuarioOuEmail=${String(this.localStorage?.getItem('LOGON_NAME'))}`;
    this._authService.path.next(path);
    this._authService.logUserOut();
  }


}
