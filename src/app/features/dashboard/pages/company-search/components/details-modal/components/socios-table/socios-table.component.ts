import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../../../../../../shared/modules/material.module';
import { EFaxiaEtaria } from '../../../../../../../../shared/enums/faixa-etario-socio.enum';
import { EQualificacaoSocio } from '../../../../../../../../shared/enums/qualificacao-socio.enum';

@Component({
  selector: 'app-socios-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './socios-table.component.html',
  styleUrl: './socios-table.component.scss'
})
export class SociosTableComponent implements AfterViewInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('paginatorPageSize') paginatorPageSize!: MatPaginator;

  readonly dialogRef = inject(MatDialogRef<SociosTableComponent>);
  public data = inject<any>(MAT_DIALOG_DATA);
  displayedColumns: string[] = ['cpfCnpj', 'nome', 'dataEntrada', 'faixaEtaria', 'qualificacao' ];
  dataSource = new MatTableDataSource<any>(this.data);
  dataSourceWithPageSize = new MatTableDataSource(this.data);
  selection = new SelectionModel<any>(true, []);

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

  public socioFaixaEtariaOutput(value: string): string {
    let label = '';
    switch (Number(value)) {
      case EFaxiaEtaria.NAO_SE_APLICA:
        label = 'Não se aplica'
        break;
      case EFaxiaEtaria.ATE_12:
        label = 'Entre 0 a 12';
        break;
      case EFaxiaEtaria.ENTRE_13_A_20:
        label = 'Entre 13 a 20';
        break;
      case EFaxiaEtaria.ENTRE_21_A_30:
        label = 'Entre 21 a 30';
        break;
      case EFaxiaEtaria.ENTRE_31_A_40:
        label = 'Entre 31 a 40';
        break;
      case EFaxiaEtaria.ENTRE_41_A_50:
        label = 'Entre 41 a 50';
        break;
      case EFaxiaEtaria.ENTRE_51_A_60:
        label = 'Entre 51 a 60';
        break;
      case EFaxiaEtaria.ENTRE_71_A_80:
        label = 'Entre 71 a 80';
        break;
      case EFaxiaEtaria.ENTRE_61_A_70:
        console.log('deu certo')
        label = 'Entre 61 a 70';
      break;
      case EFaxiaEtaria.ACIMA_DE_80:
        label = 'Acima de 80';
        break;
    }
    return label;
  }

  public socioQualificacaoOutput(value: number): string {
    let label = ''
    switch (Number(value)){
      case EQualificacaoSocio.NAO_INFORMADA:
        label = 'Não Informada';
      break;
      case EQualificacaoSocio.ADMINISTRADOR:
        label = 'Administrador';
        break;
      case EQualificacaoSocio.CONSELHEIRO_ADMINISTRACAO:
        label = 'Conselheiro de administração';
        break;
      case EQualificacaoSocio.CURADOR:
        label = 'Curador';
        break;
      case EQualificacaoSocio.DIRETOR:
        label = 'Diretor';
        break;
      case EQualificacaoSocio.INTERVENTOR:
        label = 'Interventor';
        break;
      case EQualificacaoSocio.INVENTARIANTE:
        label = 'Inventariante';
        break;
      case EQualificacaoSocio.LIQUIDANTE:
        label = 'Liquidante';
        break;
      case EQualificacaoSocio.MAE:
        label = 'Mãe';
        break;
      case EQualificacaoSocio.PAI:
        label = 'Pai';
        break;
      case EQualificacaoSocio.PRESIDENTE:
        label = 'Equal';
        break;
      case EQualificacaoSocio.PROCURADOR:
        label = 'Procurador';
        break;
      case EQualificacaoSocio.SECRETARIO:
        label = 'Secretário';
        break;
      case EQualificacaoSocio.SINDICO_CONDO:
        label = 'Síndico (condomínio)';
        break;
      case EQualificacaoSocio.SOCIEDADE_CONSORCIADA:
        label = 'Sociedade Consorciada';
        break;
      case EQualificacaoSocio.SOCIEDADE_FILIADA:
        label = 'Sociedade filiada';
        break;
      case EQualificacaoSocio.SOCIO:
        label = 'Socio';
        break;


    }
    return label;
  }
}
