const sloganTransition =
  window && window.matchMedia('(prefers-reduced-motion: no-preference)')
    ? 'opacity 1s ease'
    : 'none';

export default {
  component: {
    color: '#FFF',
  },
  slogan: {
    display: 'block',
    opacity: 0,
    transition: sloganTransition,
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
  },
  visible: {
    opacity: 1,
  },
};
