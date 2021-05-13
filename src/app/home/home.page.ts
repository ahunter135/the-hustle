import { AdMob } from '@admob-plus/ionic';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { HelpComponent } from '../modals/help/help.component';
import { DbServiceService } from '../services/db-service.service';
import { GlobalService } from '../services/global.service';
import { StorageServiceService } from '../services/storage-service.service';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  notification = <any>{};
  roomcode;
  constructor(private storage: StorageServiceService, private router: Router, private modalCtrl: ModalController,
    private admob: AdMob, private platform: Platform, private toastCtrl: ToastController, private alertCtrl: AlertController,
    private globalService: GlobalService, private dbService: DbServiceService) {}

  async ngOnInit() {
    this.globalService.getObservable().subscribe(async (data) => {
      if (data.value == 1) {
        this.router.navigateByUrl("/game-screen", {
          replaceUrl: true
        })
      } else if (data.key == 'wheretogo') {
        this.router.navigateByUrl("/game-screen-remote", {
          replaceUrl: true
        })
      }
    });
    let notif = await this.storage.getNotification();
    this.notification = notif.data();
  }

  async startGame() {
    let alert = await this.alertCtrl.create({
      header: 'Lobby Type',
      message: 'What type of game would you like to play? See rules for the difference.',
      buttons: [
        {
          text: 'Name that Song',
          handler: async () => {
            if (!this.dbService.playerName) {
              const customConfig: Config = {
                dictionaries: [adjectives, colors, animals],
                separator: ' ',
                length: 3,
              };
              const shortName: string = uniqueNamesGenerator(customConfig); 
              window.localStorage.setItem("playerName", shortName);
              this.dbService.playerName = shortName;
            }
            this.router.navigateByUrl("/name-that-song", {
              replaceUrl: true
            })
          }
        },
        {
          text: 'Remote',
          handler: async () => {
            await this.storage.createHostUser(0);
            this.storage.playerType = 0;
            this.router.navigateByUrl("/game-screen-remote", {
              replaceUrl: true
            })
          }
        }, {
          text: 'In-Person',
          handler: async () => {
            await this.storage.createHostUser(1);
            this.storage.playerType = 0;
            this.router.navigateByUrl("/game-screen", {
              replaceUrl: true
            })
          }
        }
      ]
    });

    await alert.present();
  }

  async findGame() {
    let roomData = await this.storage.findGame();

    if (roomData) {
      this.showToast("Room found, joining " + roomData.id + "..");
      this.joinGame(roomData.id);
    } else {
      this.showToast("No Rooms Found, try again later..");
    }
  }

  async joinGame(roomcode) {
    await this.storage.createPlayer(roomcode);
    this.storage.playerType = 1;
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

  async showToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });

    toast.present();
  }
}


