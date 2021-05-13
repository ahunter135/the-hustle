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
    answer.title = answer.title.toLowerCase();
    answer.artist = answer.artist.toLowerCase();
    let songMatch = stringSimilarity.findBestMatch(answer.title, guess);
    let artistMatch = stringSimilarity.findBestMatch(answer.artist, guess);
    let bestSongMatch = songMatch.bestMatch;
    let bestArtistMatch = artistMatch.bestMatch;

    bestSongMatch = this.isolateSong(answer.title, bestSongMatch.target);
    bestArtistMatch = this.isolateArtist(answer.artist, bestArtistMatch.target)
    return {
      artist: bestArtistMatch >= 0.50,
      song: bestSongMatch >= 0.50
    };
  }

  isolateSong(answer, guess) {
    let arr = guess.split(" by ");

    return stringSimilarity.compareTwoStrings(answer, arr[0])
  }
  isolateArtist(answer, guess) {
    let arr = guess.split(" by ");

    if (arr.length > 1)
      return stringSimilarity.compareTwoStrings(answer, arr[1])
    else return stringSimilarity.compareTwoStrings(answer, arr[0]);
  }
}
