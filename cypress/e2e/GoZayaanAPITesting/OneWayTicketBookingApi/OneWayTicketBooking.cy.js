describe('Gozayaan API Testing', () => {
    const token = '27039b7f97b30beb76a7f28d1aea0737d8d36d5dd7491aee4e129276d8aa8719';

    const endpoints = [
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/business_rules/offer_section/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/gozayaan_campaign/user_featured_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/gozayaan_campaign/users_sales_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/social_auth/google/', body: {} },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/offer_section/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/brand_banners/?region=BD&platform_type=GZ_WEB' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/gozayaan_campaign/users_sales_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/social_auth/google/' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/business_rules/brand_banners/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/location/autocomplete/?region=BD' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/flight/v2.0/search/' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/business_rules/get_discount_list/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/loyalty_program/user/balance_check/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/flight/services/?limit=50' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/business_rules/product_surcharge/?product=FLIGHT&product_type=DOM&platform_type=GZ_WEB&region=BD' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/product_surcharge/?product=FLIGHT&product_type=DOM&platform_type=GZ_WEB&region=BD' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/loyalty_program/user/balance_check/' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/flight/v1.0/add_on_search/' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/add_on/insurance_price/?destination_type=DOMESTIC&region=BD&pax_count=1&product_type=FLIGHT' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/business_rules/payment_surcharge/?invoice_id=INVTRS2503240697' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/account_management/traveller_account/' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/flight/v2.0/search/RmeZzibKTK2c/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/tour/get_country_list/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/flight/v2.0/search/RmeZzibKTK2c/' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/flight/v2.0/search/' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/user_journey/booking_details/INVTRS2503240697/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/account_management/traveller_account/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/gozayaan_campaign/users_sales_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/brand_banners/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/payment_surcharge/?invoice_id=INVTRS2503240697' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/flight/check_price/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/user_journey/booking_details/INVTRS2503240697/' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/product_gateway/?platform_type=GZ_WEB&invoice_id=INVTRS2503240697' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/flight/v1.0/add_on_search/' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/flight/booking/' },
    ];

    endpoints.forEach(endpoint => {
        it(`Testing ${endpoint.method} ${endpoint.url}`, () => {
            cy.request({
                method: endpoint.method,
                url: endpoint.url,
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: endpoint.body || undefined,
                failOnStatusCode: false
            }).then((response) => {
                if (endpoint.method === 'OPTIONS') {
                    expect(response.status).to.be.oneOf([200, 201, 204, 405]); // Allow 405 for OPTIONS
                } else {
                    // Handle 420 alongside regular success codes
                    expect(response.status).to.be.oneOf([200, 201, 204, 420]);
                }
                cy.log('Response:', response.body);
    
                // Optional: Retry on 420 status (rate limit or custom error)
                if (response.status === 420) {
                    cy.log('⚠️ Got 420 - Retrying in 5 seconds...');
                    cy.wait(5000); // Wait 5 seconds before retry
                    cy.request({
                        method: endpoint.method,
                        url: endpoint.url,
                        headers: {
                            'Authorization': `Token ${token}`
                        },
                        body: endpoint.body || undefined,
                        failOnStatusCode: false
                    }).then((retryResponse) => {
                        expect(retryResponse.status).to.be.oneOf([200, 201, 204]);
                        cy.log('✅ Retry Response:', retryResponse.body);
                    });
                }
            });
        });
    });
    
    

    // Special API call for baggage protection with authentication
    it('Testing baggage protection API with Authorization', () => {
        cy.request({
            method: 'GET',
            url: 'https://production.gozayaan.com/api/add_on/baggage_protection_services/?currency_code=BDT&region=BD&platting_carrier=VQ&flight_type=DOM&pax_count=1',
            headers: {
                'Authorization': `Token ${token}`
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200);
            cy.log('Response:', response.body);
        });
    });
});
