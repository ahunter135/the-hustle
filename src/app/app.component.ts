import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DbServiceService } from './services/db-service.service';
import { AdMob } from '@admob-plus/ionic';
import { Keyboard } from '@ionic-native/keyboard/ngx';

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
    private admob: AdMob,
    private keyboard: Keyboard
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.keyboard.disableScroll(false);
      this.keyboard.hideFormAccessoryBar(true);
      this.admob.setDevMode(false);
      this.admob.banner.show({
        id: {
          ios: "ca-app-pub-7853858495093513/2510882577",
          android: "ca-app-pub-7853858495093513/6641699272"
        }
      });
      this.dbService.setupDBConnection();
    });
  }
}
