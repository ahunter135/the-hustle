import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { LobbyBlockComponent } from '../lobby-block/lobby-block.component';

@Component({
  selector: 'app-voting-block',
  templateUrl: './voting-block.component.html',
  styleUrls: ['./voting-block.component.scss'],
})
export class VotingBlockComponent implements OnInit {
  @Input() playerType: any;
  @Input() roomState: any;
  @Input() storage: any;
  @Input() players: any;
  @Input() currentPlayer: any;
  @Input() activePlayers: any;
  @Input() lobbyBlock: LobbyBlockComponent

  eliminatedPlayer = <any>{};
  numVotes = 0;
  isEliminated = false;
  voted = false;
  shownElimination = false;
  constructor(
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {}

  async removePlayerThenNext() {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id == this.eliminatedPlayer.id) {
        this.players[i].eliminated = true;
      }
      this.players[i].voted = false;
    }
    this.eliminatedPlayer = <any>{};
    await this.storage.updateRoomPlayers(this.players, this.eliminatedPlayer);
    await this.storage.updateRoomState(1);
    this.lobbyBlock.activeIndex++;
    this.lobbyBlock.activeQuestion = this.lobbyBlock.questions[this.lobbyBlock.activeIndex];
    await this.storage.updateRoomQuestion(this.lobbyBlock.activeQuestion);
    this.eliminatedPlayer = <any>{};
    this.voted = false;
  }

  async vote(player, index) {
    this.storage.updateRoomPlayerVoteStatus(true);
    if (this.currentPlayer.isHustler) {
      this.eliminatedPlayer = player;
      this.storage.updateRoomPlayers(this.players, this.eliminatedPlayer);
    }

    this.voted = true;
  }

  async showElimination() {
    if (!this.shownElimination) {
      this.shownElimination = true;
      const alert = await this.alertCtrl.create({
        header: 'You\'ve been eliminated!',
        message: 'But don\'t worry! You can still vote in the final showdown to try and catch the Liar!',
        buttons: [
          {
            text: 'Okay',
            handler: () => {
              console.log('Confirm Okay');
            }
          }
        ]
      });
  
      await alert.present();
    }
  }

}
