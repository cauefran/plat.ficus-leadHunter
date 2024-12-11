import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../../../../../shared/modules/material.module';
import { CnpjPipe } from '../../../../../../../../shared/pipes/cnpj.pipe';
import { MatPaginator } from '@angular/material/paginator';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-pgfn-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    MaterialModule,
    CnpjPipe
  ],
  templateUrl: './pgfn-table.component.html',
  styleUrl: './pgfn-table.component.scss'
})
export class PgfnTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize!: MatPaginator;

  readonly dialogRef = inject(MatDialogRef<PgfnTableComponent>);
  public data = inject<any>(MAT_DIALOG_DATA);
  displayedColumns: string[] = ['cpfCnpj', 'nome', 'nomeFantasia', 'dataConsulta', 'valor' ];
  dataSource = new MatTableDataSource<any>(this.data);
  dataSourceWithPageSize = new MatTableDataSource(this.data);
  selection = new SelectionModel<any>(true, []);

  constructor(){

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
