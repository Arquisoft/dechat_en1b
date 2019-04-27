Feature: Go to the login page and login with your solid account
  Display the title

  Scenario: Login page
    Given I am on the login page
    When I enter my credentials
    Then I should see the chat page
