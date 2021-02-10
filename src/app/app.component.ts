import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DbServiceService } from './services/db-service.service';
import { AdMob } from '@admob-plus/ionic';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

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
    private keyboard: Keyboard,
    private oneSignal: OneSignal,
    private deeplinks: Deeplinks
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

      this.setupOneSignal();
      this.setupDeeplinks();
    });
  }

  setupOneSignal() {
    this.oneSignal.startInit('e432b79e-c33f-4474-9f2c-e2302ebdec63', '467223816790');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleNotificationReceived().subscribe(() => {
    // do something when notification is received
    });

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      // do something when a notification is opened
    });

    this.oneSignal.endInit();
  }

  setupDeeplinks() {
    this.deeplinks.route({ '/review':  '/'}).subscribe(
      match => {
        console.log('Successfully matched route', match);

      },
      nomatch => {
        // nomatch.$link - the full link data
        if (nomatch.$link.host.includes('review')) {
          if (this.platform.is('ios')) {
            window.open("https://apps.apple.com/us/app/the-hustle-trivia-party-game/id1550992232","_system");
          } else {
            window.open("https://play.google.com/store/apps/details?id=com.austinhunter.thehustle","_system");
          }
        }
      }
    );
  }
}
