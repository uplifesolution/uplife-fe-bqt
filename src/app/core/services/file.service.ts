import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseApi } from '@/core/interfaces/response-api';
import { EcmFolder } from '@/core/interfaces/ecm-folder';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  baseUrlEcm = `${environment.baseUrl}/ecm`;

  constructor(private http: HttpClient) {}

  uploadFileEcm(uuidEcmFolder: string, file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ResponseApi>(
      `${this.baseUrlEcm}/investors/folders/${uuidEcmFolder}/upload`,
      formData
    );
  }

  getUrlPreviewFile(uuidFile: string) {
    return this.http
      .get<
        ResponseApi<{
          url: string;
        }>
      >(`${this.baseUrlEcm}/investors/files/${uuidFile}/preview`)
      .pipe(map(res => res.data.url));
  }

  /**
   * Gọi API để download file với method GET.
   * @param apiUrl Đường dẫn API để tải file.
   * @param defaultFilename Tên file mặc định nếu không có header Content-Disposition.
   */
  downloadFile(apiUrl: string, defaultFilename: string = 'downloaded-file') {
    // 1. Thực hiện HTTP GET request
    // Rất quan trọng: phải có responseType: 'blob' và observe: 'response'
    return this.http
      .get(apiUrl, {
        observe: 'response', // Lấy toàn bộ HttpResponse để đọc được header
        responseType: 'blob' // Yêu cầu Angular trả về dữ liệu dạng Blob, không phải JSON
      })
      .pipe(
        tap((response: HttpResponse<Blob>) => {
          // 2. Kiểm tra nếu body có dữ liệu
          if (response.body) {
            // 3. Xử lý và kích hoạt download
            this.triggerDownload(
              response.body,
              this.getFilenameFromResponse(response) || defaultFilename
            );
          } else {
            console.error('API response body is null.');
            // Xử lý lỗi ở đây, ví dụ: hiển thị thông báo cho người dùng
          }
        }),
        map(res => true)
      );
  }

  /**
   * Gọi API để download file với method POST.
   * @param apiUrl Đường dẫn API để tải file.
   * @param body Payload cần truyền vào.
   * @param defaultFilename Tên file mặc định nếu không có header Content-Disposition.
   */
  downloadFilePost(apiUrl: string, body: any = {}, defaultFilename: string = 'downloaded-file') {
    // 1. Thực hiện HTTP GET request
    // Rất quan trọng: phải có responseType: 'blob' và observe: 'response'
    return this.http
      .post(apiUrl, body, {
        observe: 'response', // Lấy toàn bộ HttpResponse để đọc được header
        responseType: 'blob' // Yêu cầu Angular trả về dữ liệu dạng Blob, không phải JSON
      })
      .pipe(
        tap((response: HttpResponse<Blob>) => {
          // 2. Kiểm tra nếu body có dữ liệu
          if (response.body) {
            // 3. Xử lý và kích hoạt download
            this.triggerDownload(
              response.body,
              this.getFilenameFromResponse(response) || defaultFilename
            );
          } else {
            console.error('API response body is null.');
            // Xử lý lỗi ở đây, ví dụ: hiển thị thông báo cho người dùng
          }
        }),
        map(res => true)
      );
  }

  getEcmFolder(uuid: string) {
    return this.http
      .get<ResponseApi<EcmFolder>>(`${this.baseUrlEcm}/folders/${uuid}/tree`)
      .pipe(map(res => res.data));
  }

  /**
   * Trích xuất tên file từ header 'Content-Disposition'
   */
  getFilenameFromResponse(response: HttpResponse<any>): string | null {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        // Dọn dẹp tên file, loại bỏ dấu " hoặc '
        return matches[1].replace(/['"]/g, '');
      }
    }
    return null;
  }

  /**
   * Kích hoạt trình duyệt tải file xuống
   */
  triggerDownload(blob: Blob, filename: string): void {
    console.log(filename);
    // Tạo một thẻ <a> ẩn
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    // Tạo một URL tạm thời cho Blob
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename; // Đặt tên file sẽ được tải về

    // Giả lập một cú click để bắt đầu download
    a.click();

    // Dọn dẹp: thu hồi URL và xóa thẻ <a>
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
