import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { ChatBlockComponent } from '../components/chat-block/chat-block.component';
import { LobbyBlockComponent } from '../components/lobby-block/lobby-block.component';
import { PlayersBlockComponent } from '../components/players-block/players-block.component';
import { VotingBlockComponent } from '../components/voting-block/voting-block.component';
import { GlobalService } from '../services/global.service';
import { StorageServiceService } from '../services/storage-service.service';

@Component({
  selector: 'app-game-screen-remote',
  templateUrl: './game-screen-remote.page.html',
  styleUrls: ['./game-screen-remote.page.scss'],
})
export class GameScreenRemotePage implements OnInit {
  @ViewChild(LobbyBlockComponent) lobbyBlock: LobbyBlockComponent;
  @ViewChild(VotingBlockComponent) votingBlock: VotingBlockComponent;
  @ViewChild(ChatBlockComponent) chatBlock: ChatBlockComponent;
  @ViewChild(PlayersBlockComponent) playersBlock: PlayersBlockComponent;

  currentPlayer = {
    playerName: '',
    isHustler: false,
    playerId: '',
    playerType: null
  }
  players = [];
  activePlayers = [];
  roomState = 0;  
  timeToReveal = false;
  text = "";
  popover;
  gameType;
  constructor(private globalService: GlobalService, public storage: StorageServiceService, private router: Router, private platform: Platform, private admob: AdMob, private clipboard: Clipboard, private toastCtrl: ToastController, private onesignal: OneSignal) { }

  async ngOnInit() {
    this.globalService.getObservable().subscribe(async (data) => {
      if (data.value == null) {
        this.showAdAndLeave();
        return;
      }
      let roomData = data.value;

      this.gameType = roomData.gameType;
      let prevState = this.roomState;
      this.roomState = roomData.state;

      this.chatBlock.messages = roomData.messages;
      this.chatBlock.scrollToBottom();

      this.players = roomData.players ? roomData.players : [];
      this.activePlayers = [];
      this.votingBlock.numVotes = 0;
      this.lobbyBlock.baseTime = this.gameType == 0 ? roomData.timerLength : 60;
      this.votingBlock.numVotes = 0;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].id == this.currentPlayer.playerId && this.players[i].isHustler) {
          this.currentPlayer.isHustler = true;
        }
        if (this.players[i].id == this.currentPlayer.playerId) {
          this.votingBlock.isEliminated = this.players[i].eliminated;
          this.lobbyBlock.playerName = this.players[i].name;
          if (this.votingBlock.isEliminated) {
            this.votingBlock.showElimination();
          }
        }

        if (!this.players[i].eliminated) this.activePlayers.push(this.players[i]);
        if (this.players[i].voted) this.votingBlock.numVotes++;
      }

      this.lobbyBlock.activeQuestion = roomData.activeQuestion;

      if (roomData.timerStarted && this.roomState != 3 && this.roomState != 0) {
        if (this.gameType == 1) this.lobbyBlock.startTimer(roomData.timerStarted);
        else this.lobbyBlock.startRemoteTimer(roomData.timerStarted);
      } else if (this.roomState != prevState) {
        this.lobbyBlock.votedOnQuestion = false;
        this.lobbyBlock.time = this.lobbyBlock.baseTime;
        this.votingBlock.voted = false;
      } else {
        this.lobbyBlock.resetTimer();
      }

      this.lobbyBlock.answerRevealed = roomData.revealAnswer;
      this.votingBlock.eliminatedPlayer = roomData.eliminatedPlayer;
      this.playersBlock.timeToReveal = roomData.timeToReveal;
    });

    this.currentPlayer.playerType = this.storage.playerType;
    this.currentPlayer.playerId = this.storage.playerid;
  }

  async cancel() {
    if (this.currentPlayer.playerType == 0)
      await this.storage.deleteRoom();
    else {
      let found = false;
      let index = 0;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].id == this.storage.playerid) {
          index = i;
          found = true;
          break;
        }
      }
      if (found) {
        this.playersBlock.remove(index);
      } else {
        this.showAdAndLeave();
      }
    }
  }

  async copyToClipboard() {
    this.clipboard.copy(this.storage.roomid);
    await this.showToast("Room code copied to clipboard!");
  }

  async showToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });

    toast.present();
  }

  showAdAndLeave() {
    
    if (!this.platform.is('cordova')) {
      this.router.navigateByUrl("/home", {
        replaceUrl: true
      });
      return
    }
    this.lobbyBlock.presentLoader();

    this.admob.interstitial.load({
      id: {
        android: 'ca-app-pub-8417638044172769/2470631346',
        ios: 'ca-app-pub-8417638044172769/1204515667'
      }
    }).then((res) => {
      this.admob.interstitial.show().then(() => {
        this.lobbyBlock.dismissLoader();
        this.onesignal.addTrigger('leave', true);
        this.router.navigateByUrl("/home", {
          replaceUrl: true
        });
      }, (reason) => {
        console.log(reason);
        this.lobbyBlock.dismissLoader();
          this.onesignal.addTrigger('leave', true);
        this.router.navigateByUrl("/home", {
          replaceUrl: true
        });
      });
    }, (reason) => {
      console.log(reason);
      this.lobbyBlock.dismissLoader();
      this.onesignal.addTrigger('leave', true);
      this.router.navigateByUrl("/home", {
        replaceUrl: true
      });
    }).catch(() => {
      this.lobbyBlock.dismissLoader();
    });
    return;
  }

}
