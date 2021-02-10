import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { ChatPopoverComponent } from '../modals/chat-popover/chat-popover.component';
import { ChatBlockComponent } from './chat-block/chat-block.component';
import { LobbyBlockComponent } from './lobby-block/lobby-block.component';
import { PlayersBlockComponent } from './players-block/players-block.component';
import { VotingBlockComponent } from './voting-block/voting-block.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [ChatPopoverComponent, LobbyBlockComponent, VotingBlockComponent, ChatBlockComponent, PlayersBlockComponent],
  entryComponents: [ChatPopoverComponent, LobbyBlockComponent, VotingBlockComponent, ChatBlockComponent, PlayersBlockComponent],
  exports: [ChatPopoverComponent, LobbyBlockComponent, VotingBlockComponent, ChatBlockComponent, PlayersBlockComponent]
})
export class ComponentsModule {}