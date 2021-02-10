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

  async getNotification() {
    return await this.db.collection('notification').doc("1").get();
  }

  async createRoom(roomid, hostid, type) {
    await this.db.collection('rooms').doc(roomid).set({
      host: hostid,
      players: [],
      activeQuestion: {},
      state: 0,
      timeToReveal: false,
      private: true,
      messages: [{text: 'Please wait and talk amongst yourselves', sender: 'Host'}],
      created: new Date().toISOString(),
      timerStarted: false,
      revealAnswer: false,
      gameType: type
    });
    this.unsubscribe = this.db.collection("rooms").doc(roomid)
    .onSnapshot(function(doc) {
        this.globalService.publishData({key: 'roominfo', value: doc.data()});
    }.bind(this));
  }

  async createRoomRemote(roomid, hostid, type) {
    await this.db.collection('rooms').doc(roomid).set({
      host: hostid,
      players: [{
        id: hostid,
        name: "",
        isHustler: false,
        eliminated: false,
        voted: false,
        votes: 0,
        isHost: true
      }],
      activeQuestion: {},
      state: 0,
      timeToReveal: false,
      private: true,
      messages: [{text: 'Please wait and talk amongst yourselves', sender: 'Host'}],
      created: new Date().toISOString(),
      timerStarted: false,
      revealAnswer: false,
      gameType: type,
      timerLength: 60
    });
    this.unsubscribe = this.db.collection("rooms").doc(roomid)
    .onSnapshot(function(doc) {
        this.globalService.publishData({key: 'roominfo', value: doc.data()});
    }.bind(this));
  }

  async joinRoom(roomcode, playerid) {
    let roomData = await this.db.collection('rooms').doc(roomcode).get();
    let players = roomData.data().players;
    this.globalService.publishData({key: 'wheretogo', value: roomData.data().gameType});
    let playerObj = {
      id: playerid,
      name: "",
      isHustler: false,
      eliminated: false,
      voted: false,
      votes: 0,
      isHost: false
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

  async updateRoomPlayerVoteStatus(roomid, playerid, voteStatus) {
    let roomData = await this.db.collection('rooms').doc(roomid).get();
    let players = roomData.data().players;
    for (let i = 0; i < players.length; i++) {
      if (players[i].id == playerid) {
        players[i].voted = voteStatus;
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

  async toggleShowAnswer(roomid, toggle) {
    return await this.db.collection('rooms').doc(roomid).update({
      revealAnswer: toggle
    });
  }

  async sendMessage(roomid, text) {
    let roomData = await this.db.collection('rooms').doc(roomid).get();
    let messages = roomData.data().messages;
    messages.push(text);
    return await this.db.collection('rooms').doc(roomid).update({
      messages: messages
    })
  }

  async findGame() {
    let snapshot = await this.db.collection('rooms').where("state", "==", 0).where("private", "==", false).get();
    let rooms = [];
    snapshot.docs.map(doc => {
      rooms.push({
        data: doc.data(),
        id: doc.id
      })
    });
    let numRooms = rooms.length;
    if (numRooms > 0) {
      let randomRoomIndex = Math.floor(Math.random() * numRooms) + 1;
      return rooms[randomRoomIndex - 1];
    } else return false;
    
  }

  async updateRoomPrivacy(privacy, roomid) {
    return await this.db.collection('rooms').doc(roomid).update({
      private: privacy
    });
  }

  async updateRoomTimer(timer, roomid) {
    return await this.db.collection('rooms').doc(roomid).update({
      timerStarted: timer
    })
  }

  async updateRoomTimerLength(roomid, length) {
    return await this.db.collection('rooms').doc(roomid).update({
      timerLength: length,
      timerStarted: true
    })
  }

  async updateQuestionVoteArray(roomid, aq) {
    return await this.db.collection('rooms').doc(roomid).update({
      activeQuestion: aq
    })
  }

  unsubscribeFromRoom() {
    this.unsubscribe();                                                                                                                                                                  
  }
}
