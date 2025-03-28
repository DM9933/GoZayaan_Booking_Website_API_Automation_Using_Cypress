describe('ReqRes API - Full CRUD Tests', () => {
  const baseUrl = 'https://reqres.in/api';

  // ✅ Test 1: Fetch users from page 2
  it('Should fetch users from page 2 (GET)', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users?page=2`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('page', 2);
      expect(response.body.data).to.be.an('array');
    });
  });

  // ✅ Test 2: Create a new user
  it('Should create a new user (POST)', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/users`,
      body: {
        name: 'John Doe',
        job: 'Software Engineer',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('name', 'John Doe');
      expect(response.body).to.have.property('job', 'Software Engineer');
      expect(response.body).to.have.property('id');
    });
  });

  // ✅ Test 3: Update an existing user
  it('Should update an existing user (PUT)', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/users/2`,
      body: {
        name: 'Jane Doe',
        job: 'Product Manager',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('name', 'Jane Doe');
      expect(response.body).to.have.property('job', 'Product Manager');
    });
  });

  // ✅ Test 4: Delete a user
  it('Should delete a user (DELETE)', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/users/2`,
    }).then((response) => {
      expect(response.status).to.eq(204);
    });
  });

  // ✅ Test 5: Handle invalid user (404 Not Found)
  it('Should handle invalid user (GET - 404)', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/9999`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // 🔧 Fixed Test 6A: Handle empty data gracefully (201 Created)
  it('Should handle empty data (POST - 201)', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/users`,
      body: {}, // Empty body still returns 201 on this API
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
    });
  });

  // 🚀 New Test 6B: Force 400 error with malformed JSON
  it('Should handle malformed data (POST - 400)', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/users`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{invalid: "json"}', // Malformed JSON payload
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
