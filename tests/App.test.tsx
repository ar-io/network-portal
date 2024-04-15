import { render } from '@testing-library/react';

import App from '../src/App';

describe('App', () => {
  it('should render App', () => {
    const app = render(<App />);
    expect(app).toMatchSnapshot();
  });
});
