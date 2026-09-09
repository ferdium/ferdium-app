import {
  parseWindowFeatures,
  popupWindowOptions,
} from '../../src/electron/popupWindowOptions';

// What Slack's openHuddleWindowMva hands to window.open() (Electron options
// serialised as window features).
const SLACK_HUDDLE_FEATURES =
  'height=600,width=800,minHeight=400,minWidth=560,alwaysOnTop=yes,title=Huddle,fullscreenable=no,fullscreen=no,show=no,useContentSize=yes,windowId=huddles-T123-C456';

const onScreen = () => true;
const offScreen = () => false;

describe('parseWindowFeatures', () => {
  it('parses comma separated key=value pairs', () => {
    expect(parseWindowFeatures('width=380, height=272 ,popup')).toStrictEqual({
      width: '380',
      height: '272',
      popup: undefined,
    });
  });

  it('handles empty and missing input', () => {
    expect(parseWindowFeatures('')).toStrictEqual({});
    expect(parseWindowFeatures()).toStrictEqual({});
  });
});

describe('popupWindowOptions', () => {
  it('always shows the popup and keeps it a normal window', () => {
    const options = popupWindowOptions(SLACK_HUDDLE_FEATURES, onScreen);
    expect(options).toMatchObject({
      show: true,
      alwaysOnTop: false,
      fullscreen: false,
      fullscreenable: true,
      frame: true,
      transparent: false,
      skipTaskbar: false,
      focusable: true,
      kiosk: false,
      modal: false,
      opacity: 1,
    });
  });

  it('does not let a page control window chrome through features', () => {
    const options = popupWindowOptions(
      'frame=no,transparent=yes,skipTaskbar=yes,focusable=no,kiosk=yes,opacity=0,alwaysOnTop=1,show=0',
      onScreen,
    );
    expect(options).toMatchObject({
      show: true,
      frame: true,
      transparent: false,
      skipTaskbar: false,
      focusable: true,
      kiosk: false,
      opacity: 1,
      alwaysOnTop: false,
    });
  });

  it('leaves resizable handling to Electron', () => {
    const options = popupWindowOptions('resizable=no', onScreen);

    expect(options).not.toHaveProperty('resizable');
  });

  it('leaves an on-screen position alone', () => {
    const options = popupWindowOptions('x=100,y=200', onScreen);
    expect('x' in options).toBe(false);
    expect('y' in options).toBe(false);
  });

  it('drops an off-screen position so Electron centers the window', () => {
    const options = popupWindowOptions('x=-5000,y=200', offScreen);
    expect('x' in options).toBe(true);
    expect(options.x).toBeUndefined();
    expect(options.y).toBeUndefined();
  });

  it('understands the browser style left/top features', () => {
    const isPositionOnScreen = jest.fn(() => false);
    popupWindowOptions('left=10,top=20', isPositionOnScreen);
    expect(isPositionOnScreen).toHaveBeenCalledWith({ x: 10, y: 20 });
  });

  it('does not check the position when it is incomplete', () => {
    const isPositionOnScreen = jest.fn(() => false);
    const options = popupWindowOptions('x=10', isPositionOnScreen);
    expect(isPositionOnScreen).not.toHaveBeenCalled();
    expect('x' in options).toBe(false);
  });
});
