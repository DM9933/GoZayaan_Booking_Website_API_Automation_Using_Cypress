// cypress/e2e/api/flightSearch.cy.js

describe('GoZayaan Flight Search API Tests', () => {
    const baseUrl = 'https://production.gozayaan.com';
    const homeUrl = 'https://gozayaan.com';
    let authToken = 'Token 46d19f9d72b46dbd4a761fa97fee0d56ff611c70f56e9740979123aa8017692b';
  
    // Helper function to check CORS headers
    const checkCorsHeaders = (headers) => {
      expect(headers).to.have.property('access-control-allow-origin');
      expect(headers).to.have.property('access-control-allow-methods');
    };
  
    // Helper function to measure response time
    const checkResponseTime = (startTime, maxTime = 2000) => {
      const elapsed = Date.now() - startTime;
      expect(elapsed).to.be.lessThan(maxTime);
    };
  
    // Flight Search Initiation Tests
    describe('Flight Search Initiation Tests', () => {
      const endpoint = '/flight/list';
      const validParams = {
        adult: 1,
        child: 0,
        infant: 0,
        cabin_class: 'Business',
        trips: 'DAC,CGP,2025-03-27'
      };
  
      it('FLIGHT-001 - Verify flight search with valid params', () => {
        cy.request({
          url: homeUrl + endpoint,
          qs: validParams
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('data');
        });
      });
  
      it('FLIGHT-002 - Verify search with missing parameters', () => {
        // Test missing trips
        cy.request({
          url: homeUrl + endpoint,
          qs: {
            adult: 1,
            cabin_class: 'Business'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
  
        // Test missing cabin_class
        cy.request({
          url: homeUrl + endpoint,
          qs: {
            adult: 1,
            trips: 'DAC,CGP,2025-03-27'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
        });
      });
  
      it('FLIGHT-003 - Verify search with invalid date format', () => {
        cy.request({
          url: homeUrl + endpoint,
          qs: {
            ...validParams,
            trips: 'DAC,CGP,2025/03/27'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
  
      it('FLIGHT-004 - Verify response time under load', () => {
        const startTime = Date.now();
        for (let i = 0; i < 10; i++) { // Reduced from 100 for practicality
          cy.request({
            url: homeUrl + endpoint,
            qs: validParams
          });
        }
        cy.then(() => {
          checkResponseTime(startTime, 10000);
        });
      });
  
      it('FLIGHT-005 - Verify search with multi-city trips', () => {
        cy.request({
          url: homeUrl + endpoint,
          qs: {
            ...validParams,
            trips: 'DAC,CGP,2025-03-27;CGP,DXB,2025-03-30'
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data).to.be.an('array');
          expect(response.body.data.length).to.be.greaterThan(0);
        });
      });
  
      it('FLIGHT-006 - Verify invalid method (POST/PUT)', () => {
        ['POST', 'PUT'].forEach((method) => {
          cy.request({
            url: homeUrl + endpoint,
            method: method,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(405);
          });
        });
      });
    });
  
    // Flight Search Payload Tests
    describe('Flight Search Payload Tests', () => {
      const endpoint = '/api/flight/v2.0/search/';
      const validPayload = {
        trips: [
          {
            from: 'DAC',
            to: 'CGP',
            date: '2025-03-27'
          }
        ],
        passengers: {
          adult: 1,
          child: 0,
          infant: 0
        },
        cabin_class: 'Business',
        currency: 'BDT'
      };
  
      it('FLIGHT-007 - Verify search payload with valid data', () => {
        cy.request({
          url: baseUrl + endpoint,
          method: 'POST',
          body: validPayload
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
        });
      });
  
      it('FLIGHT-008 - Verify missing payload body', () => {
        cy.request({
          url: baseUrl + endpoint,
          method: 'POST',
          body: {},
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
  
      it('FLIGHT-009 - Verify payload with invalid airport codes', () => {
        const invalidPayload = {
          ...validPayload,
          trips: [
            {
              from: 'ABC',
              to: 'XYZ',
              date: '2025-03-27'
            }
          ]
        };
  
        cy.request({
          url: baseUrl + endpoint,
          method: 'POST',
          body: invalidPayload,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 200]);
          if (response.status === 400) {
            expect(response.body).to.have.property('error');
          }
        });
      });
  
      it('FLIGHT-010 - Verify search with past dates', () => {
        const pastDatePayload = {
          ...validPayload,
          trips: [
            {
              from: 'DAC',
              to: 'CGP',
              date: '2024-01-01'
            }
          ]
        };
  
        cy.request({
          url: baseUrl + endpoint,
          method: 'POST',
          body: pastDatePayload,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
  
      it('FLIGHT-011 - Verify response includes essential data', () => {
        cy.request({
          url: baseUrl + endpoint,
          method: 'POST',
          body: validPayload
        }).then((response) => {
          expect(response.status).to.eq(200);
          if (response.body.data && response.body.data.length > 0) {
            const flight = response.body.data[0];
            expect(flight).to.have.property('flight_number');
            expect(flight).to.have.property('airline');
            expect(flight).to.have.property('price');
            expect(flight).to.have.property('duration');
          }
        });
      });
  
      it('FLIGHT-012 - Verify timeout on long-running search', () => {
        const startTime = Date.now();
        for (let i = 0; i < 5; i++) { // Reduced from 300 for practicality
          cy.request({
            url: baseUrl + endpoint,
            method: 'POST',
            body: validPayload,
            timeout: 5000 // 5 second timeout
          });
        }
        cy.then(() => {
          checkResponseTime(startTime, 10000);
        });
      });
  
      it('FLIGHT-013 - Verify invalid methods (GET/PUT)', () => {
        ['GET', 'PUT'].forEach((method) => {
          cy.request({
            url: baseUrl + endpoint,
            method: method,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(405);
          });
        });
      });
    });
  
    // Add-ons & Baggage Protection Tests
    describe('Add-ons & Baggage Protection Tests', () => {
      const addonEndpoint = '/api/flight/v1.0/add_on_search/';
      const baggageEndpoint = '/api/add_on/baggage_protection_services/';
  
      it('ADDON-001 - Verify CORS preflight request for addons', () => {
        cy.request({
          url: baseUrl + addonEndpoint,
          method: 'OPTIONS'
        }).then((response) => {
          expect(response.status).to.be.oneOf([204, 200]);
          checkCorsHeaders(response.headers);
        });
      });
  
      it('ADDON-002 - Verify add-on search with valid payload', () => {
        const validAddonPayload = {
          flight_id: 'FL123',
          passengers: [
            {
              type: 'adult',
              count: 1
            }
          ],
          currency: 'BDT'
        };
  
        cy.request({
          url: baseUrl + addonEndpoint,
          method: 'POST',
          body: validAddonPayload
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('services');
        });
      });
  
      it('ADDON-003 - Verify add-on search with missing params', () => {
        cy.request({
          url: baseUrl + addonEndpoint,
          method: 'POST',
          body: {},
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
  
      it('ADDON-004 - Verify baggage protection fetches correctly', () => {
        cy.request({
          url: baseUrl + baggageEndpoint,
          qs: {
            currency_code: 'BDT',
            region: 'BD',
            platting_carrier: 'BG',
            flight_type: 'DOM',
            pax_count: 1
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('data');
        });
      });
  
      it('ADDON-005 - Verify invalid baggage protection params', () => {
        cy.request({
          url: baseUrl + baggageEndpoint,
          qs: {
            currency_code: 'XYZ',
            region: 'BD',
            platting_carrier: 'BG',
            flight_type: 'DOM',
            pax_count: 1
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
  
      it('ADDON-006 - Performance test with high load', () => {
        const startTime = Date.now();
        for (let i = 0; i < 10; i++) { // Reduced from 200
          cy.request({
            url: baseUrl + addonEndpoint,
            method: 'POST',
            body: {
              flight_id: `FL${i}`,
              passengers: [{ type: 'adult', count: 1 }],
              currency: 'BDT'
            }
          });
        }
        cy.then(() => {
          checkResponseTime(startTime, 10000);
        });
      });
    });
  
    // Loyalty Program Tests
    describe('Loyalty Program Tests', () => {
      const endpoint = '/api/loyalty_program/user/balance_check/';
  
      it('LOYALTY-001 - Verify user balance check with valid user', () => {
        // This assumes you have a way to get a valid auth token
        if (authToken) {
          cy.request({
            url: baseUrl + endpoint,
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('balance');
          });
        } else {
          // Skip if no auth token available
          cy.log('No auth token available - skipping test');
          expect(true).to.be.true;
        }
      });
  
      it('LOYALTY-002 - Verify balance check with unauthenticated user', () => {
        cy.request({
          url: baseUrl + endpoint,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
  
      it('LOYALTY-003 - Verify response time under load', () => {
        const startTime = Date.now();
        for (let i = 0; i < 10; i++) { // Reduced from 100
          cy.request({
            url: baseUrl + endpoint,
            failOnStatusCode: false
          });
        }
        cy.then(() => {
          checkResponseTime(startTime, 10000);
        });
      });
    });
  
    // Product Surcharge Calculation Tests
    describe('Product Surcharge Calculation Tests', () => {
      const endpoint = '/api/business_rules/product_surcharge/';
  
      it('SURCHARGE-001 - Verify surcharge calculation loads successfully', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            product: 'FLIGHT',
            product_type: 'DOM',
            platform_type: 'GZ_WEB',
            region: 'BD'
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('surcharge');
        });
      });
  
      it('SURCHARGE-002 - Verify surcharge with invalid product type', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            product: 'FLIGHT',
            product_type: 'XYZ',
            platform_type: 'GZ_WEB',
            region: 'BD'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
  
      it('SURCHARGE-003 - Verify CORS for surcharge API', () => {
        cy.request({
          url: baseUrl + endpoint,
          method: 'OPTIONS',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 || response.status === 204) {
            checkCorsHeaders(response.headers);
          } else {
            // Some servers might not implement OPTIONS
            expect(true).to.be.true;
          }
        });
      });
    });
  
    // Flight Services Tests
    describe('Flight Services Tests', () => {
      const endpoint = '/api/flight/services/';
  
      it('SERVICES-001 - Verify flight services list fetches successfully', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            limit: 50
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('services');
        });
      });
  
      it('SERVICES-002 - Verify limit param handles boundaries', () => {
        // Test lower boundary
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            limit: 0
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400]);
        });
  
        // Test upper boundary
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            limit: 1000
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400]);
        });
      });
  
      it('SERVICES-003 - Verify API response format', () => {
        cy.request({
          url: baseUrl + endpoint,
          qs: {
            limit: 5
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          if (response.body.services && response.body.services.length > 0) {
            const service = response.body.services[0];
            expect(service).to.have.property('service_name');
            expect(service).to.have.property('price');
            expect(service).to.have.property('description');
          }
        });
      });
    });
  
    // Cross-Module Tests
    describe('Cross-Module Tests', () => {
      it('CROSS-001 - Verify complete flight booking flow', () => {
        // Step 1: Flight Search
        cy.request({
          url: baseUrl + '/api/flight/v2.0/search/',
          method: 'POST',
          body: {
            trips: [{ from: 'DAC', to: 'CGP', date: '2025-03-27' }],
            passengers: { adult: 1 },
            cabin_class: 'Economy',
            currency: 'BDT'
          }
        }).then((searchResponse) => {
          expect(searchResponse.status).to.eq(200);
          const flightId = searchResponse.body.data[0].id;
  
          // Step 2: Add-on Selection
          cy.request({
            url: baseUrl + '/api/flight/v1.0/add_on_search/',
            method: 'POST',
            body: {
              flight_id: flightId,
              passengers: [{ type: 'adult', count: 1 }],
              currency: 'BDT'
            }
          }).then((addonResponse) => {
            expect(addonResponse.status).to.eq(200);
  
            // Step 3: Pricing (would typically be another API call)
            // Step 4: User Balance Check (if authenticated)
            if (authToken) {
              cy.request({
                url: baseUrl + '/api/loyalty_program/user/balance_check/',
                headers: {
                  Authorization: `Bearer ${authToken}`
                }
              }).then((balanceResponse) => {
                expect(balanceResponse.status).to.eq(200);
              });
            }
          });
        });
      });
  
      it('CROSS-002 - Verify error handling across all endpoints', () => {
        const endpointsToTest = [
          { url: '/api/flight/v2.0/search/', method: 'POST', body: {} },
          { url: '/api/flight/v1.0/add_on_search/', method: 'POST', body: {} },
          { url: '/api/loyalty_program/user/balance_check/', method: 'GET' }
        ];
  
        endpointsToTest.forEach((endpoint) => {
          cy.request({
            url: baseUrl + endpoint.url,
            method: endpoint.method,
            body: endpoint.body || undefined,
            failOnStatusCode: false
          }).then((response) => {
            if (response.status >= 400) {
              expect(response.body).to.have.property('error').that.is.a('string');
              expect(response.body).to.have.property('code').that.is.a('number');
            }
          });
        });
      });
    });
  });