import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import firebase from 'firebase';
import { HttpClientModule } from '@angular/common/http';
import { AdMob } from '@admob-plus/ionic';

var firebaseConfig = {
  apiKey: "AIzaSyCLTnNoAXOI3E13j_doKmRFM8gpkTl4yBM",
  authDomain: "the-hustle-6d380.firebaseapp.com",
  projectId: "the-hustle-6d380",
  storageBucket: "the-hustle-6d380.appspot.com",
  messagingSenderId: "467223816790",
  appId: "1:467223816790:web:d0bab3093d81ccb25269f7",
  measurementId: "G-627KGZ1Q4V"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot({
    mode: 'ios'
  }), AppRoutingModule, HttpClientModule],
  providers: [
    StatusBar,
    SplashScreen,
    AdMob,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
