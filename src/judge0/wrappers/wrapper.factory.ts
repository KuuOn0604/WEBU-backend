export interface WrapResult {
  code: string;
  lineOffset: number;
}

export class WrapperFactory {
  /**
   * Bọc userCode vào trong wrapperTemplate và tính toán số dòng bị dôi ra (line offset).
   * @param userCode Code người dùng submit
   * @param wrapperTemplate Template có chứa {{USER_CODE}}
   * @returns WrapResult chứa code đã bọc và lineOffset
   */
  static wrapCode(userCode: string, wrapperTemplate: string): WrapResult {
    if (!wrapperTemplate || !wrapperTemplate.includes('{{USER_CODE}}')) {
      return { code: userCode, lineOffset: 0 };
    }

    const placeholderIndex = wrapperTemplate.indexOf('{{USER_CODE}}');
    const beforePlaceholder = wrapperTemplate.substring(0, placeholderIndex);

    // Đếm số dòng (xuống dòng) trước khi chèn userCode
    const lineOffset = (beforePlaceholder.match(/\n/g) || []).length;

    // Sử dụng chuỗi thay thế an toàn để tránh bị lỗi do các ký tự đặc biệt ($&, $', $$) trong code người dùng
    const afterPlaceholder = wrapperTemplate.substring(
      placeholderIndex + '{{USER_CODE}}'.length,
    );
    const wrappedCode = beforePlaceholder + userCode + afterPlaceholder;

    return {
      code: wrappedCode,
      lineOffset,
    };
  }
}
