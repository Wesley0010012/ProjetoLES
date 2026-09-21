import { ResidenceTypeEnum } from '../src/customers/domain/enums/ResidenceTypeEnum';
import { StreetTypeEnum } from '../src/customers/domain/enums/StreetTypeEnum';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GenderEnum } from '../src/shared/domain/enums/GenderEnum';
import { PhoneTypeEnum } from '../src/shared/domain/enums/PhoneTypeEnum';
import products from '../src/books/infrastructure/persistence/in-memory/catalog-seed.json';

describe('Frontend/backend contracts', () => {
  let app: INestApplication;
  let user: string;
  let admin: string;
  const address = (type: string) => ({
    name: type,
    residenceType: 'Casa',
    streetType: 'Rua',
    street: 'Teste',
    number: '10',
    district: 'Centro',
    zipCode: '01001000',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    type,
  });
  const call = (token: string) => ({
    get: (path: string) =>
      request(app.getHttpServer()).get(path).auth(token, { type: 'bearer' }),
    post: (path: string) =>
      request(app.getHttpServer()).post(path).auth(token, { type: 'bearer' }),
    put: (path: string) =>
      request(app.getHttpServer()).put(path).auth(token, { type: 'bearer' }),
    delete: (path: string) =>
      request(app.getHttpServer()).delete(path).auth(token, { type: 'bearer' }),
  });
  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.init();
    user = (
      await request(app.getHttpServer())
        .post('/auth/demo-session')
        .send({ type: 'USER' })
        .expect(201)
    ).body.token;
    admin = (
      await request(app.getHttpServer())
        .post('/auth/demo-session')
        .send({ type: 'OPERATOR' })
        .expect(201)
    ).body.token;
  });
  afterAll(async () => {
    await app?.close();
  });
  it('publishes customer options directly from the backend enums', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/metadata/customer-options')
      .expect(200);
    expect(body.residenceTypes.map((option: { value: string }) => option.value)).toEqual(Object.values(ResidenceTypeEnum));
    expect(body.streetTypes.map((option: { value: string }) => option.value)).toEqual(Object.values(StreetTypeEnum));
    expect(body.genders.map((option: { value: string }) => option.value)).toEqual(Object.values(GenderEnum));
    expect(body.phoneTypes.map((option: { value: string }) => option.value)).toEqual(Object.values(PhoneTypeEnum));
    expect([...body.genders, ...body.phoneTypes].every((option: { label: string }) => typeof option.label === 'string' && option.label.length > 0)).toBe(true);
  });
  it('exposes the configured book prices in the catalog and product details', async () => {
    const { body: catalog } = await request(app.getHttpServer())
      .get('/books')
      .expect(200);
    for (const product of products) {
      expect(catalog.find((book: { id: number }) => book.id === product.id)?.price)
        .toBe(product.price);
    }
    const { body: detail } = await request(app.getHttpServer())
      .get(`/books/${products[0].id}`)
      .expect(200);
    expect(detail.price).toBe(products[0].price);
  });
  it('returns the session metadata needed to open the customer account', async () => {
    const { body: session } = await request(app.getHttpServer())
      .post('/auth/demo-session')
      .send({ type: 'USER' })
      .expect(201);
    expect(session.token).toEqual(expect.any(String));
    expect(session.userId).toEqual(expect.any(Number));
    expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
    const { body: profile } = await call(session.token)
      .get(`/users/${session.userId}/customer`)
      .expect(200);
    expect(profile.complete).toBe(true);
    expect(profile.customer.name).toEqual(expect.any(String));
  });
  it('separates the fixed customer and admin and keeps catalog maintenance disabled', async () => {
    await call(user).get('/admin/customers').expect(403);
    await call(admin).get('/customer/orders').expect(403);
    await call(user).get('/users/3/customer').expect(403);
    await call(admin).post('/admin/customers').send({}).expect(404);
    await call(admin).post('/admin/books').send({}).expect(404);
    await call(admin).put('/admin/books/1').send({}).expect(404);
    await call(admin).delete('/admin/categories/1').expect(404);
    const products = (
      await request(app.getHttpServer()).get('/storefront/products').expect(200)
    ).body;
    expect(products).toHaveLength(100);
    expect(
      products.every((p: { coverImage: string }) =>
        p.coverImage.startsWith('/images/books/'),
      ),
    ).toBe(true);
    await call(admin).get('/admin/books').expect(200);
    await call(admin).get('/admin/sales').expect(200);
    await call(admin)
      .get(
        '/admin/sales/analysis?startDate=2026-01-01&endDate=2026-12-31&groupBy=PRODUCT',
      )
      .expect(200)
      .expect(({ body }) => {
        expect(body[0].points[0].quantity).toEqual(expect.any(Number));
      });
  });
  it('paginates sales and exchanges and validates pagination parameters', async () => {
    for (const path of [
      '/admin/sales',
      '/admin/sales/customer/2',
      '/admin/sales/exchanges',
    ]) {
      await call(admin)
        .get(`${path}?page=1&pageSize=2`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.entities.length).toBeLessThanOrEqual(2);
          expect(body.totalEntities).toBeGreaterThan(2);
          expect(body.totalPages).toBe(Math.ceil(body.totalEntities / 2));
        });
      await call(admin).get(`${path}?page=0`).expect(400);
      await call(admin).get(`${path}?pageSize=101`).expect(400);
    }
  });
  it('updates customer data, addresses and cards through customer routes', async () => {
    const before = (await call(user).get('/users/1/customer')).body.customer;
    await call(user)
      .put('/users/1/customer')
      .send({
        ...before,
        name: 'Henry Integração',
        phoneType: before.phone.type,
        phoneDdd: before.phone.ddd,
        phoneNumber: before.phone.number,
      })
      .expect(200);
    expect((await call(user).get('/users/1/customer')).body.customer.name).toBe(
      'Henry Integração',
    );
    const added = (
      await call(user)
        .post('/users/1/customer/addresses')
        .send(address('Delivery'))
        .expect(201)
    ).body;
    await call(user)
      .put(`/users/1/customer/addresses/${added.id}`)
      .send({ ...address('Delivery'), name: 'Entrega atualizada' })
      .expect(200);
    await call(user)
      .delete(`/users/1/customer/addresses/${added.id}`)
      .expect(204);
    await call(user).delete('/users/1/customer/addresses/1').expect(400);
    await call(user).delete('/users/1/customer/addresses/5').expect(404);
    const card = (
      await call(user)
        .post('/users/1/customer/cards')
        .send({
          number: '4242424242424242',
          printedName: 'Henry Townshend',
          brand: 'VISA',
          securityCode: '123',
          preferred: false,
        })
        .expect(201)
    ).body;
    await call(user)
      .put(`/users/1/customer/cards/${card.id}`)
      .send({ preferred: false, description: 'Cartão atualizado' })
      .expect(200);
    await call(user).delete(`/users/1/customer/cards/${card.id}`).expect(204);
  });
  it('completes checkout, delivery, exchange and coupon generation across both roles', async () => {
    const cart = (
      await call(user)
        .post('/customer/cart/items')
        .send({ bookId: 1, quantity: 1 })
        .expect(201)
    ).body;
    const sale = (
      await call(user)
        .post('/customer/checkout')
        .send({
          addressId: 3,
          cardPayments: [
            {
              cardId: 1,
              amount:
                Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100,
            },
          ],
          couponCodes: [],
        })
        .expect(201)
    ).body;
    expect(sale.status).toBe('EM_ABERTO');
    await call(admin).post(`/admin/sales/${sale.id}/dispatch`).expect(400);
    await call(admin).post(`/admin/sales/${sale.id}/process`).expect(204);
    await call(admin).post(`/admin/sales/${sale.id}/payment`).expect(204);
    await call(admin).post(`/admin/sales/${sale.id}/dispatch`).expect(204);
    await call(user).post(`/customer/orders/${sale.id}/receipt`).expect(204);
    const exchange = (
      await call(user)
        .post('/customer/exchanges')
        .send({
          saleId: sale.id,
          items: [{ bookId: 1, quantity: 1 }],
          reason: 'Trocar o livro',
        })
        .expect(201)
    ).body;
    await call(admin)
      .post(`/admin/sales/exchanges/${exchange.id}/authorize`)
      .send({ observation: 'Troca aceita' })
      .expect(204);
    await call(user)
      .post(`/customer/exchanges/${sale.id}/dispatch`)
      .expect(204);
    await call(admin)
      .post(`/admin/sales/exchanges/${exchange.id}/arrival`)
      .expect(204);
    const coupon = (
      await call(admin)
        .post(`/admin/sales/exchanges/${exchange.id}/receive`)
        .send({ returnToStock: true, receivedAt: new Date().toISOString() })
        .expect(201)
    ).body;
    expect(
      (await call(user).get('/customer/coupons')).body.some(
        (c: { code: string }) => c.code === coupon.code,
      ),
    ).toBe(true);
    const order = (await call(user).get('/customer/orders')).body.find(
      (o: { id: number }) => o.id === sale.id,
    );
    expect(order.status).toBe('TROCADO');
    expect(order.exchanges[0].reason).toBe('Trocar o livro');
    expect(order.deliveryAddress.street).toBeTruthy();
  });
  it('cancels approved orders and supports rejecting an exchange', async () => {
    const cart = (
      await call(user)
        .post('/customer/cart/items')
        .send({ bookId: 2, quantity: 1 })
    ).body;
    const sale = (
      await call(user)
        .post('/customer/checkout')
        .send({
          addressId: 3,
          cardPayments: [
            {
              cardId: 1,
              amount:
                Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100,
            },
          ],
          couponCodes: [],
        })
    ).body;
    await call(user).post(`/customer/orders/${sale.id}/cancel`).expect(204);
    const exchange = (
      await call(user)
        .post('/customer/exchanges')
        .send({
          saleId: 1,
          items: [{ bookId: 1, quantity: 1 }],
          reason: 'Solicitação de teste',
        })
        .expect(201)
    ).body;
    await call(admin)
      .post(`/admin/sales/exchanges/${exchange.id}/reject`)
      .send({ observation: 'Solicitação recusada' })
      .expect(204);
    await call(user).post('/customer/exchanges/1/dispatch').expect(400);
  });
  it('rejects weak passwords and mismatched confirmations during registration', async () => {
    for (const [password, passwordConfirmation] of [
      ['weak', 'weak'],
      ['Cliente@123', 'Different@123'],
    ]) {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: 'invalid@libra.test',
          password,
          passwordConfirmation,
        })
        .expect(400);
    }
  });
  it('registers a new account and completes its own profile, preserving the self-registration flow', async () => {
    const session = (
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: 'novo@libra.test',
          password: 'Cliente@123',
          passwordConfirmation: 'Cliente@123',
        })
        .expect(201)
    ).body;
    expect(session.token).toEqual(expect.any(String));
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'novo@libra.test',
        password: 'Cliente@123',
        type: 'USER',
      })
      .expect(201);
    const path = `/users/${session.userId}/customer`;
    await call(session.token)
      .post(path)
      .send({
        name: 'Novo Cliente',
        gender: 'MAN',
        birthDate: '1995-01-01',
        document: '93541134780',
        phoneType: 'MOBILE',
        phoneDdd: '11',
        phoneNumber: '987654321',
        addresses: ['Primary', 'Billing', 'Delivery'].map(address),
        cards: [],
      })
      .expect(201);
    expect((await call(session.token).get(path)).body.complete).toBe(true);
    await call(session.token).delete(path).expect(204);
    await call(session.token).get(path).expect(403);
  });
  it('answers assistant requests using the backend catalog', async () => {
    const response = await request(app.getHttpServer())
      .post('/assistant/messages')
      .send({ message: 'Recomende livros de programação', history: [] })
      .expect(201);
    expect(response.body.answer).toEqual(expect.any(String));
    expect(response.body.products.length).toBeGreaterThan(0);
  });
});
