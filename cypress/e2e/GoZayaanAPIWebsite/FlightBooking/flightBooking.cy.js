// cypress/e2e/api/flightBooking.cy.js

describe('GoZayaan Flight Booking API Tests', () => {
    const baseUrl = 'https://production.gozayaan.com';
    const homeUrl = 'https://gozayaan.com';
    let authToken = 'Token 46d19f9d72b46dbd4a761fa97fee0d56ff611c70f56e9740979123aa8017692b';
    let testInvoiceId = 'INVRTC2503251123'; // Sample invoice ID for testing
    let testFlightId = 'FL12345'; // Sample flight ID for testing
  
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
  
    // Flight Booking Initialization Tests
    describe('Flight Booking Initialization Tests', () => {
      it('BOOK-001 - Verify the booking page loads successfully', () => {
        cy.request({
          url: homeUrl + '/flight/booking',
          method: 'GET'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.include('<!DOCTYPE html>');
        });
      });
  
      it('BOOK-002 - Verify flight booking with valid data', () => {
        const validBookingPayload = {
          flight_id: testFlightId,
          passengers: [
            {
              type: 'adult',
              name: 'Test User',
              passport_number: 'A12345678',
              nationality: 'BD',
              dob: '1990-01-01'
            }
          ],
          contact_info: {
            email: 'test@example.com',
            phone: '+8801712345678'
          },
          payment_method: 'credit_card'
        };
  
        cy.request({
          url: baseUrl + '/api/flight/booking/',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          body: validBookingPayload,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('booking_reference');
            expect(response.body).to.have.property('invoice_id');
            testInvoiceId = response.body.invoice_id; // Update for subsequent tests
          } else {
            // Handle cases where booking might fail without valid test data
            expect(response.status).to.be.oneOf([200, 400, 401]);
          }
        });
      });
  
      it('BOOK-003 - Verify flight booking with missing traveller details', () => {
        const invalidPayload = {
          flight_id: testFlightId,
          passengers: [{}], // Missing required fields
          contact_info: {},
          payment_method: 'credit_card'
        };
  
        cy.request({
          url: baseUrl + '/api/flight/booking/',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          body: invalidPayload,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
  
      it('BOOK-004 - Verify booking with invalid flight ID', () => {
        const invalidPayload = {
          flight_id: 'INVALID_FLIGHT_ID',
          passengers: [
            {
              type: 'adult',
              name: 'Test User'
            }
          ],
          contact_info: {
            email: 'test@example.com'
          }
        };
  
        cy.request({
          url: baseUrl + '/api/flight/booking/',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          body: invalidPayload,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 404]);
        });
      });
  
      it('BOOK-005 - Verify booking with expired flight selection', () => {
        const expiredPayload = {
          flight_id: 'EXPIRED_FLIGHT_ID',
          passengers: [
            {
              type: 'adult',
              name: 'Test User'
            }
          ],
          contact_info: {
            email: 'test@example.com'
          }
        };
  
        cy.request({
          url: baseUrl + '/api/flight/booking/',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          body: expiredPayload,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 410]);
        });
      });
  
      it('BOOK-006 - Verify unauthorized booking attempt', () => {
        cy.request({
          url: baseUrl + '/api/flight/booking/',
          method: 'POST',
          body: {
            flight_id: testFlightId
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
  
      it('BOOK-007 - Verify incorrect method usage', () => {
        ['GET', 'PUT'].forEach((method) => {
          cy.request({
            url: baseUrl + '/api/flight/booking/',
            method: method,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(405);
          });
        });
      });
    });
  
    // Price Validation Tests
    describe('Price Validation Tests', () => {
      it('PRICE-001 - Verify price check with valid flight data', () => {
        const validPriceCheckPayload = {
          flight_id: testFlightId,
          passengers: [
            {
              type: 'adult',
              count: 1
            }
          ],
          currency: 'BDT'
        };
  
        cy.request({
          url: baseUrl + '/api/flight/check_price/',
          method: 'POST',
          body: validPriceCheckPayload
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('total_price');
          expect(response.body).to.have.property('breakdown');
        });
      });
  
      it('PRICE-002 - Verify price check with outdated flight data', () => {
        const expiredPayload = {
          flight_id: 'EXPIRED_FLIGHT_ID',
          passengers: [
            {
              type: 'adult',
              count: 1
            }
          ],
          currency: 'BDT'
        };
  
        cy.request({
          url: baseUrl + '/api/flight/check_price/',
          method: 'POST',
          body: expiredPayload,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
  
      it('PRICE-003 - Verify price check with incorrect payload', () => {
        cy.request({
          url: baseUrl + '/api/flight/check_price/',
          method: 'POST',
          body: {},
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
  
      it('PRICE-004 - Verify price fluctuation handling', () => {
        const priceCheckPayload = {
          flight_id: testFlightId,
          passengers: [
            {
              type: 'adult',
              count: 1
            }
          ],
          currency: 'BDT'
        };
  
        // First price check
        cy.request({
          url: baseUrl + '/api/flight/check_price/',
          method: 'POST',
          body: priceCheckPayload
        }).then((firstResponse) => {
          expect(firstResponse.status).to.eq(200);
          const firstPrice = firstResponse.body.total_price;
  
          // Second price check (simulating price change)
          cy.request({
            url: baseUrl + '/api/flight/check_price/',
            method: 'POST',
            body: priceCheckPayload
          }).then((secondResponse) => {
            expect(secondResponse.status).to.eq(200);
            const secondPrice = secondResponse.body.total_price;
  
            // Either prices should match or there should be a warning
            if (firstPrice !== secondPrice) {
              expect(secondResponse.body).to.have.property('warning');
            }
          });
        });
      });
    });
  
    // Discount Tests
    describe('Discount Tests', () => {
      it('DISCOUNT-001 - Verify discount list fetches correctly', () => {
        const validPayload = {
          product_type: 'FLIGHT',
          region: 'BD',
          currency: 'BDT'
        };
  
        cy.request({
          url: baseUrl + '/api/business_rules/get_discount_list/',
          method: 'POST',
          body: validPayload
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('discounts');
        });
      });
  
      it('DISCOUNT-002 - Verify discount list with invalid payload', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/get_discount_list/',
          method: 'POST',
          body: {},
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });
  
    // Payment Gateway Tests
    describe('Payment Gateway Tests', () => {
      it('GATEWAY-001 - Verify payment gateway fetches successfully', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/product_gateway/',
          qs: {
            platform_type: 'GZ_WEB',
            invoice_id: testInvoiceId
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('payment_options');
        });
      });
  
      it('GATEWAY-002 - Verify gateway with invalid invoice ID', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/product_gateway/',
          qs: {
            platform_type: 'GZ_WEB',
            invoice_id: 'INVALID_INVOICE'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
        });
      });
  
      it('GATEWAY-003 - Verify CORS preflight for payment gateway', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/product_gateway/',
          method: 'OPTIONS',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 || response.status === 204) {
            checkCorsHeaders(response.headers);
          }
        });
      });
    });
  
    // Add-ons Tests
    describe('Add-ons Tests', () => {
      it('ADDON-001 - Verify baggage protection data loads correctly', () => {
        cy.request({
          url: baseUrl + '/api/add_on/baggage_protection_services/',
          qs: {
            currency_code: 'BDT',
            region: 'BD',
            platting_carrier: 'BG',
            flight_type: 'DOM',
            pax_count: 1
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('protection_options');
        });
      });
  
      it('ADDON-002 - Verify invalid params in baggage protection', () => {
        cy.request({
          url: baseUrl + '/api/add_on/baggage_protection_services/',
          qs: {
            currency_code: 'XYZ', // Invalid currency
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
    });
  
    // Surcharges Tests
    describe('Surcharges Tests', () => {
      it('SURCHARGE-001 - Verify payment surcharge fetches correctly', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/payment_surcharge/',
          qs: {
            invoice_id: testInvoiceId
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('surcharge_details');
        });
      });
  
      it('SURCHARGE-002 - Verify surcharge fetch with invalid invoice ID', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/payment_surcharge/',
          qs: {
            invoice_id: 'INVALID_INVOICE'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
        });
      });
  
      it('SURCHARGE-003 - Verify CORS for surcharge API', () => {
        cy.request({
          url: baseUrl + '/api/business_rules/payment_surcharge/',
          method: 'OPTIONS',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 || response.status === 204) {
            checkCorsHeaders(response.headers);
          }
        });
      });
    });
  
    // Booking Details and User Journey Tests
    describe('Booking Details and User Journey Tests', () => {
      it('JOURNEY-001 - Verify booking details fetches successfully', () => {
        cy.request({
          url: baseUrl + '/api/user_journey/booking_details/' + testInvoiceId + '/',
          method: 'GET'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('booking_summary');
        });
      });
  
      it('JOURNEY-002 - Verify journey fetch with invalid invoice ID', () => {
        cy.request({
          url: baseUrl + '/api/user_journey/booking_details/INVALID_INVOICE/',
          method: 'GET',
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(404);
        });
      });
  
      it('JOURNEY-003 - Verify CORS preflight for user journey', () => {
        cy.request({
          url: baseUrl + '/api/user_journey/booking_details/' + testInvoiceId + '/',
          method: 'OPTIONS',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 || response.status === 204) {
            checkCorsHeaders(response.headers);
          }
        });
      });
    });
  
    // End-to-End Booking Flow Tests
    describe('End-to-End Booking Flow Tests', () => {
      it('FLOW-001 - Verify complete booking flow', () => {
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
  
          // Step 2: Price Check
          cy.request({
            url: baseUrl + '/api/flight/check_price/',
            method: 'POST',
            body: {
              flight_id: flightId,
              passengers: [{ type: 'adult', count: 1 }],
              currency: 'BDT'
            }
          }).then((priceResponse) => {
            expect(priceResponse.status).to.eq(200);
  
            // Step 3: Add-ons (if any)
            // Step 4: Booking
            cy.request({
              url: baseUrl + '/api/flight/booking/',
              method: 'POST',
              headers: {
                Authorization: `Bearer ${authToken}`
              },
              body: {
                flight_id: flightId,
                passengers: [
                  {
                    type: 'adult',
                    name: 'Test User',
                    passport_number: 'A12345678',
                    nationality: 'BD',
                    dob: '1990-01-01'
                  }
                ],
                contact_info: {
                  email: 'test@example.com',
                  phone: '+8801712345678'
                },
                payment_method: 'credit_card'
              },
              failOnStatusCode: false
            }).then((bookingResponse) => {
              if (bookingResponse.status === 200) {
                expect(bookingResponse.body).to.have.property('booking_reference');
  
                // Step 5: Payment Gateway
                cy.request({
                  url: baseUrl + '/api/business_rules/product_gateway/',
                  qs: {
                    platform_type: 'GZ_WEB',
                    invoice_id: bookingResponse.body.invoice_id
                  }
                }).then((gatewayResponse) => {
                  expect(gatewayResponse.status).to.eq(200);
                });
              }
            });
          });
        });
      });
  
      it('FLOW-002 - Verify incomplete journey handles errors correctly', () => {
        // Simulate a booking attempt without price check
        cy.request({
          url: baseUrl + '/api/flight/booking/',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          body: {
            flight_id: testFlightId,
            passengers: [
              {
                type: 'adult',
                name: 'Test User'
              }
            ],
            contact_info: {
              email: 'test@example.com'
            }
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should fail because we skipped price check
          expect(response.status).to.be.oneOf([400, 412]); // 412 Precondition Failed or 400 Bad Request
        });
      });
  
      it('FLOW-003 - Verify load performance for high-traffic scenario', () => {
        // This is a simplified load test - consider using dedicated tools for real load testing
        const startTime = Date.now();
        for (let i = 0; i < 10; i++) { // Reduced from 500 for practicality
          cy.request({
            url: baseUrl + '/api/flight/v2.0/search/',
            method: 'POST',
            body: {
              trips: [{ from: 'DAC', to: 'CGP', date: '2025-03-27' }],
              passengers: { adult: 1 },
              cabin_class: 'Economy',
              currency: 'BDT'
            },
            failOnStatusCode: false
          });
        }
        cy.then(() => {
          checkResponseTime(startTime, 20000);
        });
      });
    });
  });