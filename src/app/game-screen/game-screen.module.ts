import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameScreenPageRoutingModule } from './game-screen-routing.module';

import { GameScreenPage } from './game-screen.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameScreenPageRoutingModule,
    ComponentsModule
  ],
  declarations: [GameScreenPage]
})
export class GameScreenPageModule {}
