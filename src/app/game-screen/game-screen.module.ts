import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameScreenPageRoutingModule } from './game-screen-routing.module';

import { GameScreenPage } from './game-screen.page';
import { ChatPopoverComponent } from '../modals/chat-popover/chat-popover.component';
import { LobbyBlockComponent } from '../components/lobby-block/lobby-block.component';
import { VotingBlockComponent } from '../components/voting-block/voting-block.component';
import { ChatBlockComponent } from '../components/chat-block/chat-block.component';
import { PlayersBlockComponent } from '../components/players-block/players-block.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameScreenPageRoutingModule
  ],
  declarations: [GameScreenPage, ChatPopoverComponent, LobbyBlockComponent, VotingBlockComponent, ChatBlockComponent, PlayersBlockComponent],
  entryComponents: [ChatPopoverComponent, LobbyBlockComponent, VotingBlockComponent, ChatBlockComponent, PlayersBlockComponent]
})
export class GameScreenPageModule {}
