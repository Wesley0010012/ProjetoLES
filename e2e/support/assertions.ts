// Asserções compartilhadas entre specs de validação de API.

export function expectRejected(response: Cypress.Response<any>, status = 400): void {
  expect(response.status, JSON.stringify(response.body)).eq(status);
  expect(response.body.message).to.be.a('string').and.not.empty;
}
