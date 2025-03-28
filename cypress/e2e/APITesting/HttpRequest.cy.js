describe("HTTP Requests", () => {
    it("GET Call", () => {
      cy.request('GET', 'https://jsonplaceholder.typicode.com/posts/1')
        .its('status')
        .should('equal', 200);
    });
  
    it("POST Call", () => {
      cy.request({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts/',
        body: {
          title: "Test post",
          body: "This is a post call",
          userId: 1
        }
      })
        .its('status')
        .should('equal', 201);
    });
  
    it("PUT Call", () => {
      cy.request({
        method: 'PUT',
        url: 'https://jsonplaceholder.typicode.com/posts/1', // Updating the post with ID 1
        body: {
          id: 1,
          title: "Updated post",
          body: "This is an updated post",
          userId: 1,
          id: 1
        }
      })
        .its('status')
        .should('equal', 200); // Expecting status code 200 for a successful update
    });
  
    it("DELETE Call", () => {
      cy.request({
        method: 'DELETE',
        url: 'https://jsonplaceholder.typicode.com/posts/1' // Deleting the post with ID 1
      })
        .its('status')
        .should('equal', 200); // Expecting status code 200 for a successful deletion
    });
  });
   