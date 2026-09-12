# Thiết kế lưu lịch sử tin nhắn Zalo cục bộ

## Mục tiêu

Ferdium tự lưu lịch sử Zalo kể từ thời điểm người dùng bắt đầu sử dụng tính năng. Dữ liệu vẫn đọc được nếu profile Zalo bất ngờ bị đăng xuất hoặc khóa. Telegram và BUFA không tham gia luồng này.

## Phạm vi và giới hạn

- Chỉ áp dụng cho recipe Zalo và tách dữ liệu theo `serviceId` của từng profile.
- Không nhập ngược toàn bộ lịch sử cũ trước thời điểm bật tính năng.
- Tin trong cuộc chat đang mở được lưu đầy đủ theo phần Zalo Web đã tải.
- Tin chưa mở được lưu từ bản xem trước ở danh sách chat hoặc thông báo: tên cuộc chat, thời gian quan sát, nội dung xem trước, số chưa đọc và trạng thái chưa đọc.
- Không tự mở cuộc chat ngầm, không chiếm chuột và không làm mất trạng thái chưa đọc.
- Khi người dùng mở chat, bản xem trước được đối chiếu và thay bằng bản tin đầy đủ nếu Zalo đã tải nội dung đó.
- Ảnh, sticker, tệp hoặc chuỗi tin chưa từng được Zalo tải có thể chỉ còn bản xem trước nếu tài khoản bị khóa trước khi người dùng mở chat.

## Lưu trữ

Mở rộng SQLite CRM cục bộ bằng các bảng riêng:

- `zalo_conversations`: profile, khóa cuộc chat ổn định, tên hiện tại, nội dung xem trước cuối, số chưa đọc, thời điểm quan sát gần nhất.
- `zalo_messages`: khóa cuộc chat, mã tin nếu lấy được, phía gửi, loại nội dung, nội dung văn bản, tham chiếu tệp cục bộ nếu có, thời gian tin và trạng thái đầy đủ/xem trước.
- `zalo_archive_state`: thời điểm đồng bộ gần nhất và trạng thái đăng nhập của profile.

Mỗi bản ghi có khóa chống trùng. Khi Zalo không cung cấp mã tin, khóa dự phòng được tạo từ cuộc chat, phía gửi, thời gian, loại và nội dung chuẩn hóa. Dữ liệu chỉ nằm trong thư mục `userData` hiện có và dùng cùng vòng đời sao lưu của CRM SQLite.

## Thu thập dữ liệu

Một userscript chỉ đọc được gắn vào webview Zalo:

1. Theo dõi danh sách chat bằng `MutationObserver` và gửi bản xem trước mới về tiến trình chính theo lô nhỏ.
2. Theo dõi vùng tin nhắn của chat đang mở và gửi các tin Zalo đã render theo lô.
3. Không quét bằng ảnh màn hình, không polling DOM tốc độ cao và không tự thao tác giao diện.
4. Tiến trình chính xác thực kích thước, recipe và `serviceId`, sau đó ghi SQLite trong transaction.
5. Listener được tháo khi webview/profile đóng để không tạo tiến trình hoặc bộ nhớ tăng không kiểm soát.

## Hiển thị

Cột **CRM cục bộ** có mục **Lịch sử tin nhắn** gồm số tin đã lưu, thời điểm cập nhật và nút **Xem lịch sử đã lưu**.

- Khi Zalo hoạt động, nút mở bản sao cục bộ ở chế độ chỉ đọc.
- Khi phát hiện màn hình đăng nhập hoặc trạng thái khóa, vùng chat hiển thị lời nhắc **Tài khoản không còn truy cập được** cùng nút **Mở lịch sử đã lưu**.
- Màn hình lịch sử có danh sách cuộc chat, tìm kiếm theo tên/nội dung, nhãn **Chưa đọc** cho bản xem trước và nhãn **Bản xem trước** khi chưa có nội dung đầy đủ.
- Không cho gửi tin từ màn hình lưu trữ để tránh nhầm đây là phiên Zalo đang hoạt động.

## An toàn và hiệu năng

- Chỉ lưu dữ liệu của profile Zalo đang tồn tại trong Ferdium.
- Giới hạn kích thước mỗi sự kiện và ghi theo batch để tránh làm lag webview.
- Không ghi lại mật khẩu, cookie, token hay dữ liệu đăng nhập.
- Tệp đính kèm chỉ sao chép khi đã được tải cục bộ và nằm trong giới hạn dung lượng cấu hình; không tự tải ngầm.
- Có thao tác xóa lịch sử theo từng profile, yêu cầu xác nhận vì không thể hoàn tác.

## Kiểm tra

- Unit test cho chống trùng, nâng cấp preview thành tin đầy đủ và cách ly profile.
- IPC test từ webview đến SQLite, bao gồm từ chối Telegram và payload quá lớn.
- Test lifecycle đảm bảo observer được gỡ khi đóng service.
- UI test cho trạng thái hoạt động, đăng xuất/khóa, dữ liệu trống và nhãn chưa đọc.
- Kiểm tra thủ công với hai profile Zalo để xác nhận không lẫn dữ liệu và không thay đổi trạng thái chưa đọc.

## Tiêu chí hoàn thành

- Tin Zalo mới bắt đầu được ghi sau khi bật tính năng hoặc đăng nhập.
- Tin chưa mở xuất hiện trong kho dưới dạng preview mà không bị đánh dấu đã đọc.
- Mở chat nâng cấp dữ liệu đã lưu thành nội dung đầy đủ, không tạo bản trùng.
- Đăng xuất hoặc khóa profile vẫn xem được toàn bộ nội dung đã lưu trên máy.
- Telegram, BUFA, thao tác chuột và vòng quét VIP 15 giây không bị ảnh hưởng.
