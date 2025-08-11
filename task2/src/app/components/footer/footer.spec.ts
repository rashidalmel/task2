import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer';  // تغيير من Footer إلى FooterComponent

describe('FooterComponent', () => {  // تغيير من Footer إلى FooterComponent
  let component: FooterComponent;  // تغيير من Footer إلى FooterComponent
  let fixture: ComponentFixture<FooterComponent>;  // تغيير من Footer إلى FooterComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]  // تغيير من Footer إلى FooterComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);  // تغيير من Footer إلى FooterComponent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});