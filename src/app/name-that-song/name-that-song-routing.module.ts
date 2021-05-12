import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NameThatSongPage } from './name-that-song.page';

const routes: Routes = [
  {
    path: '',
    component: NameThatSongPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NameThatSongPageRoutingModule {}
