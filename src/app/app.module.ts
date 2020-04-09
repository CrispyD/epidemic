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
import { NavigationComponent } from './navigation/navigation.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PlotComponent,
    ControlsComponent,
    PlotsComponent,
    SummaryComponent,
    NumberKMBTPipe,
    NavigationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ChartsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule
  ],
  providers: [ScreenTrackingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
