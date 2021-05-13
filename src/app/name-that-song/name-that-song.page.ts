import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import { DbServiceService } from '../services/db-service.service';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import Speech from 'speak-tts';
import { UseExistingWebDriver } from 'protractor/built/driverProviders';

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
  player;
  opponent;
  constructor(public loadingController: LoadingController, private platform: Platform, private admob: AdMob, private router: Router, private onesignal: OneSignal, private dbService: DbServiceService,
    private speechRecognition: SpeechRecognition) { }

  async ngOnInit() {
    if (this.state == 'home') {
      this.readInstrctions();
    }
  }

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

  async pickCategory(id) {
    // id is category string of firebase
    this.state = 'loading';
    await this.presentLoading();
    await this.getGameData(id);
    await this.loader.dismiss();
  }

  async readInstrctions() {
    const speech = new Speech();
    speech.init({
      volume: .4,
      lang: 'en-US',
      rate: 1,
      pitch: 1,
      splitSentences: true,
      listeners: {
        onvoiceschanged: (voices) => {
            console.log("Event voiceschanged", voices)
          }
      }
    })
      // checks if browser is supported
      .then(data => {
        console.log("Speech is ready", data);
      })
      .catch(e => {
        console.error("An error occured while initializing : ", e);
    });
    speech.speak({
      text: "A 6 second segment of a song from the selected genre will play.Guess the name and artist of the song by saying it after clickingthe button at the bottom of the screen.",
      queue: false,
      listeners: {
        onstart: () => {
          console.log("Start utterance");
        },
        onend: () => {
          console.log("End utterance");
        },
        onboundary: event => {
          console.log(
            event.name +
              " boundary reached after " +
              event.elapsedTime +
              " milliseconds."
          );
        }
      }
    })
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
    this.player = this.dbService.playerName;
    this.opponent = this.gameData.player.name;
    this.state = "countdown"
    this.stateChanged();
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
