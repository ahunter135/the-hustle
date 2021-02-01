import { AdMob } from '@admob-plus/ionic';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { HelpComponent } from '../modals/help/help.component';
import { StorageServiceService } from '../services/storage-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  notification = <any>{};
  roomcode;
  constructor(private storage: StorageServiceService, private router: Router, private modalCtrl: ModalController, private admob: AdMob, private platform: Platform) {}

  async ngOnInit() {
    let notif = await this.storage.getNotification();
    this.notification = notif.data();

    if (this.platform.is('ios')) {
      this.admob.banner.show({
        id: "ca-app-pub-7853858495093513/2510882577"
      });
    } else {
      this.admob.banner.show({
        id: "ca-app-pub-7853858495093513/6641699272"
      });
    }
  }

  async startGame() {
    await this.storage.createHostUser();
    this.storage.playerType = 0;
    this.router.navigateByUrl("/game-screen", {
      replaceUrl: true
    })
  }

  async joinGame(roomcode) {
    await this.storage.createPlayer(roomcode);
    this.storage.playerType = 1;
    this.router.navigateByUrl("/game-screen", {
      replaceUrl: true
    })
  }

  toUpper() {
    this.roomcode = this.roomcode.toUpperCase()
  }

  async showHelp() {
    let modal = await this.modalCtrl.create({
      component: HelpComponent,
      cssClass: 'my-custom-modal-css',
      backdropDismiss: true,
      showBackdrop: true
    });

    return await modal.present();
  }
}
