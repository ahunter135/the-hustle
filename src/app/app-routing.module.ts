import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'game-screen',
    loadChildren: () => import('./game-screen/game-screen.module').then( m => m.GameScreenPageModule)
  },
  {
    path: 'game-screen-remote',
    loadChildren: () => import('./game-screen-remote/game-screen-remote.module').then( m => m.GameScreenRemotePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
