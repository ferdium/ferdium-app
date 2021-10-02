import Form from '../../lib/Form';

// @ts-expect-error Expected 0 arguments, but got 1
export default new Form({
  fields: {
    user: {
      label: 'user',
      placeholder: 'Username',
      value: '',
    },
    password: {
      label: 'Password',
      placeholder: 'Password',
      value: '',
      type: 'password',
    },
  },
});
