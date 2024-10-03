import { HttpClient } from '@angular/common/http';
import { DoCheck, Injectable, signal } from '@angular/core';
import { sha256 } from 'js-sha256';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ISession } from '../../shared/interfaces/session.interface';
import { ILogin } from '../../shared/interfaces/login.interface';
import { crc32 } from 'crc';
import { IServerNonce } from '../../shared/interfaces/serverNonce.interface';
import moment from 'moment';
import { IPasswordEncryption } from '../../shared/interfaces/password-encryption.interface';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackModalComponent } from '../../shared/modals/feedback-modal/feedback-modal.component';
import { UserStateService } from './user-state.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public storage!: Storage;
  public userIdentified = new BehaviorSubject(false);
  public currentUserState$ = this.userIdentified.asObservable();
  public ID_SESSION!: string;
  public SYSTEM_ID_SESSION!: string;
  public signatureSession!: string;
  public userNameDisplay: string;
  public systemNonce!: string;
  public clientNonce!: string;
  public systemKey = new BehaviorSubject('');
  public loading = new Subject<boolean>();
  public userLoginData = signal<any>([]);
  public systemLoginData = new BehaviorSubject('');
  public currentSystemLoginData$ = this.systemLoginData.asObservable();
  public userKey = new BehaviorSubject('');
  public path = new BehaviorSubject('');
  public userPath = signal('');
  public userSessionPath = signal('');
  public dinamicPath!: string;
  public passwordFixed = '146a2bf4ac84efd41f08fea59725f7c8fcac5a9a86fa0108a445ac6d9450dba7';
  public userPasswordEncrypted = new BehaviorSubject('');

  constructor(
    private _httpClient: HttpClient,
    private _router: Router,
    private _dialog: MatDialog,
    private _userStateService: UserStateService,
  ) {
    this.userNameDisplay = '';
  }
  //Login sistema

  public requestSystemLogin(): void {
    const user = 'gabriel';
    this.passwordFixed = '146a2bf4ac84efd41f08fea59725f7c8fcac5a9a86fa0108a445ac6d9450dba7';

    this.getServerNonce(user).subscribe((res: IServerNonce) => {
      this.systemNonce = res.result;
      if (this.systemNonce.length > 0) {
        this.clientNonce = sha256(moment().toISOString());

        const loginPayload = {
          user: user,
          passwordEncrypted: this.passwordFixed,
          clientNonce: this.clientNonce,
          systemNonce: res.result
        } as ILogin

        this.doLogin(loginPayload).subscribe((res) => {
          if (res?.result.length > 0 ) {
            this._userStateService.setUserStatus(true);
            localStorage.setItem('SLK', res.result);
            console.log('systemLoginData doLogin: ', this.systemLoginData.value);
            setTimeout(() => { this.generateSystemSignatureSession(res.result) }, 1000);
          }
        });
      }
    });
  }

  public generateSystemSignatureSession(res: string): string {
    let session = res;
      const posicao = session.indexOf('+');
      if (posicao >= 0) {
        this.SYSTEM_ID_SESSION = session.substring(0, posicao);
      }

      const crc32Session = crc32(session);

      const PRIVATE_KEY = crc32(this.passwordFixed, crc32Session);
      const date = new Date;
      const timeStamp = date.getTime();
      const timestampToMiliseconds = Number(timeStamp) * 1000;
      const milisecondHex = timestampToMiliseconds.toString(16);
      const eightDigitMiliseconds = milisecondHex.substring(milisecondHex.length - 8, milisecondHex.length);
      this.path.subscribe((res) => {
        console.log('path gerar assinatura sistema: ', res);
        this.signatureSession = this.mountSignatureSession(res, eightDigitMiliseconds, Number(PRIVATE_KEY));
      })
      const dataReturn = this.verifySystemIdSession(this.SYSTEM_ID_SESSION) + eightDigitMiliseconds + this.signatureSession;
      this.systemKey.next(dataReturn);
      return dataReturn;
  }

  public verifySystemIdSession(SYSTEM_ID_SESSION: string): string {
    let systemIdSessionReturn = parseInt(SYSTEM_ID_SESSION, 10).toString(16);
    while(systemIdSessionReturn.length < 8 ){
      systemIdSessionReturn = `0${systemIdSessionReturn}`;
    }
    console.log('systemIdSessionReturn: ', systemIdSessionReturn);
    return systemIdSessionReturn;
  }

  public emitSystemLoginValue(value: string): void {
    this.systemLoginData.next(value);
  }

  public getSystemLoginDataValue(): Observable<any> {
    return this.currentSystemLoginData$;
  }

  //Login usuário

  public requestUserLogin(data: any): void {
    const user = data?.user;
    const userPassword = data?.password;
    const path = data?.path;

    this.getUserServerNonce(user, path).subscribe((res: IServerNonce) => {
      const userSystemNonce = res.result;
      if (this.systemNonce.length > 0) {
        const clientNonce = sha256(moment().toISOString());

        const salt = `salt${userPassword}`;
        const passwordEncrypted = sha256(salt);

        const loginPayload = {
          user: user,
          passwordEncrypted: passwordEncrypted,
          clientNonce: clientNonce,
          systemNonce: userSystemNonce
        } as ILogin

        this.userPasswordEncrypted.next(passwordEncrypted);


        this.doUserLogin(loginPayload, path).subscribe((res) => {
          if (res?.result) {
            this.userLoginData.set(res?.result);
            this.userIdentified.next(true);
            localStorage?.setItem('LOGIN_KEY', res?.result);
            localStorage.setItem('LOGON_NAME', res.logonname);
            this._userStateService.setUserName(res?.logonname);
            this._router.navigateByUrl('dashboard/company-search');
            return;
          }
          this._dialog.open(FeedbackModalComponent, {
            data: {
              title: 'Erro!',
              ret: 1,
              text: 'Erro ao logar usuário!',
              aditionalText: 'Confira os dados e tente novamente'
            }
              }).afterClosed().subscribe(() => this.loading.next(false));
              return;
        }, (err: any) => {
          this._dialog.open(FeedbackModalComponent, {
            data: {
              title: 'Erro!',
              ret: 1,
              text: 'Erro ao logar usuário!',
              aditionalText: 'Confira os dados e tente novamente'
            }
              }).afterClosed().subscribe(() => this.loading.next(false));
        });
      }
    });
  }

  public doUserLogin(payload: ILogin, path: string): Observable<any> { // fourth step
    const userName = (payload.user);
    const password = sha256(`${path}${payload.systemNonce}${payload.clientNonce}${payload.user}${payload.passwordEncrypted}`);
    const url = `http://w2.ficusconsultoria.com.br:11117/${path}/Auth?UserName=${userName}&Password=${password}&ClientNonce=${payload.clientNonce}`;
    return this._httpClient.get(url);
  }

  public generateUserSignatureSession(res: string): string {
    let systemIdSession = '';
    let session = res;
    const posicao = session.indexOf('+');
    if (posicao >= 0) {
      systemIdSession = session.substring(0, posicao);
    }

    const crc32Session = crc32(session);

    const PRIVATE_KEY = crc32(this.userPasswordEncrypted.getValue(), crc32Session);
    const date = new Date;
    const timeStamp = date.getTime();
    const timestampToMiliseconds = Number(timeStamp) * 1000;
    const milisecondHex = timestampToMiliseconds.toString(16);
    const eightDigitMiliseconds = milisecondHex.substring(milisecondHex.length - 8, milisecondHex.length);
    this.signatureSession = this.mountSignatureSession(this.userSessionPath(), eightDigitMiliseconds, Number(PRIVATE_KEY));
    const dataReturn = this.verifySystemIdSession(systemIdSession) + eightDigitMiliseconds + this.signatureSession;
    this.userKey.next(dataReturn);
    return dataReturn;
}

