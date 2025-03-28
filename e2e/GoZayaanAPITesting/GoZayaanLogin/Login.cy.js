describe('Gozayaan API Testing', () => {

    const endpoints = [
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/business_rules/offer_section/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/gozayaan_campaign/user_featured_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/gozayaan_campaign/users_sales_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/get_all_offers/?platform_type=GZ_WEB&currency=BDT&region=BD' },
        { method: 'POST', url: 'https://production.gozayaan.com/api/social_auth/google/', body: {} },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/offer_section/?region=BD&platform_type=GZ_WEB' },
        { method: 'GET', url: 'https://production.gozayaan.com/api/business_rules/brand_banners/?region=BD&platform_type=GZ_WEB' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/gozayaan_campaign/users_sales_ad/?region=BD&platform_type=GZ_WEB' },
        { method: 'OPTIONS', url: 'https://production.gozayaan.com/api/business_rules/brand_banners/?region=BD&platform_type=GZ_WEB' }
    ];

    endpoints.forEach(endpoint => {
        it(`Testing ${endpoint.method} ${endpoint.url}`, () => {
            cy.request({
                method: endpoint.method,
                url: endpoint.url,
                body: endpoint.body || undefined
            }).then((response) => {
                expect(response.status).to.be.oneOf([200, 201, 204]);
                cy.log('Response:', response.body);
            });
        });
    });
});
