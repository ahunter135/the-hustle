import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DbServiceService } from './services/db-service.service';
import { AdMobFree } from '@ionic-native/admob-free/ngx';

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
    private dbService: DbServiceService,
    private admob: AdMobFree
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.dbService.setupDBConnection();

      if (this.platform.is('ios')) {
        this.admob.banner.config({
          id: "ca-app-pub-7853858495093513/2510882577"
        });
      } else {
        this.admob.banner.config({
          id: "ca-app-pub-7853858495093513/6641699272"
        });
      }
      
      this.admob.banner.prepare().then(() => this.admob.banner.show());
    });
  }
}
