import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { SCREENSHARE_CANCELLED_BY_USER } from '../config';
import type Service from '../models/Service';

export interface IProps {
  service: Service;
}

export default function MediaSource(props: IProps) {
  const { service } = props;
  const [sources, setSources] = useState<any>([]);
  const [show, setShow] = useState<boolean>(false);
  const [trackerId, setTrackerId] = useState<string | null>(null);

  ipcRenderer.on(`select-capture-device:${service.id}`, (_event, data) => {
    setShow(true);
    setTrackerId(data.trackerId);
  });

  useEffect(() => {
    ipcRenderer
      .invoke('get-desktop-capturer-sources')
      .then(sources => setSources(sources));
  }, []);

  if (sources.length === 0 || !show) {
    return null;
  }

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
    setTrackerId(null);
  };

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
        <li className="desktop-capturer-selection__item">
          <button
            type="button" // Add explicit type attribute
            className="desktop-capturer-selection__btn"
            data-id={SCREENSHARE_CANCELLED_BY_USER}
            title="Cancel"
            onClick={handleOnClick}
          >
            <span className="desktop-capturer-selection__name desktop-capturer-selection__name--cancel">
              Cancel
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}
