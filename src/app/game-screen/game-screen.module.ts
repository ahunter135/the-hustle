import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameScreenPageRoutingModule } from './game-screen-routing.module';

import { GameScreenPage } from './game-screen.page';
import { ChatPopoverComponent } from '../modals/chat-popover/chat-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameScreenPageRoutingModule
  ],
  declarations: [GameScreenPage, ChatPopoverComponent],
  entryComponents: [ChatPopoverComponent]
})
export class GameScreenPageModule {}
