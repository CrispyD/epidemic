// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material
import { MaterialModule } from './material.module';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlotComponent } from './tools/plot/plot.component';

// Chart imports
import { ChartsModule } from 'ng2-charts';
import { ControlsComponent } from './controls/controls.component';
import { PlotsComponent } from './plots/plots.component';
import { SummaryComponent } from './summary/summary.component';
import { NumberKMBTPipe } from './number-kmbt.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PlotComponent,
    ControlsComponent,
    PlotsComponent,
    SummaryComponent,
    NumberKMBTPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
