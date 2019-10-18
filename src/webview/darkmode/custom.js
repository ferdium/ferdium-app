// CSS for pages that need custom styles to work correctly in darkmode
export default {
  'web.whatsapp.com': `
    div.landing-window > div.landing-main {
      background-color: #FFFFFF !important;
    }
    div.landing-window > div.landing-main * {
      color: #212121 !important;
    }
  `,
  'web.threema.ch': `
    .scan {
      background-color: #FFF;
    }
    .scan * {
      color: #212121;
    }
    .scan input.md-input {
      color: #212121;
    }
  `,
};
