import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
// import { LayoutModule } from '@angular/cdk/layout';

import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSortModule } from '@angular/material/sort';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatSelectModule } from '@angular/material/select';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatTreeModule } from '@angular/material/tree';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const modules = [
  CommonModule,
  FormsModule,
  // LayoutModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatTabsModule,
  MatCardModule,
  MatSliderModule,
  // MatInputModule,
  // MatSidenavModule,
  // MatListModule,
  // MatTableModule,
  // MatPaginatorModule,
  // MatCheckboxModule,
  // MatSortModule,
  // MatFormFieldModule,
  // MatProgressBarModule,
  // MatDividerModule,
  // MatMenuModule,
  // MatExpansionModule,
  // MatButtonToggleModule,
  // MatSelectModule,
  // MatRadioModule,
  // MatTreeModule,
  // MatProgressSpinnerModule,
]

@NgModule({
  declarations: [],
  imports: [modules
  ],
  exports: [modules]
})
export class MaterialModule { }
