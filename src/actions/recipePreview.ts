import PropTypes from 'prop-types';
import { ActionDefinitions } from './lib/actions';

export default <ActionDefinitions>{
  search: {
    needle: PropTypes.string.isRequired,
  },
};
