import { Component, Input, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { VotingBlockComponent } from '../voting-block/voting-block.component';

@Component({
  selector: 'app-lobby-block',
  templateUrl: './lobby-block.component.html',
  styleUrls: ['./lobby-block.component.scss'],
})
export class LobbyBlockComponent implements OnInit {
  @Input() roomState: any;
  @Input() storage: any;
  @Input() players: any;
  @Input() currentPlayer: any;
  @Input() activePlayers: any;
  @Input() gameType: any;
  @Input() votingBlock: VotingBlockComponent;

  isPrivate = true;;
  playerName;
  nametext = '';
  numQuestions = "2";
  questions;
  activeIndex = 0;
  activeQuestion = <any>{
    question: "",
    answers: []
  };
  loader;
  answerRevealed = false;
  interval;
  timerStarted = false;
  time = 0;
  baseTime = 60;
  votedOnQuestion = false;
  constructor(private loadingCtrl: LoadingController) { }

  ngOnInit() {}


  async updatePlayerName(playerName) {
    this.playerName = playerName;
    this.nametext = '';
    await this.storage.updatePlayerName(playerName);
  }

  async updateRoomPrivacy() {
    await this.storage.updateRoomPrivacy(this.isPrivate);
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

        temp[i].voteArray = [0, 0, 0, 0];
      }
    }
    
    this.questions = temp;
    this.time = this.baseTime;

    //Update room state
    await this.dismissLoader();
    await this.storage.generateHustler();
    await this.storage.updateRoomState(1);
    this.activeQuestion = this.questions[this.activeIndex];
    await this.storage.updateRoomQuestion(this.activeQuestion);
    if (this.gameType == 0) {
      await this.storage.updateRoomTimer(true);
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

  async cancelHost() {
      await this.storage.deleteRoom();
  }

  async revealAnswer() {
    this.answerRevealed = true;
    await this.storage.toggleShowAnswer(this.answerRevealed);
  }

  async startTimer(timer) {
    if (this.currentPlayer.playerType == 0 && this.gameType == 1 && !this.timerStarted) {
      this.timerStarted = true;
      await this.storage.updateRoomTimer(true);
      this.interval = setInterval(() => {
        this.time--;
        if (this.time <= 0) this.resetTimer();
      }, 1000);
    }
    if (!this.timerStarted) {
      this.timerStarted = timer;
      this.interval = setInterval(() => {
        this.time--;
        if (this.time <= 0) this.resetTimer();
      }, 1000);
    }
  }

  async startRemoteTimer(timer) {
    if (!this.timerStarted) {
      this.timerStarted = true;
      this.interval = setInterval(async () => {
        if (this.time >= 0)
          this.time--;
        if (this.time <= 0) {
          if (this.roomState == 1 && this.currentPlayer.playerType == 0 && !this.answerRevealed) {
            await this.storage.updateRoomTimerLength(35);
            await this.storage.updateRoomTimer(false);
            await this.storage.updateRoomState(4);
            return;
          } else if (this.roomState == 1 && this.currentPlayer.playerType == 1) {
            return;
          }

          if (this.roomState == 5 && this.currentPlayer.playerType == 0 && this.answerRevealed) {
            await this.storage.updateRoomTimerLength(60);
            await this.storage.updateRoomTimer(false);
            await this.storage.toggleShowAnswer(false);
            await this.storage.updateRoomState(1);
            this.votedOnQuestion = false;
            this.next();
            return;
          } else if (this.roomState == 1 && this.currentPlayer.playerType == 1) {
            return;
          }

          if (this.roomState == 2 && this.currentPlayer.playerType == 0) {
            await this.storage.updateRoomTimerLength(60);
            await this.storage.updateRoomTimer(false);
            await this.storage.toggleShowAnswer(false);
            this.votingBlock.removePlayerThenNext();
            return;
          } else if (this.roomState == 2 && this.currentPlayer.playerType == 1) {
            return;
          }

          if (this.roomState == 3 && this.currentPlayer.playerType == 0) {
            await this.storage.updateRoomTimerLength(30);
            await this.storage.updateRoomTimer(false);
            this.votedOnQuestion = false;
            this.next();
            return;
          } else if (this.roomState == 1 && this.currentPlayer.playerType == 1) {
            return;
          }

          if (this.roomState == 4 && this.currentPlayer.playerType == 0) {
            await this.storage.updateRoomTimerLength(15);
            await this.storage.updateRoomState(5);
            await this.storage.toggleShowAnswer(true);
            await this.storage.updateRoomTimer(false);
            return;
          } else if (this.roomState == 4 && this.currentPlayer.playerType == 1) {
            return;
          }
        }
      }, 1000);
    }
  }

  async resetTimer() {
    clearInterval(this.interval);
    this.time = this.gameType == 0 ? this.baseTime : 60;
    this.timerStarted = false;
    if (this.currentPlayer.playerType == 0 && this.gameType == 1)
      await this.storage.updateRoomTimer(this.timerStarted);

    if (this.gameType == 0 && this.currentPlayer.playerType == 0 && this.roomState != 0) {
      await this.storage.updateRoomTimer(true);
    }
  }

  async next() {
    this.answerRevealed = false;
    await this.storage.toggleShowAnswer(false);
    if (this.gameType == 1) this.resetTimer();
    let totalQuestions = (this.players.length - 2) * +this.numQuestions;

    if (((this.activeIndex + 1) % +this.numQuestions) == 0 && this.activeIndex != 0) {
      // it's been 2 questions time to vote
      if (this.activeIndex + 1 == totalQuestions) {
        // Game is over
        await this.storage.updateRoomState(3);  
        await this.storage.updateRoomTimer(false);
        await this.storage.toggleShowAnswer(false);
        await this.storage.updateRoomTimerLength(30);
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
  }

  async voteOnAnswer(index) {
    if (!this.votedOnQuestion) {
      this.votedOnQuestion = true;
      let voteArray = this.activeQuestion.voteArray;
      voteArray[index]++;
      this.activeQuestion.voteArray = voteArray
  
      await this.storage.updateQuestionVoteArray(this.activeQuestion);
    }
  }
}
