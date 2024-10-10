import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, DoCheck, Input, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../../shared/modules/material.module';
import { CnpjPipe } from '../../../../shared/pipes/cnpj.pipe';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import * as XLSX from "xlsx";
import { FilterSectionComponent } from './components/filter-section/filter-section.component';
import { DashboardService } from '../../../services/dashboard.service';

export interface ISearchCompanyTable {
  name: string;
  cnpj: string;
  contact: string;
  cnae: string;
  address: string;
  companySize: string;
  position: number;
  socio: string;
}

@Component({
  selector: 'app-company-search',
  templateUrl: './company-search.component.html',
  styleUrls: ['./company-search.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    MaterialModule,
    CnpjPipe,
    FilterSectionComponent
  ],

})

export class CompanySearchComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize!: MatPaginator;

  @Input() searchTableData: boolean = false;

  resultsLength = 0;
  pageSizes = [5, 10, 20];
  public isExcelBtnActive = false;
  public showTable = signal(false);
  public isSearch: boolean = false;
  public contentTable!: any[];
  public data!: any[];
  displayedColumns: string[] = ['select', 'cnpjName', 'contact', 'regime', 'cnae', 'companySize', 'address', 'socio'];
  dataSource = new MatTableDataSource<ISearchCompanyTable>(this.data);
  dataSourceWithPageSize = new MatTableDataSource(this.data);
  selection = new SelectionModel<ISearchCompanyTable>(true, []);

  public selectedSector: any;
  public selectedCnaePrima: any;
  public selectedCnaeSecund: any;
  public selectedNcm: any;
  public filterInputSocio: string = '';
  public filterInputCnpj: string = '';
  public filterInputNome: string = '';
  public selectedFilterLabelShow: boolean = false;
  constructor(
    private _dialog: MatDialog,
    public dashboardService: DashboardService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSourceWithPageSize.paginator = this.paginatorPageSize;
  }

  ngDoCheck(): void {
    if(this.selection.selected.length > 0) {
      this.isExcelBtnActive = true;
    } else if(this.selection.selected.length <= 0){
      this.isExcelBtnActive = false;
    }

  }

  public recieveTableData(event: any): void {
    this.dataSource.data = event;
    console.log('event: ', event);
    this.dataSourceWithPageSize.data = event;
    this.resultsLength = event.length;
    this.showTable.set(true);
    this.dashboardService.isLoading.set(false);
    console.log("this.showTable(): ",this.showTable() );
  }

  public openDetailsModal(element: any): void {
    this._dialog.open(DetailsModalComponent, { data: element})
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ISearchCompanyTable): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  public clearTable(): void {
    this.dataSource.data = [];
    this.dataSourceWithPageSize.data = [];
    this.searchTableData = false;
    this.showTable.set(false);
  }

  public filteredSelectedSectorEvent(event: any): void {
    this.selectedSector = event.map((i: any) => i?.descricao);
    if(this.selectedSector.length > 0){
      this.selectedFilterLabelShow = true;
    }
  }
  public filteredSelectedCnaePrimaEvent(event: any): void {
    this.selectedCnaePrima = event.map((i: any) => i?.descricao);
    if(this.selectedCnaePrima.length > 0){
      this.selectedFilterLabelShow = true;
    }
  }
  public filteredSelectedCnaeSecundEvent(event: any): void {
    this.selectedCnaeSecund = event.map((i: any) => i?.descricao);
    if(this.selectedCnaeSecund.length > 0){
      this.selectedFilterLabelShow = true;
    }
  }
  public filteredSelectedNcmEvent(event: any): void {
    this.selectedNcm = event.map((i: any) => i?.descricao);
    if(this.selectedNcm.length > 0){
      this.selectedFilterLabelShow = true;
    }
  }
  public filteredSocioEvent(event: any): void {
      this.filterInputSocio = event;
      if(this.filterInputSocio.length > 0){
        this.selectedFilterLabelShow = true;
      }
  }
  public filteredNomeEvent(event: any): void {
      this.filterInputNome = event;
      if(this.filterInputNome.length > 0){
        this.selectedFilterLabelShow = true;
      }
  }
  public filteredCnpjEvent(event: any): void {
      this.filterInputCnpj = event;
      if(this.filterInputCnpj.length > 0){
        this.selectedFilterLabelShow = true;
      }
  }

  public exportToExcel(): void {
    let name = '';
    let timeSpan = new Date().toISOString();
    let prefix = name || 'ExportResult';
    let fileName = `${prefix}-${timeSpan}`;
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(this.selection.selected);
    XLSX.utils.book_append_sheet(wb, ws);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

}
