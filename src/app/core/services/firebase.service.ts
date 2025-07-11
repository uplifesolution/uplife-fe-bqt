import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, Messaging, onMessage } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly vapidKey =
    'BIQJSPoF2kZUD5yPkMOKcYCwYDF_TvDIIJr89tqX_oz3Z_agO-CwX3r0EL1vZfF8nKm9eceUZ-gn7yDRHk3lhrg';

  currentMessage = new BehaviorSubject<any>(null);
  private readonly messaging: Messaging;

  constructor() {
    // Khởi tạo ứng dụng Firebase với cấu hình từ file environment
    const app = initializeApp(environment.firebaseConfig);
    this.messaging = getMessaging(app);
    console.log('Firebase service initialized');
  }

  /**
   * Yêu cầu quyền nhận thông báo và lấy token FCM
   */
  requestPermissionAndGetToken() {
    console.log('Requesting permission for notifications...');

    getToken(this.messaging, { vapidKey: this.vapidKey })
      .then(currentToken => {
        if (currentToken) {
          console.log('FCM Token của bạn là:', currentToken);
          // TODO: Gửi token này về server của bạn để lưu lại
          // ví dụ: this.http.post('/api/save-fcm-token', { token: currentToken }).subscribe();
        } else {
          // Người dùng không cấp quyền hoặc có lỗi khác
          console.log('Không lấy được token. Hãy chắc chắn bạn đã cho phép nhận thông báo!');
        }
      })
      .catch(err => {
        // Xử lý lỗi, đặc biệt là lỗi người dùng từ chối cấp quyền
        console.error('Đã xảy ra lỗi khi lấy token:', err);
      });
  }

  /**
   * Lắng nghe các tin nhắn đến khi người dùng đang ở trên trang web (foreground)
   */
  listenForMessages() {
    onMessage(this.messaging, payload => {
      console.log('Tin nhắn mới nhận được: ', payload);

      // Cập nhật BehaviorSubject để các component khác có thể sử dụng thông tin tin nhắn
      this.currentMessage.next(payload);

      // Tại đây, bạn có thể hiển thị một thông báo toast/snackbar để báo cho người dùng
      // Ví dụ: alert(`Thông báo mới: ${payload.notification?.title}`);
    });
  }
}
