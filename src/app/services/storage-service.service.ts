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
  
  async createHostUser(type) {
    this.hostid = this.generateUID();
    this.roomid = this.generateUID();
    this.roomid = this.roomid.toUpperCase();

    if (type == 0) await this.createRoomRemote(type);
    else await this.createRoom(type);
  }
  

  async createRoom(type) {
    await this.dbService.createRoom(this.roomid, this.hostid, type);
  }

  async createRoomRemote(type) {
    this.playerid = this.hostid;
    await this.dbService.createRoomRemote(this.roomid, this.hostid, type);
  }

  async updateRoomState(state) {
   return await this.dbService.updateRoomState(this.roomid, state);
  }

  async updateRoomTimerLength(length) {
    return await this.dbService.updateRoomTimerLength(this.roomid, length);
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

  async updateRoomToReveal(flag) {
    return await this.dbService.updateRoomToReveal(this.roomid, flag)
  }

  async toggleShowAnswer(toggle) {
    return await this.dbService.toggleShowAnswer(this.roomid, toggle);
  }

  async sendMessage(text) {
    return await this.dbService.sendMessage(this.roomid, text);
  }

  async findGame() {
    return await this.dbService.findGame();
  }

  async updateRoomPrivacy(privacy) {
    return await this.dbService.updateRoomPrivacy(privacy, this.roomid);
  }

  async updateRoomTimer(timer) {
    return await this.dbService.updateRoomTimer(timer, this.roomid);
  }

  async updateRoomPlayerVoteStatus(voteStatus) {
    return await this.dbService.updateRoomPlayerVoteStatus(this.roomid, this.playerid, voteStatus);
  }

  async updateQuestionVoteArray(aq) {
    return await this.dbService.updateQuestionVoteArray(this.roomid, aq);
  }

  async uploadAudioMessage(obj, fileDir) {
    return await this.dbService.uploadAudioMessage(obj, fileDir, this.roomid);
  }

  generateUID() {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = <any>("000" + firstPart.toString(36)).slice(-3);
    secondPart = <any>("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
  }
}
