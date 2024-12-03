import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { IFilterPayload } from '../../shared/interfaces/filter-payload.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public isLoading = signal(false);

  constructor(
    private _httpClient: HttpClient,
  ) { }

  public filterSearch(path: string, dados: any, signatureSession: string): Observable<any>{
    const url = `http://w2.ficusconsultoria.com.br:11117/${path}/Empresa/PegarEmpresasSegundoFiltro?session_signature=${signatureSession}`;
    return this._httpClient.post(url,{dados});
  }

  public filterAllSearchs(path: string, dados: any, signatureSession: string): Observable<any>{
    const url = `http://w2.ficusconsultoria.com.br:11117/${path}/Pesquisa/PegarPesquisas?session_signature=${signatureSession}`;
    return this._httpClient.post(url,{dados});
  }


  public getListaCnae(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaCnaes`;
    return this._httpClient.get(url);
  }
  public getListaNatureza(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaNaturezas`;
    return this._httpClient.get(url);
  }
  public getMunicipios(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaMunicipios`;
    return this._httpClient.get(url);
  }
  public getListaPortes(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaPortes`;
    return this._httpClient.get(url);
  }
  public getUnidadeFederativa(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaUnidadeFederativa`;
    return this._httpClient.get(url);
  }
  public getListaSecaoCnae(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaSecaoCnae`;
    return this._httpClient.get(url);
  }

  public getListaNcm(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaNCM`;
    return this._httpClient.get(url);
  }

  public getCEP(cep: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarDadosDoCep?cep=${cep}`;
    return this._httpClient.get(url);
  }

  public getEstado(): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarListaUnidadeFederativa`;
    return this._httpClient.get(url);
  }

  public getCidade(uf: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarMunicipiosDaUF?uf=${uf}`;
    return this._httpClient.get(url);
  }

  public getBairro(municipio: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarBairrosDoMunicipio?codigoMunicipio=${municipio}`;
    return this._httpClient.get(url);
  }
  public getLogradouro(bairro: string): Observable<any> {
    const url = `http://w2.ficusconsultoria.com.br:11117/dados_auxiliares/InformacoesAuxiliares/PegarLogradourosDoBairro?codigoBairro=${bairro}`;
    return this._httpClient.get(url);
  }

}
