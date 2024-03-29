import { Component, Input, OnInit } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx';
import { Platform } from '@ionic/angular';
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
  constructor(private media: Media, private file: File, private storage: StorageServiceService,
    private platform: Platform) { }

  ngOnInit() {}

  async down() {
    let filepath;
    if (this.platform.is('ios')) filepath = this.file.tempDirectory;
    else filepath = this.file.externalDataDirectory;
    this.recording = true;
    await this.file.createFile(filepath, 'voice.m4a', true);
    if (this.platform.is('ios')) {
      filepath =this.file.tempDirectory.replace(/^file:\/\//, '');
    }
    this.audioFile = await this.media.create(filepath + "voice.m4a");
    this.audioFile.onSuccess.subscribe(async () => {
      if (this.platform.is('ios')) filepath = this.file.tempDirectory;
      else filepath = this.file.externalDataDirectory;
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
      const buffer = await this.file.readAsDataURL(filepath, "voice.m4a");

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
