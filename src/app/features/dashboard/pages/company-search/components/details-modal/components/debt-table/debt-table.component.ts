import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../../../../../shared/modules/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CnpjPipe } from '../../../../../../../../shared/pipes/cnpj.pipe';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-debt-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    MaterialModule,
    CnpjPipe
  ],
  templateUrl: './debt-table.component.html',
  styleUrl: './debt-table.component.scss'
})
export class DebtTableComponent implements OnInit, AfterViewInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize!: MatPaginator;

  readonly dialogRef = inject(MatDialogRef<DebtTableComponent>);
  public data = inject<any>(MAT_DIALOG_DATA);
  displayedColumns: string[] = ['codigo', 'cpfCnpj', 'modalidade', 'qtdParcelasAtraso', 'qtdParcelasConcedidas', 'sistema', 'situacao', 'tipo', 'uf', 'valorConsolidado', 'valorEncargo', 'valorJuros', 'valorMulta', 'valorPrincipal' ];
  dataSource = new MatTableDataSource<any>(this.data);
  dataSourceWithPageSize = new MatTableDataSource(this.data);
  selection = new SelectionModel<any>(true, []);


  constructor(){

  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSourceWithPageSize.paginator = this.paginatorPageSize;
  }


  onClose(): void {
    this.dialogRef.close();
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
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }


}
