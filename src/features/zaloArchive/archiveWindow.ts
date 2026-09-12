import { BrowserWindow } from 'electron';
import type { StoredZaloConversation, StoredZaloMessage } from './types';
import type { ZaloArchiveRepository } from './ZaloArchiveRepository';

const windows = new Map<string, BrowserWindow>();

const safeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</gu, '\\u003c').replace(/>/gu, '\\u003e');

export const buildZaloArchiveHtml = (
  conversations: StoredZaloConversation[],
  messages: Record<string, StoredZaloMessage[]>,
) => `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<title>Lịch sử tin nhắn Zalo</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f7fb;color:#13264d;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;height:100vh;overflow:hidden}
.app{display:grid;grid-template-columns:minmax(240px,32%) 1fr;height:100vh}.sidebar{background:#fff;border-right:1px solid #dce3ed;display:flex;flex-direction:column;min-width:0}
.title{padding:18px 16px 12px;border-bottom:1px solid #e5eaf2}.title h1{font-size:18px;margin:0 0 4px}.title p,.empty p{color:#6d7b91;margin:0}.search{margin:12px;border:1px solid #bfcadd;border-radius:8px;padding:10px 12px;font:inherit;outline:none}.search:focus{border-color:#0868e8;box-shadow:0 0 0 2px #dbeaff}
.list{overflow:auto;padding:0 8px 12px}.account{appearance:none;background:transparent;border:0;border-radius:8px;color:inherit;cursor:pointer;display:grid;gap:4px;padding:11px;text-align:left;width:100%}.account:hover,.account.active{background:#e7f1ff}.account strong,.account span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.account span,.account time{color:#6d7b91;font-size:12px}.account i{color:#d65d00;font-size:11px;font-style:normal}
.chat{display:flex;flex-direction:column;min-width:0}.chat-header{background:#fff;border-bottom:1px solid #dce3ed;padding:16px 20px}.chat-header h2{font-size:17px;margin:0 0 4px}.chat-header p{color:#6d7b91;margin:0}.messages{display:flex;flex:1;flex-direction:column;gap:8px;overflow:auto;padding:18px}.bubble{background:#fff;border:1px solid #dce3ed;border-radius:10px;max-width:72%;padding:10px 12px}.bubble.me{align-self:flex-end;background:#dfeeff}.bubble p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.bubble footer{color:#6d7b91;font-size:11px;margin-top:6px}.bubble em{color:#d65d00;font-size:10px;font-style:normal;margin-left:8px}.empty{align-items:center;display:flex;flex:1;flex-direction:column;justify-content:center;text-align:center}.empty h2{font-size:18px;margin:0 0 6px}
@media(max-width:680px){.app{grid-template-columns:42% 58%}.bubble{max-width:90%}}
</style></head><body><div class="app"><aside class="sidebar"><div class="title"><h1>Lịch sử tin nhắn Zalo</h1><p>Dữ liệu chỉ đọc · lưu cục bộ trên máy này</p></div><input id="search" class="search" type="search" placeholder="Tìm theo tên hoặc nội dung"><div id="list" class="list"></div></aside><main class="chat"><header id="chatHeader" class="chat-header" hidden></header><div id="messages" class="messages"><div class="empty"><h2>Chọn một tài khoản để xem lịch sử</h2><p>Mỗi tài khoản được lưu thành một cuộc chat riêng.</p></div></div></main></div>
<script>const conversations=${safeJson(conversations)};const messageMap=${safeJson(messages)};const list=document.querySelector('#list');const pane=document.querySelector('#messages');const header=document.querySelector('#chatHeader');const search=document.querySelector('#search');let selected='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(d):v};
function show(key){selected=key;renderList(search.value);const c=conversations.find(x=>x.conversationKey===key);const rows=messageMap[key]||[];header.hidden=false;header.innerHTML='<h2>'+esc(c.displayName)+'</h2><p>'+rows.length+' tin đã lưu · '+esc(time(c.observedAt))+'</p>';pane.innerHTML=rows.length?rows.map(m=>'<article class="bubble '+(m.sender==='me'?'me':'them')+'"><p>'+esc(m.text||'['+m.kind+']')+'</p><footer>'+esc(time(m.occurredAt))+(m.completeness==='preview'?'<em>Bản xem trước · Chưa đọc</em>':'')+'</footer></article>').join(''):'<div class="empty"><h2>Chưa có nội dung đầy đủ</h2><p>Tin xem trước sẽ được bổ sung khi bạn mở cuộc chat.</p></div>';pane.scrollTop=pane.scrollHeight}
function renderList(q=''){const n=q.trim().toLocaleLowerCase('vi');const rows=conversations.filter(c=>!n||(c.displayName+' '+c.previewText).toLocaleLowerCase('vi').includes(n));list.innerHTML=rows.map(c=>'<button class="account '+(selected===c.conversationKey?'active':'')+'" data-key="'+esc(c.conversationKey)+'"><strong>'+esc(c.displayName)+'</strong><span>'+esc(c.previewText||'Không có nội dung xem trước')+'</span><time>'+esc(time(c.observedAt))+'</time>'+(c.unreadCount?'<i>Chưa đọc · '+c.unreadCount+'</i>':'')+'</button>').join('')||'<div class="empty"><p>Không tìm thấy tài khoản.</p></div>';list.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.key))}
search.oninput=()=>renderList(search.value);renderList();</script></body></html>`;

export const openZaloArchiveWindow = async (
  serviceId: string,
  repository: ZaloArchiveRepository,
) => {
  const existing = windows.get(serviceId);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return;
  }
  const conversations = await repository.listConversations(serviceId);
  const entries = await Promise.all(
    conversations.map(
      async conversation =>
        [
          conversation.conversationKey,
          await repository.getMessages(serviceId, conversation.conversationKey),
        ] as const,
    ),
  );
  const archiveWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 680,
    minHeight: 480,
    title: 'Lịch sử tin nhắn Zalo',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  windows.set(serviceId, archiveWindow);
  archiveWindow.on('closed', () => windows.delete(serviceId));
  await archiveWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(buildZaloArchiveHtml(conversations, Object.fromEntries(entries)))}`,
  );
};
