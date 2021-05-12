import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import { DbServiceService } from '../services/db-service.service';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

@Component({
  selector: 'app-name-that-song',
  templateUrl: './name-that-song.page.html',
  styleUrls: ['./name-that-song.page.scss'],
})
export class NameThatSongPage implements OnInit {
  loader;
  state = "home";
  options: AnimationOptions = {
    path: '/assets/animations/wave.json',
    autoplay: false,
    loop: true,
    name: 'wave'
  };
  waveAnimation;
  recording = false;
  timer;
  gameData;
  round = 1;
  currentSong;
  

  /**
   * the gimmick will be that as the player answers, we will store if they got it right or wrong like so, 0 = wrong, 1 = right.
   * Then when the game is over, send the object to the backend like so
   * categories/{genre}/games/{new_id} -> {
   *   player: {name: "", correctAnswers: []},
   *   tracks: <use tracks from this.gameData
   * }
   */


  /**
   * 
   * @param loadingController 
   * @param platform 
   * @param admob 
   * @param router 
   * @param onesignal 
   * @param dbService 
   * @param speechRecognition 
   */
  constructor(public loadingController: LoadingController, private platform: Platform, private admob: AdMob, private router: Router, private onesignal: OneSignal, private dbService: DbServiceService,
    private speechRecognition: SpeechRecognition) { }

  async ngOnInit() {}

  /**
   * Use this function to do any state specific stuff.
   * Example: when moving to "home" make sure to clear all timers, etc.
   * When moving to count down, set timer and start it.
   * 
   */
  stateChanged() {
    if (this.state == 'countdown') {
      this.timer = 5
      var myfunc = setInterval(function() {
        this.timer = this.timer - 1;
        if (this.timer <= 0) {
          clearInterval(myfunc);
          this.state = 'song-playing';
          this.stateChanged();
        }
      }.bind(this), 1000)
    } else if (this.state == 'song-playing') {
      this.currentSong = new Audio(this.gameData.tracks[this.round - 1].link);
      this.currentSong.play();
      this.timer = 12;
      var myfunc = setInterval(function() {
        this.timer = this.timer - 1;
        if (this.timer <= 0) {
          clearInterval(myfunc);
          this.currentSong.pause();
          this.state = 'song-stopped';
          this.stateChanged();
        }
      }.bind(this), 1000)
    } else if (this.state == 'song-stopped') {
      this.waveAnimation.stop();
    }
  }

  animationCreated(animationItem: AnimationItem): void {
    animationItem.resize();
    if (animationItem.name == 'wave') {
      this.waveAnimation = animationItem;
      this.waveAnimation.play();
    }
  }

  /**
   * 
   * @param id 
   */
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
    this.gameData = await this.dbService.getGameData(id);
    console.log(this.gameData);
    this.state = "countdown"
    this.stateChanged();
    /**
     * So we got the game data here. What should we do next?
     * 
     * Display the opponent name. Display the name of current user. Hint: (this.dbService.playerName);
     */
  }
   async down() {
     let isAvailable = await this.speechRecognition.isRecognitionAvailable();
     if (isAvailable) {
      let hasPermission = await this.speechRecognition.hasPermission();

      if (!hasPermission) {
        // Request permissions
        this.speechRecognition.requestPermission()
        .then(
          () => {
            this.recording = true;
            this.startListening();
          },
          () => {return}
        )
      } else {
        this.recording = true;
        this.startListening();
      }
     } else return;
   }

   async startListening() {
    this.speechRecognition.startListening({
      language: 'EN-US',
      matches: 2,
    })
    .subscribe(
      (matches: string[]) => console.log(matches),
      (onerror) => console.log('error:', onerror)
    )
   }

   async up() {
    this.recording = false;
    this.speechRecognition.stopListening()
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
