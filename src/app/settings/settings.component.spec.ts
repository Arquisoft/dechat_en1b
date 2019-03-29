import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import {By} from '@angular/platform-browser';
import {EventEmitter} from '@angular/core';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [ FormsModule , ToastrModule.forRoot() ],
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
    component.webIdAddFriend = null;
    component.addFriend();
    expect(By.css('#toastr-container'));

    component.webIdAddFriend = '';
    component.addFriend();
    expect(By.css('#toastr-container'));

    // TODO: check that you are in session to make sure that it doesn't crash
    // component.webIdAddFriend = 'test';
    // component.addFriend();
    // expect(!By.css('#toastr-container'));
  });

  it('should display input error (remove)', () => {
    component.webIdRemoveFriend = null;
    component.addFriend();
    expect(By.css('#toastr-container'));

    component.webIdRemoveFriend = '';
    component.addFriend();
    expect(By.css('#toastr-container'));

    // TODO: check that you are in session to make sure that it doesn't crash
    // component.webIdRemoveFriend = 'test';
    // component.removeFriend();
    // expect(!By.css('#toastr-container'));
  });

  it('should click intro', () => {
    component.webIdAddFriend = null;
    component.handleSubmit({keyCode: 13});
    expect(By.css('#toastr-container'));
  });
});
