import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-chat-popover',
  templateUrl: './chat-popover.component.html',
  styleUrls: ['./chat-popover.component.scss'],
})
export class ChatPopoverComponent implements OnInit {
  messages = [];
  text = "";
  constructor(private params: NavParams) {
    this.messages = this.params.get("data");
  }

  sendMessage(text){}

  ngOnInit() {}

}
