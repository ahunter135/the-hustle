import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import { DbServiceService } from '../services/db-service.service';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { GlobalService } from '../services/global.service';

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
  interval;
  answer;
  image;
  matches;
  currentGameObj = {
    player: {
      name: "",
      correctAnswers: {
        song: [],
        artist: []
      }
    },
    tracks: {}
  }
  score = {
    you: 0,
    opp: 0
  }
  gotSong = false;
  gotArtist = false;
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
    private speechRecognition: SpeechRecognition, private globalService: GlobalService) { }

  async ngOnInit() {}

  /**
   * Use this function to do any state specific stuff.
   * Example: when moving to "home" make sure to clear all timers, etc.
   * When moving to count down, set timer and start it.
   * 
   */
  stateChanged() {
    if (this.state == 'countdown') {
      this.timer = 0
      this.interval = setInterval(function() {
        this.timer = this.timer + 1;
        if (this.timer >= 5) {
          clearInterval(this.interval);
          this.state = 'song-playing';
          this.stateChanged();
        }
      }.bind(this), 1000)
    } else if (this.state == 'song-playing') {
      try {
        this.currentSong = new Audio(this.gameData.tracks[this.round - 1].link);
        this.currentSong.play();
      } catch (error) {
        // something went wrong, more than likely no link is available
        // do something to fix this..
      }
      
      this.timer = 0;
      this.interval = setInterval(function() {
        this.timer = this.timer + 1;
        if (this.timer >= 15) {
          clearInterval(this.interval);
          this.state = 'song-stopped';
          this.stateChanged();
        }
      }.bind(this), 1000)
    } else if (this.state == 'song-stopped') {
      this.waveAnimation.stop();
      this.currentSong.pause();
      this.timer = 0;
      if (!this.recording) {
        this.recording = true;
        this.startListening();
      }
      this.interval = setInterval(function() {
        this.timer = this.timer + 1;
        if (this.timer >= 10) {
          clearInterval(this.interval);
          this.currentSong.pause();
          this.state = 'round-results';
          this.stateChanged();
        }
      }.bind(this), 1000)
    } else if (this.state == 'round-results') {
      this.up();
      if (this.gameData.player.correctAnswers.song[this.round - 1]) this.score.opp++;
      if (this.gameData.player.correctAnswers.artist[this.round - 1]) this.score.opp++;
    } else if (this.state == 'game-over') {
      // Save this game to the DB
      this.dbService.saveGameData(this.gameData);

      //TODO Display who won. Put it all in the "Game Over" card
      /**
       * You can see the score via: this.score.opp & this.score.you
       */
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
    this.currentGameObj.tracks = this.gameData.tracks;
    this.currentGameObj.player.name = this.dbService.playerName;
    console.log(this.gameData);
    this.player = this.dbService.playerName;
    this.opponent = this.gameData.player.name;
    this.state = "countdown"
    this.stateChanged();
    /**
     * So we got the game data here. What should we do next?
     * 
     * Display the opponent name. Display the name of current user. Hint: (this.dbService.playerName);
     */
  }
   async down() {
    this.recording = true;
    clearInterval(this.interval);
    this.state = 'song-stopped';
    this.stateChanged();
     let isAvailable = await this.speechRecognition.isRecognitionAvailable();
     if (isAvailable) {
      let hasPermission = await this.speechRecognition.hasPermission();

      if (!hasPermission) {
        // Request permissions
        this.speechRecognition.requestPermission()
        .then(
          () => {
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
      matches: 3,
      showPopup: this.platform.is('android') ? false : null
    })
    .subscribe(
      (matches: string[])=> {
        this.gotAnswer(matches); 
      },
      (onerror) => {
        //got error, show error and reset timer to let them try again
        // TODO: Show a toast message saying something went wrong, try again.
        clearInterval(this.interval);
        this.state = 'song-stopped';
        this.stateChanged();
      }
    )
   }

   async gotAnswer(matches) {
    this.recording = false;
    this.speechRecognition.stopListening();
     console.log(matches);
     this.matches = matches;
     for (let i = 0; i < matches.length; i++) {
       if (matches[i].includes('repeat')) {
        clearInterval(this.interval);
        this.state = 'song-playing';
        this.stateChanged();
        return;
       }
       matches[i] = matches[i].toLowerCase();
     }

     let isCorrect = await this.globalService.determineCorrectAnswer(this.gameData.tracks[this.round - 1], matches);

     console.log(isCorrect);
     this.determineAnswerString(isCorrect.song, isCorrect.artist);

     clearInterval(this.interval);
     this.state = 'round-results';
      this.stateChanged();
   }

   determineAnswerString(song, artist) {
    if (song || artist) {
      if (song && artist) {
        this.gotSong = true;
        this.gotArtist = true;
        this.score.you += 2;
        this.answer = "You got the song and artist correct!";
      } else if (song) {
        this.gotSong = true;
        this.gotArtist = false;
        this.score.you += 1;
        this.answer = "You got the song correct!";
      } else if (artist) {
        this.gotSong = false;
        this.gotArtist = true;
        this.score.you += 1;
        this.answer = "You got the artist correct!";
      }
    } else {
      this.gotSong = false;
      this.gotArtist = false;
      this.answer = "You got neither correct."
    }
   }

   async up() {
    this.recording = false;
    this.speechRecognition.stopListening();
   }
  
  async cancel() {
    /**
     * TODO
     * Add an "Are you sure?" popup button here. See Docs.
     * If they are sure, call the below function. If they say no, do nothing
     */
    await this.showAdAndLeave();
  }

  async next() {
    this.currentGameObj.player.correctAnswers.song[this.round - 1] = this.gotSong ? 1 : 0;
    this.currentGameObj.player.correctAnswers.artist[this.round - 1] = this.gotArtist ? 1 : 0;

    if (this.round == 6) {
      //Game OVer
      clearInterval(this.interval);
      this.state = 'game-over';
      this.stateChanged();
    } else {
      this.round++;
      clearInterval(this.interval);
      this.state = 'song-playing';
      this.stateChanged();
    }
  }

  capitilizePlayerNames(name) {
    const words = name.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    return words.join(" ");
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
