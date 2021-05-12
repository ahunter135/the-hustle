import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NameThatSongPageRoutingModule } from './name-that-song-routing.module';

import { NameThatSongPage } from './name-that-song.page';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

export function playerFactory() {
  return player;
}
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NameThatSongPageRoutingModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  declarations: [NameThatSongPage]
})
export class NameThatSongPageModule {}
