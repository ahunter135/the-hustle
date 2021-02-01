import { Injectable } from '@angular/core';
import { DbServiceService } from './db-service.service';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StorageServiceService {

  roomid;
  hostid;
  playerid;
  roomInfo;
  playerType;
  constructor(private dbService: DbServiceService, public http: HttpClient) { }

  async getNotification() {
    return await this.dbService.getNotification();
  }
  
  async createHostUser() {
    this.hostid = this.generateUID();
    this.roomid = this.generateUID();
    this.roomid = this.roomid.toUpperCase();

    await this.createRoom();
  }

  async createRoom() {
    this.dbService.createRoom(this.roomid, this.hostid);
  }

  async updateRoomState(state) {
   return await this.dbService.updateRoomState(this.roomid, state);
  }

  async createPlayer(roomcode) {
    this.playerid = this.generateUID();
    this.roomid = roomcode;
    await this.joinGame(roomcode);
  }

  async joinGame(roomcode) {
    this.dbService.joinRoom(roomcode, this.playerid)
  }

  async updatePlayerName(playerName) {
    await this.dbService.updatePlayerName(playerName, this.roomid, this.playerid);
  }

  async deleteRoom() {
    await this.dbService.deleteRoom(this.roomid);
  }

  async getQuestions(numberOfQuestions) {
    let response = await <any>this.http.get("https://opentdb.com/api.php?amount="+numberOfQuestions+"&type=multiple&category=9", {
      observe: 'response'
    }).toPromise();

    if (response.status == 200) {
      return response.body;
    } else return null;
  }

  async generateHustler() {
    return await this.dbService.generateHustler(this.roomid);
  }

  async updateRoomQuestion(question) {
    return await this.dbService.updateRoomQuestion(this.roomid, question);
  }

  async updateRoomPlayers(players, eliminatedPlayer) {
    return await this.dbService.updateRoomPlayers(this.roomid, players, eliminatedPlayer);
  }

  async updateRoomToReveal() {
    return await this.dbService.updateRoomToReveal(this.roomid)
  }

  async sendMessage(text) {
    return await this.dbService.sendMessage(this.roomid, text);
  }
  generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = <any>("000" + firstPart.toString(36)).slice(-3);
    secondPart = <any>("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
  }
}
