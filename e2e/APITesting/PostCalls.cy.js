    // describe("API Testing", () => {
    
    //     it("Approach1 - Hard Coded JSON object", () => {
    //     const requestBody = {
    //         tourist_name: "MSD",
    //         tourist_email: "INDCAP@gmail.com",
    //         tourist_location: "India"
    //     };
    
    //     cy.request({
    //         method: "POST",
    //         url: "http://restapi.adequateshop.com/api/Tourist",
    //         body: requestBody,
    //     })
    //     .then((response) => {
    //         expect(response.status).to.eq(201);
    //         expect(response.body.tourist_name).to.eq("MSD");
    //         expect(response.body.tourist_email).to.eq("INDCAP@gmail.com");
    //         expect(response.body.tourist_location).to.eq("India");
    //     });
    //     });
    // });
  

      describe("API Testing", () => {
    
        it("Approach2 - Dynamically generating JSON object", () => {
        const requestBody = {
            tourist_name: Math.random().toString(5).substring(2),
            tourist_email: Math.random().toString(5).substring(2)+"@gmail.com",
            tourist_location: "Paris",
        };
    
        cy.request({
            method: "POST",
            url: "https://reqres.in/api/users",
            body: requestBody,
        })
        .then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.tourist_name).to.eq(requestBody.tourist_name);
            expect(response.body.tourist_email).to.eq(requestBody.tourist_email);
            expect(response.body.tourist_location).to.eq(requestBody.tourist_location);
        });
        });
    });