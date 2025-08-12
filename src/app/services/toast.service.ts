import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService: MessageService) { }

  /**
   * Show a success toast notification
   */
  showSuccess(message: string, title: string = 'Success'): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  /**
   * Show an error toast notification
   */
  showError(message: string, title: string = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 6000
    });
  }

  /**
   * Show a warning toast notification
   */
  showWarning(message: string, title: string = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 5000
    });
  }

  /**
   * Show an info toast notification
   */
  showInfo(message: string, title: string = 'Info'): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  /**
   * Clear all toast notifications
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Show a custom toast notification
   */
  showCustom(severity: 'success' | 'error' | 'warn' | 'info', message: string, title: string, life: number = 4000): void {
    this.messageService.add({
      severity,
      summary: title,
      detail: message,
      life
    });
  }
}
