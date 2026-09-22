// Casos que o HTML do formulário bloqueia são enviados direto à API real.
import { expectRejected } from '../../support/assertions';
import { identity, PASSWORD } from '../../support/fixtures';

describe('Auth API — validações de cadastro', () => {
  const signupBody = () => ({ email: identity().email, password: PASSWORD, passwordConfirmation: PASSWORD });

  it('rejeita cadastro sem e-mail', () => {
    const body: any = signupBody();
    delete body.email;
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita cadastro com e-mail inválido', () => {
    const body = signupBody();
    (body as any).email = 'invalido';
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita cadastro sem senha', () => {
    const body: any = signupBody();
    delete body.password;
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita senha curta', () => {
    const body = signupBody();
    body.password = body.passwordConfirmation = 'Aa1!';
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita senha sem letra maiúscula', () => {
    const body = signupBody();
    body.password = body.passwordConfirmation = 'cliente@123';
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita senha sem letra minúscula', () => {
    const body = signupBody();
    body.password = body.passwordConfirmation = 'CLIENTE@123';
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita senha sem caractere especial', () => {
    const body = signupBody();
    body.password = body.passwordConfirmation = 'Cliente123';
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita cadastro sem confirmação de senha', () => {
    const body: any = signupBody();
    delete body.passwordConfirmation;
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });

  it('rejeita confirmação de senha diferente da senha', () => {
    const body = signupBody();
    body.passwordConfirmation = 'Outra@123';
    cy.api('POST', '/auth/sign-up', body).then((r) => expectRejected(r));
  });
});
