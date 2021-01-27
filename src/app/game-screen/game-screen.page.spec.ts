import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GameScreenPage } from './game-screen.page';

describe('GameScreenPage', () => {
  let component: GameScreenPage;
  let fixture: ComponentFixture<GameScreenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameScreenPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameScreenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
