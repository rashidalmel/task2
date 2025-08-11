import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';  // تغيير من Header إلى HeaderComponent

describe('HeaderComponent', () => {  // تغيير من Header إلى HeaderComponent
  let component: HeaderComponent;  // تغيير من Header إلى HeaderComponent
  let fixture: ComponentFixture<HeaderComponent>;  // تغيير من Header إلى HeaderComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]  // تغيير من Header إلى HeaderComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);  // تغيير من Header إلى HeaderComponent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});