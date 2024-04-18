import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/button';
import { H2 } from '../../../components/ui/headline';
import Infobox from '../../../components/ui/infobox/index';
import Input from '../../../components/ui/input';
import Toggle from '../../../components/ui/toggle';
import { KEEP_WS_LOADED_USID } from '../../../config';
import { required } from '../../../helpers/validation-helpers';
import Form from '../../../lib/Form';
import type Service from '../../../models/Service';
import type Request from '../../../stores/lib/Request';
import type Workspace from '../models/Workspace';
import WorkspaceServiceListItem from './WorkspaceServiceListItem';

const messages = defineMessages({
  buttonDelete: {
    id: 'settings.workspace.form.buttonDelete',
    defaultMessage: 'Delete workspace',
  },
  buttonSave: {
    id: 'settings.workspace.form.buttonSave',
    defaultMessage: 'Save workspace',
  },
  name: {
    id: 'settings.workspace.form.name',
    defaultMessage: 'Name',
  },
  yourWorkspaces: {
    id: 'settings.workspace.form.yourWorkspaces',
    defaultMessage: 'Your workspaces',
  },
  keepLoaded: {
    id: 'settings.workspace.form.keepLoaded',
    defaultMessage: 'Keep this workspace loaded*',
  },
  keepLoadedInfo: {
    id: 'settings.workspace.form.keepLoadedInfo',
    defaultMessage:
      '*This option will be overwritten by the global "Keep all workspaces loaded" option.',
  },
  servicesInWorkspaceHeadline: {
    id: 'settings.workspace.form.servicesInWorkspaceHeadline',
    defaultMessage: 'Services in this Workspace',
  },
  noServicesAdded: {
    id: 'settings.services.noServicesAdded',
    defaultMessage: 'Start by adding a service.',
  },
  discoverServices: {
    id: 'settings.services.discoverServices',
    defaultMessage: 'Discover services',
  },
});

const styles = {
  nameInput: {
    height: 'auto',
  },
  serviceList: {
    height: 'auto',
  },
  keepLoadedInfo: {
    marginBottom: '2rem !important',
  },
};

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  onDelete: () => void;
  onSave: (...args: any[]) => void;
  services: Service[];
  workspace: Workspace;
  updateWorkspaceRequest: Request;
  deleteWorkspaceRequest: Request;
}

@observer
class EditWorkspaceForm extends Component<IProps> {
  form: Form;

  constructor(props: IProps) {
    super(props);

    this.form = this.prepareWorkspaceForm(this.props.workspace);
  }

  // eslint-disable-next-line @eslint-react/no-unsafe-component-will-receive-props
  UNSAFE_componentWillReceiveProps(nextProps): void {
    const { workspace } = this.props;
    if (workspace.id !== nextProps.workspace.id) {
      this.form = this.prepareWorkspaceForm(nextProps.workspace);
    }
  }

  prepareWorkspaceForm(workspace: Workspace): Form {
    const { intl, updateWorkspaceRequest } = this.props;
    updateWorkspaceRequest.reset();

    return new Form({
      fields: {
        name: {
          label: intl.formatMessage(messages.name),
          placeholder: intl.formatMessage(messages.name),
          value: workspace.name,
          validators: [required],
        },
        keepLoaded: {
          label: intl.formatMessage(messages.keepLoaded),
          value: workspace.services.includes(KEEP_WS_LOADED_USID),
          default: false,
          type: 'checkbox',
        },
        services: {
          value: [...workspace.services],
        },
      },
    });
  }

  save(form): void {
    this.props.updateWorkspaceRequest.reset();
    form.submit({
      onSuccess: async f => {
        const { onSave } = this.props;
        const values = f.values();
        onSave(values);
      },
      onError: noop,
    });
  }

  delete(): void {
    const { onDelete } = this.props;
    onDelete();
  }

  toggleService(service: Service): void {
    const servicesField = this.form.$('services');
    const serviceIds = servicesField.value;
    if (serviceIds.includes(service.id)) {
      serviceIds.splice(serviceIds.indexOf(service.id), 1);
    } else {
      serviceIds.push(service.id);
    }
    servicesField.set(serviceIds);
  }

  render(): ReactElement {
    const {
      classes,
      workspace,
      services,
      deleteWorkspaceRequest,
      updateWorkspaceRequest,
      intl,
    } = this.props;
    const { form } = this;
    const workspaceServices = form.$('services').value;
    const isDeleting = deleteWorkspaceRequest.isExecuting;
    const isSaving = updateWorkspaceRequest.isExecuting;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            <Link to="/settings/workspaces">
              {intl.formatMessage(messages.yourWorkspaces)}
            </Link>
          </span>
          <span className="separator" />
          <span className="settings__header-item">{workspace.name}</span>
        </div>
        <div className="settings__body">
          {updateWorkspaceRequest.error ? (
            <Infobox icon="alert" type="danger">
              Error while saving workspace
            </Infobox>
          ) : null}
          <div className={classes.nameInput}>
            <Input {...form.$('name').bind()} />
            <Toggle {...form.$('keepLoaded').bind()} />
            <p className={`${classes.keepLoadedInfo} franz-form__label`}>
              {intl.formatMessage(messages.keepLoadedInfo)}
            </p>
          </div>
          <H2>{intl.formatMessage(messages.servicesInWorkspaceHeadline)}</H2>
          <div className={classes.serviceList}>
            {services.length === 0 ? (
              <div className="align-middle settings__empty-state">
                {/* ===== Empty state ===== */}
                <p className="settings__empty-text">
                  <span className="emoji">
                    <img src="./assets/images/emoji/sad.png" alt="" />
                  </span>
                  {intl.formatMessage(messages.noServicesAdded)}
                </p>
                <Link to="/settings/recipes" className="button">
                  {intl.formatMessage(messages.discoverServices)}
                </Link>
              </div>
            ) : (
              <>
                {services.map(service => (
                  <WorkspaceServiceListItem
                    key={service.id}
                    service={service}
                    isInWorkspace={workspaceServices.includes(service.id)}
                    onToggle={() => this.toggleService(service)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        <div className="settings__controls">
          {/* ===== Delete Button ===== */}
          <Button
            label={intl.formatMessage(messages.buttonDelete)}
            loaded={false}
            busy={isDeleting}
            buttonType={isDeleting ? 'secondary' : 'danger'}
            className="settings__delete-button"
            disabled={isDeleting}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={this.delete.bind(this)}
          />
          {/* ===== Save Button ===== */}
          <Button
            type="submit"
            label={intl.formatMessage(messages.buttonSave)}
            busy={isSaving}
            className="franz-form__button"
            buttonType={isSaving ? 'secondary' : 'primary'}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={this.save.bind(this, form)}
            // TODO: Need to disable if no services have been added to this workspace
            disabled={isSaving}
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(EditWorkspaceForm),
);
