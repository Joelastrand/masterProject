import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  imports: [MatButtonModule, MatMenuModule, CommonModule, MatIconModule],
  exports: [MatButtonModule, MatMenuModule, CommonModule, MatIconModule],
})
export class MaterialModule { }
