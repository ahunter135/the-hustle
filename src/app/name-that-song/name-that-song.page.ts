import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import { DbServiceService } from '../services/db-service.service';

@Component({
  selector: 'app-name-that-song',
  templateUrl: './name-that-song.page.html',
  styleUrls: ['./name-that-song.page.scss'],
})
export class NameThatSongPage implements OnInit {
  loader;
  state = "home";
  constructor(public loadingController: LoadingController, private platform: Platform, private admob: AdMob, private router: Router, private onesignal: OneSignal, private dbService: DbServiceService) { }

  async ngOnInit() {
   
  }

  async pickCategory(id) {
    // id is category string of firebase
    this.state = 'loading';
    await this.presentLoading();
    await this.getGameData(id);
    await this.loader.dismiss();
  }

  async presentLoading() {
    this.loader = await this.loadingController.create({
      message: 'Finding Player'
    });
    await this.loader.present();
  }

  async dismissLoading() {
    await this.loader.dismiss();
  }

  async getGameData(id) {
    let game = await this.dbService.getGameData(id);
    console.log(game);
    this.state = "game"
    /**
     * So we got the game data here. What should we do next?
     * 
     * Display the opponent. Display their name. (this.dbService.playerName);
     */
  }
  
  async cancel() {
    /**
     * Add an "Are you sure?" popup button here. See Docs.
     * If they are sure, call the below function. If they say no, do nothing
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
