describe("API Testing",()=>{

    it("Passing Query Parameters", ()=>{


        cypress.request({
            method: 'POST',
            url: 'https://reqres.in/api/users',
            qs:{
                page:2
            }
        })
        .then((response)=>{
            expect(response.status).to.eq(200);
            expect()
        })
    })






})