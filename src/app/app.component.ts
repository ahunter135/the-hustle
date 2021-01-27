import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DbServiceService } from './services/db-service.service';

declare var admob;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dbService: DbServiceService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.dbService.setupDBConnection();
      admob.setDevMode(false);
      admob.banner.show({id: {
        ios: "ca-app-pub-7853858495093513/2510882577",
        android: "ca-app-pub-7853858495093513/6641699272"
      }});
    });
  }
}
