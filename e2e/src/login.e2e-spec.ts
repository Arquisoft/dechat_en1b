import { LoginPage } from './login.po';

describe('workspace-project App', () => {
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
