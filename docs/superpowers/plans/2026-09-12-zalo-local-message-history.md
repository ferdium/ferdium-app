# Zalo Local Message History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tự động lưu cục bộ lịch sử Zalo kể từ lúc tính năng hoạt động, kể cả bản xem trước của tin chưa đọc, và cho phép xem lại trong CRM khi profile bị đăng xuất hoặc khóa.

**Architecture:** Preload của webview chỉ quan sát DOM tại `chat.zalo.me`, chuẩn hóa dữ liệu rồi gửi các batch nhỏ bằng `sendToHost`; renderer gắn `serviceId`/`recipeId` đáng tin cậy trước khi gọi IPC main. Main process xác thực payload và lưu vào các bảng riêng trong `local-crm.sqlite`; CRM hiển thị kho lưu trữ chỉ đọc, tách tuyệt đối theo profile.

**Tech Stack:** Electron webview/preload, React class components, TypeScript, SQLite3, Jest, SCSS.

**Spec:** `docs/superpowers/specs/2026-09-12-zalo-local-message-history-design.md`

## Global Constraints

- Chỉ áp dụng cho recipe Zalo; không thay đổi Telegram, BUFA hoặc vòng quét VIP 15 giây.
- Không tự mở chat, không điều khiển chuột và không làm tin chưa đọc thành đã đọc.
- Chỉ lưu dữ liệu Zalo đã render hoặc đã lộ ở bản xem trước; không backfill lịch sử cũ và không tự tải tệp.
- Không lưu mật khẩu, cookie, token hoặc dữ liệu đăng nhập.
- Payload tối đa 100 mục, 512 KiB mỗi batch và 10.000 ký tự mỗi trường văn bản.
- Dữ liệu nằm trong `userData/local-crm.sqlite`, tách theo `serviceId` và chỉ xóa theo từng profile sau xác nhận.
- Toàn bộ text giao diện mới dùng tiếng Việt và không tràn cột CRM hẹp.

---

## File Structure

- `src/features/zaloArchive/types.ts`: hợp đồng dữ liệu giữa collector, renderer, IPC, repository và UI.
- `src/features/zaloArchive/normalize.ts`: chuẩn hóa, tạo khóa chống trùng và xác thực payload thuần hàm.
- `src/features/zaloArchive/ZaloArchiveRepository.ts`: schema/migration và mọi truy vấn SQLite cho kho Zalo.
- `src/features/zaloArchive/ipc.ts`: IPC main, giới hạn đầu vào và vòng đời repository.
- `src/webview/zaloArchive.ts`: collector DOM Zalo, batch queue và cleanup observer.
- `src/features/zaloArchive/ZaloArchiveSection.tsx`: phần tóm tắt và màn hình lịch sử chỉ đọc trong CRM.
- `src/components/services/content/ServiceWebview.tsx`: cầu nối tin cậy từ webview sang IPC main.
- `src/features/localCrm/LocalCrmPanel.tsx`: gắn mục lịch sử vào CRM mà không chạm logic hậu đài.
- `src/styles/services.scss`: layout kho lưu trữ trong cột CRM.
- `src/i18n/locales/vi.json`: chuỗi giao diện tiếng Việt mới.

### Task 1: Hợp đồng dữ liệu, chuẩn hóa và chống trùng

**Files:**
- Create: `src/features/zaloArchive/types.ts`
- Create: `src/features/zaloArchive/normalize.ts`
- Test: `test/features/zaloArchive/normalize.test.ts`

**Interfaces:**
- Consumes: Không có.
- Produces: `ZaloArchiveBatch`, `ZaloConversationCapture`, `ZaloMessageCapture`, `validateArchiveBatch(value)`, `messageDedupeKey(message)` và `normalizeText(value)`.

- [ ] **Step 1: Write the failing tests**

