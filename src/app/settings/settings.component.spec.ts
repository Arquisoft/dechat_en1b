    
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import {By} from '@angular/platform-browser';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let spy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [ FormsModule , ToastrModule.forRoot(), NgSelectModule, RouterTestingModule ],
      providers: [ ChatService , ToastrService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display input error (add)', () => {

    spy = spyOn(component, 'addFriend').and.callFake(function(friend) {
      return null;
    });

    component.webIdAddFriend = 'test';
    component.addFriend();
    expect(!By.css('#toastr-container'));

    component.webIdAddFriend = null;
    component.addFriend();
    expect(By.css('#toastr-container'));

    component.webIdAddFriend = '';
    component.addFriend();
    expect(By.css('#toastr-container'));
  });

  it('should display input error (remove)', () => {

    spy = spyOn(component, 'removeFriend').and.callFake(function(friend) {
      return null;
    });

    component.webIdRemoveFriend = 'test';
    component.removeFriend();
    expect(!By.css('#toastr-container'));

    component.webIdRemoveFriend = null;
    component.addFriend();
    expect(By.css('#toastr-container'));

    component.webIdRemoveFriend = '';
    component.addFriend();
    expect(By.css('#toastr-container'));

  });

  it('should click intro', () => {
    component.webIdAddFriend = null;
    component.handleSubmit({keyCode: 13});
    expect(By.css('#toastr-container'));
  });
});
