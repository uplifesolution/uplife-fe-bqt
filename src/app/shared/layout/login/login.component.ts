import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/core/guards/auth.service';
import { InputTextComponent } from '@/shared/components';
import { Button } from 'primeng/button';
import { LoadingService } from '@/core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, CommonModule, InputTextComponent, Button], // Để dùng ngModel
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loadingService = inject(LoadingService);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.hasToken()) {
      this.router.navigate(['/']).then();
    }
  }

  onSubmit() {
    this.loadingService.start();
    this.authService
      .login({
        phoneNumber: this.username,
        password: this.password
      })
      .pipe(finalize(() => this.loadingService.complete()))
      .subscribe({
        next: () => {
          this.router.navigate(['/']).then(); // Chuyển hướng sau khi đăng nhập thành công
        },
        error: () => {
          this.errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
        }
      });
  }
}
