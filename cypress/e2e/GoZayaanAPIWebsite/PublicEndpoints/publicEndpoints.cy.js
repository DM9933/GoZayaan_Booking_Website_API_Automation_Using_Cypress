// cypress/e2e/api/publicEndpoints.cy.js

describe('GoZayaan Public API Endpoints Tests', () => {
    const baseUrl = 'https://production.gozayaan.com';
    const homePageUrl = 'https://gozayaan.com';
  
    // Helper function to check security headers
    const checkSecurityHeaders = (headers) => {
      expect(headers).to.have.property('content-security-policy');
      expect(headers).to.have.property('strict-transport-security');
    };
  
    // Helper function to measure response time
    const checkResponseTime = (startTime, maxTime = 2000) => {
      const elapsed = Date.now() - startTime;
      expect(elapsed).to.be.lessThan(maxTime);
    };
  
    // Home Page Tests
    describe('Home Page Tests', () => {
      it('HOME-001 - Verify the home page loads successfully', () => {
        const startTime = Date.now();
        cy.request({
          url: homePageUrl,
          method: 'GET'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.include('<!DOCTYPE html>');
          checkResponseTime(startTime);
        });
      });
  
      it('HOME-002 - Verify response time is within limits', () => {
        const startTime = Date.now();
        cy.request(homePageUrl).then(() => {
          checkResponseTime(startTime);
        });
      });
  
      it('HOME-003 - Verify page content includes essential elements', () => {
        cy.request(homePageUrl).then((response) => {
          expect(response.body).to.include('<head');
          expect(response.body).to.include('<body');
          expect(response.body).to.include('</html>');
        });
      });
  
      it('HOME-004 - Verify incorrect methods (POST/PUT/DELETE)', () => {
        const methods = ['POST', 'PUT', 'DELETE'];
        methods.forEach((method) => {
          cy.request({
            url: homePageUrl,
            method: method,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.be.oneOf([405, 404]);
          });
        });
      });
  
      it('HOME-005 - Verify response headers include security headers', () => {
        cy.request(homePageUrl).then((response) => {
          checkSecurityHeaders(response.headers);
        });
      });
    });
  
    // Get All Offers Tests
    describe('Get All Offers Tests', () => {
      const endpoint = '/api/business_rules/get_all_offers/';
      const validParams = {
        platform_type: 'GZ_WEB',
        currency: 'BDT',
        region: 'BD'
      };
  
      it('OFFERS-001 - Verify fetching all offers works successfully', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
        });
      });
  
      it('OFFERS-002 - Verify offers contain required fields', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
          if (response.body.data.length > 0) {
            const offer = response.body.data[0];
            expect(offer).to.have.property('id');
            expect(offer).to.have.property('title');
            expect(offer).to.have.property('description');
          }
        });
      });
  
      it('OFFERS-003 - Verify response with invalid currency', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            ...validParams,
            currency: 'XYZ'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]); // Could be 200 with empty data
          if (response.status === 400) {
            expect(response.body).to.have.property('error');
          }
        });
      });
  
      it('OFFERS-004 - Verify response with missing region or platform', () => {
        // Test missing region
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            platform_type: 'GZ_WEB',
            currency: 'BDT'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
  
        // Test missing platform_type
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            currency: 'BDT',
            region: 'BD'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
      });
  
      it('OFFERS-005 - Verify response time under load', () => {
        const requests = Array(100).fill({
          url: baseUrl + endpoint,
          qs: validParams
        });
        
        const startTime = Date.now();
        cy.request(requests).then(() => {
          checkResponseTime(startTime, 5000); // Increased threshold for multiple requests
        });
      });
  
      it('OFFERS-006 - Verify unauthorized modification attempt', () => {
        cy.request({
          url: baseUrl + endpoint,
          method: 'POST',
          body: { test: 'data' },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([405, 403, 401]);
        });
      });
    });
  
    // User Featured Ad Tests
    describe('User Featured Ad Tests', () => {
      const endpoint = '/api/gozayaan_campaign/user_featured_ad/';
      const validParams = {
        platform_type: 'GZ_WEB',
        region: 'BD'
      };
  
      it('FEATURED-001 - Verify featured ad loads properly', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
        });
      });
  
      it('FEATURED-002 - Verify response has correct ad fields', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.body).to.have.property('data');
          const data = response.body.data;
          if (data && data.length > 0) {
            const ad = data[0];
            expect(ad).to.have.property('id');
            expect(ad).to.have.property('title');
            expect(ad).to.have.property('image_url');
          }
        });
      });
  
      it('FEATURED-003 - Verify invalid region', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            ...validParams,
            region: 'INVALID'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]); // Could be 200 with empty data
        });
      });
  
      it('FEATURED-004 - Verify missing platform type', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            region: 'BD'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
      });
  
      it('FEATURED-005 - Performance check with multiple requests', () => {
        const requests = Array(100).fill({
          url: baseUrl + endpoint,
          qs: validParams
        });
        
        const startTime = Date.now();
        cy.request(requests).then(() => {
          checkResponseTime(startTime, 5000);
        });
      });
    });
  
    // Offer Section Tests
    describe('Offer Section Tests', () => {
      const endpoint = '/api/business_rules/offer_section/';
      const validParams = {
        platform_type: 'GZ_WEB',
        region: 'BD'
      };
  
      it('OFFERSEC-001 - Verify offer section loads correctly', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
        });
      });
  
      it('OFFERSEC-002 - Verify response has correct offer details', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.body).to.have.property('data');
          const data = response.body.data;
          if (data && data.length > 0) {
            const section = data[0];
            expect(section).to.have.property('section_title');
            expect(section).to.have.property('offers');
            expect(section.offers).to.be.an('array');
          }
        });
      });
  
      it('OFFERSEC-003 - Verify invalid region/platform params', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            platform_type: 'INVALID',
            region: 'INVALID'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
      });
  
      it('OFFERSEC-004 - Performance check under load', () => {
        const requests = Array(200).fill({
          url: baseUrl + endpoint,
          qs: validParams
        });
        
        const startTime = Date.now();
        cy.request(requests).then(() => {
          checkResponseTime(startTime, 8000);
        });
      });
    });
  
    // User Sales Ad Tests
    describe('User Sales Ad Tests', () => {
      const endpoint = '/api/gozayaan_campaign/users_sales_ad/';
      const validParams = {
        platform_type: 'GZ_WEB',
        region: 'BD'
      };
  
      it('SALES-001 - Verify sales ads load properly', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
        });
      });
  
      it('SALES-002 - Verify ads contain essential fields', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.body).to.have.property('data');
          const data = response.body.data;
          if (data && data.length > 0) {
            const ad = data[0];
            expect(ad).to.have.property('id');
            expect(ad).to.have.property('title');
            expect(ad).to.have.property('image_url');
          }
        });
      });
  
      it('SALES-003 - Verify invalid region/platform handling', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            platform_type: 'INVALID',
            region: 'INVALID'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
      });
  
      it('SALES-004 - Performance test for high traffic', () => {
        const requests = Array(100).fill({
          url: baseUrl + endpoint,
          qs: validParams
        });
        
        const startTime = Date.now();
        cy.request(requests).then(() => {
          checkResponseTime(startTime, 5000);
        });
      });
    });
  
    // Cross-Endpoint Tests
    describe('Cross-Endpoint Tests', () => {
      const endpoints = [
        '/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD',
        '/api/gozayaan_campaign/user_featured_ad/?region=BD&platform_type=GZ_WEB',
        '/api/business_rules/offer_section/?region=BD&platform_type=GZ_WEB',
        '/api/gozayaan_campaign/users_sales_ad/?region=BD&platform_type=GZ_WEB'
      ];
  
      it('CROSS-001 - Verify APIs handle mixed parallel requests', () => {
        const requests = endpoints.map(endpoint => ({
          url: baseUrl + endpoint
        }));
        
        cy.request(requests).then((responses) => {
          responses.forEach((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
  
      it('CROSS-002 - Verify API rate limit (if exists)', () => {
        // Make 50 rapid requests to test rate limiting
        const rapidRequests = Array(50).fill({
          url: baseUrl + endpoints[0]
        });
        
        cy.request(rapidRequests).then((responses) => {
          // Check if any responses were rate limited (429)
          const rateLimited = responses.some(r => r.status === 429);
          if (rateLimited) {
            cy.log('Rate limiting is in effect');
          } else {
            cy.log('No rate limiting detected');
          }
          
          // Verify that even if rate limited, the responses are proper
          responses.forEach((response) => {
            expect(response.status).to.be.oneOf([200, 429]);
            if (response.status === 429) {
              expect(response.body).to.have.property('error');
            }
          });
        });
      });
  
      it('CROSS-003 - Verify API behaves properly with slow internet (throttling)', () => {
        // This test simulates slow network by using cy.intercept
        endpoints.forEach((endpoint) => {
          cy.intercept(baseUrl + endpoint, (req) => {
            req.on('response', (res) => {
              // Delay the response by 5 seconds
              res.setDelay(5000);
            });
          }).as('slowRequest');
          
          const startTime = Date.now();
          cy.request(baseUrl + endpoint).then((response) => {
            expect(response.status).to.eq(200);
            // Verify the request took at least 5 seconds
            expect(Date.now() - startTime).to.be.at.least(5000);
          });
        });
      });
    });
  });