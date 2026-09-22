import './commands';
import { drainCreatedCustomersCarts } from './scenarios';

// Não suprimir uncaught:exception: erros reais da interface devem reprovar a suíte.

afterEach(() => {
  // Libera reservas dos clientes criados pelo teste sem apagar dados de outros testes.
  drainCreatedCustomersCarts();
});
