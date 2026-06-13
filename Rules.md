# Rules FE

**WEBU Frontend**

**Coding Rules & Conventions**

# **0\. Format**

Page size 1440 x 1024 và 1440 x 1024++  
Padding chia hết cho 4  
Margin \= 120px  
Auto format là grid, 12 x Auto,   
Heading là H  
Paragraph là P  
Ide code là IDE  
Font, màu, size đặt theo typography có sẵn, không tự chỉnh sửa, thiếu thì add style trong foundation

# **I. Đặt tên**

## **File**

* **Component và folder chứa mỗi component (.tsx):** PascalCase → Button.tsx, UserProfile.tsx

* **Non-component (.ts):** camelCase → useAuth.ts, formatDate.ts

* **Folder:** kebab-case → src/user-profile/, src/api-services/

* **CSS đi kèm:** cùng tên component → Button.tsx \+ Button.css

* Tệp đại diện cho thư mục: [index.ts](http://index.ts). index.tsx

## **Biến / hàm**

| Loại | Convention | Ví dụ |
| :---- | :---- | :---- |
| Component | PascalCase | \<LoginForm /\> |
| Custom hook | use \+ camelCase | useAuth() |
| Variable | camelCase | const userName |
| Constant | UPPER\_SNAKE\_CASE | const API\_URL |
| Type / Interface | PascalCase | interface User |

# **II. Cấu trúc thư mục**

src/  
├── assets/       \# ảnh, icon, font  
├── components/   \# UI tái sử dụng (Button, Card...)  
├── pages/        \# màn hình tương ứng với route  
├── hooks/        \# custom hooks  
├── services/     \# gọi API  
├── types/        \# TypeScript types  
├── utils/        \# helper functions  
├── constants/    \# API\_URL, ROUTES...  
├── App.tsx       \# routing  
├── main.tsx      \# entry  
└── index.css     \# global styles

**Rules:**

* Constants dùng chung → src/constants/

* Helper / utility → src/utils/

* **Không hardcode API URL** trong component.

# **III. TypeScript**

## **1\. Toán tử so sánh**  

Luôn dùng \=== / \!==. Cấm \== / \!= (trừ \== null để check cả null/undefined).

if (count \=== 0\) { ... }       // ✅  
if (count \== 0\) { ... }         // ❌  
   
if (value \== null) { ... }     // ✅ OK: bắt cả null và undefined

## **2\. Hạn chế any**  

Định nghĩa type chính xác. Khi không biết type → dùng unknown.

function handleSubmit(data: FormData) { ... }   // ✅  
function handleSubmit(data: any) { ... }	         // ❌

## **3\. Phải await Promise**  

Mọi hàm async phải được await, tránh floating promise.

async function load(): Promise\<void\> {  
  await fetchUser();         // ✅  
}  
   
async function load() {  
  fetchUser();		// ❌ không await  
}

## **4\. Khai báo kiểu trả về**  

Cho hàm exported, hàm async:

async function fetchUser(id: string): Promise\<User\> { ... }   // ✅  
async function fetchUser(id: string) { ... }  		// ❌

Ngoại lệ: callback nhỏ trong .map(), .filter() được bỏ.

## **5\. Props phải có type**  

interface ButtonProps {  
  children: React.ReactNode;  
  onClick?: () \=\> void;  
}  
   
function Button({ children, onClick }: ButtonProps) { ... }   // ✅  
function Button(props: any) { ... }                                          // ❌

# **IV. Clean code**

## **1\. Không lồng quá 4 cấp**  

If/else, for, try/catch không lồng quá 4 cấp \-\> refactor thành hàm nhỏ.

## **2\. Early return**  

// ❌ khó đọc  
function render() {  
  if (user) {  
    if (user.isActive) {  
      return \<Dashboard /\>;  
    } else {  
      return \<Inactive /\>;  
    }  
  } else {  
    return \<Login /\>;  
  }  
}  
   
// ✅ dễ đọc  
function render() {  
  if (\!user) return \<Login /\>;  
  if (\!user.isActive) return \<Inactive /\>;  
  return \<Dashboard /\>;  
}

## **3\. Biến không dùng**  

Sử dụng Prefix “\_” nếu cần thiết khai báo nhưng không sử dụng:

function handler(\_event: Event, data: string) {  
  console.log(data);  
}

## **4\. Không để console.log khi commit**  

Xóa trước khi push. console.warn và console.error OK.

## **5\. Không magic numbers**  

// ❌  
if (user.role \=== 1\) { ... }  
   
// ✅  
const USER\_ROLE \= { ADMIN: 1, STUDENT: 2 } as const;  
if (user.role \=== USER\_ROLE.ADMIN) { ... }

# **V. React rules**

## **1\. Rules of Hooks**  

* Chỉ gọi hook ở **top-level** của component hoặc custom hook.

* Không gọi trong if/else/loop/function thường.

* Custom hook phải bắt đầu bằng use.

function Comp() {  
  const \[x, setX\] \= useState(0);           // ✅ top-level  
   
  if (condition) {  
    const \[y, setY\] \= useState(0);         // ❌ trong if  
  }  
}

## **2\. useEffect dependency đầy đủ**  

useEffect(() \=\> {  
  fetchUser(userId);  
}, \[userId\]);         // ✅ khai báo userId  
   
useEffect(() \=\> {  
  fetchUser(userId);  
}, \[\]);               //  ❌ thiếu userId

## **3\. Key trong list**  

Dùng ID unique, **không dùng index**.

{users.map((user) \=\> \<Card key={user.id} user={user} /\>)}    // ✅  
{users.map((user, i) \=\> \<Card key={i} user={user} /\>)}       // ❌

## **4\. Button type**  

Mặc định type="submit" → reload page ngoài ý muốn.

\<button type="button" onClick={handleClick}\>Click\</button\>   // ✅  
\<button onClick={handleClick}\>Click\</button\>                 // ❌

## **5\. Semantic HTML**  

Dùng tag có ý nghĩa thay vì \<div\> tất cả:

* \<main\>, \<header\>, \<nav\>, \<footer\>, \<article\>, \<section\>

* \<button\> cho click, không \<div onClick\>.

# **VI. Styling (CSS)**

## **1\. BEM naming**  

.block              \-\> component chính  
.block\_\_element     \-\> phần con (dùng \_\_)  
.block--modifier    \-\> biến thể (dùng \--)

Ví dụ: .card, .card\_\_title, .card\_\_btn--primary

## **2\. Không inline style**  

Chỉ dùng inline khi style phụ thuộc runtime data (vd progress bar).

## **3\. CSS variables cho color/spacing**  

Khai trong src/index.css:

:root {  
  \--color-primary: \#646cff;  
  \--spacing-md: 1rem;  
}  
   
.button {  
  background: var(--color-primary);  
  padding: var(--spacing-md);  
}

# **VII. Import & Export**

## **1\. Dùng alias @/**  

import Button from '@/components/ui/Button';      // ✅  
import Button from '../../../components/Button';  // ❌

## **2\. Thứ tự import**  

// 1\. Thư viện ngoài  
import { useState } from 'react';  
   
// 2\. Absolute (@/)  
import Button from '@/components/ui/Button';  
   
// 3\. Relative  
import Header from './Header';  
   
// 4\. CSS cuối cùng  
import './Home.css';

## **3\. Export style**  

* Component → export default

* Hook, util, type, constant → **named export**

# **VIII. Git & Commit**

## **1\. Conventional Commits (bắt buộc)**

Format: \<type\>: \<description\> (tiếng Anh)

| Type | Dùng khi |
| :---- | :---- |
| feat | Thêm tính năng |
| fix | Sửa bug |
| chore | Config, cài đặt |
| docs | Cập nhật documentation |
| style | Format code |
| refactor | Refactor, không đổi behavior |

✅ feat: add login page  
✅ fix: correct button hover on Google Chrome  
❌ update stuff  
❌ fix lỗ

## **2\. Branch naming**  

✅ feat/login-page, fix/button-bug, chore/update-deps  
❌ LoginPage, fix\_bug, my-branch

## **3\. Không push thẳng main/develop**  

Flow chuẩn:

git checkout develop  
git pull  
git checkout \-b feat/your-feature  
\# code...  
yarn lint && yarn build         \# check trước khi push  
git add .  
git commit \-m "feat: mô tả"  
git push \-u origin feat/your-feature  
\# Tạo PR trên GitHub → review → merge

# **IX. Setup VS Code**

Bắt buộc cài:

* Extension **ESLint** (dbaeumer.vscode-eslint)

* Extension **Prettier** (esbenp.prettier-vscode)

Trong .vscode/settings.json:

{  
  "editor.formatOnSave": true,  
  "editor.defaultFormatter": "esbenp.prettier-vscode",  
  "editor.codeActionsOnSave": {  
    "source.fixAll.eslint": "explicit"  
  }  
}

# **X. Checklist trước khi push**

* ☐ Code chạy được local (yarn dev)

* ☐ yarn lint pass

* ☐ yarn build pass

* ☐ Không còn console.log

* ☐ Đã test responsive

* ☐ Branch \+ commit theo convention

## **Các lệnh hay dùng**

| Lệnh | Mục đích |
| :---- | :---- |
| yarn lint | check ESLint |
| yarn lint:fix | auto-fix |
| yarn format | format tất cả |
| yarn type-check | check TypeScript |
| yarn build | build production |

# Rules BE

**CODING RULES/ CONVENTIONS**

## **I. CẤU TRÚC THƯ MỤC & ĐẶT TÊN** 

Quan trọng: lúc imply code thì mọi thuộc tính có ‘\_’ cần sử dụng (vd \_id) thì sẽ đổi tên biến sang ‘id’ nha.

### **1\. Quy chuẩn Kebab-Case (Error)**

Toàn bộ **thư mục** nằm trong src/ và các **file code** (.ts, .js) bắt buộc phải viết chữ thường, cách nhau bằng dấu gạch ngang (kebab-case).  
Không dùng camelCase, PascalCase hay snake\_case cho tên file.  
*Đúng:* src/auth-module/, user-profile.controller.ts, database.config.ts  
*Sai:* src/AuthModule/, UserProfileController.ts, database\_config.ts

**Class, DTO, Interface, Decorator:** Bắt buộc dùng **PascalCase**   
(Ví dụ: UserController, CreateUserDto, UserEntity).

**Biến, Hàm, Thuộc tính, Phương thức:** Bắt buộc dùng **camelCase**   
(Ví dụ: findUserById, userId, correctTestCases).

**Hằng số toàn cục (Constants):** Thường dùng **UPPER\_SNAKE\_CASE**   
(Ví dụ: MAX\_UPLOAD\_SIZE, JWT\_SECRET).

### **2\. Chia thư mục (Theo a Nghi)**

Các constants dùng chung phải được gom vào thư mục riêng.   
Ví dụ: src/constants/ hoặc src/common/constants/.  
Các hàm helper, utility,... phải đặt trong thư mục src/utils/ hoặc src/common/.  
…

## **II. Rules TypeScript**

### **1\. Khai báo kiểu trả về của hàm (Warn)**

Bắt buộc phải khai báo kiểu dữ liệu trả về cho các hàm chính.  
Đúng: async getUser(id: string): Promise\<User\> { ... }  
Ngoại lệ: Các arrow functions hoặc callback trong .map(), .filter() được phép bỏ qua.

### **2\. Hạn chế sử dụng any (Warn)**

Cố gắng định nghĩa chính xác Interface hoặc DTO. Việc lạm dụng any sẽ bị warn.

### **3\. Nhớ thêm await (Warn)**

Bất kỳ hàm nào thao tác với Database hoặc trả về Promise đều phải có await (hoặc .then()) để tránh lỗi luồng dữ liệu (Floating Promises).

## **III. QUY CHUẨN LOGIC & CLEAN CODE**

### **1\. Giới hạn độ lồng nhau của Code (Error)**

Các khối lệnh (if/else, for, try/catch) không được lồng nhau quá 4 cấp, bắt buộc phải tách bớt logic ra thành một hàm nhỏ hơn (Refactor).

### **2\. Toán tử so sánh (Error)**

Luôn luôn sử dụng `===` và `!==`. Tuyệt đối cấm dùng `==` và `!=`. Ngoại lệ: \== null.

### **3\. Biến và tham số khai báo mà không sử dụng (Warn)**

Khai báo biến nhớ sử dụng. Nếu khai báo để giữ chỗ, bắt buộc phải thêm dấu gạch dưới \_ ở đầu tên biến (VD: \_req, \_temp).

Console.log: Hạn chế để quên console.log() khi đẩy code lên. Khuyến khích sử dụng logger tích hợp sẵn của framework.

## **IV. ĐỊNH DẠNG CODE**

Nhớ bật auto format on save trên vscode.

