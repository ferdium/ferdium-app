import fs from 'node:fs';
import path from 'node:path';

describe('ZaloArchiveSection layout', () => {
  it('shows the Vietnamese read-only archive controls', () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        'src/features/zaloArchive/ZaloArchiveSection.tsx',
      ),
      'utf8',
    );
    expect(source).toContain('Lịch sử tin nhắn');
    expect(source).toContain('Xem lịch sử đã lưu');
    expect(source).toContain('Dữ liệu lưu cục bộ trên máy này');
    expect(source).toContain('Bản xem trước');
    expect(source).toContain('Chưa đọc');
    expect(source).not.toContain('Gửi tin');
  });

  it('is mounted for exact Zalo recipe only', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/localCrm/LocalCrmPanel.tsx'),
      'utf8',
    );
    expect(source).toContain("this.props.service.recipe.id === 'zalo'");
    expect(source).toContain('<ZaloArchiveSection');
  });
});
