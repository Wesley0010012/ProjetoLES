// Única camada acoplada ao Cypress para chamadas HTTP.
// Toda a suíte fala com a API através deste cliente — se o runner mudar
// (ex.: Playwright), apenas este arquivo precisa ser reescrito; fixtures,
// tipos e os cenários de negócio em scenarios.ts continuam válidos.

import type { AuthSession } from './types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class ApiClient {
  // Corpo e resposta ficam como `any` de propósito: os specs validam JSON
  // solto vindo da API (payloads de teste, respostas de erro) e forçar um
  // tipo estrito aqui só obrigaria a `as` em cada chamada sem ganho real.
  request<T = any>(
    method: HttpMethod,
    path: string,
    body?: any,
    session?: AuthSession,
  ): Cypress.Chainable<Cypress.Response<T>> {
    return cy.request<T>({
      method,
      url: `/api${path}`,
      body,
      failOnStatusCode: false,
      headers: session ? { Authorization: `Bearer ${session.token}` } : {},
    });
  }

  get<T = unknown>(path: string, session?: AuthSession) {
    return this.request<T>('GET', path, undefined, session);
  }

  post<T = unknown>(path: string, body?: unknown, session?: AuthSession) {
    return this.request<T>('POST', path, body, session);
  }

  put<T = unknown>(path: string, body?: unknown, session?: AuthSession) {
    return this.request<T>('PUT', path, body, session);
  }

  delete<T = unknown>(path: string, session?: AuthSession) {
    return this.request<T>('DELETE', path, undefined, session);
  }
}

export const api = new ApiClient();
