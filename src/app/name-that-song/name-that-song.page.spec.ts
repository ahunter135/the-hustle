import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NameThatSongPage } from './name-that-song.page';

describe('NameThatSongPage', () => {
  let component: NameThatSongPage;
  let fixture: ComponentFixture<NameThatSongPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameThatSongPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NameThatSongPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
