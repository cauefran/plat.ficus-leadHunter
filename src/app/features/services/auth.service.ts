import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { sha256 } from 'js-sha256';
import { Observable } from 'rxjs';
import { ISession } from '../../shared/interfaces/session.interface';
import { ILogin } from '../../shared/interfaces/login.interface';
import { crc32 } from 'crc';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public storage: Storage;
  public userIdentified!: boolean;
  public ID_SESSION!: string;
  public SignatureSession!: string;
  public userNameDisplay: string;

  constructor(
    private _httpClient: HttpClient,
  ) {
    this.storage = window.localStorage;
    this.userNameDisplay = '';
  }

  public getServerNonce(userName: string): Observable<any> { // first step
    const url = `http://192.168.5.4:11117/retaguarda_prospect/auth?UserName=${userName}`;
    return this._httpClient.get(url);
  }

  public getUserNameForDisplay(user: string): string {
    return this.userNameDisplay = user;
  }

  public getClientNonce(dateHour: string): string { // second step
    return sha256(dateHour);
  }

  // public passwordEncryption(payload: IPasswordEncryption): string { // thrid step
  //   const salt = `salt${payload.password}`;
  //   const hashSalt = sha256(salt);
  //   this.setLocalStorageItem('SALT_HASH', hashSalt);
  //   const encryptedPassword = sha256(`retaguarda_prospect/${payload.user}${payload.serverNonce}${payload.clientNonce}${payload.user}${hashSalt}`);

  //   return encryptedPassword;
  // }

  public doLogin(payload: ILogin): Observable<any> { // fourth step
    const password = sha256(`retaguarda_prospect/${payload.user}${payload.systemNonce}${payload.clientNonce}${payload.user}${payload.passwordEncrypted}`);
    const url = `http://192.168.5.4:11117/retaguarda_prospect/auth?UserName=${payload.user}&Password=${password}&ClientNonce=${payload.clientNonce}`;
    return this._httpClient.get(url);
  }

  public setLocalStorageItem(name: string, item: string): any {
    this.storage.setItem(name, JSON.stringify(item));
  }

  // public getSignatureSession(serverData: ISession, password: string): string { // fifth step

  //   let session = serverData.result;
  //   const posicao = session.indexOf('+');
  //   if (posicao >= 0) {
  //     this.ID_SESSION = session.substring(0, posicao);
  //   }
  //   const crc32Session = crc32(session);
  //   const saltPassword = `salt${password}`;
  //   const hashSaltPassword = sha256(saltPassword);

  //   const PRIVATE_KEY = crc32(hashSaltPassword, crc32Session);

  //   const date = new Date;
  //   const timeStamp = date.getTime();
  //   const timestampToMiliseconds = Number(timeStamp) * 1000;
  //   const milisecondHex = timestampToMiliseconds.toString(16);
  //   const eightDigitMiliseconds = milisecondHex.substring(milisecondHex.length - 8, milisecondHex.length);

  //   this.SignatureSession = crc32('retaguarda_prospect/empresaService/PegarEmpresasFavoritas', crc32(eightDigitMiliseconds, Number(PRIVATE_KEY))).toString(16);
  //   const dataReturn = parseInt(this.ID_SESSION, 10).toString(16) + eightDigitMiliseconds + this.SignatureSession;


  //   return dataReturn;
  // }

  // public getCompanyList(signatureSession: string): Observable<any> { // sixsith and final step
  //   const url = `http://test.ficusconsultoria.com.br:11118/retaguarda_prospect/aaaa/empresaService/PegarEmpresasFavoritas?session_signature=${signatureSession}`;
  //   return this._httpClient.get(url);
  // }

  public isLogged(userLoggedIn: boolean): boolean {
    this.userIdentified = userLoggedIn;
    if (this.userIdentified) {
      return true

    }
    return false;
  }

}
