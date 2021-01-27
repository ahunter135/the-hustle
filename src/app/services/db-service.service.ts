import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import firebase from 'firebase';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class DbServiceService {
  db;
  roomInfo = <any>{};
  unsubscribe;
  constructor(private globalService: GlobalService) { 
    
  }

  setupDBConnection() {
    this.db = firebase.firestore();
  }

  async createRoom(roomid, hostid) {
    console.log(roomid);
    await this.db.collection('rooms').doc(roomid).set({
      host: hostid,
      players: [],
      activeQuestion: {},
      state: 0,
      timeToReveal: false
    });
    this.unsubscribe = this.db.collection("rooms").doc(roomid)
    .onSnapshot(function(doc) {
        this.globalService.publishData({key: 'roominfo', value: doc.data()});
    }.bind(this));
  }

  async joinRoom(roomcode, playerid) {
    let roomData = await this.db.collection('rooms').doc(roomcode).get();
    let players = roomData.data().players;
    let playerObj = {
      id: playerid,
      name: "",
      isHustler: false
    }
    players.push(playerObj);
    await this.db.collection('rooms').doc(roomcode).update({
      players: players
    });
    this.unsubscribe = this.db.collection("rooms").doc(roomcode)
    .onSnapshot(function(doc) {
        this.globalService.publishData({key: 'roominfo', value: doc.data()});
    }.bind(this));
  }

  async deleteRoom(roomcode) {
   return await this.db.collection('rooms').doc(roomcode).delete();
  }

  async updatePlayerName(playerName, roomid, playerid) {
    let roomData = await this.db.collection('rooms').doc(roomid).get();
    let players = roomData.data().players;
    for (let i = 0; i < players.length; i++) {
      if (players[i].id == playerid) {
        players[i].name = playerName;
        break;
      }
    }
    return await this.db.collection('rooms').doc(roomid).update({
      players: players
    })
  }

  async updateRoomState(roomid, state) {
    return await this.db.collection('rooms').doc(roomid).update({
      state: state
    });
  }

  async updateRoomPlayers(roomid, players, eliminatedPlayer) {
    return await this.db.collection('rooms').doc(roomid).update({
      players: players,
      eliminatedPlayer: eliminatedPlayer
    })
  }

  async updateRoomQuestion(roomid, question) {
    return await this.db.collection('rooms').doc(roomid).update({
      activeQuestion: question
    })
  }

  async generateHustler(roomid) {
    let roomData = await this.db.collection('rooms').doc(roomid).get();
    let players = roomData.data().players;
    let numPlayers = players.length;
    let index = Math.floor(Math.random() * numPlayers) + 1;
    players[index - 1].isHustler = true;
    return await this.db.collection('rooms').doc(roomid).update({
      players: players
    })
  }

  async updateRoomToReveal(roomid) {
    return await this.db.collection('rooms').doc(roomid).update({
      timeToReveal: true
    })
  }

  unsubscribeFromRoom() {
    this.unsubscribe();                                                                                                                                                                  
  }
}
