# CINEBOOKING — HƯỚNG DẪN SỬ DỤNG HỆ THỐNG AGENT SKILLS

Tài liệu này cung cấp hướng dẫn toàn diện về các **Agent Skills** đã được tích hợp vào dự án **CineBooking** (`C:\Users\trana\OneDrive\Desktop\java\fontend\.agents\skills`), bao gồm chức năng, thời điểm kích hoạt, quy trình phối hợp đa Skill và quy tắc chống xung đột cho Google Antigravity.

---

## 1. Danh sách các Skill đã cài đặt & Chức năng chi tiết

Hệ thống bao gồm **7 nhóm gói năng lực (30 Skills chuyên biệt)** được cài đặt ở cấp **Project** (`.agents/skills/`):

### Nhóm A: Thiết kế Giao diện & Định hướng Thẩm mỹ (UI/UX & Art Direction)

| Tên Skill (`name`) | Nguồn Repository | Chức năng chính | Khi nào Agent nên kích hoạt |
| :--- | :--- | :--- | :--- |
| `frontend-design` | `anthropics/skills` | Xây dựng giao diện web đạt độ hoàn thiện sản phẩm cao (production-grade), bố cục sắc nét, tránh thiết kế AI rập khuôn. | Khi tạo mới trang hoặc thiết kế lại một khu vực giao diện quan trọng (Hero, Movie Grid, Checkout, Ticket). |
| `design-taste-frontend` | `Leonxlnx/taste-skill` | Áp dụng hướng nghệ thuật (art direction) cao cấp từ 247 trang web đạt giải thưởng (Awwwards), kiểm tra trực quan qua trình duyệt và chống lỗi "AI-slop". | Khi cần tinh chỉnh thẩm mỹ cao cấp (dark luxury cinema), cân chỉnh tỷ lệ poster, ánh sáng bóng đổ, và chạy vòng lặp chụp màn hình đối chiếu thực tế. |
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill` | Kho tri thức thiết kế UI/UX (bảng màu, cặp font, 119 quy tắc UX, preset chuyển động, khả năng truy cập). | Khi thiết kế luồng đặt vé (user flow), cấu trúc phân cấp thông tin (visual hierarchy), trạng thái tương tác và trải nghiệm đa thiết bị. |
| `design-system` | `nextlevelbuilder/ui-ux-pro-max-skill` | Quản lý hệ thống Design Tokens (màu sắc, spacing 4/8px, border radius, shadow, typography tokens). | Khi cần định nghĩa hoặc đồng bộ hóa biến CSS (`globals.css`, Tailwind tokens) xuyên suốt toàn trang CineBooking. |
| `ui-styling` | `nextlevelbuilder/ui-ux-pro-max-skill` | Kỹ thuật styling hiện đại với Tailwind CSS, glassmorphism, backdrop blur và hiệu ứng ánh sáng tím/navy. | Khi tinh chỉnh chi tiết CSS, hover effect, border mảnh, glow tím và chuyển đổi Dark/Light mode. |
| `banner-design` | `nextlevelbuilder/ui-ux-pro-max-skill` | Thiết kế Hero Banner, Promotional Banner (CineClub) và bố cục quảng bá phim. | Khi thiết kế hoặc tối ưu Hero Carousel, CineClub Banner, ưu đãi thành viên và khu vực CTA nổi bật. |

---

### Nhóm B: Kiến trúc React, Next.js & Component System

| Tên Skill (`name`) | Nguồn Repository | Chức năng chính | Khi nào Agent nên kích hoạt |
| :--- | :--- | :--- | :--- |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | Tối ưu hiệu năng React 19 & Next.js App Router từ đội ngũ kỹ sư Vercel (hydration, bundle size, rendering, image/video loading). | Khi viết hoặc tối ưu hóa các trang Next.js (`src/app/**`), giảm tải tài nguyên (như nhúng trailer YouTube, lazy-load 3D Canvas). |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | Mẫu thiết kế component mở rộng (compound components, context, tách bạch state và UI), tránh lạm dụng boolean props. | Khi thiết kế các bộ component phức tạp: Modal Trailer, Bộ lọc lịch chiếu, Thanh bước đặt vé (Booking Stepper). |
| `vercel-react-view-transitions` | `vercel-labs/agent-skills` | Tạo hiệu ứng chuyển trang và chuyển đổi trạng thái mượt mà bằng View Transitions API. | Khi chuyển từ trang chủ sang trang chi tiết phim hoặc từ danh sách suất chiếu vào phòng chiếu 3D. |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Kiểm toán giao diện theo tiêu chuẩn Web Interface Guidelines (accessibility, focus states, keyboard nav, contrast). | Khi rà soát chất lượng giao diện (UI/UX Audit) trước khi bàn giao tính năng. |
| `shadcn` | `shadcn-ui/ui` | Quản lý, tuỳ biến và kết hợp các thành phần giao diện theo chuẩn kiến trúc `shadcn/ui` (Radix Primitives + Tailwind + `cn`). | Khi xây dựng Dialog, Popover, Tabs, Tooltip, Sheet, Dropdown rạp chiếu hoặc form thanh toán. |

---

### Nhóm C: Dựng Phòng Chiếu 3D & Tối ưu React Three Fiber (Three.js & R3F)

| Tên Skill (`name`) | Nguồn Repository | Chức năng chính | Khi nào Agent nên kích hoạt |
| :--- | :--- | :--- | :--- |
| `r3f-scene-architect` | `nonaxanon/r3f-skills` | Thiết kế kiến trúc Scene Graph trong React Three Fiber, tách biệt Zustand store (`useSeatStore`) với vòng lặp `useFrame`, quản lý bộ nhớ GPU. | **Luôn kích hoạt đầu tiên** trước khi code hoặc mở rộng phòng chiếu 3D (`/booking/[showtimeId]`). |
| `r3f-graphics-builder` | `nonaxanon/r3f-skills` | Nâng cấp chất lượng thị giác R3F: ánh sáng màn chiếu hắt xuống ghế, chất liệu ghế nhung/da VIP, môi trường phòng tối. | Khi tinh chỉnh vẻ đẹp chân thực của phòng chiếu 3D sau khi đã có khung kiến trúc. |
| `r3f-ui-designer` | `nonaxanon/r3f-skills` | Thiết kế lớp HUD/UI 2D đè lên không gian 3D (chú thích loại ghế, giá vé, mini-map, nút đổi góc nhìn từ ghế lên màn hình). | Khi làm giao diện chọn ghế kết hợp giữa Canvas 3D và bảng tóm tắt vé 2D bên cạnh. |
| `r3f-debug-profiler` | `nonaxanon/r3f-skills` | Đo lường và gỡ lỗi tụt FPS, rò rỉ bộ nhớ WebGL, quá tải draw calls và re-render không cần thiết trong R3F. | Khi phòng chiếu 3D có hiện tượng giật lag khi di chuột qua hàng trăm ghế. |
| `r3f-game-director` | `nonaxanon/r3f-skills` | Điều phối thứ tự làm việc giữa kiến trúc sư 3D, đồ họa, UI và QA. | Khi thực hiện một tính năng 3D lớn từ đầu đến cuối (ví dụ: toàn bộ luồng chọn ghế 3D + góc nhìn POV từ ghế). |
| `r3f-qa-release` | `nonaxanon/r3f-skills` | Kiểm tra chất lượng hiển thị 3D trên trình duyệt thực tế, xử lý mất ngữ cảnh WebGL (`webglcontextlost`) và fallback. | Khi nghiệm thu trang phòng chiếu 3D trước khi hoàn tất. |
| `threejs-scene`, `threejs-r3f` | `cesartevisual/threejs-skills` | Cấu hình Camera, Perspective, OrbitControls giới hạn góc quay trong rạp, Suspense & Drei helpers. | Khi thiết lập Canvas, điều khiển góc nhìn từ hàng ghế nhìn lên màn hình IMAX. |
| `threejs-lighting`, `threejs-postprocessing` | `cesartevisual/threejs-skills` | Hiệu ứng ánh sáng động từ màn hình chiếu phim (RectAreaLight / SpotLight) và hậu kỳ Bloom, Vignette. | Khi tạo hiệu ứng ánh sáng từ trailer trên màn chiếu hắt màu theo thời gian thực xuống khán phòng. |
| `threejs-materials`, `threejs-geometry`, `threejs-shaders` | `cesartevisual/threejs-skills` | Tạo hình học màn hình cong (curved screen), bậc thang rạp chiếu, vật liệu PBR cho ghế Thường / VIP / Sweetbox. | Khi dựng mô hình ghế, bậc thềm có đèn LED lối đi và màn hình chiếu cong. |
| `threejs-interaction`, `threejs-html`, `threejs-animation` | `cesartevisual/threejs-skills` | Bắt sự kiện Raycasting chọn ghế, hiển thị nhãn số ghế (`A1`, `B12`), và chuyển động bay camera (`fly-to-seat` POV). | Khi lập trình hành vi click chọn ghế, xem thử góc nhìn từ ghế vừa chọn lên màn chiếu. |
| `threejs-performance`, `threejs-assets`, `threejs-debugging` | `cesartevisual/threejs-skills` | Tối ưu hóa bằng `InstancedMesh` cho hàng trăm ghế xem phim, nén texture/GLTF và kiểm tra hiệu năng. | Khi tối ưu phòng chiếu lớn (150–300 ghế) chạy mượt 60 FPS. |

---

## 2. Cách kết hợp nhiều Skill trong một nhiệm vụ (Multi-Skill Workflows)

### Kịch bản 1: Xây dựng & Tinh chỉnh Trang Giao diện 2D (Home, Chi tiết phim, Thanh toán)
1. **Bước 1 — Khung chuẩn & Design Tokens**: Đọc `design-system` + `ui-ux-pro-max` để khóa bảng màu chuẩn CineBooking (`#030916`, `#071329`, `#693BFF`) và tỷ lệ chữ.
2. **Bước 2 — Triển khai Component**: Áp dụng `frontend-design` + `vercel-react-best-practices` + `shadcn` để viết code React/Next.js sạch, nhẹ, chuẩn cấu trúc.
3. **Bước 3 — Kiểm định Thẩm mỹ & Nghiệm thu**: Dùng `design-taste-frontend` + `web-design-guidelines` để chụp màn hình trình duyệt thực tế ở độ phân giải chuẩn `1536x1024` và so sánh từng chi tiết.

### Kịch bản 2: Xây dựng Phòng Chiếu 3D & Chọn Ghế Tương Tác (`/booking/[showtimeId]`)
1. **Bước 1 — Kiến trúc Scene & State**: Kích hoạt `r3f-scene-architect` + `threejs-r3f` để kết nối `useSeatStore` (Zustand) với R3F mà không gây re-render toàn bộ Canvas khi chọn 1 ghế.
2. **Bước 2 — Mô hình & Hiệu năng**: Dùng `threejs-geometry` + `threejs-performance` để vẽ bậc thang phòng chiếu, màn hình cong và các dãy ghế (Thường, VIP, Couple) tối ưu draw calls.
3. **Bước 3 — Ánh sáng Điện ảnh & Tương tác**: Kết hợp `r3f-graphics-builder` + `threejs-lighting` + `threejs-interaction` + `threejs-animation` để tạo ánh sáng hắt từ màn chiếu, hiệu ứng hover/chọn ghế và chuyển góc camera POV từ vị trí ghế ngồi.
4. **Bước 4 — Giao diện HUD Đặt vé**: Dùng `r3f-ui-designer` + `ui-styling` để thiết kế thanh tóm tắt ghế đã chọn, tổng tiền và nút Tiếp tục thanh toán.

---

## 3. Ví dụ Prompt mẫu sử dụng từng nhóm Skill

### Ví dụ 1: Prompt nâng cấp giao diện 2D & Banner
> *"Hãy sử dụng các skill `frontend-design`, `design-taste-frontend` và `banner-design` để thiết kế khu vực Lịch chiếu theo rạp và Modal chọn suất chiếu cho CineBooking, tuân thủ nghiêm ngặt bảng màu navy tối `#030916` và tím accent `#693BFF`."*

### Ví dụ 2: Prompt dựng phòng chiếu 3D & chọn ghế
> *"Hãy kích hoạt `r3f-scene-architect`, `r3f-graphics-builder`, `threejs-lighting` và `threejs-interaction` để xây dựng trang chọn ghế 3D tại `/booking/[showtimeId]`. Yêu cầu có màn hình chiếu cong phát trailer chiếu sáng xuống khán phòng, phân biệt ghế Thường / VIP / Couple, khi click ghế sẽ cập nhật `useSeatStore` và cho phép xem thử góc nhìn từ ghế đó lên màn hình."*

### Ví dụ 3: Prompt tối ưu hiệu năng React & 3D
> *"Hãy dùng `vercel-react-best-practices` và `r3f-debug-profiler` để kiểm tra và tối ưu hiệu năng trang đặt vé 3D, đảm bảo chuyển cảnh mượt mà 60fps và không bị rò rỉ bộ nhớ GPU khi người dùng đổi suất chiếu."*

---

## 4. Quy tắc tránh xung đột giữa các Skill (Conflict Resolution Rules)

Để các Skill hoạt động hài hòa và không ghi đè quy chuẩn của dự án CineBooking, Agent luôn tuân thủ **Thứ tự ưu tiên (Precedence Hierarchy)** sau:

1. **Ưu tiên số 1 — Yêu cầu trực tiếp của Người dùng & Design Tokens của CineBooking**:
   - Mọi bảng màu gợi ý chung trong `ui-ux-pro-max` hoặc `design-taste-frontend` **không được phép ghi đè** bảng màu khóa cứng của CineBooking (`--color-bg: #030916`, `--color-surface: #071329`, `--color-primary: #693BFF`, `--color-rating: #FFB52E`).
2. **Ưu tiên số 2 — Nguyên tắc Thảo luận trước khi thực hiện**:
   - Trước khi thay đổi bố cục hoặc thêm thư viện mới theo gợi ý của bất kỳ Skill nào, Agent phải thảo luận phương án với người dùng.
3. **Ưu tiên số 3 — Phân tách phạm vi 2D vs 3D**:
   - Các Skill 2D (`frontend-design`, `ui-styling`, `shadcn`) quản lý DOM/HTML/Tailwind bên ngoài `<Canvas>`.
   - Các Skill 3D (`r3f-*`, `threejs-*`) quản lý cây đối tượng WebGL bên trong `<Canvas>`.
   - Sự giao tiếp giữa 2D UI và 3D Canvas đi qua Zustand store (`src/stores/useSeatStore.ts`) theo đúng chuẩn của `r3f-scene-architect`.
4. **Ưu tiên số 4 — Không tạo file rác trong thư mục dự án**:
   - Khi các Skill yêu cầu chạy script kiểm tra hoặc chụp ảnh màn hình, mọi file tạm phải được lưu vào thư mục `scratch` của Antigravity, tuyệt đối không để lại file tạm trong thư mục gốc của project.
