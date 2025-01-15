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
        label = 'Presidente';
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
      case EQualificacaoSocio.SOCIO_CAPITALISTA:
        label = 'Sócio capitalista';
        break;
      case EQualificacaoSocio.SOCIO_COMANDITADO:
        label = 'Sócio comanditado';
        break;
      case EQualificacaoSocio.SOCIO_COMANDITARIO:
        label = 'Sócio comanditário';
        break;
      case EQualificacaoSocio.SOCIO_INDUSTRIA:
        label = 'Sócio de indústria';
        break;
      case EQualificacaoSocio.SOCIO_GERENTE:
        label = 'Sócio Gerente';
        break;
      case EQualificacaoSocio.SOCIO_INCAPAZ_OU_RELATOR_INCAPAZ:
        label = 'Sócio incapaz ou relator incapaz (Exceto menor)';
        break;
      case EQualificacaoSocio.SOCIO_MENOR:
        label = 'Sócio Menor (Assistido/Representado)';
        break;
      case EQualificacaoSocio.SOCIO_OSTENSIVO:
        label = 'Sócio Ostensivo';
        break;
      case EQualificacaoSocio.TABELIAO:
        label = 'Tabelião';
        break;
      case EQualificacaoSocio.TESOUREIRO:
        label = 'Tesoureiro';
        break;
      case EQualificacaoSocio.TITULAR_EMPRESA_INDIVIDUAL_IMOBILIARIA:
        label = 'Titular de Empresa Individual Imobiliária';
        break;
      case EQualificacaoSocio.TUTOR:
        label = 'Tutor';
        break;
      case EQualificacaoSocio.SOCIO_PESSOA_JURIDICA_DOMICILIADO_NO_EXTERIOR:
        label = 'Sócio Pessoa Jurídica Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.SOCIO_PESSOA_FISICA_RESIDENTE_NO_EXTERIOR:
        label = 'Sócio Pessoa Física Residente no Exterior';
        break;
      case EQualificacaoSocio.DIPLOMATA:
        label = 'Diplomata';
        break;
      case EQualificacaoSocio.CONSUL:
        label = 'Cônsul';
        break;
      case EQualificacaoSocio.REPRESENTANTE_DE_ORGANIZACAO_INTERNACIONAL:
        label = 'Representante de Organização Internacional';
        break;
      case EQualificacaoSocio.OFICIAL_DE_REGISTRO:
        label = 'Oficial de registro';
        break;
      case EQualificacaoSocio.RESPONSAVEL:
        label = 'Responsável';
        break;
      case EQualificacaoSocio.MINISTRO_DE_ESTADO_DAS_RELACOES_EXTERIORES:
        label = 'Ministro de Estado das Relações Exteriores';
        break;
      case EQualificacaoSocio.SOCIO_PESSOA_FISICA_RESIDENTE_NO_BRASIL:
        label = 'Sócio Pessoa Física Residente no Brasil';
        break;
      case EQualificacaoSocio.SOCIO_PESSOA_JURIDICA_DOMICILIADA_NO_BRASIL:
        label = 'Sócio Pessoa Jurídica Domiciliado no Brasil';
        break;
      case EQualificacaoSocio.SOCIO_ADMINISTRADOR:
        label = 'Sócio-Administrador';
        break;
      case EQualificacaoSocio.EMPRESARIO:
        label = 'Empresário';
        break;
      case EQualificacaoSocio.CANDIDATO_A_CARGO_POLITICO_ELETIVO:
        label = 'Candidato a cargo político eletivo';
        break;
      case EQualificacaoSocio.SOCIO_COM_CAPITAL:
        label = 'Sócio com capital';
        break;
      case EQualificacaoSocio.SOCIO_SEM_CAPITAL:
        label = 'Sócio sem Capital';
        break;
      case EQualificacaoSocio.FUNDADOR:
        label = 'Fundador';
        break;
      case EQualificacaoSocio.SOCIO_COMANDITADO_RESIDENTE_NO_EXTERIOR:
        label = 'Sócio Comanditado Residente no Exterior';
        break;
      case EQualificacaoSocio.SOCIO_COMANDITARIO_PESSOA_FISICA_RESIDENTE_NO_EXTERIOR:
        label = 'Sócio Comanditário Pessoa Física Residente no Exterior';
        break;
      case EQualificacaoSocio.SOCIO_COMANDITARIO_PESSOA_JURIDICA_DOMICILIADO_NO_EXTERIOR:
        label = 'Sócio Comanditário Pessoa Jurídica Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.SOCIO_COMANDITARIO_INCAPAZ:
        label = 'Sócio Comanditário Incapaz';
        break;
      case EQualificacaoSocio.PRODUTOR_RURAL:
        label = 'Produtor Rural';
        break;
      case EQualificacaoSocio.CONSUL_HONORAIRO:
        label = 'Cônsul Honorário';
        break;
      case EQualificacaoSocio.RESPONSAVEL_INDIGENA:
        label = 'Responsável indígena';
        break;
      case EQualificacaoSocio.REPRESENTANTE_DA_INSTITUICAO_EXTRATERRITORIAL:
        label = 'Representante da Instituição Extraterritorial';
        break;
      case EQualificacaoSocio.COTAS_EM_TESOURARIA:
        label = 'Cotas em Tesouraria';
        break;
      case EQualificacaoSocio.ADMINISTRADOR_JUDICIAL:
        label = 'Administrador Judicial';
        break;
      case EQualificacaoSocio.TITULAR_PESSOA_FISICA_RESIDENTE_OU_DOMICILIADO_NO_BRASIL:
        label = 'Titular Pessoa Física Residente ou Domiciliado no Brasil';
        break;
      case EQualificacaoSocio.TITULAR_PESSOA_FISICA_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Titular Pessoa Física Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.TITULAR_PESSOA_FISICA_INCAPAZ_OU_RELATIVAMENT_INCAPAZ:
        label = 'Titular Pessoa Física Incapaz ou Relativamente Incapaz (exceto menor)';
        break;
      case EQualificacaoSocio.TITULAR_PESSOA_FISICA_MENOR:
        label = 'Titular Pessoa Física Menor (Assistido/Representado)';
        break;
      case EQualificacaoSocio.BENEFICIARIO_FINAL:
        label = 'Beneficiário Final';
        break;
      case EQualificacaoSocio.ADMINISTRADOR_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Administrador Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.CONSELHEIRO_DE_ADMINISTRACAO_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Conselheiro de Administração Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.DIRETOR_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Diretor Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.PRESIDENTE_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Presidente Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.SOCIO_ADMINISTRADOR_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Sócio-Administrador Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.FUNDADOR_RESIDENTE_OU_DOMICILIADO_NO_EXTERIOR:
        label = 'Fundador Residente ou Domiciliado no Exterior';
        break;
      case EQualificacaoSocio.TITULAR_PESSOA_JURIDICA_DOMICILIADA_NO_BRASIL:
        label = 'Titular Pessoa Jurídica Domiciliada no Brasil';
        break;
      case EQualificacaoSocio.TITULAr_PESSOA_JURIDICA_DOMICILIADA_NO_EXTERIOR:
        label = 'Titular Pessoa Jurídica Domiciliada no Exterior';
        break;

    }
    return label;
  }
}
