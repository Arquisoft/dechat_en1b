import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatroomComponent } from './chatroom.component';
import { UserListComponent } from '../user-list/user-list.component';
import { FeedComponent } from '../feed/feed.component';
import { ChatFormComponent } from '../chat-form/chat-form.component';
import { UserItemComponent } from '../user-item/user-item.component';
import { ChatService } from '../services/chat.service';
import { MessageComponent } from '../message/message.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

describe('ChatroomComponent', () => {
  let component: ChatroomComponent;
  let fixture: ComponentFixture<ChatroomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatroomComponent, UserListComponent, FeedComponent, ChatFormComponent, UserItemComponent , MessageComponent ],
      imports: [ FormsModule , ToastrModule.forRoot()  ],
      providers: [ ChatService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