```ts
import {
  messageDedupeKey,
  normalizeText,
  validateArchiveBatch,
} from '../../../src/features/zaloArchive/normalize';

describe('zalo archive normalization', () => {
  it('normalizes whitespace without losing Vietnamese text', () => {
    expect(normalizeText('  Xin\n  chào   bạn ')).toBe('Xin chào bạn');
  });

  it('creates the same fallback key for equivalent messages', () => {
    const base = {
      conversationKey: 'user-42',
      sender: 'them' as const,
      kind: 'text' as const,
      text: 'Xin  chào',
      occurredAt: '2026-09-12T08:10:00.000Z',
      completeness: 'full' as const,
    };
    expect(messageDedupeKey(base)).toBe(
      messageDedupeKey({ ...base, text: ' Xin chào ' }),
    );
  });

  it('rejects Telegram, oversized fields and batches over 100 items', () => {
    const valid = {
      recipeId: 'zalo',
      conversations: [],
      messages: [],
      observedAt: '2026-09-12T08:10:00.000Z',
    };
    expect(validateArchiveBatch(valid).ok).toBe(true);
    expect(validateArchiveBatch({ ...valid, recipeId: 'telegram' }).ok).toBe(false);
    expect(
      validateArchiveBatch({
        ...valid,
        messages: Array.from({ length: 101 }, (_, index) => ({
          conversationKey: 'chat', sender: 'them', kind: 'text',
          text: String(index), occurredAt: valid.observedAt,
          completeness: 'preview',
        })),
      }).ok,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- --runInBand test/features/zaloArchive/normalize.test.ts`

Expected: FAIL because `normalize.ts` does not exist.

- [ ] **Step 3: Add the exact shared types and validation**

```ts
export type ZaloMessageCompleteness = 'preview' | 'full';
export type ZaloMessageKind = 'text' | 'image' | 'sticker' | 'file' | 'unknown';

export interface ZaloConversationCapture {
  conversationKey: string;
  displayName: string;
  previewText: string;
  unreadCount: number;
  observedAt: string;
}

export interface ZaloMessageCapture {
  conversationKey: string;
  remoteId?: string;
  sender: 'me' | 'them' | 'system' | 'unknown';
  kind: ZaloMessageKind;
  text: string;
  occurredAt: string;
  completeness: ZaloMessageCompleteness;
}

export interface ZaloArchiveBatch {
  recipeId: 'zalo';
  conversations: ZaloConversationCapture[];
  messages: ZaloMessageCapture[];
  observedAt: string;
  loginState?: 'available' | 'signed-out' | 'locked' | 'unknown';
}
```

Implement `normalizeText` with Unicode-preserving whitespace collapse; implement `messageDedupeKey` with Node `createHash('sha256')` over normalized stable fields, preferring `remoteId`; implement `validateArchiveBatch` as a discriminated `{ok:true; value} | {ok:false; reason}` result. Reject non-plain arrays, more than 100 combined items, invalid enums/dates, empty or over-10.000-character identifiers/text, and serialized input over `512 * 1024` bytes.

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm test -- --runInBand test/features/zaloArchive/normalize.test.ts && pnpm typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/zaloArchive/types.ts src/features/zaloArchive/normalize.ts test/features/zaloArchive/normalize.test.ts
git commit -m "feat: add Zalo archive data contract"
```

### Task 2: SQLite repository, dedupe and preview upgrade

**Files:**
- Create: `src/features/zaloArchive/ZaloArchiveRepository.ts`
- Test: `test/features/zaloArchive/ZaloArchiveRepository.test.ts`

**Interfaces:**
- Consumes: `ZaloArchiveBatch` and `messageDedupeKey` from Task 1.
- Produces: `ZaloArchiveRepository.open(path)`, `openInMemory()`, `saveBatch(serviceId, batch)`, `getSummary(serviceId)`, `listConversations(serviceId, query?)`, `getMessages(serviceId, conversationKey)`, `deleteProfile(serviceId)` and `close()`.

- [ ] **Step 1: Write failing repository tests**

```ts
import { ZaloArchiveRepository } from '../../../src/features/zaloArchive/ZaloArchiveRepository';

