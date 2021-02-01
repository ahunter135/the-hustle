import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { DbServiceService } from '../services/db-service.service';
import { GlobalService } from '../services/global.service';
import { StorageServiceService } from '../services/storage-service.service';

@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.page.html',
  styleUrls: ['./game-screen.page.scss'],
})
export class GameScreenPage implements OnInit {
  players = [];
  playerType;
  playerName;
  roomState = 0;
  loader;
  questions;
  activeIndex = 0;
  activeQuestion = <any>{
    question: "",
    answers: []
  };
  isHustler = false;
  voted = false;
  eliminatedPlayer = <any>{};
  timeToReveal = false;
  timerStarted = false;
  time = 60;
  interval;
  messages = [];
  text = "";
  numQuestions = "2";
  constructor(public dbService: DbServiceService, private globalService: GlobalService, public storage:StorageServiceService,
    private router: Router, private loadingCtrl: LoadingController, private admob: AdMob, private platform: Platform) { }

  ngOnInit() {
    this.globalService.getObservable().subscribe(async (data) => {
      if (data.value == null) {
        if (!this.platform.is('cordova')) {
          this.router.navigateByUrl("/home", {
            replaceUrl: true
          });
        }
          this.admob.interstitial.show();
          this.router.navigateByUrl("/home", {
            replaceUrl: true
          });
        return;
      }
      this.players = data.value.players;
      if (this.roomState != data.value.state) {
        this.voted = false;
      }
      this.roomState = data.value.state;
      this.activeQuestion = data.value.activeQuestion;

      let playerId = this.storage.playerid;
      let playerFound = false;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].id == playerId && this.players[i].isHustler) {
          this.isHustler = true;
        }
        if (this.players[i].id == playerId) playerFound = true;
      }

      if (!playerFound && !this.storage.hostid) {
        if (!this.platform.is('cordova')) {
          this.router.navigateByUrl("/home", {
            replaceUrl: true
          });
        }
          this.admob.interstitial.show();
          this.router.navigateByUrl("/home", {
            replaceUrl: true
          });
        return;
      }

      if (data.value.eliminatedPlayer) {
        this.eliminatedPlayer = data.value.eliminatedPlayer;
      }

      if (data.value.timeToReveal) {
        this.timeToReveal = true;
      }

      if (data.value.messages) {
        this.messages = data.value.messages;
      }
      
    });

    this.playerType = this.storage.playerType;
  }

  async updatePlayerName(playerName) {
    await this.storage.updatePlayerName(playerName);
  }

  async begin() {
    await this.presentLoader();
    //Game has started
    let questions = await this.storage.getQuestions((this.players.length  - 2) * +this.numQuestions);
    let temp = <any>[];
    if (questions.response_code == 0) {
      temp = questions.results;
      for (let i = 0; i < temp.length; i++) {
        temp[i].answers = temp[i].incorrect_answers;
        temp[i].answers.push(temp[i].correct_answer);
        temp[i].answers = this.shuffle(temp[i].answers);
      }
    }
    
    this.questions = temp;

    //Update room state
    await this.dismissLoader();
    await this.storage.generateHustler();
    await this.storage.updateRoomState(1);
    this.activeQuestion = this.questions[this.activeIndex];
    await this.storage.updateRoomQuestion(this.activeQuestion);
  }

  async cancel() {
    this.admob.interstitial.load({
      id: {
        android: 'ca-app-pub-7853858495093513/2510882577',
        ios: 'ca-app-pub-7853858495093513/3151818890'
      }
    }).then((res) => {
      this.admob.interstitial.show();
    });
    if (this.playerType == 0)
      await this.storage.deleteRoom();
    else {
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].id == this.storage.playerid) {
          this.players.splice(i, 1);
          break;
        }
      }
      this.eliminatedPlayer = <any>{};
      await this.storage.updateRoomPlayers(this.players, this.eliminatedPlayer);
    }
  }

  async presentLoader() {
    this.loader = await this.loadingCtrl.create({
      message: "Please Wait..."
    });

    await this.loader.present();
  }

  async dismissLoader() {
    await this.loader.dismiss();
  }

  async next() {
    if ((this.activeIndex + 1) % +this.numQuestions == 0 && this.activeIndex != 0) {
      // it's been 2 questions time to vote
      if (this.players.length == 3) {
        // Game is over
        await this.storage.updateRoomState(3);   
        this.activeQuestion = <any>{
          question: "",
          answers: []
        };
        await this.storage.updateRoomQuestion(this.activeQuestion);
        return;
      }
      await this.storage.updateRoomState(2);
      this.activeQuestion = <any>{
        question: "",
        answers: []
      };
      await this.storage.updateRoomQuestion(this.activeQuestion);
      return;
    }
    this.activeIndex++;
    this.activeQuestion = this.questions[this.activeIndex];
    await this.storage.updateRoomQuestion(this.activeQuestion);
    this.voted = false;
  }

  async vote(player, index) {
    if (this.isHustler) {
      this.eliminatedPlayer = player;
      this.storage.updateRoomPlayers(this.players, this.eliminatedPlayer);
    }

    this.voted = true;
  }

  async removePlayerThenNext() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id == this.eliminatedPlayer.id) {
        this.players.splice(i, 1);
        break;
      }
    }
    this.eliminatedPlayer = <any>{};
    await this.storage.updateRoomPlayers(this.players, this.eliminatedPlayer);
    await this.storage.updateRoomState(1);
    this.activeIndex++;
    this.activeQuestion = this.questions[this.activeIndex];
    await this.storage.updateRoomQuestion(this.activeQuestion);
    this.voted = false;
    this.eliminatedPlayer = <any>{};
  }

  async revealHustler() {
    await this.storage.updateRoomToReveal();
  }

  async startTimer() {
    this.timerStarted = true;
    this.interval = setInterval(() => {
      this.time--;
      if (this.time <= 0) this.resetTimer();
    }, 1000);
  }

  async resetTimer() {
    this.time = 60;
    this.timerStarted = false;
    clearInterval(this.interval);
  }

  async sendMessage(text) {
    let obj = {
      text: text,
      sender: this.playerType == 1 ? this.playerName ? this.playerName : this.storage.playerid : 'HOST'
    }
    await this.storage.sendMessage(obj);
    this.text = "";
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

}
