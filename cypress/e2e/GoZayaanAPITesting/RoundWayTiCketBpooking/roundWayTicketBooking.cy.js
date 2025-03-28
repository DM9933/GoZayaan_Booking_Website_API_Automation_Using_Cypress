describe("GoZayaan API Automation", () => {
  let authToken;

  // Step 1: Authenticate and get the token
  before(() => {
    cy.request({
      method: "POST",
      url: "https://production.gozayaan.com/api/social_auth/google/",
      body: {
        username: "Habibur Rahman ",
        password: "Vasker.30@"
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      authToken = response.body.token; // Assuming response returns a token
    });
  });

  const endpoints = [
    { method: "GET", url: "/api/location/autocomplete/?region=BD" },
    { method: "GET", url: "/api/account_management/traveller_account/" },
    { method: "GET", url: "/api/business_rules/product_surcharge/?product=FLIGHT&product_type=DOM&platform_type=GZ_WEB&region=BD" },
    { method: "POST", url: "/api/flight/check_price/" },
    { method: "GET", url: "/api/tour/get_country_list/" },
    { method: "POST", url: "/api/flight/booking/" },
    { method: "POST", url: "/api/flight/v2.0/search/" },
    { method: "GET", url: "/api/business_rules/product_gateway/?platform_type=GZ_WEB&invoice_id=INVTCW2503250296" },
    { method: "POST", url: "/api/flight/v1.0/add_on_search/" },
    { method: "GET", url: "/api/flight/services/?limit=50" },
    { method: "OPTIONS", url: "/api/business_rules/get_discount_list/" },
    { method: "OPTIONS", url: "/api/user_journey/booking_details/INVTCW2503250296/" },
    { method: "OPTIONS", url: "/api/flight/v2.0/search/" },
    { method: "GET", url: "/api/flight/v2.0/search/5atc0YCW5qCC/" },
    { method: "OPTIONS", url: "/api/flight/check_price/" },
    { method: "GET", url: "/api/loyalty_program/user/balance_check/" },
    { method: "OPTIONS", url: "/api/business_rules/payment_surcharge/?invoice_id=INVTCW2503250296" },
    { method: "OPTIONS", url: "/api/flight/services/?limit=50" },
    { method: "GET", url: "/api/add_on/insurance_price/?destination_type=DOMESTIC&region=BD&pax_count=1&product_type=FLIGHT" },
    { method: "GET", url: "/api/user_journey/booking_details/INVTCW2503250296/" },
    { method: "OPTIONS", url: "/api/add_on/insurance_price/?destination_type=DOMESTIC&region=BD&pax_count=1&product_type=FLIGHT" },
    { method: "OPTIONS", url: "/api/flight/v1.0/add_on_search/" },
    { method: "GET", url: "/api/add_on/baggage_protection_services/?currency_code=BDT&region=BD&platting_carrier=VQ&flight_type=DOM&pax_count=1" },
    { method: "OPTIONS", url: "/api/business_rules/product_gateway/?platform_type=GZ_WEB&invoice_id=INVTCW2503250296" },
    { method: "OPTIONS", url: "/api/flight/v2.0/search/5atc0YCW5qCC/" },
    { method: "POST", url: "/api/business_rules/get_discount_list/" },
    { method: "GET", url: "/api/business_rules/payment_surcharge/?invoice_id=INVTCW2503250296" },
    { method: "OPTIONS", url: "/api/business_rules/product_surcharge/?product=FLIGHT&product_type=DOM&platform_type=GZ_WEB&region=BD" },
    { method: "OPTIONS", url: "/api/add_on/baggage_protection_services/?currency_code=BDT&region=BD&platting_carrier=VQ&flight_type=DOM&pax_count=1" },
    { method: "OPTIONS", url: "/api/loyalty_program/user/balance_check/" },
    { method: "OPTIONS", url: "/api/flight/booking/" }
  ];

  endpoints.forEach((endpoint) => {
    it(`${endpoint.method} ${endpoint.url}`, () => {
      cy.request({
        method: endpoint.method,
        url: `https://production.gozayaan.com${endpoint.url}`,
        headers: {
          Authorization: `Token ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Response status: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 204, 401]);
      });
    });
  });
});
