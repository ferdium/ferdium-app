import type { Theme } from '../../../themes';

export default (theme: Theme) => ({
  content: {},
  label: {
    color: theme.labelColor,
    fontSize: theme.uiFontSize,
  },
  hasError: {
    color: theme.brandDanger,
  },
});