describe('ZaloArchiveRepository', () => {
  it('isolates profiles, deduplicates and upgrades preview to full', async () => {
    const repo = await ZaloArchiveRepository.openInMemory();
    const preview = {
      recipeId: 'zalo' as const,
      observedAt: '2026-09-12T08:10:00.000Z',
      conversations: [{ conversationKey: 'lucy', displayName: 'Lucy', previewText: 'Xin chào', unreadCount: 1, observedAt: '2026-09-12T08:10:00.000Z' }],
      messages: [{ conversationKey: 'lucy', sender: 'them' as const, kind: 'text' as const, text: 'Xin chào', occurredAt: '2026-09-12T08:10:00.000Z', completeness: 'preview' as const }],
    };
    await repo.saveBatch('zalo-a', preview);
    await repo.saveBatch('zalo-a', { ...preview, messages: [{ ...preview.messages[0], completeness: 'full' }] });
    expect((await repo.getMessages('zalo-a', 'lucy'))).toHaveLength(1);
    expect((await repo.getMessages('zalo-a', 'lucy'))[0].completeness).toBe('full');
    expect(await repo.listConversations('zalo-b')).toEqual([]);
    await repo.close();
  });

  it('deletes only the selected profile', async () => {
    const repo = await ZaloArchiveRepository.openInMemory();
    // Insert one minimal batch into zalo-a and zalo-b using the fixture above.
    await repo.deleteProfile('zalo-a');
    expect((await repo.getSummary('zalo-a')).messageCount).toBe(0);
    expect((await repo.getSummary('zalo-b')).messageCount).toBe(1);
    await repo.close();
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- --runInBand test/features/zaloArchive/ZaloArchiveRepository.test.ts`

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement schema and transaction writes**

Create these tables and indexes in `initialize()`:

```sql
CREATE TABLE IF NOT EXISTS zalo_conversations (
  service_id TEXT NOT NULL,
  conversation_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  preview_text TEXT NOT NULL DEFAULT '',
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_observed_at TEXT NOT NULL,
  PRIMARY KEY (service_id, conversation_key)
);
CREATE TABLE IF NOT EXISTS zalo_messages (
  service_id TEXT NOT NULL,
  conversation_key TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  remote_id TEXT,
  sender TEXT NOT NULL,
  kind TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  occurred_at TEXT NOT NULL,
  completeness TEXT NOT NULL,
  PRIMARY KEY (service_id, conversation_key, dedupe_key)
);
CREATE INDEX IF NOT EXISTS idx_zalo_messages_timeline
  ON zalo_messages(service_id, conversation_key, occurred_at);
CREATE TABLE IF NOT EXISTS zalo_archive_state (
  service_id TEXT PRIMARY KEY,
  last_synced_at TEXT NOT NULL,
  login_state TEXT NOT NULL DEFAULT 'unknown'
);
```

Use `BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`. Conversation upsert keeps the newest observation. Message conflict updates `completeness` to `full` when either row is full and replaces text only when the incoming full text is non-empty. Add typed row mappers and close-safe promise wrappers following `ContactRepository` conventions.

- [ ] **Step 4: Run focused repository tests**

Run: `pnpm test -- --runInBand test/features/zaloArchive/ZaloArchiveRepository.test.ts`

Expected: PASS for profile isolation, dedupe, preview upgrade, ordering and deletion.

- [ ] **Step 5: Commit**

```bash
git add src/features/zaloArchive/ZaloArchiveRepository.ts test/features/zaloArchive/ZaloArchiveRepository.test.ts
git commit -m "feat: persist Zalo message archive in SQLite"
```

### Task 3: Zalo-only collector with batching and cleanup

**Files:**
- Create: `src/webview/zaloArchive.ts`
- Modify: `src/webview/recipe.ts`
- Test: `test/webview/zaloArchive.test.ts`

**Interfaces:**
- Consumes: the Task 1 batch shape structurally; no Node-only imports in page parsing.
- Produces: `startZaloArchiveCollector({document, location, send, now, setTimer, clearTimer}) => () => void` and host channel `zalo-archive:capture`.

- [ ] **Step 1: Write failing collector tests with a minimal fake DOM adapter**

```ts
import { startZaloArchiveCollector } from '../../src/webview/zaloArchive';

describe('Zalo archive collector', () => {
  it('does nothing outside chat.zalo.me', () => {
    const send = jest.fn();
    const stop = startZaloArchiveCollector({
      document: document as never,
      location: { hostname: 'web.telegram.org' } as Location,
      send,
      now: () => new Date('2026-09-12T08:10:00Z'),
    });
    expect(send).not.toHaveBeenCalled();
    stop();
  });

  it('disconnects observers and clears the flush timer', () => {
    const disconnect = jest.fn();
    const clearTimer = jest.fn();
    const stop = startZaloArchiveCollector({
      document: createZaloFixtureDocument(),
      location: { hostname: 'chat.zalo.me' } as Location,
      send: jest.fn(),
      now: () => new Date('2026-09-12T08:10:00Z'),
      createObserver: () => ({ observe: jest.fn(), disconnect }),
      setTimer: callback => 7 as never,
      clearTimer,
    });
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(clearTimer).toHaveBeenCalledWith(7);
  });
});
```

Use small fake elements implementing `querySelector(All)`, `textContent`, `getAttribute` and `closest`; do not add a browser-test dependency.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- --runInBand test/webview/zaloArchive.test.ts`

Expected: FAIL because the collector does not exist.

- [ ] **Step 3: Implement read-only DOM collection**

Centralize selector fallbacks for the conversation list, active header and rendered message rows. Derive conversation key in priority order: stable `data-id`/`data-conversation-id`, stable link identifier, then normalized display name. Extract unread count without clicking. Full-message rows identify sender from ownership classes/attributes, kind from visible media metadata and remote ID from stable data attributes. Queue deduped captures in maps, flush after 400 ms or at 100 items, and send only:

```ts
send('zalo-archive:capture', {
  recipeId: 'zalo',
  conversations: [...pendingConversations.values()],
  messages: [...pendingMessages.values()],
  observedAt: now().toISOString(),
  loginState: detectLoginState(document),
});
```

Return a cleanup function that disconnects every observer, clears the pending timer and empties maps. In `recipe.ts`, start once on `DOMContentLoaded`, stop on `pagehide`, and call `ipcRenderer.sendToHost(channel, batch)`; hostname gating must happen before observers are created.

- [ ] **Step 4: Run lifecycle and parsing tests**

Run: `pnpm test -- --runInBand test/webview/zaloArchive.test.ts`

Expected: PASS, including preview extraction, full-message extraction, no send on Telegram, batch cap and cleanup.

- [ ] **Step 5: Commit**

```bash
git add src/webview/zaloArchive.ts src/webview/recipe.ts test/webview/zaloArchive.test.ts
git commit -m "feat: capture rendered Zalo messages"
```

### Task 4: Trusted webview bridge and IPC validation

**Files:**
- Modify: `src/models/Service.ts`
- Create: `src/features/zaloArchive/ipc.ts`
- Modify: `src/index.ts`
- Test: `test/features/zaloArchive/ipc.test.ts`
- Modify: `test/components/services/content/ServiceWebview.test.tsx` only if listener ownership is moved there during implementation.

**Interfaces:**
- Consumes: `validateArchiveBatch` and `ZaloArchiveRepository` from Tasks 1–2; webview channel from Task 3.
- Produces IPC handlers `zalo-archive:save-batch`, `zalo-archive:get-summary`, `zalo-archive:list-conversations`, `zalo-archive:get-messages`, `zalo-archive:delete-profile`.

- [ ] **Step 1: Write failing IPC tests**

```ts
describe('Zalo archive IPC', () => {
  it('accepts a Zalo batch and attaches the service id from the host', async () => {
    await bridgeWebviewArchiveMessage(zaloService, {
      channel: 'zalo-archive:capture', args: [validBatch],
    });
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
      'zalo-archive:save-batch',
      expect.objectContaining({ serviceId: 'zalo-profile-1', recipeId: 'zalo' }),
    );
  });

  it('rejects a forged Telegram source and oversized payload', async () => {
    await expect(saveArchiveBatch({ serviceId: 'telegram-1', recipeId: 'telegram', batch: validBatch })).rejects.toThrow('Chỉ hỗ trợ Zalo');
    await expect(saveArchiveBatch({ serviceId: 'zalo-1', recipeId: 'zalo', batch: oversizedBatch })).rejects.toThrow('Dữ liệu lưu trữ không hợp lệ');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- --runInBand test/features/zaloArchive/ipc.test.ts`

Expected: FAIL because the IPC module and bridge branch do not exist.

- [ ] **Step 3: Implement the trusted bridge and handlers**

In the existing `Service.webview` `ipc-message` listener, handle `zalo-archive:capture` before generic `handleIPCMessage`. Return immediately unless `this.recipe.id === 'zalo'`, then invoke:

```ts
await ipcRenderer.invoke('zalo-archive:save-batch', {
  serviceId: this.id,
  recipeId: this.recipe.id,
  batch: e.args[0],
});
```

Export handler factories in `zaloArchive/ipc.ts` so tests can inject an in-memory repository. Verify `recipeId === 'zalo'`, non-empty `serviceId`, and `validateArchiveBatch(batch)` before any write. Initialize the five IPC handlers once from `src/index.ts`; read handlers require a non-empty `serviceId`, limit search query to 200 characters and return at most 500 messages per request.

- [ ] **Step 4: Run bridge, IPC and type tests**

Run: `pnpm test -- --runInBand test/features/zaloArchive/ipc.test.ts test/components/services/content/ServiceWebview.test.tsx && pnpm typecheck`

Expected: PASS with no Telegram write.

- [ ] **Step 5: Commit**

```bash
git add src/models/Service.ts src/features/zaloArchive/ipc.ts src/index.ts test/features/zaloArchive/ipc.test.ts test/components/services/content/ServiceWebview.test.tsx
git commit -m "feat: bridge Zalo archive capture to SQLite"
```

### Task 5: Kho lịch sử chỉ đọc trong CRM

**Files:**
- Create: `src/features/zaloArchive/ZaloArchiveSection.tsx`
- Modify: `src/features/localCrm/LocalCrmPanel.tsx`
- Modify: `src/styles/services.scss`
- Modify: `src/i18n/locales/vi.json`
- Test: `test/features/zaloArchive/ZaloArchiveSection.layout.test.ts`

**Interfaces:**
- Consumes: IPC read/delete endpoints from Task 4 and `service.id`/`service.recipe.id` from the CRM panel.
- Produces: `<ZaloArchiveSection serviceId: string loginState?: string />`, archive summary/list/search/timeline and confirmed profile deletion.

- [ ] **Step 1: Write failing source-level layout tests matching the existing CRM test style**

```ts
import fs from 'node:fs';
import path from 'node:path';

describe('ZaloArchiveSection layout', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/features/zaloArchive/ZaloArchiveSection.tsx'),
    'utf8',
  );

  it('shows Vietnamese read-only archive controls', () => {
    expect(source).toContain('Lịch sử tin nhắn');
    expect(source).toContain('Xem lịch sử đã lưu');
    expect(source).toContain('Dữ liệu lưu cục bộ trên máy này');
    expect(source).toContain('Bản xem trước');
    expect(source).toContain('Chưa đọc');
  });

  it('does not render for Telegram', () => {
    const panel = fs.readFileSync(path.join(process.cwd(), 'src/features/localCrm/LocalCrmPanel.tsx'), 'utf8');
    expect(panel).toContain("this.props.service.recipe.id === 'zalo'");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- --runInBand test/features/zaloArchive/ZaloArchiveSection.layout.test.ts`

Expected: FAIL because `ZaloArchiveSection.tsx` does not exist.

- [ ] **Step 3: Implement the CRM archive UI**

Add a compact collapsed section under the existing customer fields only for exact recipe ID `zalo`. Load summary on mount and refresh it when the service becomes active. The section displays saved message count, last saved time formatted with `vi-VN`, and **Xem lịch sử đã lưu**. Its internal view replaces only the CRM column content and contains search, conversation rows, chronological messages, **Chưa đọc** and **Bản xem trước** badges, a close button, and no composer/send control.

When `loginState` is `signed-out` or `locked`, render **Tài khoản không còn truy cập được** and **Mở lịch sử đã lưu**. Add **Xóa lịch sử profile này** behind `window.confirm('Xóa toàn bộ lịch sử Zalo đã lưu của profile này? Thao tác này không thể hoàn tác.')`, then invoke deletion only after confirmation. Keep the current CRM width and use internal scrolling; at the narrow width, conversation list and timeline switch between panes rather than appearing side-by-side.

- [ ] **Step 4: Run UI tests and inspect stylesheet constraints**

Run: `pnpm test -- --runInBand test/features/zaloArchive/ZaloArchiveSection.layout.test.ts test/features/localCrm/LocalCrmPanel.layout.test.ts && pnpm typecheck`

Expected: PASS; SCSS includes `min-width: 0`, wrapped Vietnamese labels and a single vertical scroll container.

- [ ] **Step 5: Commit**

```bash
git add src/features/zaloArchive/ZaloArchiveSection.tsx src/features/localCrm/LocalCrmPanel.tsx src/styles/services.scss src/i18n/locales/vi.json test/features/zaloArchive/ZaloArchiveSection.layout.test.ts
git commit -m "feat: show saved Zalo history in local CRM"
```

### Task 6: End-to-end verification and resource audit

**Files:**
- Modify: `docs/superpowers/specs/2026-09-12-zalo-local-message-history-design.md` only if verified behavior requires a factual clarification.
- Test: all files under `test/features/zaloArchive/` and `test/webview/zaloArchive.test.ts`.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified feature with documented limitations; no new runtime interface.

- [ ] **Step 1: Run the complete focused suite**

Run:

```bash
pnpm test -- --runInBand \
  test/features/zaloArchive/normalize.test.ts \
  test/features/zaloArchive/ZaloArchiveRepository.test.ts \
  test/features/zaloArchive/ipc.test.ts \
  test/features/zaloArchive/ZaloArchiveSection.layout.test.ts \
  test/webview/zaloArchive.test.ts \
  test/features/localCrm/LocalCrmPanel.layout.test.ts \
  test/features/localCrm/conversation.test.ts
```

Expected: all tests PASS.

- [ ] **Step 2: Run static verification**

Run: `pnpm typecheck && pnpm lint`

Expected: PASS. If the known `sonar/deprecation` stack overflow in `src/lib/Menu.ts` recurs, record that exact pre-existing failure, run ESLint only on the changed TypeScript files, and require that focused lint to pass before proceeding.

- [ ] **Step 3: Build the application**

Run the repository's existing development build command from `package.json` (resolve it with `node -p "require('./package.json').scripts.build || require('./package.json').scripts.dev"` before execution).

Expected: Electron renderer, preload and main bundles compile successfully.

- [ ] **Step 4: Perform manual two-profile QA**

Launch Ferdium using its existing build/run workflow, then verify this exact checklist:

1. Profile Zalo A receives an unread text while its chat is not opened; badge stays unread and archive shows a **Bản xem trước** row.
2. Open that chat; archive keeps one logical message and upgrades it to full.
3. Profile Zalo B has no rows from profile A.
4. Telegram receives a message; no archive event or SQLite Zalo row is created for it.
5. Sign out profile A; CRM shows **Tài khoản không còn truy cập được** and its saved history remains readable.
6. Close/reopen the service repeatedly; observer count and pending timers do not grow, and the mouse/focus never moves automatically.

- [ ] **Step 5: Inspect the SQLite result without exposing content**

Run a count-only query against the resolved `userData/local-crm.sqlite`:

```sql
SELECT service_id, COUNT(*) AS messages
FROM zalo_messages
GROUP BY service_id;
```

Expected: one row per tested Zalo profile, no Telegram service ID, and no output containing message bodies or credentials.

- [ ] **Step 6: Final commit**

```bash
git add docs/superpowers/specs/2026-09-12-zalo-local-message-history-design.md
git commit -m "docs: record verified Zalo archive behavior"
```

Skip this commit if the spec did not need a factual clarification; do not create an empty commit.

## Self-Review

- Spec coverage: storage, unopened previews, full-message upgrade, profile isolation, signed-out access, search, deletion, payload limits, cleanup and the Telegram/BUFA exclusions are each assigned to a task.
- Placeholder scan: the plan contains no deferred implementation markers; every test and implementation step names concrete interfaces and expected behavior.
- Type consistency: `ZaloArchiveBatch`, IPC channel names, repository method names and `serviceId` scoping are identical across all tasks.
