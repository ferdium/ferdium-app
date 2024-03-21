import PropTypes from 'prop-types';
import type { ActionDefinitions } from './lib/actions';

export default <ActionDefinitions>{
  search: {
    needle: PropTypes.string.isRequired,
  },
};
