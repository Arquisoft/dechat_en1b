import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComponent } from './message.component';
import { ChatService } from '../services/chat.service';
import { ToastrModule } from 'ngx-toastr';
import {By} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatMessage } from '../models/chat-message.model';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageComponent ],
      imports: [ BrowserAnimationsModule, ToastrModule.forRoot() ],
      providers: [ ChatService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
    component.chatMessage = new ChatMessage("Test 1", "Test msg", new Date());
    component.chatMessage.webId = "";
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should not remove a message that is not yours', () => {
    component.isOwnMessage = false;
    component.removeMessage();
    expect(By.css('#toastr-container'));
  });

  it('should remove message', () => {
    component.isOwnMessage = true;
    component.removeMessage();
    expect(!By.css('#toastr-container'));
  });
});
