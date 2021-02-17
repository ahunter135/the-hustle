import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { GlobalService } from './global.service';
import * as moment from 'moment';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

@Injectable({
  providedIn: 'root'
})
export class DbServiceService {
  db;
  store;
  roomInfo = <any>{};
  unsubscribe;
  constructor(private globalService: GlobalService) { 
    
  }

  setupDBConnection() {
    this.db = firebase.firestore();
    this.store = firebase.storage();
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
      messages: [{text: 'Please wait and talk amongst yourselves', sender: 'Host', type: 0}],
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
    const customConfig: Config = {
      dictionaries: [adjectives, animals],
      separator: ' ',
      length: 2,
    };
    const shortName: string = uniqueNamesGenerator(customConfig); 
    await this.db.collection('rooms').doc(roomid).set({
      host: hostid,
      players: [{
        id: hostid,
        name: shortName,
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
      messages: [{text: 'Please wait and talk amongst yourselves', sender: shortName, type: 0}],
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
    let state = roomData.data().state;
    const customConfig: Config = {
      dictionaries: [adjectives, animals],
      separator: ' ',
      length: 2,
    };
    const shortName: string = uniqueNamesGenerator(customConfig); 
    this.globalService.publishData({key: 'wheretogo', value: roomData.data().gameType});
    let playerObj = {
      id: playerid,
      name: shortName,
      isHustler: false,
      eliminated: state != 0 ? true : false,
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
    let storageRef = firebase.storage().ref();
    storageRef.child(roomcode).listAll().then(dir => {
      dir.items.forEach(fileRef => {
        storageRef.child(roomcode).child(fileRef.name).delete();
      });
    }).catch((err) => {
    });
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

  async updateRoomToReveal(roomid, flag) {
    return await this.db.collection('rooms').doc(roomid).update({
      timeToReveal: flag
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

  async uploadAudioMessage(obj, fileDir, roomid) {
    return new Promise((resolve, reject) => {
      let storageRef = this.store.ref().child(roomid).child(moment().format());
      let uploadTask = storageRef.putString(fileDir, "data_url");

      uploadTask.on(
        "state_changed",
        (_snapshot: any) => {

        },
        _error => {
          reject(_error);
        },
        () => {
          // completion...
          resolve(uploadTask.snapshot);
        }
      );
    });
  }

  unsubscribeFromRoom() {
    this.unsubscribe();                                                                                                                                                                  
  }
}
