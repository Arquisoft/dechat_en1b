import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { RdfService } from './rdf.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {By} from '@angular/platform-browser';
import {User} from '../models/user.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ChatMessage} from '../models/chat-message.model';

describe('ChatService', () => {

  // Dummy webIds
  const webId1 = 'https://nachomontes.solid.community/profile/card#me';
  const webId2 = 'https://test.solid.community/profile/card#me';

  // Dummy users
  const user1 = new BehaviorSubject<User>(new User(webId1, '', ''));
  const user2 = new User(webId2, '', '');

  // Dummy chat messages
  const msg1 = new ChatMessage('nachomontes', 'test1', new Date(2019, 11, 17, 12, 40));
  const msg2 = new ChatMessage('nachomontes', 'test2', new Date(2019, 11, 17, 13, 40));
  const msg3 = new ChatMessage('test', 'test3', new Date(2019, 10, 17, 14, 40));
  const msg4 = new ChatMessage('test', 'test4', new Date(2019, 10, 17, 15, 40));

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ ToastrModule.forRoot(), BrowserAnimationsModule ],
    providers: [ ChatService ]
  }));

  it('should be created', () => {
    const service: ChatService = TestBed.get(ChatService);
    expect(service).toBeTruthy();
  });

  it('should check null when done correctly', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.thisUser = user1;
    service.otherUser = user2;
    service.changeChat(null);
    expect(By.css('#toastr-container'));
  });

  it('should change chat correctly', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.thisUser = user1;
    service.changeChat(user2);
    expect(By.css('#toastr-container'));
  });

  it('should generate URL correctly', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.thisUser = user1;
    service.otherUser = user2;
    expect(service.getChatUrl(user1.value, user2)[Symbol.toStringTag] === 'https://nachomontes.solid.community/private/dechat/chat_test');
  });

  it('should add messages and sort them', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.thisUser = user1;
    service.otherUser = user2;
    service.addMessage(msg1);
    service.addMessage(msg2);
    service.addMessage(msg3);
    service.addMessage(msg4);
    expect(service.chatMessages.value.length === 4);
    expect(service.chatMessages[0] === msg3);
  });

  it('should send a message', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.sendMessage('Test');
    expect(By.css('#toastr-container'));
  });

  it('should return current user', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.thisUser = user1;
    expect(service.getUser() === user1.asObservable());
  });

  it('should return the other user', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.otherUser = user2;
    expect(service.getOtherUser() === of(user2));
  });
});
