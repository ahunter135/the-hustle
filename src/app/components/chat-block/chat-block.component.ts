import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatPopoverComponent } from 'src/app/modals/chat-popover/chat-popover.component';
import { StorageServiceService } from 'src/app/services/storage-service.service';
import { LobbyBlockComponent } from '../lobby-block/lobby-block.component';

@Component({
  selector: 'app-chat-block',
  templateUrl: './chat-block.component.html',
  styleUrls: ['./chat-block.component.scss'],
})
export class ChatBlockComponent implements OnInit {
  @Input() lobbyBlock: LobbyBlockComponent;
  @Input() currentPlayer: any;
  @ViewChild('scrollMe') private myScrollContainer: any;

  messages = [];
  text = '';
  popover;
  constructor(private modalCtrl: ModalController, private storage: StorageServiceService) { }

  ngOnInit() {}

  async popoutChat(ev: any) {
    this.popover = await this.modalCtrl.create({
      component: ChatPopoverComponent,
      componentProps: {
        data: this.messages,
        sendMessage: this.sendMessage,
        storage: this.storage,
        currentPlayer: this.currentPlayer,
        lobbyBlock: this.lobbyBlock
      },
      cssClass: 'chatpopover'
    });
    return await this.popover.present();
  }

  async sendMessage(text) {
    let sender = "";
    console.log(this);
    if (this.currentPlayer.playerType == 1) {
      if (this.lobbyBlock.playerName) sender = this.lobbyBlock.playerName;
      else sender = this.storage.playerid; 
    } else {
      if (this.lobbyBlock.playerName) sender = this.lobbyBlock.playerName;
      else sender = "Host";
    }

    let obj = {
      text: text,
      sender: sender,
      type: 0
    }
    await this.storage.sendMessage(obj);
    this.text = "";
  }

  scrollToBottom(): void {
    setTimeout(() => {
      this.myScrollContainer.scrollToBottom(300);
    }, 300)              
  }

}
