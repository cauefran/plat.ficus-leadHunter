import { NgModule } from "@angular/core";
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';


@NgModule({
    imports:[
        ChartModule,
        DropdownModule,
        InputTextModule,
        MultiSelectModule
    ],
    exports: [
        ChartModule,
        DropdownModule,
        InputTextModule,
        MultiSelectModule
    ]
})

export class PrimeNgModule {}
