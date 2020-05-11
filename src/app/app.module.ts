import { environment } from '../environments/environment'

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule, ScreenTrackingService } from '@angular/fire/analytics';


// Chart imports
import { NgxChartsModule } from '@swimlane/ngx-charts/';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlotsComponent } from './plots/plots.component';
import { NumberKMBTPipe } from './number-kmbt.pipe';
import { NavigationComponent } from './navigation/navigation.component';
import { AboutComponent } from './about/about.component';
import { ConPresetComponent } from './controls/con-preset/con-preset.component';
import { ConDragChartComponent } from './controls/con-drag-chart/con-drag-chart.component';
import { ConDiseaseComponent } from './controls/con-disease/con-disease.component';
import { ConPlotComponent } from './controls/con-plot/con-plot.component';

import { ConChartComponent } from './controls/con-chart/con-chart.component';
import { CircleSeriesComponent } from './controls/con-chart/circle-series.component';
import { CircleComponent } from './controls/con-chart/circle.component';
import { ConDpadComponent } from './controls/con-dpad/con-dpad.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PlotsComponent,
    NumberKMBTPipe,
    NavigationComponent,
    AboutComponent,
    ConPresetComponent,
    ConDragChartComponent,
    ConDiseaseComponent,
    ConPlotComponent,
    ConChartComponent,
    CircleSeriesComponent,
    CircleComponent,
    ConDpadComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxChartsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
  ],
  providers: [ScreenTrackingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
