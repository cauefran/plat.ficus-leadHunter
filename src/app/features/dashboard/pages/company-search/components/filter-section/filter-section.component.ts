import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../../../shared/modules/material.module';
import { PrimeNgModule } from '../../../../../../shared/modules/primeng.module';
import { DashboardService } from '../../../../../services/dashboard.service';
import { IFilterCnae } from '../../../../../../shared/interfaces/filter-cnae.interface';
import { AuthService } from '../../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ERegimeTributario } from '../../../../../../shared/enums/regime-tributario.enum';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import removeAccents from 'remove-accents';
import { FeedbackModalComponent } from '../../../../../../shared/modals/feedback-modal/feedback-modal.component';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect } from '@angular/material/select';



export class User {
  constructor(public firstname: string, public lastname: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}

export class Sector {
  constructor(public codigo: string, public descricao: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}
export class Cnae {
  constructor(public codigo: string, public descricao: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}
export class CnaeSecund {
  constructor(public codigo: string, public descricao: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}
export class Ncm {
  constructor(public codigo: string, public descricao: string, public selected?: boolean) {
    if (selected === undefined) selected = false;
  }
}

@Component({
  selector: 'app-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PrimeNgModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgxMatSelectSearchModule
  ],

})
export class FilterSectionComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Output() tableDataEvent = new EventEmitter<any>();
  @Output() selectedSectorValue = new EventEmitter<any>();
  @Output() selectedCnaePrimarioValue = new EventEmitter<any>();
  @Output() selectedCnaeSecundarioValue = new EventEmitter<any>();
  @Output() selectedNcmValue = new EventEmitter<any>();
  @ViewChild('multiSelect', { static: true }) multiSelect!: MatSelect;


  public form: FormGroup;
  readonly panelOpenState = signal(false);
  public mock: Array<any> = [];
  public selectedState = '';
  public doSearch = false;
  public selectedCity = '';
  public cities: Array<any> = [];
  public neighbourhoods: Array<any> = [];
  public streets: Array<any> = [];

  // sector
  public sectorMultiCtrl = new FormControl();
  public sectorMultiFilterCtrl = new FormControl();
  public filteredSectorMulti: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public sectors: Array<any> = [];

    // Cnae Primario
  public cnaePrimaMultiCtrl = new FormControl();
  public cnaePrimaMultiFilterCtrl = new FormControl();
  public filteredCnaePrimaMulti: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public cnaes: Array<IFilterCnae> = [];

  // Cnae Secundario
  public cnaeSecundMultiCtrl = new FormControl();
  public cnaeSecundMultiFilterCtrl = new FormControl();
  public filteredCnaeSecundMulti: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public cnaesSecundarios: Array<any> = [];

  // NCM
  public ncmMultiCtrl = new FormControl();
  public ncmMultiFilterCtrl = new FormControl();
  public filteredNcmMulti: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public ncm: Array<IFilterCnae> = [];

  public municipios: Array<IFilterCnae> = [];
  public estate: Array<any> = [];
  public legalNatures:  Array<IFilterCnae> = [];
  public CompanySizeList: Array<any> = [];
  public regimeTributario: Array<any> = [
    {codigo: ERegimeTributario.TODOS, label: 'Todos'},
    {codigo: ERegimeTributario.EXCLUIDO_SIMPLES, label: 'Excluídas do Simples'},
    {codigo: ERegimeTributario.LUCRO_PRESUMIDO, label: 'Lucro Presumido'},
    {codigo: ERegimeTributario.LUCRO_REAL, label: 'Lucro Real'},
    {codigo: ERegimeTributario.SIMPLES, label: 'Simples'},
    {codigo: ERegimeTributario.NAO_SIMPLES, label: 'Não simples'}
  ]
  public getCodigoIBGE = signal('');

  public userPath = '';
  public userSignatureSession = '';
  public payloadMunicipios: Array<string> = [];

