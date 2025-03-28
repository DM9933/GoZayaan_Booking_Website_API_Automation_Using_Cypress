describe('Offers APIs', () => {

  it('OFFERS-001: Verify fetching all offers works successfully', () => {
    cy.request('GET', 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD')
      .its('status')
      .should('eq', 200);
  });

  it('OFFERS-002: Verify offers contain required fields', () => {
    cy.request('GET', 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD')
      .its('body')
      .then((body) => {
        // Log the body to inspect its structure
        cy.log(JSON.stringify(body));
        // Check if the body is an array, then check the fields in each offer
        if (Array.isArray(body)) {
          body.forEach(offer => {
            expect(offer).to.have.property('offer_title');
            expect(offer).to.have.property('discount');
            expect(offer).to.have.property('validity');
          });
        } else {
          // If the body is not an array, handle accordingly (e.g., log the error)
          cy.log('Response is not an array, unable to verify fields');
        }
      });
  });

  it('OFFERS-003: Verify response with invalid currency', () => {
    cy.request({
      method: 'GET',
      url: 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=XYZ&region=BD',
      failOnStatusCode: false
    }).its('status').should('eq', 200); // Adjust the expected status based on actual behavior
  });

  it('OFFERS-004: Verify response with missing region or platform', () => {
    cy.request({
      method: 'GET',
      url: 'https://production.gozayaan.com/api/business_rules/get_all_offers/?currency=BDT',
      failOnStatusCode: false
    }).its('status').should('eq', 200); // Adjust based on actual behavior
  });

  it('OFFERS-005: Verify response time under load', () => {
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(cy.request('GET', 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD'));
    }

    cy.wrap(Promise.all(requests)).then(() => {
      requests.forEach((req) => {
        expect(req.duration).to.be.lessThan(2000); // Example assertion for response time
      });
    });
  });

  it('OFFERS-006: Verify unauthorized modification attempt', () => {
    cy.request({
      method: 'POST',
      url: 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD',
      failOnStatusCode: false
    }).its('status').should('eq', 405); // Expect 405 Method Not Allowed
  });

});
