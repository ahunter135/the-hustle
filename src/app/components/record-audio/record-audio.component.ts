import { Component, Input, OnInit } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx';
import { StorageServiceService } from 'src/app/services/storage-service.service';
import { LobbyBlockComponent } from '../lobby-block/lobby-block.component';

@Component({
  selector: 'app-record-audio',
  templateUrl: './record-audio.component.html',
  styleUrls: ['./record-audio.component.scss'],
})
export class RecordAudioComponent implements OnInit {
  @Input() lobbyBlock: LobbyBlockComponent;
  @Input() currentPlayer: any;
  recording = false;
  audioFile;
  constructor(private media: Media, private file: File, private storage: StorageServiceService) { }

  ngOnInit() {}

  async down() {
    this.recording = true;
    await this.file.createFile(this.file.externalDataDirectory, 'voice.mp3', true);
    this.audioFile = await this.media.create(this.file.externalDataDirectory + "voice.mp3");
    this.audioFile.onSuccess.subscribe(async () => {
      let sender = "";

      if (this.currentPlayer.playerType == 1) {
        if (this.lobbyBlock.playerName) sender = this.lobbyBlock.playerName;
        else sender = this.storage.playerid; 
      } else {
        if (this.lobbyBlock.playerName) sender = this.lobbyBlock.playerName;
        else sender = "Host";
      }

      let obj = {
        type: 1,
        sender: sender,
        text: ''
      }
      const buffer = await this.file.readAsDataURL(this.file.externalDataDirectory, "voice.mp3");

      let res = <any>await this.storage.uploadAudioMessage(obj, buffer);
      let downloadUrl = await res.ref.getDownloadURL();
      obj.text = downloadUrl;
      await this.storage.sendMessage(obj);
    });

    this.audioFile.onError.subscribe(error => console.log('Error!', error));

    this.audioFile.startRecord();
  }

  async up() {
    this.recording = false;
    this.audioFile.stopRecord();
  }

}
