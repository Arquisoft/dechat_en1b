Feature: Log in the application
  test to login the app.

  Scenario: Login page test
    Given I am on the login webPage
    When I introduce my auth. data
    Then I should be able to see my profile