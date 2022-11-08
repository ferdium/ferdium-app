import { Component, InputHTMLAttributes } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
import { mdiDelete, mdiFileImage } from '@mdi/js';
import prettyBytes from 'pretty-bytes';
import { noop } from 'lodash';
import { isWindows } from '../../../environment';
import Icon from '../icon';
import { IFormField } from '../typings/generic';

interface IProps extends InputHTMLAttributes<HTMLInputElement>, IFormField {
  className: string;
  multiple: boolean;
  textDelete: string;
  textUpload: string;
  textMaxFileSize: string;
  textMaxFileSizeError: string;
  maxSize?: number;
  maxFiles?: number;
  messages: any;
  set?: (value: string) => void;
}

interface IState {
  path: string | null;
  errorState: boolean;
  errorMessage: { message: string };
}

// TODO - drag and drop image for recipe add/edit not working from 6.2.0 need to look at it
@observer
class ImageUpload extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      path: null,
      errorState: false,
      errorMessage: {
        message: '',
      },
    };
  }

  onDropAccepted(acceptedFiles): void {
    const { onDrop = noop, set = noop } = this.props;
    this.setState({ errorState: false });

    for (const file of acceptedFiles) {
      const imgPath: string = isWindows
        ? file.path.replace(/\\/g, '/')
        : file.path;
      this.setState({ path: imgPath });
      onDrop(file);
    }

    set('');
  }

  onDropRejected(rejectedFiles): void {
    for (const file of rejectedFiles) {
      for (const error of file.errors) {
        if (error.code === 'file-too-large') {
          this.setState({ errorState: true });
          this.setState({
            errorMessage: {
              message: this.props.textMaxFileSizeError,
            },
          });
        }
      }
    }
  }

  render() {
    const {
      className,
      multiple = false,
      textDelete,
      textUpload,
      textMaxFileSize,
      value,
      maxSize = Number.POSITIVE_INFINITY,
      maxFiles = 0,
      label = '',
      set = noop,
    } = this.props;

    const cssClasses = classnames({
      'image-upload__dropzone': true,
      [`${className}`]: className,
    });

    const maxSizeParse: number =
      maxSize === undefined || maxSize === Number.POSITIVE_INFINITY
        ? 0
        : maxSize;

    return (
      <div className="image-upload-wrapper">
        <label className="franz-form__label" htmlFor="iconUpload">
          {label}
        </label>
        <div className="image-upload">
          {(value && value !== 'delete') || this.state.path ? (
            <>
              <div
                className="image-upload__preview"
                style={{
                  backgroundImage: `url("${this.state.path || value}")`,
                }}
              />
              <div className="image-upload__action">
                <button
                  type="button"
                  onClick={() => {
                    if (value) {
                      set('delete');
                    } else {
                      this.setState({ path: null });
                    }
                  }}
                >
                  <Icon icon={mdiDelete} />
                  <p>{textDelete}</p>
                </button>
                <div className="image-upload__action-background" />
              </div>
            </>
          ) : (
            <Dropzone
              onDropAccepted={this.onDropAccepted.bind(this)}
              onDropRejected={this.onDropRejected.bind(this)}
              multiple={multiple}
              accept="image/jpeg, image/png, image/svg+xml"
              minSize={0}
              maxSize={maxSize}
              maxFiles={maxFiles}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className={cssClasses}>
                  <Icon icon={mdiFileImage} />
                  <p>{textUpload}</p>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>
          )}
        </div>
        {maxSizeParse !== 0 && (
          <span className="image-upload-wrapper__file-size">
            {textMaxFileSize}{' '}
            {prettyBytes(maxSizeParse, { maximumFractionDigits: 1 })}
          </span>
        )}
        {this.state.errorState && (
          <span className="image-upload-wrapper__file-size-error">
            {this.state.errorMessage.message}
          </span>
        )}
      </div>
    );
  }
}

export default ImageUpload;
