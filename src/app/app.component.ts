import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DbServiceService } from './services/db-service.service';
import { AdMob } from '@admob-plus/ionic';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LaunchReview } from '@ionic-native/launch-review/ngx';

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
    private launchReview: LaunchReview
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
    });
  }

  setupOneSignal() {
    this.oneSignal.promptForPushNotificationsWithUserResponse();

    this.oneSignal.startInit('e432b79e-c33f-4474-9f2c-e2302ebdec63', '467223816790');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    this.oneSignal.handleInAppMessageClicked().subscribe((data) => {
      if (data.click_name == 'review') {
        this.launchReview.launch();
      }
    })

    this.oneSignal.handleNotificationReceived().subscribe(() => {
    // do something when notification is received
    });

    this.oneSignal.handleNotificationOpened().subscribe((data) => {
      // do something when a notification is opened
        if (data.notification.payload.additionalData.review) {
          this.launchReview.launch();
        }
    });

    this.oneSignal.endInit();
  }
}
