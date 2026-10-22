# Disk usage: diagnóstico e correções

Data: 2026-10-22

## Problema

Cada serviço tem uma partição persistente (`Partitions/service-<id>` ou
`Partitions/sandbox-<id>`) com Cache HTTP, Code Cache, GPUCache, Service Worker e
IndexedDB. Nada limita esse crescimento e o botão "Clear cache" só limpava o cache HTTP.

## Medições

Perfil novo, 4 serviços (WhatsApp, Telegram, Slack, Gmail), depois de fechar:

- total 42 MB · WhatsApp 28 MB (Service Worker 16 MB + Cache HTTP 9,4 MB)
- `session.clearCache()` sozinho (comportamento antigo do botão): 42 → 23 MB
- `clearStorageData({cachestorage, serviceworkers, shadercache})`: 42 → 26 MB
- os dois juntos: **42 → 6,7 MB (−84%)**, preservando IndexedDB e cookies

Teste de integração com o handler compilado (build real, partição de serviço):

- antes 27,6 MB → depois 2,4 MB · **25,1 MB recuperados (91%)**

## Correções aplicadas

1. `src/helpers/partition-helpers.ts` (novo): resolução pura da partição do serviço
   (sandbox vs. própria), validação de partição persistente e detecção de partições
   órfãs. Coberto por 19 testes.
2. `clear-cache` agora recebe a partição resolvida pelo renderer, valida e limpa
   **cache HTTP + CacheStorage + Service Workers + shader cache**. Cookies,
   localStorage e IndexedDB não são tocados (sem logout, sem perder histórico).
3. `clear-storage-data` também aceita a partição (usado na exclusão de serviço).
4. Exclusão de serviço remove a partição do serviço e, quando ele era o último do
   grupo, a partição do sandbox.
5. Varredura de partições órfãs na inicialização, disparada quando a lista de
   serviços carrega (guardada contra lista vazia) — cobre o caso de serviço excluído
   em outra máquina com sync.
6. "Clear all cache" passa a usar a mesma detecção de órfãs (inclui sandbox).

## Verificação

- `pnpm test`: 18 suites, 161 testes (159 ok, 2 skipped) — 19 novos
- `pnpm typecheck`: ok
- `pnpm lint` (`--max-warnings 0`): ok
- AppImage reconstruído e iniciado sob Xvfb sem crash

## Risco e comportamento

- "Clear cache" passa a descartar também o CacheStorage/Service Worker: o serviço
  recarrega assets na próxima abertura (esperado), sem novo login.
- A limpeza de IndexedDB saiu do "clear cache" e ficou restrita à exclusão do
  serviço. Antes, limpar cache podia deslogar WhatsApp/Slack.
- A varredura de órfãs nunca roda com lista de serviços vazia (falha de API não
  apaga partições válidas).
