import { ipcRenderer } from 'electron';
import { type MouseEventHandler, useEffect, useState } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { SCREENSHARE_CANCELLED_BY_USER } from '../config';
import { isWayland } from '../environment';
import type Service from '../models/Service';
import FullscreenLoader from './ui/FullscreenLoader';

interface IProps extends WrappedComponentProps {
  service: Service;
}

const messages = defineMessages({
  loading: {
    id: 'service.screenshare.loading',
    defaultMessage: 'Loading screens and windows',
  },
  cancel: {
    id: 'service.screenshare.cancel',
    defaultMessage: 'Cancel',
  },
});

interface ICancelButtonProps extends WrappedComponentProps {
  handleOnClick: MouseEventHandler<HTMLButtonElement> | undefined;
}

const CancelButton = injectIntl(
  ({ handleOnClick, intl }: ICancelButtonProps) => (
    <li className="desktop-capturer-selection__item">
      <button
        type="button" // Add explicit type attribute
        className="desktop-capturer-selection__btn"
        data-id={SCREENSHARE_CANCELLED_BY_USER}
        title="Cancel"
        onClick={handleOnClick}
      >
        <span className="desktop-capturer-selection__name desktop-capturer-selection__name--cancel">
          {intl.formatMessage(messages.cancel)}
        </span>
      </button>
    </li>
  ),
);

function MediaSource(props: IProps) {
  const { service, intl } = props;
  const [sources, setSources] = useState<any>([]);
  const [show, setShow] = useState<boolean>(false);
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [loadingSources, setLoadingSources] = useState<boolean>(false);

  ipcRenderer.on(`select-capture-device:${service.id}`, (_event, data) => {
    if (loadingSources) return;
    setShow(true);
    setTrackerId(data.trackerId);
  });

  const handleOnClick = (e: any) => {
    const { id } = e.currentTarget.dataset;
    window['ferdium'].actions.service.sendIPCMessage({
      serviceId: service.id,
      channel: `selected-media-source:${trackerId}`,
      args: {
        mediaSourceId: id,
      },
    });

    setShow(false);
    setSources([]);
    setTrackerId(null);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run when `show` changes
  useEffect(() => {
    if (show) {
      setLoadingSources(true);
      ipcRenderer
        .invoke('get-desktop-capturer-sources')
        .then(sources => {
          if (isWayland) {
            // On Linux, we do not need to prompt the user again for the source
            handleOnClick({
              currentTarget: { dataset: { id: sources[0].id } },
            });
            return;
          }

          setSources(sources);
          setLoadingSources(false);
        })
        // silence the error
        .catch(() => {
          setShow(false);
          setSources([]);
          setLoadingSources(false);
        });
    } else {
      setSources([]);
      setLoadingSources(false);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  if (loadingSources) {
    return (
      <div className="desktop-capturer-selection">
        <ul
          className="desktop-capturer-selection__list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <FullscreenLoader title={intl.formatMessage(messages.loading)}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CancelButton handleOnClick={handleOnClick} />
            </div>
          </FullscreenLoader>
        </ul>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="desktop-capturer-selection">
        <ul className="desktop-capturer-selection__list">
          <li>No available sources.</li>
          <CancelButton handleOnClick={handleOnClick} />
        </ul>
      </div>
    );
  }

  return (
    <div className="desktop-capturer-selection">
      <ul className="desktop-capturer-selection__list">
        {sources.map(({ id, name, thumbnail }) => (
          <li className="desktop-capturer-selection__item" key={id}>
            <button
              type="button" // Add explicit type attribute
              className="desktop-capturer-selection__btn"
              data-id={id}
              title={name}
              onClick={handleOnClick}
            >
              <img
                alt="Desktop capture preview"
                className="desktop-capturer-selection__thumbnail"
                src={thumbnail.toDataURL()}
              />
              <span className="desktop-capturer-selection__name">{name}</span>
            </button>
          </li>
        ))}
      </ul>
      <CancelButton handleOnClick={handleOnClick} />
    </div>
  );
}

export default injectIntl(MediaSource);
