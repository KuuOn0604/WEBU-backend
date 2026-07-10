# Quy chuẩn Coding (Coding Rules & Conventions) - Dự án WEBU

Tài liệu này tổng hợp toàn bộ các quy chuẩn phát triển phần mềm (Frontend & Backend) được đúc kết từ file gốc [Rules.md](file:///c:/Users/DELL/Desktop/WEBU-backend/Rules.md). Mọi thành viên và trợ lý AI khi làm việc trên repository này đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## I. QUY CHUẨN BACKEND (BE)
### 1. Đặt tên file & thư mục (Kebab-Case)
> [!IMPORTANT]
> Vi phạm quy tắc này sẽ gây ra lỗi Build hoặc Lint (Error).
*   **Thư mục** trong `src/` và **file code** (`.ts`, `.js`): Bắt buộc viết chữ thường, cách nhau bằng dấu gạch ngang (**kebab-case**).
    *   *Đúng:* `user-profile.controller.ts`, `database.config.ts`.
    *   *Sai:* `UserProfileController.ts`, `database_config.ts`.
*   **Tên Class, DTO, Interface, Decorator:** Dùng **PascalCase** (Ví dụ: `UserController`, `CreateUserDto`).
*   **Tên Biến, Hàm, Thuộc tính, Phương thức:** Dùng **camelCase** (Ví dụ: `findUserById`, `userId`).
*   **Hằng số toàn cục (Constants):** Dùng **UPPER_SNAKE_CASE** (Ví dụ: `JWT_SECRET`).
*   **Đặc biệt:** Khi map code, các thuộc tính DB có dấu gạch dưới như `_id` cần được đổi tên biến sang `id` khi sử dụng ở logic code.

### 2. Phân chia thư mục
*   **Constants dùng chung:** Đặt trong `src/constants/` hoặc `src/common/constants/`.
*   **Helper, Utility:** Đặt trong `src/utils/` hoặc `src/common/`.

### 3. Quy tắc TypeScript (BE)
*   **Kiểu trả về của hàm (Warn):** Luôn khai báo kiểu dữ liệu trả về cho hàm chính.
    *   *Đúng:* `async getUser(id: string): Promise<User> { ... }`
    *   *Ngoại lệ:* Callback trong `.map()`, `.filter()`.
*   **Hạn chế `any` (Warn):** Định nghĩa rõ ràng Interface/DTO. Tránh lạm dụng `any`.
*   **Await Promise (Warn):** Mọi thao tác bất đồng bộ (Database, Promise) phải dùng `await` (hoặc `.then()`) để tránh floating promise.

### 4. Quy chuẩn Logic & Clean Code (BE)
*   **Độ lồng nhau (Error):** Không lồng các khối lệnh (`if/else`, `for`, `try/catch`) quá **4 cấp**. Nếu quá 4 cấp bắt buộc phải refactor tách hàm nhỏ.
*   **Toán tử so sánh (Error):** Luôn dùng `===` và `!==`. Cấm dùng `==` và `!=` (ngoại lệ: `== null` dùng để check cả `null` và `undefined`).
*   **Biến không sử dụng (Warn):** Nếu khai báo biến để giữ chỗ mà không dùng, bắt buộc phải thêm dấu gạch dưới `_` ở đầu tên (Ví dụ: `_req`, `_temp`).
*   **Console.log:** Xóa sạch `console.log()` trước khi commit. Khuyến khích dùng logger tích hợp của NestJS.

---

## II. QUY CHUẨN FRONTEND (FE)

### 1. Format & Layout UI
*   Kích thước trang chuẩn: `1440 x 1024` và `1440 x 1024++`.
*   **Padding** phải chia hết cho **4**.
*   **Margin** biên mặc định: `120px`.
*   Sử dụng Grid mặc định: `12 x Auto`.
*   Sử dụng đúng typography có sẵn trong foundation (không tự ý chỉnh sửa font, màu, size khi không cần thiết).

### 2. Đặt tên file & thư mục (FE)
*   **Component & Thư mục chứa Component:** Dùng **PascalCase** (Ví dụ: `Button.tsx`, `UserProfile.tsx`).
*   **Non-component (.ts):** Dùng **camelCase** (Ví dụ: `useAuth.ts`, `formatDate.ts`).
*   **Folder:** Dùng **kebab-case** (Ví dụ: `src/user-profile/`, `src/api-services/`).
*   **CSS đi kèm:** Tên giống với component (Ví dụ: `Button.tsx` + `Button.css`).
*   File đại diện cho thư mục: `index.ts` hoặc `index.tsx`.

### 3. Quy tắc React & TypeScript (FE)
*   **Rules of Hooks:** Chỉ gọi hook ở top-level của component hoặc custom hook. Không đặt trong if/else/loop.
*   **useEffect Dependency:** Luôn khai báo đầy đủ các dependencies mà hook sử dụng.
*   **Key trong List:** Bắt buộc dùng **ID unique**, không dùng index của mảng làm key.
*   **Button Type:** Luôn khai báo rõ `type="button"` cho nút bấm để tránh reload trang ngoài ý muốn (mặc định của trình duyệt là `submit`).
*   **Semantic HTML:** Sử dụng các thẻ HTML5 có ý nghĩa (`<main>`, `<header>`, `<nav>`, `<button>`) thay vì lạm dụng thẻ `<div>`.

### 4. Styling (CSS)
*   **BEM Naming:** Tuân thủ `.block__element--modifier` (Ví dụ: `.card__title`, `.card__btn--primary`).
*   **Không inline style:** Chỉ sử dụng khi giá trị phụ thuộc vào runtime data (Ví dụ: thanh tiến trình `width: ${progress}%`).
*   **CSS Variables:** Khai báo mã màu, spacing dùng chung trong `src/index.css` sử dụng `:root`.

### 5. Import & Export
*   **Alias `@/`:** Luôn dùng alias `@/` cho absolute import (Ví dụ: `import Button from '@/components/ui/Button'`).
*   **Thứ tự Import:**
    1.  Thư viện ngoài (React, NestJS, third-party).
    2.  Absolute import (`@/...`).
    3.  Relative import (`./...`, `../...`).
    4.  Tệp CSS (`import './Style.css'`).
*   **Style Export:**
    *   Component: `export default`.
    *   Hook, util, type, constant: **named export** (`export const ...`).

---

## III. QUY TRÌNH GIT & CHECKLIST TRƯỚC KHI PUSH

### 1. Conventional Commits
Bắt buộc viết commit theo format: `<type>: <description>` bằng tiếng Anh.
*   `feat`: Thêm tính năng mới.
*   `fix`: Sửa lỗi.
*   `chore`: Cấu hình, cài đặt thư viện.
*   `docs`: Cập nhật tài liệu.
*   `style`: Sửa format code.
*   `refactor`: Cơ cấu lại code (không đổi logic).

*Ví dụ chuẩn:* `feat: add login page`, `fix: correct button hover on chrome`.

### 2. Đặt tên Branch
Sử dụng kebab-case kèm prefix: `feat/login-page`, `fix/button-bug`, `chore/update-deps`.

### 3. Checklist trước khi Push
- [ ] Code đã chạy tốt ở local (`yarn dev` / `npm run dev`).
- [ ] Không còn tồn tại lệnh `console.log()` dư thừa.
- [ ] Đã chạy check và pass kiểm tra cú pháp (`yarn lint` / `npm run lint`).
- [ ] Đã chạy thử build và thành công (`yarn build` / `npm run build`).
- [ ] Giao diện đã được test tương thích thiết bị (Responsive).
- [ ] Tên branch và commit message đúng quy chuẩn.
