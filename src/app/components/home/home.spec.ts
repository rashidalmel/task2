import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';  // تغيير من Home إلى HomeComponent

describe('HomeComponent', () => {  // تغيير من Home إلى HomeComponent
  let component: HomeComponent;  // تغيير من Home إلى HomeComponent
  let fixture: ComponentFixture<HomeComponent>;  // تغيير من Home إلى HomeComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]  // تغيير من Home إلى HomeComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);  // تغيير من Home إلى HomeComponent
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});