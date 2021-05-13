import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import stringSimilarity from 'string-similarity';
@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  private fooSubject = new Subject<any>();

  publishData(data: any) {
    this.fooSubject.next(data);
  }

  getObservable(): Subject<any> {
    return this.fooSubject;
  }

  determineCorrectAnswer(answer, guess) {
    let songMatch = stringSimilarity.findBestMatch(answer.title, guess);
    let artistMatch = stringSimilarity.findBestMatch(answer.artist, guess);
    let bestSongMatch = songMatch.bestMatch.rating;
    let bestArtistMatch = artistMatch.bestMatch.rating;

    console.log(songMatch);
    console.log(artistMatch);
    return {
      artist: bestArtistMatch >= 0.75,
      song: bestSongMatch >= 0.75
    };
  }
}
