import AutomaticLanguageDetection from '../../src/webview/AutomaticLanguageDetection';

function createController() {
  const listeners: ((event: KeyboardEvent) => void)[] = [];
  const detectLanguage = jest.fn().mockResolvedValue('pt');
  const resolveSpellcheckerLocale = jest.fn().mockReturnValue('pt-PT');
  const switchDictionary = jest.fn();
  const addKeyupListener = jest.fn(
    (listener: (event: KeyboardEvent) => void) => {
      listeners.push(listener);
    },
  );
  const removeKeyupListener = jest.fn(
    (listener: (event: KeyboardEvent) => void) => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    },
  );

  const controller = new AutomaticLanguageDetection({
    addKeyupListener,
    delay: 225,
    detectLanguage,
    getServiceId: () => 'service-id',
    removeKeyupListener,
    resolveSpellcheckerLocale,
    switchDictionary,
  });

  return {
    addKeyupListener,
    controller,
    detectLanguage,
    listeners,
    removeKeyupListener,
    resolveSpellcheckerLocale,
    switchDictionary,
  };
}

describe('AutomaticLanguageDetection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('attaches one keyup listener across repeated enables', () => {
    const { addKeyupListener, controller, listeners } = createController();

    controller.enable();
    controller.enable();
    controller.enable();

    expect(addKeyupListener).toHaveBeenCalledTimes(1);
    expect(listeners).toHaveLength(1);
    expect(controller.isAttached).toBe(true);
  });

  it('removes the same keyup listener when disabled', () => {
    const { addKeyupListener, controller, listeners, removeKeyupListener } =
      createController();

    controller.enable();
    const [handler] = listeners;

    controller.disable();

    expect(removeKeyupListener).toHaveBeenCalledTimes(1);
    expect(removeKeyupListener).toHaveBeenCalledWith(handler);
    expect(removeKeyupListener.mock.calls[0][0]).toBe(
      addKeyupListener.mock.calls[0][0],
    );
    expect(listeners).toHaveLength(0);
    expect(controller.isAttached).toBe(false);
  });

  it('destroys idempotently and cancels pending detection work', () => {
    const { controller, detectLanguage, listeners } = createController();
    const event = {
      target: {
        value: 'This is a long enough message to trigger detection.',
      },
    } as unknown as KeyboardEvent;

    controller.enable();
    listeners[0](event);

    controller.destroy();
    controller.destroy();
    jest.advanceTimersByTime(225);

    expect(detectLanguage).not.toHaveBeenCalled();
    expect(controller.isAttached).toBe(false);
  });

  it('detects language once for a single keyup listener', async () => {
    const {
      controller,
      detectLanguage,
      listeners,
      resolveSpellcheckerLocale,
      switchDictionary,
    } = createController();
    const event = {
      target: {
        value: 'This is a long enough message to trigger detection.',
      },
    } as unknown as KeyboardEvent;

    controller.enable();
    listeners[0](event);
    jest.advanceTimersByTime(225);
    await Promise.resolve();

    expect(detectLanguage).toHaveBeenCalledTimes(1);
    expect(detectLanguage).toHaveBeenCalledWith(
      'This is a long enough message to trigger detection.',
    );
    expect(resolveSpellcheckerLocale).toHaveBeenCalledWith('pt');
    expect(switchDictionary).toHaveBeenCalledWith('pt-PT', 'service-id');
  });
});
