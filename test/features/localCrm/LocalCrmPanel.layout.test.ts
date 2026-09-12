import fs from 'node:fs';
import path from 'node:path';

describe('LocalCrmPanel result card', () => {
  it('reserves CRM space for every supported chat service', () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        'src/components/services/content/ServiceView.tsx',
      ),
      'utf8',
    );

    expect(source).toContain(
      "'services__webview-wrapper--with-crm': supportsLocalCrm(service.recipe.id)",
    );
  });

  it('keeps the deposit action inside the account overview card', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/localCrm/LocalCrmPanel.tsx'),
      'utf8',
    );
    const overviewStart = source.indexOf(
      'local-crm-panel__card local-crm-panel__overview-card',
    );
    const overviewEnd = source.indexOf('</section>', overviewStart);
    const depositAction = source.indexOf(
      'local-crm-panel__deposit-row',
      overviewStart,
    );

    expect(overviewStart).toBeGreaterThan(-1);
    expect(depositAction).toBeGreaterThan(overviewStart);
    expect(depositAction).toBeLessThan(overviewEnd);
  });

  it('prevents the global div height from hiding the deposit row', () => {
    const styles = fs.readFileSync(
      path.join(process.cwd(), 'src/styles/services.scss'),
      'utf8',
    );
    const bindingRule = styles.match(
      /&__binding-row\s*\{(?<rule>[\s\S]*?)\n\s*\}/,
    )?.groups?.rule;

    expect(bindingRule).toContain('height: auto;');
  });

  it('gives the CRM panel enough width for two comfortable status buttons', () => {
    const styles = fs.readFileSync(
      path.join(process.cwd(), 'src/styles/services.scss'),
      'utf8',
    );

    expect(styles).toContain('width: calc(100% - 248px);');
    expect(styles).toContain('width: 248px;');
    expect(styles).toMatch(
      /&__binding-row\s*\{[\s\S]*?gap: 8px;[\s\S]*?grid-template-columns: 1fr 1fr;/,
    );
  });

  it('provides an editable and copyable customer display name', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/localCrm/LocalCrmPanel.tsx'),
      'utf8',
    );

    expect(source).toContain('local-crm-panel__display-name');
    expect(source).toContain('readOnly');
    expect(source).toContain(
      'value={displayNameForConversation(name, conversationKey)}',
    );
    expect(source).toContain('local-crm:resolve-conversation-key');
    expect(source).not.toContain('renameZaloContact');
    expect(source).not.toContain('Không đổi được tên trên Zalo');
  });

  it('only loads deposit history while refreshing the opened account', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/features/localCrm/LocalCrmPanel.tsx'),
      'utf8',
    );

    expect(source).toContain('includeDepositHistory: true');
    expect(source).toContain('includeDepositHistory: false');
  });
});
