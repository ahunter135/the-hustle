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
    answer = answer.toLowerCase();
    guess = guess.toLowerCase();
    let songMatch = stringSimilarity.findBestMatch(answer.title, guess);
    let artistMatch = stringSimilarity.findBestMatch(answer.artist, guess);
    let bestSongMatch = songMatch.bestMatch;
    let bestArtistMatch = artistMatch.bestMatch.rating;

    bestSongMatch = this.isolateSong(answer.title, bestSongMatch.bestMatch.target);
    bestArtistMatch = this.isolateArtist(answer.artist, bestArtistMatch.bestMatch.target)
    return {
      artist: bestArtistMatch >= 0.50,
      song: bestSongMatch >= 0.50
    };
  }

  isolateSong(answer, guess) {
    let arr = guess.split(" by ");

    return stringSimilarity.findBestMatch(answer, arr[0])
  }
  isolateArtist(answer, guess) {
    let arr = guess.split(" by ");

    if (arr.length > 1)
      return stringSimilarity.findBestMatch(answer, arr[1])
    else return stringSimilarity.findBestMatch(answer, arr[0]);
  }
}
