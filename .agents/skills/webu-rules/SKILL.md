# Quy chuẩn Coding (Coding Rules & Conventions) - Dự án WEBU (Backend)

Tài liệu này tổng hợp toàn bộ các quy chuẩn phát triển phần mềm cho Backend. Mọi thành viên và trợ lý AI khi làm việc trên repository này đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 0. Tech Context (Bắt buộc đọc trước)

### Backend Stack
- NestJS v11 + TypeScript v6
- MongoDB Atlas + Mongoose v9
- Package Manager: Yarn + pnpm
- Code Execution: Judge0
- FSRS Algorithm: ts-fsrs v5.4
- AI Integration: Google Gemini + OpenAI
- API Docs: Swagger tại route `/api`

### Cấu trúc Module
- Hệ thống chia thành các module độc lập (`src/auth`, `src/cards`, `src/submissions`, v.v.).
- Mỗi module bao gồm `controller`, `service`, `module`, và có thể có `dto`, `entities`, `schemas`.

---

## I. QUY CHUẨN BACKEND

### 1. Đặt tên file & thư mục (Kebab-Case)
> [!IMPORTANT]
> Vi phạm quy tắc này sẽ gây ra lỗi Build hoặc Lint (Error).

- **Thư mục** trong `src/` và **file code** (`.ts`, `.js`): Bắt buộc viết chữ thường, cách nhau bằng dấu gạch ngang (**kebab-case**).
  - _Đúng:_ `user-profile.controller.ts`, `database.config.ts`.
  - _Sai:_ `UserProfileController.ts`, `database_config.ts`.
- **Tên Class, DTO, Interface, Decorator:** Dùng **PascalCase** (Ví dụ: `UserController`, `CreateUserDto`).
- **Tên Biến, Hàm, Thuộc tính, Phương thức:** Dùng **camelCase** (Ví dụ: `findUserById`, `userId`).
- **Hằng số toàn cục (Constants):** Dùng **UPPER_SNAKE_CASE** (Ví dụ: `JWT_SECRET`).
- **Đặc biệt:** Khi map code, các thuộc tính DB có dấu gạch dưới như `_id` cần được đổi tên biến sang `id` khi sử dụng ở logic code.

### 2. Phân chia thư mục
- **Constants dùng chung:** Đặt trong `src/common/constants/` (đây là thư mục chuẩn dự án đang dùng).
  - Ví dụ: `src/common/constants/card-config.ts`
  - Nếu constant chỉ dùng trong 1 module, đặt trong `src/<module>/constants/` của module đó.
- **Helper, Utility:** Đặt trong `src/utils/` hoặc `src/common/`.

### 3. Quy tắc TypeScript
- **Kiểu trả về của hàm (Warn):** Luôn khai báo kiểu dữ liệu trả về cho hàm chính.
  - _Đúng:_ `async getUser(id: string): Promise<User> { ... }`
  - _Ngoại lệ:_ Callback trong `.map()`, `.filter()`.
- **Hạn chế `any` — Quy tắc chi tiết:**
  - Cấm dùng `any` cho dữ liệu business logic (request body, response, DB documents).
  - Cho phép `unknown` trong `catch (err: unknown)` — đây là best practice TypeScript.
  - Cho phép `any` khi type của thư viện bên thứ 3 chưa có declaration (phải có comment giải thích).
  - Cho phép `Record<string, unknown>` thay `any` để type generic objects.
  - Lint rule mức Warning: `@typescript-eslint/no-explicit-any`.
- **Await Promise (Warn):** Mọi thao tác bất đồng bộ (Database, Promise) phải dùng `await` (hoặc `.then()`) để tránh floating promise.

### 4. Quy chuẩn Logic & Clean Code
- **Độ lồng nhau (Error):** Không lồng các khối lệnh (`if/else`, `for`, `try/catch`) quá **4 cấp**. Nếu quá 4 cấp bắt buộc phải refactor tách hàm nhỏ.
- **Toán tử so sánh (Error):** Luôn dùng `===` và `!==`. Cấm dùng `==` và `!=` (ngoại lệ: `== null` dùng để check cả `null` và `undefined`).
- **Biến không sử dụng (Warn):** Nếu khai báo biến để giữ chỗ mà không dùng, bắt buộc phải thêm dấu gạch dưới `_` ở đầu tên (Ví dụ: `_req`, `_temp`).
- **Console.log:** Xóa sạch `console.log()` trước khi commit. Khuyến khích dùng logger tích hợp của NestJS.

---

## II. QUY TRÌNH GIT & CHECKLIST TRƯỚC KHI PUSH (Backend Repository)

### 1. Conventional Commits
Bắt buộc viết commit theo format: `<type>: <description>` bằng tiếng Anh.
- `feat`: Thêm tính năng mới.
- `fix`: Sửa lỗi.
- `chore`: Cấu hình, cài đặt thư viện.
- `docs`: Cập nhật tài liệu.
- `style`: Sửa format code.
- `refactor`: Cơ cấu lại code (không đổi logic).
_Ví dụ chuẩn:_ `feat: add login page`, `fix: correct button hover on chrome`.

### 2. Đặt tên Branch
Sử dụng kebab-case kèm prefix: `feat/login-page`, `fix/button-bug`, `chore/update-deps`.

### 3. Checklist trước khi Push
- [ ] Code đã chạy tốt ở local (`yarn start:dev`).
- [ ] Không còn tồn tại lệnh `console.log()` dư thừa.
- [ ] Đã chạy check và pass kiểm tra cú pháp (`yarn lint`).
- [ ] Đã chạy thử build và thành công (`yarn build`).
- [ ] Đã viết/cập nhật unit test cho service mới (nếu có).
- [ ] Swagger docs được cập nhật (nếu thêm/sửa endpoint).
- [ ] Không có sensitive data (API key, password) trong code.
- [ ] Tên branch và commit message đúng quy chuẩn.
