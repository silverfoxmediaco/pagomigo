## Authentication Flow and JWT Implementation

This PR fixes issues with the authentication flow and properly implements JWT:

- Fixed signup process to create users in the database
- Temporarily bypassed Twilio verification for testing purposes
- Updated URL construction in frontend to use proper relative paths
- Implemented JWT token handling for secure authentication
- Added proper error handling for authentication failures

TODO: 
- Re-enable Twilio verification once testing is complete
