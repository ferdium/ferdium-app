import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input/index';
import { required } from '../../../helpers/validation-helpers';
import Form from '../../../lib/Form';
import { workspaceStore } from '../index';

const messages = defineMessages({
  submitButton: {
    id: 'settings.workspace.add.form.submitButton',
    defaultMessage: 'Create workspace',
  },
  name: {
    id: 'settings.workspace.add.form.name',
    defaultMessage: 'Name',
  },
});

const styles = {
  form: {
    display: 'flex',
  },
  input: {
    flexGrow: 1,
    marginRight: '10px',
  },
  submitButton: {
    height: 'inherit',
  },
};

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  isSubmitting: boolean;
  onSubmit: (...args: any[]) => void;
}

@observer
class CreateWorkspaceForm extends Component<IProps> {
  form: Form;

  constructor(props: IProps) {
    super(props);

    this.form = new Form({
      fields: {
        name: {
          label: this.props.intl.formatMessage(messages.name),
          placeholder: this.props.intl.formatMessage(messages.name),
          value: '',
          validators: [required],
        },
      },
    });
  }

  submitForm(): void {
    this.form.submit({
      onSuccess: async form => {
        const { onSubmit } = this.props;
        const values = form.values();
        onSubmit(values);
      },
    });
  }

  render(): ReactElement {
    const { classes, isSubmitting, intl } = this.props;
    const { form } = this;

    return (
      <div className={classes.form}>
        <Input
          {...form.$('name').bind()}
          className={classes.input}
          showLabel={false}
          // @ts-expect-error Expected 1 arguments, but got 2.
          // eslint-disable-next-line react/jsx-no-bind
          onEnterKey={this.submitForm.bind(this, form)}
          focus={workspaceStore.isUserAllowedToUseFeature}
        />
        <Button
          className={`${classes.submitButton} franz-form__button`}
          type="submit"
          label={intl.formatMessage(messages.submitButton)}
          // @ts-expect-error Expected 1 arguments, but got 2.
          // eslint-disable-next-line react/jsx-no-bind
          onClick={this.submitForm.bind(this, form)}
          busy={isSubmitting}
          buttonType={isSubmitting ? 'secondary' : 'primary'}
        />
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(CreateWorkspaceForm),
);
