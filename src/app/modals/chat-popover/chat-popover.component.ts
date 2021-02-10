import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-chat-popover',
  templateUrl: './chat-popover.component.html',
  styleUrls: ['./chat-popover.component.scss'],
})
export class ChatPopoverComponent implements OnInit {
  @ViewChild('content') private content: any;

  messages = [];
  text = "";
  send;
  storage;
  currentPlayer;
  lobbyBlock;
  constructor(private params: NavParams, private globalService: GlobalService, private modalCtrl: ModalController) {
    this.messages = this.params.get("data");
    this.send = this.params.get('sendMessage');
    this.storage = this.params.get('storage');
    this.currentPlayer = this.params.get('currentPlayer');
    this.lobbyBlock = this.params.get('lobbyBlock');
  }

  sendMessage(text){
    this.send(text);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.globalService.getObservable().subscribe(async (data) => {
      if (data.value.messages) {
        this.messages = data.value.messages;
        this.scrollToBottomOnInit();
      }
    });
  }

  scrollToBottomOnInit() {
    setTimeout(() => {
      this.content.scrollToBottom(300);
    }, 300)
  }

}
