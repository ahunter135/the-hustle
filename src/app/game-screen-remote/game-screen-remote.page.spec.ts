import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GameScreenRemotePage } from './game-screen-remote.page';

describe('GameScreenRemotePage', () => {
  let component: GameScreenRemotePage;
  let fixture: ComponentFixture<GameScreenRemotePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameScreenRemotePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameScreenRemotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
