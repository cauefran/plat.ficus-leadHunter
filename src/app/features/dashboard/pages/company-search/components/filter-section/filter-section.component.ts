import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, OnChanges, OnInit, Output, signal, ViewChild } from '@angular/core';
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
import { map, Observable, startWith } from 'rxjs';
import { IFilter } from '../../../../../../shared/interfaces/filter-payload.interface';


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
  ],

})
export class FilterSectionComponent implements OnInit, AfterViewChecked {
  @Output() tableDataEvent = new EventEmitter<any>();
  @Output() selectedSectorValue = new EventEmitter<any>();
  @Output() selectedCnaePrimarioValue = new EventEmitter<any>();
  @Output() selectedCnaeSecundarioValue = new EventEmitter<any>();
  @Output() selectedNcmValue = new EventEmitter<any>();

  public form: FormGroup;
  readonly panelOpenState = signal(false);
  public mock: Array<any> = [];
  public selectedState = '';
  public doSearch = false;
  public selectedCity = '';
  public cities: Array<any> = [];
  public neighbourhoods: Array<any> = [];
  public streets: Array<any> = [];

  public sectorControl = new FormControl();
  public sectors: Array<IFilterCnae> = [];
  public selectedSectors: Sector[] = new Array<Sector>();
  public filteredSectors!: Observable<IFilterCnae[]>;
  public lastFilterSector: string = '';
  public displayValueSector: string = '';

  public cnaeControl = new FormControl();
  public cnaes: Array<IFilterCnae> = [];
  public selectedCnae: Cnae[] = new Array<Cnae>();
  public filteredCnae!: Observable<IFilterCnae[]>;
  public lastFilterCnae: string = '';
  public displayValueCnae: string = '';

  public cnaeSecundarioControl = new FormControl();
  public cnaesSecundarios: Array<any> = [];
  public selectedCnaeSecundario: CnaeSecund[] = new Array<CnaeSecund>();
  public filteredCnaeSecundario!: Observable<IFilterCnae[]>;
  public lastFilterCnaeSecundario: string = '';
  public displayValueCnaeSecundario: string = '';

  public ncmControl = new FormControl();
  public ncm: Array<IFilterCnae> = [];
  public selectedNcm: Ncm[] = new Array<Ncm>();
  public filteredNcm!: Observable<IFilterCnae[]>;
  public lastFilterNcm: string = '';
  public displayValueNcm: string = '';

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
    this.filteredSectors = this.sectorControl.valueChanges.pipe(
      startWith<string | IFilterCnae[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilterSector),
      map(sector => this.filterSector(sector))
    );
    this.filteredCnae = this.cnaeControl.valueChanges.pipe(
      startWith<string | IFilterCnae[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilterCnae),
      map(cnae => this.filterCnae(cnae))
    );
    this.filteredCnaeSecundario = this.cnaeSecundarioControl.valueChanges.pipe(
      startWith<string | IFilterCnae[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilterCnaeSecundario),
      map(cnaeSecund => this.filterCnaeSecundario(cnaeSecund))
    );

    this.filteredNcm = this.ncmControl.valueChanges.pipe(
      startWith<string | IFilterCnae[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilterCnaeSecundario),
      map(ncm => this.filterNcm(ncm))
    );


