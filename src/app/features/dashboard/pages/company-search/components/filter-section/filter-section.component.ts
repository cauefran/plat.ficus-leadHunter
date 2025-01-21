import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, OnDestroy, OnInit, Output, signal, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../../../shared/modules/material.module';
import { PrimeNgModule } from '../../../../../../shared/modules/primeng.module';
import { DashboardService } from '../../../../../services/dashboard.service';
import { IFilterCnae } from '../../../../../../shared/interfaces/filter-cnae.interface';
import { AuthService } from '../../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ERegimeTributario } from '../../../../../../shared/enums/regime-tributario.enum';
import { NgxMaskDirective } from 'ngx-mask';
import removeAccents from 'remove-accents';
import { FeedbackModalComponent } from '../../../../../../shared/modals/feedback-modal/feedback-modal.component';
import { BehaviorSubject, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect } from '@angular/material/select';
import { take } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import moment from 'moment';
import {default as _rollupMoment} from 'moment';
import * as _moment from "moment";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';



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

export interface ISectorIterator {
  cnaes: Array<ICnaeIterator>;
  codigo: string;
  descricao: string;
}

export interface ICnaeIterator {
  codigo: string;
  descricao: string;
}

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-filter-section',
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PrimeNgModule,
    NgxMaskDirective,
    NgxMatSelectSearchModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ]
})
export class FilterSectionComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @Output() tableDataEvent = new EventEmitter<any>();
  @Output() selectedSectorValue = new EventEmitter<any>();
  @Output() selectedCnaePrimarioValue = new EventEmitter<any>();
  @Output() selectedCnaeSecundarioValue = new EventEmitter<any>();
  @Output() selectedNcmValue = new EventEmitter<any>();
  @Output() cnpjFilteredValue = new EventEmitter<any>();
  @Output() nomeFilteredValue = new EventEmitter<any>();
  @Output() socioFilteredValue = new EventEmitter<string>();
  @Output() stateFilteredValue = new EventEmitter<string>();
  @Output() cityFilteredValue = new EventEmitter<string>();
  @Output() neighbourhoodFilteredValue = new EventEmitter<string>();
  @Output() logradouroFilteredValue = new EventEmitter<string>();
  @Output() stNumberFilteredValue = new EventEmitter<string>();
  @Output() cepFilteredValue = new EventEmitter<string>();
  @Output() companySizeFilteredValue = new EventEmitter<any>();
  @Output() telephoneFilteredValue = new EventEmitter<string>();
  @Output() initialDateFilteredValue = new EventEmitter<string>();
  @Output() finalDateFilteredValue = new EventEmitter<string>();
  @Output() previousSearchsEmitter = new EventEmitter<any>();
  @ViewChild('sectorSelect', { static: true }) sectorSelect!: MatSelect;
  @ViewChild('cnaePrimaSelect', { static: true }) cnaePrimaSelect!: MatSelect;
  @ViewChild('cnaeSecondSelect', { static: true }) cnaeSecondSelect!: MatSelect;
  @ViewChild('ncmSelect', { static: true }) ncmSelect!: MatSelect;

  public form: FormGroup;
  public formLabel: FormGroup;
  readonly panelOpenState = signal(false);
  public mock: Array<any> = [];
  public selectedState = '';
  public doSearch = false;
  public selectedCity = '';
  public cities: Array<any> = [];
  public neighbourhoods: Array<any> = [];
  public streets: Array<any> = [];
  public previousSearchs: Array<any> = [];

  // sector
  public sectorMultiCtrl = new FormControl();
  public sectorMultiFilterCtrl = new FormControl();
  public filteredSectorMulti: ReplaySubject<ISectorIterator[]> = new ReplaySubject<ISectorIterator[]>(1);
  public sectors: Array<any> = [];

    // Cnae Primario
  public cnaePrimaMultiCtrl = new FormControl();
  public cnaePrimarioMultiObservable =  new Subject();
  public cnaePrimarioMultiData = new FormControl();
  public cnaePrimaMultiFilterCtrl = new FormControl();
  public filteredCnaePrimaMulti: ReplaySubject<Array<any>> = new ReplaySubject<Array<any>>(1);
  public filteredCnaeMulti = new BehaviorSubject<Array<ICnaeIterator>>([]);
  public filteredCnaeMultiTeste = new ReplaySubject<Array<ICnaeIterator>>();
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
  public errorInitialDate = false;
  public errorFinalDate = false;
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
    this.formLabel = this._formBuilder.group({
      label: new FormControl(),
    })
    this.form = this._formBuilder.group({
      sector: new FormControl(),
      cnaePrimario: new FormControl(),
      cnaeSecundario: [false, []],
      ncm: new FormControl(),
      estate: new FormControl(),
      neighbourhood: new FormControl(),
      city: new FormControl(),
      cep: ['', ],
      logradouro: ['', []],
      stNumber: ['', []],
      telephone: ['', []],
      dataAberturaInicio: ['', []],
      dataAberturaFim: ['', []],
      partner: ['', [
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z \-\']+')]],
      name: ['', [
        Validators.maxLength(50)]],
      companySize: new FormControl(),
      legalNature: ['', []],
      feeType: [ERegimeTributario.TODOS, []],
      cnpj: ['', [Validators.pattern('([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[-]?[0-9]{2})')]],
    })
  }

  ngOnInit() {
    this.getFilterData();
    this.loadInitialSelectValues();
    this.getCnaes(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"]);
    this.form.get('city')?.disable();
    this.form.get('neighbourhood')?.disable();
    this.cnaePrimaMultiFilterCtrl.disable();
    this.getPreviousSearch();
    this.cnaePrimaMultiCtrl.disable();
    this.sectorMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSectorMulti();
      });

    this.cnaePrimaMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCnaePrimaMulti();
      });

    this.cnaeSecundMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCnaeSecundMulti();
      });

    this.ncmMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterNcmMulti();
      });
  }

  ngAfterViewInit() {
    this.loadInitialSelectValues();
    this.onFirstClick();
  }

  public onFirstClick(): void {
    this.sectorMultiFilterCtrl.setValue('')
    this.sectorMultiFilterCtrl.updateValueAndValidity();
    this.cnaePrimaMultiFilterCtrl.setValue('')
    this.cnaePrimaMultiFilterCtrl.updateValueAndValidity();
    this.cnaeSecundMultiFilterCtrl.setValue('')
    this.ncmMultiFilterCtrl.setValue('')
  }

  public ngAfterViewChecked(): void {
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0){
      this.form.get('city')?.enable();
    }

    if(this.form.get('dataAberturaInicio')?.valueChanges || this.form.get('dataAberturaFim')?.valueChanges) {
      this.validateInitialDate();
      this.validateFinalDate();
    }

    this.onInitialDateValueUpdate();
    this.onFinalDateValueUpdate();

  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
    this._dashboardService.isLoading.set(false);
  }

  public resetDatePickerInitialValue(): void {
    this.form.get('dataAberturaInicio')?.reset();
    this.form.get('dataAberturaInicio')?.updateValueAndValidity();
    this.initialDateFilteredValue.emit()
  }

  public resetDatePickerFinalValue(): void {
    this.form.get('dataAberturaFim')?.reset();
    this.form.get('dataAberturaFim')?.updateValueAndValidity();
    this.finalDateFilteredValue.emit()
  }

  public getCnaeSecundarioValue(event: any){
    this.form.get('cnaeSecundario')?.setValue(event);
  }

  public loadInitialSelectValues(): void {
    this.filteredSectorMulti.next(this.sectors.slice());
    this.filteredCnaePrimaMulti.next(this.cnaes.slice());
    this.filteredCnaeSecundMulti.next(this.cnaesSecundarios.slice());
    this.filteredNcmMulti.next(this.ncm.slice());
  }

  protected setSectorInitialValue() {
    this.filteredSectorMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.sectorSelect.compareWith = (a: Sector, b: Sector) => a && b && a.codigo === b.codigo;
      });
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
    let payloadSector = this.sectorMultiCtrl.value !== null ? this.sectorMultiCtrl.value.map((i: IFilterCnae) => i.codigo) : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];
    this.getCnaes(payloadSector);
    this.cnaePrimaMultiCtrl.updateValueAndValidity();
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

  public onKeyUpSocioValue(): void {
    if(this.form.get('partner')?.errors?.pattern){
      return;
    }
    this.socioFilteredValue.emit(this.form.get('partner')?.value);
  }
  public onKeyUpNomeValue(): void {
    this.nomeFilteredValue.emit(this.form.get('name')?.value);
  }
  public onKeyUpCnpjValue(): void {
    if(this.form.get('cnpj')?.errors?.pattern){
      return;
    }
    this.cnpjFilteredValue.emit(this.form.get('cnpj')?.value);
  }

  public onKeyUpLabelValue(): void {
    // console.log(this.formLabel.get('label')?.value);
  }

  public onStateMultiSelectionChange(event: any): void {
    this.stateFilteredValue.emit(this.form.get('estate')?.value);
  }
  public onCityMultiSelectionChange(event: any): void {
    this.cityFilteredValue.emit(this.form.get('city')?.value);
  }
  public onNeighbourhoodMultiSelectionChange(event: any): void {
    this.neighbourhoodFilteredValue.emit(this.form.get('neighbourhood')?.value);
  }
  public onKeyUpCEPValue(): void {
    this.cepFilteredValue.emit(this.form.get('cep')?.value);
  }
  public onKeyUpLogradouroValue(): void {
    this.logradouroFilteredValue.emit(this.form.get('logradouro')?.value);
  }
  public onKeyUpStNumberValue(): void {
    this.stNumberFilteredValue.emit(this.form.get('stNumber')?.value);
  }
  public onCompanySizeMultiSelectionChange(): void {
    this.companySizeFilteredValue.emit(this.form.get('companySize')?.value);
  }
  public onKeyUpTelephoneValue(): void {
    this.telephoneFilteredValue.emit(this.form.get('telephone')?.value);
  }
  public onInitialDateValueUpdate(): void {
    if(this.form.get('dataAberturaInicio')?.value){
      if(this.errorInitialDate){
        return;
      }
      this.initialDateFilteredValue.emit(moment(this.form.get('dataAberturaInicio')?.value).format('DD/MM/YYYY'));
    } else{
      this.initialDateFilteredValue.emit();
    }
  }

  public onFinalDateValueUpdate(): void {
    if(this.form.get('dataAberturaFim')?.value){
      if(this.errorFinalDate){
        return;
      }
      this.finalDateFilteredValue.emit(moment(this.form.get('dataAberturaFim')?.value).format('DD/MM/YYYY'));
    } else{
      this.finalDateFilteredValue.emit();
    }
  }

  public dropSpecialCharacters(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '');

  }
  public clearFilters(): void {
    this.form.reset();
    if(!this.form.get('estate')?.value){
      this.form.get('city')?.disable();
      this.form.get('neighbourhood')?.disable();
    }
    this.getFilterData();
    this.sectorMultiCtrl.reset();
    this.selectedSectorValue.emit([]);
    this.cnaePrimaMultiCtrl.reset();
    this.selectedCnaePrimarioValue.emit([]);
    this.cnaeSecundMultiCtrl.reset();
    this.selectedCnaeSecundarioValue.emit([]);
    this.ncmMultiCtrl.reset();
    this.selectedNcmValue.emit([]);
    this.form.reset();
    this.socioFilteredValue.emit('');
    this.nomeFilteredValue.emit('');
    this.cnpjFilteredValue.emit('');
    this.stateFilteredValue.emit('');
    this.cityFilteredValue.emit('');
    this.neighbourhoodFilteredValue.emit('');
    this.form.get('companySize')?.reset();
    this.form.reset();
    this.companySizeFilteredValue.emit([]);
    this.telephoneFilteredValue.emit('');
    this.previousSearchsEmitter.emit([]);
    this.getPreviousSearch();
    this.getCnaes(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"]);
  }

  public getCitiesValue(): void {
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0){
      this._dashboardService.getCidade(this.form.get('estate')?.value).subscribe((res) => {
        if(res.result.length > 0){
          this.cities = res.result;
          this.form.get('city')?.enable();
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
    if(this.form.get('estate')?.value && this.form.get('estate')?.value.length > 0 && this.form.get('city')?.value && this.form.get('city')?.value.length > 0){
      this._dashboardService.getBairro(this.getCodigoIBGE()).subscribe((res) => {
        if(res){
          this.neighbourhoods = res.result;
          this.form.get('neighbourhood')?.enable();
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
      this._dashboardService.getCEP(this.form.get('cep')?.value).subscribe((res) => {
        if(res.result){
          this.onKeyUpCEPValue();
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
          this.onKeyUpLogradouroValue();
          return;
        }
        return;
      });

  }

  public getCnaes(payload: any): void {
    let payloadSector = this.sectorMultiCtrl.value !== null ? this.sectorMultiCtrl.value.map((i: IFilterCnae) => i.codigo) : [];

    this._dashboardService.getCnaesFromSection(payload).subscribe((res) => {
      if(res.result?.length < 0){
        this.cnaes = [];
        return;
      }
      this.cnaes = res.result;
      this.cnaePrimaMultiCtrl.enable();
    })
  }

  public getPreviousSearch(): void {
    this.userPath = this._authService.userPath().length > 0 ? this._authService.userPath() : String(localStorage.getItem('PATH_USER'));
    const SessionSearchPath = `${this.userPath}/Pesquisa/PegarPesquisas`;
    const userLoginData = this._authService.userLoginData().length > 0 ? this._authService.userLoginData() : String(localStorage.getItem('LOGIN_KEY'));
    this._authService.userSessionPath.set(SessionSearchPath);
    this._authService.generateUserSignatureSession(userLoginData);

    this._authService.userKey.subscribe((res) => {
      this.userSignatureSession = res;
    });

    const dados = {
      filtro : {
        dataInicio : '',
        dataFim : '',
     },
     maxCount : 20,
    }

    this._dashboardService.filterAllSearchs(this.userPath, dados, this.userSignatureSession).subscribe((res) => {
      if(res){
        this.previousSearchs = res;
        this.previousSearchsEmitter.next(res.result);
      }
    }, () => {
      this.getPreviousSearch();
    })
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
        this.payloadMunicipios.push(removeAccents.remove(element));
      })

    }

    const sectorsPayload = this.sectorMultiCtrl.value !== null ? this.sectorMultiCtrl.value.map((i: IFilterCnae) => i.codigo) : null;
    const cnaePrimaPayload = this.cnaePrimaMultiCtrl.value !== null ? this.cnaePrimaMultiCtrl.value.map((i: IFilterCnae) => i.codigo) : null;

    const ncmPayload = this.ncmMultiCtrl.value !== null ? this.ncmMultiCtrl.value.map((i: IFilterCnae) => i.codigo) : null;
    const companySize = this.form.get('companySize')?.value ? this.form.get('companySize')?.value : null;
    let filter = {
      setores: sectorsPayload,
      cnae: cnaePrimaPayload,
      buscarCnaesSecundarios: this.form.get('cnaeSecundario')?.value,
      ncms: ncmPayload,
      uf: this.form.get('estate')?.value ? this.form.get('estate')?.value : null,
      municipio: this.payloadMunicipios.length > 0 ? this.payloadMunicipios : null,
      bairro: this.form.get('neighbourhood')?.value ? this.form.get('neighbourhood')?.value : null,
      cep: this.form.get('cep')?.value ? this.form.get('cep')?.value : null,
      logradouro: this.form.get('logradouro')?.value ? this.form.get('logradouro')?.value : null,
      socio: this.form.get('partner')?.value ? this.form.get('partner')?.value : null,
      nome: this.form.get('name')?.value ? this.form.get('name')?.value : null,
      telefone: this.form.get('telephone')?.value ? this.form.get('telephone')?.value : null,
      numero: this.form.get('stNumber')?.value ? this.form.get('stNumber')?.value : null,
      porte: companySize,
      naturezaJuridica: this.form.get('legalNature')?.value ? this.form.get('legalNature')?.value : null,
      regime: this.form.get('feeType')?.value ? this.form.get('feeType')?.value : null,
      cnpj: this.form.get('cnpj')?.value ? this.dropSpecialCharacters(this.form.get('cnpj')?.value) : null,
      dataAberturaInicio: this.form.get('dataAberturaInicio')?.value ? this.form.get('dataAberturaInicio')?.value : null,
      dataAberturaFim: this.form.get('dataAberturaFim')?.value ? this.form.get('dataAberturaFim')?.value : null,
    }

    const dados = {
    filtro: filter,
    descricaoConsulta: this.formLabel.get('label')?.value ? this.formLabel.get('label')?.value : null,
    identificadorConsulta: '11222',
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
  public previousSearchRequest(filter: any): void {
    this._dashboardService.isLoading.set(true);
      this.userPath = this._authService.userPath().length > 0 ? this._authService.userPath() : String(localStorage.getItem('PATH_USER'));
      const SessionSearchPath = `${this.userPath}/Empresa/PegarEmpresasSegundoFiltro`;
      const userLoginData = this._authService.userLoginData().length > 0 ? this._authService.userLoginData() : String(localStorage.getItem('LOGIN_KEY'));

      this._authService.userSessionPath.set(SessionSearchPath);
        this._authService.generateUserSignatureSession(userLoginData);

    this._authService.userKey.subscribe((res) => {
      this.userSignatureSession = res;
    });

    // if(this.form.get('city')?.value){
    //   this.form.get('city')?.value.forEach((element: string) => {
    //     this.payloadMunicipios.push(removeAccents.remove(element));
    //   })

    // }

    const dados = {
      filtro: filter?.filter,
      descricaoConsulta: filter?.descricaoConsulta,
      identificadorConsulta: '11222',
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
  //  this._dashboardService.getListaCnae().subscribe((res: any) => {
  //   this.cnaes = res?.result;
  //   this.cnaesSecundarios = res?.result;
  //    });
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
     });
  }

  public validateSocioInput(): string {
    if (this.form.get('partner')?.hasError('required')) {
      return 'Inserir apenas letras';
    }

    return this.form.get('partner')?.hasError('pattern') ? 'Inserir apenas letras' : '';
  }

  public validateInitialDate(): string {
    const dataAtual = moment().format('DD/MM/yyyy');
    const dataFinal = moment(this.form.get('dataAberturaFim')?.value).format('DD/MM/yyyy')
    const dataInicial= moment(this.form.get('dataAberturaInicio')?.value).format('DD/MM/yyyy')

    if(this.form.get('dataAberturaInicio')?.dirty && dataInicial > dataAtual){
      this.errorInitialDate = true;
      return 'Data Inicial não pode ser maior do que a data Atual!'
    }
    if(this.form.get('dataAberturaFim')?.dirty && this.form.get('dataAberturaInicio')?.dirty && dataInicial > dataFinal){
      this.errorInitialDate = true;
      return 'Data Inicial não pode ser maior do que a data Final!'
    }
    this.errorInitialDate = false;
    return '';
  }
  public validateFinalDate(): string {
    const dataAtual = moment().format('DD/MM/yyyy');
    const dataFinal = moment(this.form.get('dataAberturaFim')?.value).format('DD/MM/yyyy')
    const dataInicial= moment(this.form.get('dataAberturaInicio')?.value).format('DD/MM/yyyy')

    if(this.form.get('dataAberturaFim')?.dirty && dataFinal > dataAtual){
      this.errorFinalDate = true;
      return 'Data final não pode ser maior do que a data Atual!'
    }
    if(this.form.get('dataAberturaFim')?.dirty && this.form.get('dataAberturaInicio')?.dirty && dataFinal < dataInicial){
      this.errorFinalDate = true;
      return 'Data final não pode ser menor do que a data Inicial!'
    }
    this.errorFinalDate = false;
    return '';
  }

  public getErrorMessageDocument() {
    if(this.form.get('cnpj')?.errors?.pattern){
      return 'Documento inválido';
    }

    return '';
  }


}
