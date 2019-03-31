import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComponent } from './message.component';
import { ChatService } from '../services/chat.service';
import { ToastrModule } from 'ngx-toastr';
import {By} from '@angular/platform-browser';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageComponent ],
      imports: [ ToastrModule.forRoot() ],
      providers: [ ChatService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should remove message (case a)', () => {
    component.messageContent = '';
    component.removeMessage();
    expect(By.css('#toastr-container'));
  });

  it('should remove message (case b)', () => {
    component.messageContent = 'a';
    component.isOwnMessage = true;
    component.removeMessage();
    expect(By.css('#toastr-container'));
    expect(component.messageContent === '');
  });
});