public logUserOut(): void {
    console.log('systemLoginKey', localStorage.getItem('SLK'));
      if(String(localStorage.getItem('SLK')).length > 0){
        const key = this.generateSystemSignatureSession(String(localStorage.getItem('SLK')));
        const user = String(localStorage.getItem('LOGON_NAME'));
        this.logOut(user, key).subscribe((res) => {
          console.log('logout 1', res);
          if(res){
            console.log('if res logout', res);
            localStorage.clear();
            this._userStateService.setUserStatus(false);
            this._router.navigateByUrl('login');
          }
        }, (err: any) => {
          localStorage.clear();
            this._router.navigateByUrl('login');
        });
      }


}

  // ********************

  public getUserUrl(usuarioOuEmail: string, signatureSession: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/retaguarda_prospect/usuarios/PegarUrlDoUsuario?usuarioOuEmail=${usuarioOuEmail}&session_signature=${signatureSession}`;
    return this._httpClient.get(url);
  }


  public logOut(usuarioOuEmail: string, signatureSession: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/retaguarda_prospect/usuarios/Logout?usuarioOuEmail=${usuarioOuEmail}&session_signature=${signatureSession}`;
    return this._httpClient.get(url);
  }

  public getServerNonce(userName: string): Observable<any> { // first step
    const userNemEncoded = encodeURIComponent(userName)
    const url = `http://w2.ficusconsultoria.com.br:11117/retaguarda_prospect/auth?UserName=${userNemEncoded}`;
    return this._httpClient.get(url);
  }
  public getUserServerNonce(userName: string, path: string): Observable<any> { // first step
    const userNemEncoded = encodeURIComponent(userName)
    const url = `http://w2.ficusconsultoria.com.br:11117/${path}/auth?UserName=${userNemEncoded}`;
    return this._httpClient.get(url);
  }

  public getUserNameForDisplay(user: string): string {
    return this.userNameDisplay = user;
  }

  public getClientNonce(dateHour: string): string { // second step
    return sha256(dateHour);
  }

  public passwordEncryption(payload: IPasswordEncryption, path: string): string { // thrid step
    const salt = `salt${payload.password}`;
    const hashSalt = sha256(salt);
    const encryptedPassword = sha256(`${path}/${payload.user}${payload.serverNonce}${payload.clientNonce}${payload.user}${hashSalt}`);

    return encryptedPassword;
  }

  public doLogin(payload: ILogin): Observable<any> { // fourth step
    const password = sha256(`retaguarda_prospect${payload.systemNonce}${payload.clientNonce}${payload.user}${payload.passwordEncrypted}`);
    const url = `http://w2.ficusconsultoria.com.br:11117/retaguarda_prospect/auth?UserName=${payload.user}&Password=${password}&ClientNonce=${payload.clientNonce}`;
    return this._httpClient.get(url);
  }

  public getSignatureSession(serverData: ISession, password: string, url: string): string { // fifth step

    let session = serverData.result;
    const posicao = session.indexOf('+');
    if (posicao >= 0) {
      this.ID_SESSION = session.substring(0, posicao);
    }
    const crc32Session = crc32(session);
    const saltPassword = `salt${password}`;
    const hashSaltPassword = sha256(saltPassword);

    const PRIVATE_KEY = crc32(hashSaltPassword, crc32Session);

    const date = new Date;
    const timeStamp = date.getTime();
    const timestampToMiliseconds = Number(timeStamp) * 1000;
    const milisecondHex = timestampToMiliseconds.toString(16);
    const eightDigitMiliseconds = milisecondHex.substring(milisecondHex.length - 8, milisecondHex.length);
    this.signatureSession = this.mountSignatureSession(url, eightDigitMiliseconds, Number(PRIVATE_KEY));
    // let SignatureSessionTwo = crc32('retaguarda_prospect/empresaService/PegarEmpresasFavoritas', crc32(eightDigitMiliseconds, Number(PRIVATE_KEY))).toString(16);
    const dataReturn = parseInt(this.ID_SESSION, 10).toString(16) + eightDigitMiliseconds + this.signatureSession;
    return dataReturn;
  }

  public mountSignatureSession(url: string, eightDigitMiliseconds: string, privateKey: number){
    return crc32(url, crc32(eightDigitMiliseconds, privateKey)).toString(16);
  }

  public createNewAccount(dados: any, signatureSession: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/retaguarda_prospect/usuarios/CadastrarUsuario?session_signature=${signatureSession}`;
    return this._httpClient.post(url, {dados: dados});
  }

}