    this. getFilterData();
    this.form.get('city')?.disable();
    this.form.get('neighbourhood')?.disable();
  }

  // AUTOCOMPLETE *****************************

  public filterSector(filter: string): IFilterCnae[] {
    this.lastFilterSector = filter;
    if (filter) {
      return this.sectors.filter(option => {
        return option.codigo.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.descricao.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      })
    } else {
      return this.sectors.slice();
    }
  }

  public filterCnae(filter: string): IFilterCnae[] {
    this.lastFilterCnae = filter;
    if (filter) {
      return this.cnaes.filter(option => {
        return option.codigo.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.descricao.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      })
    } else {
      return this.cnaes.slice();
    }
  }

  public filterCnaeSecundario(cnaeSecundario: string): IFilterCnae[] {
    this.lastFilterCnaeSecundario = cnaeSecundario;
    if (cnaeSecundario) {
      return this.cnaesSecundarios.filter(option => {
        return option.codigo.toLowerCase().indexOf(cnaeSecundario.toLowerCase()) >= 0
          || option.descricao.toLowerCase().indexOf(cnaeSecundario.toLowerCase()) >= 0;
      })
    } else {
      return this.cnaesSecundarios.slice();
    }
  }

  public filterNcm(ncm: string): IFilterCnae[] {
    this.lastFilterCnaeSecundario = ncm;
    if (ncm) {
      return this.ncm.filter(option => {
        return option.codigo.toLowerCase().indexOf(ncm.toLowerCase()) >= 0
          || option.descricao.toLowerCase().indexOf(ncm.toLowerCase()) >= 0;
      })
    } else {
      return this.ncm.slice();
    }
  }

  public displayFnSectors(value: IFilterCnae[] | string): string {
    if (Array.isArray(value)) {
      value.forEach((user, index) => {
        if (index === 0) {
          this.displayValueSector = user.codigo + ' ' + user.descricao;
        } else {
          this.displayValueSector += ', ' + user.codigo + ' ' + user.descricao;
        }
      });
    } else {
      this.displayValueSector = value;
    }
    return this.displayValueSector;
  }
  public displayFnCnaes(value: Cnae[] | string): string {
    if (Array.isArray(value)) {
      value.forEach((user, index) => {
        if (index === 0) {
          this.displayValueCnae = user.codigo + ' ' + user.descricao;
        } else {
          this.displayValueCnae += ', ' + user.codigo + ' ' + user.descricao;
        }
      });
    } else {
      this.displayValueCnae = value;
    }
    return this.displayValueCnae;
  }

  public displayFnCnaesSecundarios(value: IFilterCnae[] | string): string {
    if (Array.isArray(value)) {
      value.forEach((user, index) => {
        if (index === 0) {
          this.displayValueCnaeSecundario = user.codigo + user.descricao;
        } else {
          this.displayValueCnaeSecundario += ', ' + user.codigo + ' ' + user.descricao;
        }
      });
    } else {
      this.displayValueCnaeSecundario = value;
    }
    return this.displayValueCnaeSecundario;
  }

  public displayFnNcm(value: IFilterCnae[] | string): string {
    if (Array.isArray(value)) {
      value.forEach((user, index) => {
        if (index === 0) {
          this.displayValueNcm = user.codigo + user.descricao;
        } else {
          this.displayValueNcm += ', ' + user.codigo + ' ' + user.descricao;
        }
      });
    } else {
      this.displayValueNcm = value;
    }
    return this.displayValueNcm;
  }

  public optionClickedSector(event: Event, sector: Sector) {
    event.stopPropagation();
    this.toggleSelectionSector(sector);
  }
  public optionClickedCnae(event: Event, cnae: Cnae) {
    event.stopPropagation();
    this.toggleSelectionCnae(cnae);
  }
  public optionClickedCnaeSecundario(event: Event, cnaeSecundario: CnaeSecund) {
    event.stopPropagation();
    this.toggleSelectionCnaeSecundario(cnaeSecundario);
  }
  public optionClickedNcm(event: Event, ncm: Ncm) {
    event.stopPropagation();
    this.toggleSelectionNcm(ncm);
  }

  public toggleSelectionSector(sector: Sector) {
    sector.selected = !sector.selected;
    if (sector.selected) {
      this.selectedSectors.push(sector);
    } else {
      const i = this.selectedSectors.findIndex(value => value.codigo === sector.codigo && value.descricao === sector.descricao);
      this.selectedSectors.splice(i, 1);
    }
    console.log('this.selectedSector: ', this.selectedSectors);
    // this.sectorControl.setValue(this.selectedSectors.map((i) => i.codigo));
    this.sectorControl.setValue(this.selectedSectors);
    console.log('this.sectorControl: ', this.sectorControl.value);
    this.selectedSectorValue.emit(this.sectorControl.value);
  }
  public toggleSelectionCnae(cnae: Cnae) {
    cnae.selected = !cnae.selected;
    if (cnae.selected) {
      this.selectedCnae.push(cnae);
    } else {
      const i = this.selectedCnae.findIndex(value => value.codigo === cnae.codigo && value.descricao === cnae.descricao);
      this.selectedCnae.splice(i, 1);
    }
    // this.cnaeControl.setValue(this.selectedCnae.map((i) => i.codigo));
    this.cnaeControl.setValue(this.selectedCnae);
    this.selectedCnaePrimarioValue.emit(this.cnaeControl.value);
  }

  public toggleSelectionCnaeSecundario(cnaeSecundario: CnaeSecund) {
    cnaeSecundario.selected = !cnaeSecundario.selected;
    if (cnaeSecundario.selected) {
      this.selectedCnaeSecundario.push(cnaeSecundario);
    } else {
      const i = this.selectedCnaeSecundario .findIndex(value => value.codigo === cnaeSecundario.codigo && value.descricao === cnaeSecundario.descricao);
      this.selectedCnaeSecundario.splice(i, 1);
    }
    // this.cnaeSecundarioControl.setValue(this.selectedCnaeSecundario.map((i) => i.codigo));
    this.cnaeSecundarioControl.setValue(this.selectedCnaeSecundario);
    this.selectedCnaeSecundarioValue.emit(this.cnaeSecundarioControl.value);
  }

  public toggleSelectionNcm(ncm: Ncm) {
    ncm.selected = !ncm.selected;
    if (ncm.selected) {
      this.selectedNcm.push(ncm);
    } else {
      const i = this.selectedNcm.findIndex(value => value.codigo === ncm.codigo && value.descricao === ncm.descricao);
      this.selectedNcm.splice(i, 1);
    }
    // this.ncmControl.setValue(this.selectedNcm.map((i) => i.codigo));
    this.ncmControl.setValue(this.selectedNcm);
    this.selectedNcmValue.emit(this.ncmControl.value);
  }

  // ************************************

  public clearFilters(): void {
    this.form.reset();
    if(!this.form.get('estate')?.value){
      this.form.get('city')?.disable();
      this.form.get('neighbourhood')?.disable();
    }
    this.cnaeControl.reset()
    this.selectedCnae = [];
    this.cnaeSecundarioControl.reset();
    this.selectedCnaeSecundario = [];
    this.ncmControl.reset();
    this.selectedNcm = [];
    this.sectorControl.reset();
    this.selectedSectors = [];
    this.getFilterData();

  }

  public ngAfterViewChecked(): void {
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0){
      this.form.get('city')?.enable();
    }
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

    const sectorsPayload = this.sectorControl.value.map((i: any) => i.codigo);
    const cnaePrimaPayload = this.cnaeControl.value.map((i: any) => i.codigo);
    const cnaeSecundPayload = this.cnaeSecundarioControl.value.map((i: any) => i.codigo);
    const ncmPayload = this.ncmControl.value.map((i: any) => i.codigo);
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
