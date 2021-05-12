import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-name-that-song',
  templateUrl: './name-that-song.page.html',
  styleUrls: ['./name-that-song.page.scss'],
})
export class NameThatSongPage implements OnInit {
  loader;
  isLoading = false;
  constructor(public loadingController: LoadingController) { }

  async ngOnInit() {
    await this.presentLoading();
    await this.getGameData();
    await this.loader.dismiss();
  }

  async presentLoading() {
    this.loader = await this.loadingController.create({
      message: 'Finding Player'
    });
    await this.loader.present();

    this.isLoading = true;
  }

  async dismissLoading() {
    await this.loader.dismiss();
  }

  async getGameData() {
    // call http services to get all the game data necessary
  }
}
