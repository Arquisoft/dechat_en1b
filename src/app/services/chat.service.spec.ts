import { TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';
import { RdfService } from './rdf.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';

import {By} from '@angular/platform-browser';

describe('ChatService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ ToastrModule.forRoot() ],
    providers: [ ChatService ]
  }));

  it('should be created', () => {
    const service: ChatService = TestBed.get(ChatService);
    expect(service).toBeTruthy();
  });

  it('should check null when done correctly', () => {
    const service: ChatService = TestBed.get(ChatService);
    service.changeChat(null);
    expect(By.css('#toastr-container'));
  });

});
