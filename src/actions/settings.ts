import PropTypes from 'prop-types';
import type { ActionDefinitions } from './lib/actions';

export default <ActionDefinitions>{
  update: {
    type: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
  },
  remove: {
    type: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
  },
};
