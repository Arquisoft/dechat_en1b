import { LoginPage } from './login.po';

describe('Login page test', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('PROFILE DEMO APP');
  });

  //TODO: other tests

});
