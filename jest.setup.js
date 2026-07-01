jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.render = jest.fn((component) => {
    const React = require('react');
    const { render: tlRender } = require('@testing-library/react-native');
    return tlRender(component);
  });

  return RN;
});

global.fetch = jest.fn();
