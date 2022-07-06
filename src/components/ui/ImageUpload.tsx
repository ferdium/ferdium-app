import { Component } from 'react';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
import { mdiDelete, mdiFileImage } from '@mdi/js';
import prettyBytes from 'pretty-bytes';
import { isWindows } from '../../environment';
import Icon from './icon';

type Props = {
  field: typeof Field;
  className: string;
  multiple: boolean;
  textDelete: string;
  textUpload: string;
  textMaxFileSize: string;
  textMaxFileSizeError: string;
  maxSize?: number;
  maxFiles?: number;
  messages: any;
};

// Should this file be converted into the coding style similar to './toggle/index.tsx'?
class ImageUpload extends Component<Props> {
  static defaultProps = {
    multiple: false,
    maxSize: Number.POSITIVE_INFINITY,
    maxFiles: 0,
  };

  state = {
    path: null,
    errorState: false,
  };

  errorMessage = {
    message: '',
  };

  onDropAccepted(acceptedFiles) {
    const { field } = this.props;
    this.setState({ errorState: false });

    for (const file of acceptedFiles) {
      const imgPath = isWindows ? file.path.replace(/\\/g, '/') : file.path;
      this.setState({
        path: imgPath,
      });

      this.props.field.onDrop(file);
    }

    field.set('');
  }

  onDropRejected(rejectedFiles) {
    for (const file of rejectedFiles) {
      for (const error of file.errors) {
        if (error.code === 'file-too-large') {
          this.setState({ errorState: true });
          this.setState(
            (this.errorMessage = {
              message: this.props.textMaxFileSizeError,
            }),
          );
        }
      }
    }
  }

  render() {
    const {
      field,
      className,
      multiple,
      textDelete,
      textUpload,
      textMaxFileSize,
      maxSize,
      maxFiles,
    } = this.props;

    const cssClasses = classnames({
      'image-upload__dropzone': true,
      [`${className}`]: className,
    });

    const maxSizeParse =
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
            {this.errorMessage.message}
          </span>
        )}
      </div>
    );
  }
}

export default observer(ImageUpload);
