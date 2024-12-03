import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../../shared/modules/material.module';
import moment from 'moment';


@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class DetailsModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DetailsModalComponent>);
  public data = inject<any>(MAT_DIALOG_DATA);

  public socios: Array<any>;
  constructor() {
    this.socios = this.data.socios;
  }

  ngOnInit() {
    this.socios = this.data.socios;
    console.log('data details: ', this.data);
    console.log('this.socios: ', this.socios);
  }

  onClose(): void {
    this.dialogRef.close();
  }
  public formatPhone(phone: string): String{
    const first = phone.slice(0,4)
    const second = phone.slice(5)
    return `${first}-${second}`;
  }

}
