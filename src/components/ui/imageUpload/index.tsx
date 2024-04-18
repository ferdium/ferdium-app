import { mdiDelete, mdiFileImage } from '@mdi/js';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import prettyBytes from 'pretty-bytes';
import { Component, type ReactElement } from 'react';
import Dropzone from 'react-dropzone';
import { isWindows } from '../../../environment';
import Icon from '../icon';

interface IProps {
  field: any;
  textDelete: string;
  textUpload: string;
  textMaxFileSize: string;
  textMaxFileSizeError: string;
  className?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

interface IState {
  path: string | null;
  errorState: boolean;
  errorMessage: {
    message: string;
  };
}

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

  onDropAccepted(acceptedFiles) {
    const { field } = this.props;
    this.setState({ errorState: false });

    for (const file of acceptedFiles) {
      const imgPath = isWindows ? file.path.replaceAll('\\', '/') : file.path;
      this.setState({
        path: imgPath,
      });

      this.props.field.onDrop(file);
    }

    field.set('');
  }

  onDropRejected(rejectedFiles): void {
    for (const file of rejectedFiles) {
      for (const error of file.errors) {
        if (error.code === 'file-too-large') {
          this.setState({
            errorState: true,
            errorMessage: {
              message: this.props.textMaxFileSizeError,
            },
          });
        }
      }
    }
  }

  render(): ReactElement {
    const {
      field,
      textDelete,
      textUpload,
      textMaxFileSize,
      className = '',
      multiple = false,
      maxSize = Number.POSITIVE_INFINITY,
      maxFiles = 0,
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
          {field.label}
        </label>
        <div className="image-upload">
          {(field.value && field.value !== 'delete') || this.state.path ? (
            <>
              <div
                className="image-upload__preview"
                style={{
                  backgroundImage: `url("${this.state.path || field.value}")`,
                }}
              />
              <div className="image-upload__action">
                <button
                  type="button"
                  onClick={() => {
                    if (field.value) {
                      field.set('delete');
                    } else {
                      this.setState({
                        path: null,
                      });
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
              // eslint-disable-next-line react/jsx-no-bind
              onDropAccepted={this.onDropAccepted.bind(this)}
              // eslint-disable-next-line react/jsx-no-bind
              onDropRejected={this.onDropRejected.bind(this)}
              multiple={multiple}
              accept={{
                'image/jpeg': ['.jpeg', '.jpg'],
                'image/png': ['.png'],
                'image/svg+xml': ['.svg'],
              }}
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
