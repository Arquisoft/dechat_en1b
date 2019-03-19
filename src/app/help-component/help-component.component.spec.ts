import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponentComponent } from './help-component.component';

describe('HelpComponentComponent', () => {
  let component: HelpComponentComponent;
  let fixture: ComponentFixture<HelpComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
