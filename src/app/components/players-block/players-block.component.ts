import { Component, Input, OnInit } from '@angular/core';
import { VotingBlockComponent } from '../voting-block/voting-block.component';

@Component({
  selector: 'app-players-block',
  templateUrl: './players-block.component.html',
  styleUrls: ['./players-block.component.scss'],
})
export class PlayersBlockComponent implements OnInit {
  @Input() votingBlock: VotingBlockComponent;
  @Input() storage: any;
  @Input() roomState: any;
  @Input() currentPlayer: any;
  @Input() activePlayers: any;
  @Input() players: any;

  timeToReveal = false;

  constructor() { }

  ngOnInit() {}

  async voteOnHustler(player) {
    this.votingBlock.voted = true;
    let foundPlayer = this.activePlayers[player].id;
    let playerId = this.storage.playerid;
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id == foundPlayer) {
        this.players[i].votes++;
      }
      if (this.players[i].id == playerId) {
        this.players[i].voted = true;
      }
    }
    this.votingBlock.eliminatedPlayer = <any>{};
    await this.storage.updateRoomPlayers(this.players, this.votingBlock.eliminatedPlayer);
  }

  async revealHustler() {
    await this.storage.updateRoomToReveal();
  }

  async cancel() {
    await this.storage.deleteRoom();
  }

  async remove(index) {
    this.players.splice(index, 1);

    this.votingBlock.eliminatedPlayer = <any>{};
    await this.storage.updateRoomPlayers(this.players, this.votingBlock.eliminatedPlayer);
  }

}
