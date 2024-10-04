import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DoCheck, Input, OnInit, ViewChild } from '@angular/core';
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
  imports: [
    CommonModule,
    MaterialModule,
    CnpjPipe,
    FilterSectionComponent
  ],

})

export class CompanySearchComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() searchTableData: boolean = false;

  public isExcelBtnActive = false;
  public isSearch: boolean = false;
  public contentTable!: any[];
  public data!: any[];
  displayedColumns: string[] = ['select', 'cnpjName', 'contact', 'regime', 'cnae', 'companySize', 'regime', 'address', 'socio'];
  dataSource = new MatTableDataSource<ISearchCompanyTable>(this.data);
  selection = new SelectionModel<ISearchCompanyTable>(true, []);

  public selectedSector: any;
  public selectedCnaePrima: any;
  public selectedCnaeSecund: any;
  public selectedNcm: any;

  constructor(
    private _dialog: MatDialog,
    public dashboardService: DashboardService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
    console.log("chegou: ",this.dataSource.data );
    if(this.dataSource.data.length > 0){
      this.dashboardService.isLoading.set(false);
    }
  }

  public openDetailsModal(element: any): void {
    this._dialog.open(DetailsModalComponent, { data: element})
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
    this.searchTableData = false;
  }

  public filteredSelectedSectorEvent(event: any): void {
    console.log('event SelectedSectors: ', event);
    this.selectedSector = event.map((i: any) => i?.descricao)
  }
  public filteredSelectedCnaePrimaEvent(event: any): void {
    console.log('event SelectedSectors: ', event);
    this.selectedCnaePrima = event.map((i: any) => i?.descricao)
  }
  public filteredSelectedCnaeSecundEvent(event: any): void {
    console.log('event SelectedSectors: ', event);
    this.selectedCnaeSecund = event.map((i: any) => i?.descricao)
  }
  public filteredSelectedNcmEvent(event: any): void {
    console.log('event SelectedSectors: ', event);
    this.selectedNcm = event.map((i: any) => i?.descricao)
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
