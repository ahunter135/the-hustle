import { AdMob } from '@admob-plus/ionic';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { DbServiceService } from '../services/db-service.service';
import { GlobalService } from '../services/global.service';
import { StorageServiceService } from '../services/storage-service.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LobbyBlockComponent } from '../components/lobby-block/lobby-block.component';
import { VotingBlockComponent } from '../components/voting-block/voting-block.component';
import { ChatBlockComponent } from '../components/chat-block/chat-block.component';
import { PlayersBlockComponent } from '../components/players-block/players-block.component';
import { OneSignal } from '@ionic-native/onesignal/ngx';

LobbyBlockComponent
@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.page.html',
  styleUrls: ['./game-screen.page.scss'],
})
export class GameScreenPage implements OnInit {
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
  roomState = 0;  
  text = "";
  popover;
  loading = true;
  players = [];
  activePlayers = [];
  gameType;
  constructor(public dbService: DbServiceService, private globalService: GlobalService, public storage: StorageServiceService,
    private router: Router, private admob: AdMob, private platform: Platform,
    private toastCtrl: ToastController, private clipboard: Clipboard, private onesignal: OneSignal) { }

  ngOnInit() {
    this.globalService.getObservable().subscribe(async (data) => {
      if (data.value == null) {
        this.showAdAndLeave();
        return;
      }
      this.gameType = data.value.gameType;

      this.players = data.value.players;
      if (this.roomState != data.value.state) {
        this.votingBlock.voted = false;
      }
      this.roomState = data.value.state;
      this.lobbyBlock.activeQuestion = data.value.activeQuestion;

      let playerId = this.storage.playerid;
      this.activePlayers = [];
      this.votingBlock.numVotes = 0;
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].id == playerId && this.players[i].isHustler) {
          this.currentPlayer.isHustler = true;
        }
        if (this.players[i].id == playerId) {
          this.votingBlock.isEliminated = this.players[i].eliminated;
          this.lobbyBlock.playerName = this.players[i].name;
          if (this.votingBlock.isEliminated) {
            this.votingBlock.showElimination();
          }
        }

        if (!this.players[i].eliminated) this.activePlayers.push(this.players[i]);
        if (this.players[i].voted) this.votingBlock.numVotes++;
      }

      if (data.value.eliminatedPlayer) {
        this.votingBlock.eliminatedPlayer = data.value.eliminatedPlayer;
      }

      if (data.value.timeToReveal) {
        this.playersBlock.timeToReveal = true;
      }

      if (data.value.revealAnswer) {
        this.lobbyBlock.answerRevealed = data.value.revealAnswer;
      } else this.lobbyBlock.answerRevealed = false;

      if (data.value.messages) {
        this.chatBlock.messages = data.value.messages;
        this.chatBlock.scrollToBottom();
      }

      if (this.currentPlayer.playerType == 1) {
        if (data.value.timerStarted) {
          this.lobbyBlock.startTimer(data.value.timerStarted);
        } else {
          this.lobbyBlock.resetTimer();
        }
      }
      
    });

    this.currentPlayer.playerType = this.storage.playerType;
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
      });
    }, (reason) => {
      console.log(reason);
      this.lobbyBlock.dismissLoader();
      this.onesignal.addTrigger('leave', true);
      this.router.navigateByUrl("/home", {
        replaceUrl: true
      });
    });
    return;
  }

  

}
