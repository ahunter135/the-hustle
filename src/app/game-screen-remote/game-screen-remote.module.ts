import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameScreenRemotePageRoutingModule } from './game-screen-remote-routing.module';

import { GameScreenRemotePage } from './game-screen-remote.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameScreenRemotePageRoutingModule,
    ComponentsModule
  ],
  declarations: [GameScreenRemotePage],
  entryComponents: []
})
export class GameScreenRemotePageModule {}
