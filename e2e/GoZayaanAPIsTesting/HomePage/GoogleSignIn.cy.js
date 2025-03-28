describe('Google Sign-In APIs', () => {

    it('SIGNIN-001: Verify Google sign-in preflight works', () => {
      cy.request('OPTIONS', 'https://production.gozayaan.com/api/social_auth/google/')
        .its('status')
        .should('eq', 204);
    });
  
    it('SIGNIN-002: Verify unauthorized methods (GET/POST)', () => {
      cy.request({
        method: 'GET',
        url: 'https://production.gozayaan.com/api/social_auth/google/',
        failOnStatusCode: false
      }).its('status').should('eq', 405);
  
      cy.request({
        method: 'POST',
        url: 'https://production.gozayaan.com/api/social_auth/google/',
        failOnStatusCode: false
      }).its('status').should('eq', 405);
    });
  
    it('SIGNIN-003: Verify response headers include CORS', () => {
      cy.request('OPTIONS', 'https://production.gozayaan.com/api/social_auth/google/')
        .its('headers')
        .should('include', 'access-control-allow-origin');
    });
  
    it('SIGNIN-004: Verify Google sign-in with valid data', () => {
      cy.request('POST', 'https://production.gozayaan.com/api/social_auth/google/', {
        token: 'valid_token_here'
      })
        .its('status')
        .should('eq', 200);
    });
  
    it('SIGNIN-005: Verify sign-in with missing payload', () => {
      cy.request({
        method: 'POST',
        url: 'https://production.gozayaan.com/api/social_auth/google/',
        body: {},
        failOnStatusCode: false
      }).its('status').should('eq', 400);
    });
  
  });
  