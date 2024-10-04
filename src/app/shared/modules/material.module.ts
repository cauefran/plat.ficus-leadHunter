import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatGridListModule,
    MatExpansionModule,
    MatSelectModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatListModule,
    MatChipsModule
  ],
  exports: [
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatGridListModule,
    MatExpansionModule,
    MatSelectModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatListModule,
    MatChipsModule

  ],
  providers: [],
})

export class MaterialModule { }
