import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NameThatSongPageRoutingModule } from './name-that-song-routing.module';

import { NameThatSongPage } from './name-that-song.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NameThatSongPageRoutingModule
  ],
  declarations: [NameThatSongPage]
})
export class NameThatSongPageModule {}