  protected _onDestroy = new Subject<void>();


  constructor(
    private _formBuilder: FormBuilder,
    private _dashboardService: DashboardService,
    private _authService: AuthService,
    private _dialog: MatDialog,
  ) {
    this.form = this._formBuilder.group({
      sector: new FormControl(),
      cnaePrimario: new FormControl(),
      cnaeSecundario: new FormControl(),
      ncm: new FormControl(),
      estate: new FormControl(),
      neighbourhood: new FormControl(),
      city: new FormControl(),
      cep: ['', ],
      logradouro: ['', []],
      stNumber: ['', []],
      telephone: ['', []],
      initialDate: [''],
      finalDate: ['', []],
      partner: ['', []],
      companySize: new FormControl(),
      legalNature: ['', []],
      feeType: [ERegimeTributario.TODOS, []],
      cnpj: ['', [Validators.pattern('([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})')]],
    })
  }

  ngOnInit() {
    this. getFilterData();
    this.form.get('city')?.disable();
    this.form.get('neighbourhood')?.disable();

    this.filteredSectorMulti.next(this.sectors);
    this.sectorMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSectorMulti();
      });

    this.filteredCnaePrimaMulti.next(this.cnaes);
    this.cnaePrimaMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCnaePrimaMulti();
      });

    this.filteredCnaeSecundMulti.next(this.cnaesSecundarios);
    this.cnaeSecundMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCnaeSecundMulti();
      });

    this.filteredNcmMulti.next(this.ncm);
    this.ncmMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterNcmMulti();
      });
  }

  public ngAfterViewChecked(): void {
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0){
      this.form.get('city')?.enable();
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected filterSectorMulti() {
    if (!this.sectors) {
      return;
    }
    // get the search keyword
    let search = this.sectorMultiFilterCtrl.value;
    if (!search) {
      this.filteredSectorMulti.next(this.sectors.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredSectorMulti.next(
      this.sectors.filter(
        sector => sector.descricao.toLowerCase().indexOf(search) > -1 || sector.codigo.toLowerCase().indexOf(search) > -1 )
    );
  }

  protected filterCnaePrimaMulti() {
    if (!this.cnaes) {
      return;
    }
    // get the search keyword
    let search = this.cnaePrimaMultiFilterCtrl.value;
    if (!search) {
      this.filteredCnaePrimaMulti.next(this.cnaes.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the cnaes
    this.filteredCnaePrimaMulti.next(
      this.cnaes.filter(
        cnae => cnae.descricao.toLowerCase().indexOf(search) > -1 || cnae.codigo.toLowerCase().indexOf(search) > -1 )
    );
  }
  protected filterCnaeSecundMulti() {
    if (!this.cnaesSecundarios) {
      return;
    }
    // get the search keyword
    let search = this.cnaeSecundMultiFilterCtrl.value;
    if (!search) {
      this.filteredCnaeSecundMulti.next(this.cnaesSecundarios.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the cnaes
    this.filteredCnaeSecundMulti.next(
      this.cnaesSecundarios.filter(
        cnae => cnae.descricao.toLowerCase().indexOf(search) > -1 || cnae.codigo.toLowerCase().indexOf(search) > -1 )
    );
  }
  protected filterNcmMulti() {
    if (!this.ncm) {
      return;
    }
    // get the search keyword
    let search = this.ncmMultiFilterCtrl.value;
    if (!search) {
      this.filteredNcmMulti.next(this.ncm.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the ncm
    this.filteredNcmMulti.next(
      this.ncm.filter(
        ncm => ncm.descricao.toLowerCase().indexOf(search) > -1 || ncm.codigo.toLowerCase().indexOf(search) > -1 )
    );
  }

  public onSectorMultiSelectionChange(event: any): void {
    this.selectedSectorValue.emit(this.sectorMultiCtrl.value);
  }

  public onCnaePrimaMultiSelectionChange(event: any): void {
    this.selectedCnaePrimarioValue.emit(this.cnaePrimaMultiCtrl.value);
  }

  public onCnaeSecundMultiSelectionChange(event: any): void {
    this.selectedCnaeSecundarioValue.emit(this.cnaeSecundMultiCtrl.value);
  }
  public onNcmMultiSelectionChange(event: any): void {
    this.selectedNcmValue.emit(this.ncmMultiCtrl.value);
  }

  public clearFilters(): void {
    this.form.reset();
    if(!this.form.get('estate')?.value){
      this.form.get('city')?.disable();
      this.form.get('neighbourhood')?.disable();
    }
    this.getFilterData();

  }

  public getCitiesValue(): void {
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0){
      this._dashboardService.getCidade(this.form.get('estate')?.value).subscribe((res) => {
        if(res.result.length > 0){
          this.cities = res.result;
          this.form.get('city')?.enable();
          console.log('res getCidades', res);
          return;
        }
        return;
      });
    } else {
      this.form.get('city')?.reset();
      this.form.get('city')?.disable();
    }
  }

  public getNeighbourhoodValue(): void {
    console.log("event", this.getCodigoIBGE());
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0 && this.form.get('city')?.value && this.form.get('city')?.value.length > 0){
      this._dashboardService.getBairro(this.getCodigoIBGE()).subscribe((res) => {
        if(res){
          this.neighbourhoods = res.result;
          this.form.get('neighbourhood')?.enable();
          console.log('res neighbourhood: ', res);
          return;
        }
        return;
      });
    } else {
      this.form.get('neighbourhood')?.disable();
      this.form.get('neighbourhood')?.reset();
    }
  }
  public getStreetValue(): void {
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0 && this.form.get('city')?.value && this.form.get('city')?.value.length > 0 && this.form.get('neighbourhood')?.value && this.form.get('neighbourhood')?.value.length){
      this._dashboardService.getLogradouro(this.form.get('neighbourhood')?.value).subscribe((res) => {
        if(res){
          this.streets = res.result;
          this.form.get('street')?.enable();
          console.log('res street: ', res);
          return;
        }
        return;
      });
    } else {
      this.form.get('neighbourhood')?.disable();
      this.form.get('neighbourhood')?.reset();
    }
  }

  public getCEP(): void {

      console.log('this.form.get(cep)?.value: ', this.form.get('cep')?.value )
      this._dashboardService.getCEP(this.form.get('cep')?.value).subscribe((res) => {
        if(res.result){
          console.log('res.result cep ', res.result);
          if(res.result?.uf.length > 0){
            this.form.get('estate')?.setValue([res.result.uf]);
            this._dashboardService.getCidade(res.result.uf).subscribe((val)=> {
              this.cities = val.result;
              this.form.get('city')?.setValue([res.result.municipio]);
            })
          }
          if(res.result?.municipio.length > 0){
            this._dashboardService.getBairro(removeAccents.remove(res.result.municipio)).subscribe((val) => {
              this.neighbourhoods = val.result;
              this.form.get('neighbourhood')?.enable();
              this.form.get('neighbourhood')?.setValue([res.result.codigoBairro]);
            })
          }
          this.form.get('logradouro')?.reset()
          this.form.get('logradouro')?.setValue(res.result.logradouro);
          return;
        }
        return;
      });

  }

  public search(): void {
    this._dashboardService.isLoading.set(true);
      this.userPath = this._authService.userPath().length > 0 ? this._authService.userPath() : String(localStorage.getItem('PATH_USER'));
      const SessionSearchPath = `${this.userPath}/Empresa/PegarEmpresasSegundoFiltro`;
      const userLoginData = this._authService.userLoginData().length > 0 ? this._authService.userLoginData() : String(localStorage.getItem('LOGIN_KEY'));

      this._authService.userSessionPath.set(SessionSearchPath);
        this._authService.generateUserSignatureSession(userLoginData);

    this._authService.userKey.subscribe((res) => {
      this.userSignatureSession = res;
    });

    if(this.form.get('city')?.value){
      this.form.get('city')?.value.forEach((element: string) => {
        console.log('elemnt', removeAccents.remove(element));
        this.payloadMunicipios.push(removeAccents.remove(element));
      })

    }

    const sectorsPayload = this.sectorMultiCtrl.value.map((i: any) => i.codigo);
    const cnaePrimaPayload = this.cnaePrimaMultiCtrl.value.map((i: any) => i.codigo);
    const cnaeSecundPayload = this.cnaeSecundMultiCtrl.value.map((i: any) => i.codigo);
    const ncmPayload = this.ncmMultiCtrl.value.map((i: any) => i.codigo);
    console.log("sectorsPayload", sectorsPayload);
    let filter = {
      setores: sectorsPayload.length > 0 ? sectorsPayload : null,
      cnae: cnaePrimaPayload.length > 0 ? cnaePrimaPayload : null,
      buscarCnaesSecundarios:  cnaeSecundPayload.length > 0 ? cnaeSecundPayload : null,
      ncms: ncmPayload.length > 0 ? ncmPayload : null,
      uf: this.form.get('estate')?.value ? this.form.get('estate')?.value : null,
      municipio: this.payloadMunicipios.length > 0 ? this.payloadMunicipios : null,
      bairro: this.form.get('neighbourhood')?.value ? this.form.get('neighbourhood')?.value : null,
      cep: this.form.get('cep')?.value ? this.form.get('cep')?.value : null,
      logradouro: this.form.get('logradouro')?.value ? this.form.get('logradouro')?.value : null,
      socio: this.form.get('partner')?.value ? this.form.get('partner')?.value : null,
      telefone: this.form.get('telephone')?.value ? this.form.get('telephone')?.value : null,
      numero: this.form.get('stNumber')?.value ? this.form.get('stNumber')?.value : null,
      porte: this.form.get('companySize')?.value ? this.form.get('companySize')?.value : null,
      naturezaJuridica: this.form.get('legalNature')?.value ? this.form.get('legalNature')?.value : null,
      regime: this.form.get('feeType')?.value ? this.form.get('feeType')?.value : null,
      cnpj: this.form.get('cnpj')?.value ? this.form.get('cnpj')?.value : null,
    }

   const dados = {
    filtro: filter,
    ordenacao: 0,
    pagina: 0,
    }

    this._dashboardService.filterSearch(this.userPath, dados ,this.userSignatureSession).subscribe((res) => {
        this.tableDataEvent.emit(res.result);

    }, () => {
      this._dialog.open(FeedbackModalComponent, {
        data: {
          title: 'Erro!',
          text: 'Erro ao buscar dados!'
        }
          }).afterClosed().subscribe(() => this._dashboardService.isLoading.set(false));
    }, () => {
      this._dashboardService.isLoading.set(false);
    });
  }

  public getFilterData(): void {
   this._dashboardService.getListaCnae().subscribe((res: any) => {
    this.cnaes = res?.result;
    this.cnaesSecundarios = res?.result;
     });
   this._dashboardService.getListaNatureza().subscribe((res: any) => {
    this.legalNatures = res?.result;
     });
   this._dashboardService.getMunicipios().subscribe((res) => {
    this.municipios = res?.result;
     });
   this._dashboardService.getListaSecaoCnae().subscribe((res: any) => {
    this.sectors = res?.result;
     });
   this._dashboardService.getListaNcm().subscribe((res) => {
    this.ncm = res?.result;
     });
   this._dashboardService.getEstado().subscribe((res) => {
    this.estate = res?.result;
     });
   this._dashboardService.getListaPortes().subscribe((res) => {
    this.CompanySizeList = res?.result;
    console.log('res ListaPorte :', res);
     });
  }

}
