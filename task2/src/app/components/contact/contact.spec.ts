import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact';  // تغيير من Contact إلى ContactComponent

describe('ContactComponent', () => {  // تغيير من Contact إلى ContactComponent
  let component: ContactComponent;  // تغيير من Contact إلى ContactComponent
  let fixture: ComponentFixture<ContactComponent>;  // تغيير من Contact إلى ContactComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent]  // تغيير من Contact إلى ContactComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactComponent);  // تغيير من Contact إلى ContactComponent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});