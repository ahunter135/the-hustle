import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameScreenRemotePage } from './game-screen-remote.page';

const routes: Routes = [
  {
    path: '',
    component: GameScreenRemotePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameScreenRemotePageRoutingModule {}
