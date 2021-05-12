import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LoadingController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-name-that-song',
  templateUrl: './name-that-song.page.html',
  styleUrls: ['./name-that-song.page.scss'],
})
export class NameThatSongPage implements OnInit {
  loader;
  isLoading = false;
  constructor(public loadingController: LoadingController, private platform: Platform, private admob: AdMob, private router: Router, private onesignal: OneSignal) { }

  async ngOnInit() {
    await this.presentLoading();
    await this.getGameData();
    await this.loader.dismiss();
  }

  async presentLoading() {
    this.loader = await this.loadingController.create({
      message: 'Finding Player'
    });
    await this.loader.present();

    this.isLoading = true;
  }

  async dismissLoading() {
    await this.loader.dismiss();
  }

  /**
   * What to solve:
   * - How to get game data from Deezer api
   *    Should it be from firebase or straight http calls?
   * - If straight http calls, how would I store player data to firebase for future?
   * - If firebase, how would I get the http calls onto firebase?
   * 
   * I also want to add https://ionicframework.com/docs/native/speech-recognition for players to answer.
   * Think song quiz but on a mobile app instead of Alexa
   */
  async getGameData() {
    // call http services to get all the game data necessary
  }
  
  async cancel() {
    /**
     * Add an "Are you sure?" button here
     */
    await this.showAdAndLeave();
  }

  showAdAndLeave() {
    if (!this.platform.is('cordova')) {
      this.router.navigateByUrl("/home", {
        replaceUrl: true
      });
      return
    }
    this.presentLoading();

    this.admob.interstitial.load({
      id: {
        android: 'ca-app-pub-8417638044172769/2470631346',
        ios: 'ca-app-pub-8417638044172769/1204515667'
      }
    }).then((res) => {
      this.admob.interstitial.show().then(() => {
        this.dismissLoading();
        this.onesignal.addTrigger('leave', true);
        this.router.navigateByUrl("/home", {
          replaceUrl: true
        });
      }, (reason) => {
        console.log(reason);
        this.dismissLoading();
          this.onesignal.addTrigger('leave', true);
        this.router.navigateByUrl("/home", {
          replaceUrl: true
        });
      });
    }, (reason) => {
      console.log(reason);
      this.dismissLoading();
      this.onesignal.addTrigger('leave', true);
      this.router.navigateByUrl("/home", {
        replaceUrl: true
      });
    }).catch(() => {
      this.dismissLoading();
    });
    return;
  }
}
