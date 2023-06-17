import { Component, ReactNode } from 'react';
import { observer } from 'mobx-react';
import withStyles, { WithStylesProps } from 'react-jss';
import classnames from 'classnames';
import { mdiInfinity } from '@mdi/js';
import Icon from './icon';

const styles = theme => ({
  root: {
    height: `${theme.serviceIcon.width}px`,
    width: `${theme.serviceIcon.width}px`,
    textAlign: 'center',
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  icon: {
    height: 'auto',
    width: `${theme.serviceIcon.width}px`,
    maxHeight: `${theme.serviceIcon.width}px`,
  },
  iconLetterContainer: {
    border: `1px solid ${theme.colorText}`,
    borderRadius: '20%',
  },
  iconLetter: {
    fontSize: 'x-large',
    fontWeight: '500',
  },
});

interface IProps extends WithStylesProps<typeof styles> {
  className?: string;
  name: string | null;
  iconUrl: string;
}

@observer
class WorkspaceIcon extends Component<IProps> {
  render(): ReactNode {
    const { classes, className, name, iconUrl } = this.props;
    if (iconUrl === 'allServices') {
      return (
        <div className={classnames([classes.root, className])}>
          <Icon icon={mdiInfinity} size={1.5} />
        </div>
      );
    }
    if (iconUrl) {
      return (
        <div className={classnames([classes.root, className])}>
          <img src={iconUrl} className={classes.icon} alt={name || undefined} />{' '}
        </div>
      );
    }
    return (
      <div
        className={classnames([
          classes.root,
          classes.iconLetterContainer,
          className,
        ])}
      >
        <span className={classes.iconLetter}>
          {(name || ' ').slice(0, 1).toLocaleUpperCase()}
        </span>
      </div>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(WorkspaceIcon);
