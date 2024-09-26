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
  public selectedSectors: IFilterCnae[] = new Array<IFilterCnae>();
  public filteredSectors!: Observable<IFilterCnae[]>;
  public lastFilterSector: string = '';
  public displayValueSector: string = '';

  public cnaes: Array<IFilterCnae> = [];
  public municipios: Array<IFilterCnae> = [];
  public ncm: Array<IFilterCnae> = [];
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
  public data: any[] = [
    { position: 1, cnpj: '37984878000119', name: 'RANCK MAGRISSO', contact: '(81) 3048-2521', cnae: 'M-6911-7/01 - Serviços advocatícios', address: 'Quadra Sig Quadra 4, 106, Brasilia - Zona Industrial, DF - 70.610-440', companySize: 'pequeno' },
    { position: 2, cnpj: '97554129000183', name: 'RAPHAEL MIRANDA ADVOGADOS', contact: '(21) 3806-3650', cnae: ' M-6911-7/01 - Serviços advocatícios', address: 'Rua Visconde De Piraja, 430, Rio De Janeiro - Ipanema, RJ - 22.410-002', companySize: 'pequeno' },
    { position: 3, cnpj: '97543925000110', name: 'BRUTO E REGIS ADVOGADOS', contact: '(81) 3037-3377', cnae: 'M-6911-7/01 - Serviços advocatícios', address: 'Rua Doutor Clovis Ribeiro Vieira, 640, Franca - Sao Jose, SP - 14.401-303', companySize: 'pequeno' },
    { position: 4, cnpj: '75264400000103', name: 'Escritorio De Advocacia Antonio Jose Marques Neto', contact: '(51) 3346-2255', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
    { position: 5, cnpj: '67333974000168', name: 'JJ OLIVEIRA ADVOGADOS ASSOCIADOS', contact: '(51) 3275-2450', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
    { position: 6, cnpj: '42644256000181', name: 'Castilho Caracik Advogados Associados', contact: '(51) 99128-2268', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
    { position: 7, cnpj: '42375188000100', name: 'Silverio Marcal Advocacia', contact: '(61) 3326-0477', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
    { position: 8, cnpj: '37436877000130', name: 'Advocacia Marly Fagundes Advogados Associados', contact: '(61) 97400-8216', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
    { position: 9, cnpj: '41659868000185', name: 'Jj Oliveira Advogados Associados Sociedade Simples', contact: '(61) 97400-8216', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
    { position: 10, cnpj: '46497428000192', name: 'Guimaraes E Meireles Advogados Associados', contact: '(61) 97400-8216', cnae: 'M-6911-7/01 - Serviços advocatícios', address: '', companySize: 'pequeno' },
  ];

  public userPath = '';
  public userSignatureSession = '';
  public payloadMunicipios: Array<string> = [];

  // TESTE *********************

  userControl = new FormControl();

  users = [
    new User('Misha', 'Arnold'),
    new User('Felix', 'Godines'),
    new User('Odessa', 'Thorton'),
    new User('Julianne', 'Gills'),
    new User('Virgil', 'Hommel'),
    new User('Justa', 'Betts'),
    new User('Keely', 'Millington'),
    new User('Blanca', 'Winzer'),
    new User('Alejandrina', 'Pallas'),
    new User('Rosy', 'Tippins'),
    new User('Winona', 'Kerrick'),
    new User('Reynaldo', 'Orchard'),
    new User('Shawn', 'Counce'),
    new User('Shemeka', 'Wittner'),
    new User('Sheila', 'Sak'),
    new User('Zola', 'Rodas'),
    new User('Dena', 'Heilman'),
    new User('Concepcion', 'Pickrell'),
    new User('Marylynn', 'Berthiaume'),
    new User('Howard', 'Lipton'),
    new User('Maxine', 'Amon'),
    new User('Iliana', 'Steck'),
    new User('Laverna', 'Cessna'),
    new User('Brittany', 'Rosch'),
    new User('Esteban', 'Ohlinger'),
    new User('Myron', 'Cotner'),
    new User('Geri', 'Donner'),
    new User('Minna', 'Ryckman'),
    new User('Yi', 'Grieco'),
    new User('Lloyd', 'Sneed'),
    new User('Marquis', 'Willmon'),
    new User('Lupita', 'Mattern'),
    new User('Fernande', 'Shirk'),
    new User('Eloise', 'Mccaffrey'),
    new User('Abram', 'Hatter'),
    new User('Karisa', 'Milera'),
    new User('Bailey', 'Eno'),
    new User('Juliane', 'Sinclair'),
    new User('Giselle', 'Labuda'),
    new User('Chelsie', 'Hy'),
    new User('Catina', 'Wohlers'),
    new User('Edris', 'Liberto'),
    new User('Harry', 'Dossett'),
    new User('Yasmin', 'Bohl'),
    new User('Cheyenne', 'Ostlund'),
    new User('Joannie', 'Greenley'),
    new User('Sherril', 'Colin'),
    new User('Mariann', 'Frasca'),
    new User('Sena', 'Henningsen'),
    new User('Cami', 'Ringo')
  ];

  selectedUsers: User[] = new Array<User>();

  filteredUsers!: Observable<User[]>;
  lastFilter: string = '';
  displayValue: string = '';

  //

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
    this.filteredUsers = this.userControl.valueChanges.pipe(
      startWith<string | User[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilter),
      map(filter => this.filter(filter))
    );
    this.filteredSectors = this.sectorControl.valueChanges.pipe(
      startWith<string | IFilterCnae[]>(''),
      map(value => typeof value === 'string' ? value : this.lastFilterSector),
      map(filter => this.filterSector(filter))
    );


    this. getFilterData();
    this.form.get('city')?.disable();
    this.form.get('neighbourhood')?.disable();
  }

  // TESTE *****************************

  public filter(filter: string): User[] {
    this.lastFilter = filter;
    if (filter) {
      return this.users.filter(option => {
        return option.firstname.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.lastname.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      })
    } else {
      return this.users.slice();
    }
  }

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

  public displayFn(value: User[] | string): string {
    if (Array.isArray(value)) {
      value.forEach((user, index) => {
        if (index === 0) {
          this.displayValue = user.firstname + ' ' + user.lastname;
        } else {
          this.displayValue += ', ' + user.firstname + ' ' + user.lastname;
        }
      });
    } else {
      this.displayValue = value;
    }
    return this.displayValue;
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

  public optionClicked(event: Event, user: User) {
    event.stopPropagation();
    this.toggleSelection(user);
  }

  public optionClickedSector(event: Event, sector: Sector) {
    event.stopPropagation();
    this.toggleSelectionSector(sector);
  }

  public toggleSelection(user: User) {
    user.selected = !user.selected;
    if (user.selected) {
      this.selectedUsers.push(user);
    } else {
      const i = this.selectedUsers.findIndex(value => value.firstname === user.firstname && value.lastname === user.lastname);
      this.selectedUsers.splice(i, 1);
    }

    this.userControl.setValue(this.selectedUsers);
  }

  public toggleSelectionSector(sector: Sector) {
    sector.selected = !sector.selected;
    if (sector.selected) {
      this.selectedSectors.push(sector);
    } else {
      const i = this.selectedSectors.findIndex(value => value.codigo === sector.codigo && value.descricao === sector.descricao);
      this.selectedSectors.splice(i, 1);
    }

    this.sectorControl.setValue(this.selectedUsers);
  }

  // ************************************

  public clearFilters(): void {
    this.form.reset();
    if(!this.form.get('estate')?.value){
      this.form.get('city')?.disable();
      this.form.get('neighbourhood')?.disable();
    }
    this. getFilterData();

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

    console.log('this.payloadMunicipios', this.payloadMunicipios);

    let filter = {
      setores: this.form.get('sector')?.value ? this.form.get('sector')?.value : null,
      cnae: this.form.get('cnaePrimario')?.value ? this.form.get('cnaePrimario')?.value : null,
      buscarCnaesSecundarios: this.form.get('cnaeSecundario')?.value ? this.form.get('cnaeSecundario')?.value : null,
      ncms: this.form.get('ncm')?.value ? this.form.get('ncm')?.value : null,
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
