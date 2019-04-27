Feature: Register the application
  test to register the app.

  Scenario: Register paga
    Given I am on the login page to register
    When click on the register button
    Then I should be able to see the different providers