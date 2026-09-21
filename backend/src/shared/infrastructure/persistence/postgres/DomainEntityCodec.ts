import { Author } from 'src/books/domain/entities/Author';
import { AssistantChat } from 'src/assistant/domain/entities/AssistantChat';
import { AssistantChatMessage } from 'src/assistant/domain/entities/AssistantChatMessage';
import { Book } from 'src/books/domain/entities/Book';
import { Category } from 'src/books/domain/entities/Category';
import { Editor } from 'src/books/domain/entities/Editor';
import { PrecificationGroup } from 'src/books/domain/entities/PrecificationGroup';
import { Dimensions } from 'src/books/domain/vo/Dimensions';
import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerAddress } from 'src/customers/domain/entities/CustomerAddress';
import { CustomerCreditCard } from 'src/customers/domain/entities/CustomerCreditCard';
import { Coupon } from 'src/sales/domain/entities/Coupon';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { Sale } from 'src/sales/domain/entities/Sale';
import { SaleItem } from 'src/sales/domain/entities/SaleItem';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { Email } from 'src/shared/domain/vo/Email';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Phone } from 'src/shared/domain/vo/Phone';
import { BookSalePrice } from 'src/stock/domain/entities/BookSalePrice';
import { StockBalance } from 'src/stock/domain/entities/StockBalance';
import { StockEntry } from 'src/stock/domain/entities/StockEntry';
import { StockMovement } from 'src/stock/domain/entities/StockMovement';
import { Supplier } from 'src/stock/domain/entities/Supplier';
import { CartItem } from 'src/storefront/domain/entities/CartItem';
import { ShoppingCart } from 'src/storefront/domain/entities/ShoppingCart';
import { PasswordHistory } from 'src/users/domain/entities/PasswordHistory';
import { User } from 'src/users/domain/entities/User';

type Constructor = { prototype: object };
type Encoded = { $type: string; value?: unknown };

const constructors: Record<string, Constructor> = {
  AssistantChat,
  AssistantChatMessage,
  Author,
  Book,
  Category,
  Editor,
  PrecificationGroup,
  Dimensions,
  Customer,
  CustomerAddress,
  CustomerCreditCard,
  Coupon,
  ExchangeRequest,
  Sale,
  SaleItem,
  Email,
  CPF,
  Phone,
  BookSalePrice,
  StockBalance,
  StockEntry,
  StockMovement,
  Supplier,
  CartItem,
  ShoppingCart,
  PasswordHistory,
  User,
};

/** Serializa entidades, VOs, relações e datas sem depender do ORM no domínio. */
export class DomainEntityCodec {
  public encode(value: unknown): unknown {
    if (value instanceof Date)
      return { $type: 'Date', value: value.toISOString() } satisfies Encoded;
    if (Array.isArray(value)) return value.map((item) => this.encode(item));
    if (value && typeof value === 'object') {
      const object = value as Record<string, unknown>;
      const type = value.constructor.name;
      const encoded: Record<string, unknown> = { $type: type };
      for (const [key, item] of Object.entries(object))
        encoded[key] = this.encode(item);
      return encoded;
    }
    return value;
  }

  public decode<T>(value: unknown): T {
    if (Array.isArray(value))
      return value.map((item) => this.decode(item)) as T;
    if (!value || typeof value !== 'object') return value as T;
    const record = value as Record<string, unknown>;
    if (record.$type === 'Date') return new Date(String(record.value)) as T;
    const prototype =
      constructors[String(record.$type)]?.prototype ?? Object.prototype;
    const decoded = Object.create(prototype) as Record<string, unknown>;
    for (const [key, item] of Object.entries(record)) {
      if (key !== '$type') decoded[key] = this.decode(item);
    }
    return decoded as T;
  }

  public encodeEntity(entity: AbstractEntity): unknown {
    return this.encode(entity);
  }
}
