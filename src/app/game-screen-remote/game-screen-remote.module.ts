import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameScreenRemotePageRoutingModule } from './game-screen-remote-routing.module';

import { GameScreenRemotePage } from './game-screen-remote.page';
import { ChatBlockComponent } from '../components/chat-block/chat-block.component';
import { LobbyBlockComponent } from '../components/lobby-block/lobby-block.component';
import { VotingBlockComponent } from '../components/voting-block/voting-block.component';
import { PlayersBlockComponent } from '../components/players-block/players-block.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameScreenRemotePageRoutingModule
  ],
  declarations: [GameScreenRemotePage, ChatBlockComponent, LobbyBlockComponent, VotingBlockComponent, PlayersBlockComponent],
  entryComponents: [ChatBlockComponent, LobbyBlockComponent, VotingBlockComponent, PlayersBlockComponent]
})
export class GameScreenRemotePageModule {}
