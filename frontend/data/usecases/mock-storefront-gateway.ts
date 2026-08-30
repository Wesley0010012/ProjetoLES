import type {
  CustomerCart,
  CustomerOrder,
  SelfProfile,
  StoreProduct,
  AssistantChatMessage,
  AssistantResponse,
  CustomerCoupon,
} from "@/domain/models/storefront";
import type { StorefrontGateway } from "@/domain/usecases/storefront-gateway";

const coreProductSeeds: Omit<
  StoreProduct,
  "barcode" | "precificationGroup" | "coverImage"
>[] = [
  {
    id: 1,
    code: "LIB-0001",
    title: "Clean Code",
    authors: ["Robert C. Martin"],
    categories: ["Engenharia de software", "Boas práticas", "Programação"],
    editors: ["Prentice Hall"],
    year: 2008,
    edition: "1ª edição",
    isbn: "9780132350884",
    synopsis:
      "Princípios, padrões e práticas para escrever código limpo, legível e sustentável.",
    numberOfPages: 464,
    dimensions: { height: 21, width: 14, weight: 0.42, depth: 2.1 },
    price: 41.6,
    availableQuantity: 20,
    available: true,
  },
  {
    id: 2,
    code: "LIB-0002",
    title: "Domain-Driven Design",
    authors: ["Eric Evans"],
    categories: ["Arquitetura de software", "Engenharia de software"],
    editors: ["Addison-Wesley"],
    year: 2003,
    edition: "1ª edição",
    isbn: "9780321125217",
    synopsis:
      "Uma abordagem estratégica para modelar domínios complexos e alinhar software ao negócio.",
    numberOfPages: 560,
    dimensions: { height: 21, width: 14, weight: 0.48, depth: 2.4 },
    price: 49.4,
    availableQuantity: 15,
    available: true,
  },
  {
    id: 3,
    code: "LIB-0003",
    title: "The Pragmatic Programmer",
    authors: ["Andrew Hunt e David Thomas"],
    categories: ["Programação", "Boas práticas", "Engenharia de software"],
    editors: ["Pearson"],
    year: 2019,
    edition: "20ª edição comemorativa",
    isbn: "9780135957059",
    synopsis:
      "Técnicas práticas para evoluir como profissional e construir software com responsabilidade.",
    numberOfPages: 352,
    dimensions: { height: 20.8, width: 13.6, weight: 0.36, depth: 1.8 },
    price: 28.8,
    availableQuantity: 12,
    available: true,
  },
  {
    id: 4,
    code: "LIB-0004",
    title: "Refactoring",
    authors: ["Martin Fowler"],
    categories: ["Engenharia de software", "Boas práticas"],
    editors: ["Addison-Wesley"],
    year: 2018,
    edition: "2ª edição",
    isbn: "9780134757599",
    synopsis:
      "Técnicas para melhorar a estrutura interna de sistemas sem alterar seu comportamento externo.",
    numberOfPages: 448,
    dimensions: { height: 23, width: 17, weight: 0.61, depth: 2.3 },
    price: 54.9,
    availableQuantity: 9,
    available: true,
  },
  {
    id: 5,
    code: "LIB-0005",
    title: "Design Patterns",
    authors: ["Erich Gamma", "Richard Helm", "Ralph Johnson", "John Vlissides"],
    categories: ["Arquitetura de software", "Engenharia de software"],
    editors: ["Addison-Wesley"],
    year: 1994,
    edition: "1ª edição",
    isbn: "9780201633610",
    synopsis:
      "Soluções reutilizáveis para problemas recorrentes no projeto de software orientado a objetos.",
    numberOfPages: 416,
    dimensions: { height: 24, width: 18, weight: 0.72, depth: 2.5 },
    price: 62.5,
    availableQuantity: 8,
    available: true,
  },
  {
    id: 6,
    code: "LIB-0006",
    title: "Working Effectively with Legacy Code",
    authors: ["Michael Feathers"],
    categories: ["Engenharia de software", "Testes", "Boas práticas"],
    editors: ["Prentice Hall"],
    year: 2004,
    edition: "1ª edição",
    isbn: "9780131177055",
    synopsis:
      "Estratégias seguras para testar, compreender e modificar sistemas legados.",
    numberOfPages: 456,
    dimensions: { height: 23, width: 17, weight: 0.64, depth: 2.4 },
    price: 47.9,
    availableQuantity: 6,
    available: true,
  },
  {
    id: 7,
    code: "LIB-0007",
    title: "Test-Driven Development",
    authors: ["Kent Beck"],
    categories: ["Testes", "Programação", "Boas práticas"],
    editors: ["Addison-Wesley"],
    year: 2002,
    edition: "1ª edição",
    isbn: "9780321146533",
    synopsis:
      "Desenvolvimento guiado por testes apresentado por meio de exemplos progressivos e práticos.",
    numberOfPages: 240,
    dimensions: { height: 23, width: 17, weight: 0.38, depth: 1.5 },
    price: 36.9,
    availableQuantity: 14,
    available: true,
  },
  {
    id: 8,
    code: "LIB-0008",
    title: "Building Microservices",
    authors: ["Sam Newman"],
    categories: ["Arquitetura de software", "Sistemas distribuídos"],
    editors: ["O'Reilly Media"],
    year: 2021,
    edition: "2ª edição",
    isbn: "9781492034025",
    synopsis:
      "Princípios e decisões para projetar, implantar e evoluir arquiteturas baseadas em microsserviços.",
    numberOfPages: 612,
    dimensions: { height: 23.5, width: 17.8, weight: 0.82, depth: 3.1 },
    price: 58.4,
    availableQuantity: 11,
    available: true,
  },
  {
    id: 9,
    code: "LIB-0009",
    title: "Clean Architecture",
    authors: ["Robert C. Martin"],
    categories: ["Arquitetura de software", "Engenharia de software", "Boas práticas"],
    editors: ["Prentice Hall"],
    year: 2017,
    edition: "1ª edição",
    isbn: "9780134494166",
    synopsis:
      "Fundamentos para organizar sistemas independentes de frameworks, interfaces e detalhes externos.",
    numberOfPages: 432,
    dimensions: { height: 23, width: 17, weight: 0.59, depth: 2.2 },
    price: 45.8,
    availableQuantity: 16,
    available: true,
  },
  {
    id: 10,
    code: "LIB-0010",
    title: "Patterns of Enterprise Application Architecture",
    authors: ["Martin Fowler"],
    categories: ["Arquitetura de software", "Sistemas corporativos"],
    editors: ["Addison-Wesley"],
    year: 2002,
    edition: "1ª edição",
    isbn: "9780321127426",
    synopsis:
      "Catálogo de padrões para estruturar aplicações corporativas e suas camadas de persistência e domínio.",
    numberOfPages: 560,
    dimensions: { height: 24, width: 18, weight: 0.79, depth: 2.9 },
    price: 64.2,
    availableQuantity: 5,
    available: true,
  },
  {
    id: 11,
    code: "LIB-0011",
    title: "Release It!",
    authors: ["Michael T. Nygard"],
    categories: ["Sistemas distribuídos", "DevOps", "Arquitetura de software"],
    editors: ["Pragmatic Bookshelf"],
    year: 2018,
    edition: "2ª edição",
    isbn: "9781680502398",
    synopsis:
      "Padrões de estabilidade e resiliência para sistemas preparados para produção.",
    numberOfPages: 376,
    dimensions: { height: 23, width: 18, weight: 0.55, depth: 2.0 },
    price: 42.7,
    availableQuantity: 7,
    available: true,
  },
  {
    id: 12,
    code: "LIB-0012",
    title: "Accelerate",
    authors: ["Nicole Forsgren", "Jez Humble", "Gene Kim"],
    categories: ["DevOps", "Engenharia de software", "Gestão de tecnologia"],
    editors: ["IT Revolution"],
    year: 2018,
    edition: "1ª edição",
    isbn: "9781942788331",
    synopsis:
      "Pesquisa sobre práticas técnicas e organizacionais associadas ao desempenho de equipes de tecnologia.",
    numberOfPages: 288,
    dimensions: { height: 22.8, width: 15.2, weight: 0.43, depth: 1.7 },
    price: 39.6,
    availableQuantity: 10,
    available: true,
  },
];
const additionalBookDefinitions: [string, string, number, string, number, string][] = [
  ["Bobby Fischer Teaches Chess", "Bobby Fischer", 1966, "0701516097", 7376530, "Xadrez"],
  ["Modern Chess Openings", "John Herbert White", 1911, "0679141065", 4067980, "Xadrez"],
  [
    "How to Reassess Your Chess",
    "Jeremy Silman",
    1991,
    "9781890085001",
    938081,
    "Xadrez",
  ],
  ["The Art of Learning", "Josh Waitzkin", 2007, "1416538860", 475008, "Xadrez"],
  ["My System", "Aron Nimzowitsch", 1925, "9781607964520", 15023018, "Xadrez"],
  ["The Amateur's Mind", "Jeremy Silman", 1995, "1890085022", 938083, "Xadrez"],
  ["Begin Chess", "David B. Pritchard", 1973, "0716007487", 1236519, "Xadrez"],
  ["My 60 Memorable Games", "Bobby Fischer", 1969, "1849948496", 3364419, "Xadrez"],
  ["Chess Master vs. Chess Amateur", "Max Euwe", 1963, "2228886955", 9320211, "Xadrez"],
  [
    "Logical Chess, Move by Move",
    "Irving Chernev",
    1957,
    "9780713484649",
    6877988,
    "Xadrez",
  ],
  ["The Soviet Chess Primer", "Ilya Maizelis", 2014, "9781784831448", 11149566, "Xadrez"],
  [
    "Silman's Complete Endgame Course",
    "Jeremy Silman",
    2007,
    "1890085103",
    938090,
    "Xadrez",
  ],
  ["Chess for Dummies", "James Eade", 1996, "9780470389416", 521598, "Xadrez"],
  [
    "Chess Fundamentals",
    "José Raúl Capablanca",
    1921,
    "9781544608372",
    7313798,
    "Xadrez",
  ],
  ["Play Winning Chess", "Yasser Seirawan", 1990, "1857443314", 1304686, "Xadrez"],
  ["Win at Chess", "Fred Reinfeld", 1945, "0486204383", 313298, "Xadrez"],
  ["Chess", "Laszlo Polgar", 1995, "3829005075", 931396, "Xadrez"],
  [
    "The Art of Attack in Chess",
    "Vladimir Vuković",
    1965,
    "9781857444001",
    909565,
    "Xadrez",
  ],
  ["The Queen's Gambit", "Walter S. Tevis", 1983, "1399601482", 9319360, "Xadrez"],
  ["Discovering Chess Openings", "John Emms", 2006, "8425520355", 2056972, "Xadrez"],
  ["Misery", "Stephen King", 1978, "0606395687", 8259296, "Terror"],
  ["The Shining", "Stephen King", 1977, "9780451193889", 12376585, "Terror"],
  ["The Exorcist", "William Peter Blatty", 1971, "9788412198867", 12715730, "Terror"],
  ["Cujo", "Stephen King", 1981, "9780751504408", 8570003, "Terror"],
  ["The Hellbound Heart", "Clive Barker", 1991, "0061452882", 1726053, "Terror"],
  ["The Long Walk", "Stephen King", 1979, "9788556511614", 14653609, "Terror"],
  ["It", "Stephen King", 1986, "9784167148072", 8569284, "Terror"],
  ["Christine", "Stephen King", 1983, "9789752112575", 14655985, "Terror"],
  ["Four Past Midnight", "Stephen King", 1990, "2277236705", 8413143, "Terror"],
  ["Fear Street: The Knife", "R. L. Stine", 1991, "9783785533529", 2547647, "Terror"],
  ["The Great God Pan", "Arthur Machen", 1894, "1727724860", 921610, "Terror"],
  ["House of Leaves", "Mark Z. Danielewski", 1998, "9786055159719", 6450442, "Terror"],
  ["Twisted Games", "Ana Huang", 2021, "9780349434315", 12821465, "Romance"],
  ["Twisted Love", "Ana Huang", 2021, "9788408260509", 12940491, "Romance"],
  ["Twisted Hate", "Ana Huang", 2022, "9781728274881", 12928487, "Romance"],
  ["Corrupt", "Penelope Douglas", 2015, "6073911203", 10226443, "Romance"],
  ["Punk 57", "Penelope Douglas", 2016, "9780593641996", 10107803, "Romance"],
  ["It Starts with Us", "Colleen Hoover", 2022, "8408267191", 12749873, "Romance"],
  ["The Sweetest Oblivion", "Danielle Lori", 2018, "1721284443", 10831263, "Romance"],
  ["The Fine Print", "Lauren Asher", 2021, "1737507714", 14319054, "Romance"],
  ["Twisted Lies", "Ana Huang", 2022, "034943428X", 14425197, "Romance"],
  ["Heated Rivalry", "Rachel Reid", 2019, "9781038986597", 15226452, "Romance"],
  ["It Ends with Us", "Colleen Hoover", 2012, "3423432837", 10473609, "Romance"],
  ["Breaking Point", "Emma Darcy", 1992, "9780263134186", 10387434, "Romance"],
  ["Quicksilver", "Callie Hart", 2024, "9781538775790", 15227615, "Alquimia"],
  ["Alchemy", "Stanislas Klossowski de Rola", 1973, "9780500810033", 317278, "Alquimia"],
  ["Alchemy", "Eric John Holmyard", 1957, "9780486262987", 310703, "Alquimia"],
  [
    "Dictionary of Occult, Hermetic and Alchemical Sigils",
    "Fred Gettings",
    1981,
    "0710000952",
    4365840,
    "Alquimia",
  ],
  [
    "Picatrix",
    "Maslamah ibn Ahmad al-Majriti",
    1933,
    "9780966295009",
    13867098,
    "Alquimia",
  ],
  ["A Discovery of Witches", "Deborah Harkness", 2011, "0670022411", 6998669, "Alquimia"],
  ["Real Alchemy", "Robert Allen Bartlett", 2006, "9781847284785", 897691, "Alquimia"],
  [
    "Alchemy: Science of the Cosmos",
    "Titus Burckhardt",
    1960,
    "9783926253859",
    935306,
    "Alquimia",
  ],
  ["Fullmetal Alchemist 1", "Hiromu Arakawa", 2002, "9784757506206", 863658, "Alquimia"],
  ["Alchemy & Mysticism", "Alexander Roob", 1997, "3836549360", 1030563, "Alquimia"],
  ["Chemistry", "Theodore L. Brown", 1977, "0134557328", 9407725, "Química"],
  ["Introductory Chemistry", "Steven S. Zumdahl", 1990, "0618388036", 1333055, "Química"],
  ["General Chemistry", "James E. Brady", 1975, "9780471019107", 4089838, "Química"],
  [
    "Foundations of College Chemistry",
    "Morris Hein",
    1967,
    "0471779911",
    6598795,
    "Química",
  ],
  ["Physical Chemistry", "Robert A. Alberty", 1955, "9780471552208", 3963744, "Química"],
  [
    "Industrial Chemicals",
    "William Lawrence Faith",
    1975,
    "9780471549642",
    4483483,
    "Química",
  ],
  [
    "Chemistry: A Molecular Approach",
    "Nivaldo J. Tro",
    1996,
    "1269441884",
    9640101,
    "Química",
  ],
  [
    "Fundamentals of Analytical Chemistry",
    "Douglas A. Skoog",
    1963,
    "9780030894954",
    7063702,
    "Química",
  ],
  [
    "Operational Organic Chemistry",
    "John W. Lehman",
    1981,
    "0205112552",
    4128310,
    "Química",
  ],
  ["Organic Chemistry", "Ralph J. Fessenden", 1979, "0871507242", 8577311, "Química"],
  [
    "Concepts of Physics",
    "Harish Chandra Verma",
    1993,
    "9788177091878",
    8631889,
    "Física",
  ],
  ["Relativity", "Albert Einstein", 1917, "1019377984", 10478466, "Física"],
  ["Physics", "Douglas C. Giancoli", 1980, "9780130352569", 9153769, "Física"],
  [
    "Seven Brief Lessons on Physics",
    "Carlo Rovelli",
    2014,
    "8716345878",
    7398110,
    "Física",
  ],
  ["Modern Physics", "Kenneth S. Krane", 1983, "9781119495553", 10504052, "Física"],
  ["College Physics", "Randall D. Knight", 2006, "032159634X", 5375397, "Física"],
  ["Fundamentals of Physics", "David Halliday", 1970, "9780471332350", 1246724, "Física"],
  [
    "Physics for Scientists and Engineers",
    "Paul A. Tipler",
    1990,
    "9780716708094",
    1855030,
    "Física",
  ],
  ["Conceptual Physics", "Paul G. Hewitt", 1971, "0805384421", 7065516, "Física"],
  [
    "Light, Magnetism, and Electricity",
    "Isaac Asimov",
    1966,
    "9780451619426",
    10655842,
    "Física",
  ],
  [
    "Introductory Mathematical Analysis",
    "Ernest F. Haeussler",
    1973,
    "9780130338556",
    10572268,
    "Matemática",
  ],
  [
    "Discrete Mathematics with Applications",
    "Susanna S. Epp",
    1990,
    "0534359450",
    9295752,
    "Matemática",
  ],
  [
    "What Is Mathematics?",
    "Richard Courant",
    1941,
    "9788833912004",
    123325,
    "Matemática",
  ],
  ["Algorithms to Live By", "Brian Christian", 2016, "0008166099", 8042539, "Matemática"],
  ["Calculus", "James Stewart", 1986, "9780840058188", 364094, "Matemática"],
  [
    "How to Lie with Statistics",
    "Darrell Huff",
    1954,
    "9780393094268",
    13115835,
    "Matemática",
  ],
  ["How to Solve It", "George Pólya", 1945, "9788087888650", 8404335, "Matemática"],
  [
    "Hands-On Machine Learning",
    "Aurélien Géron",
    2019,
    "9781098122461",
    9388208,
    "Matemática",
  ],
  ["Humble Pi", "Matt Parker", 2019, "8491991913", 10530378, "Matemática"],
  ["Applied Mathematics", "Frank S. Budnick", 1979, "0071125809", 9935503, "Matemática"],
  [
    "Automate the Boring Stuff with Python",
    "Al Sweigart",
    2015,
    "1718503407",
    7363640,
    "Programação",
  ],
  [
    "The C Programming Language",
    "Brian W. Kernighan",
    1978,
    "9780131107502",
    6684943,
    "Programação",
  ],
  [
    "The Mythical Man-Month",
    "Frederick P. Brooks",
    1974,
    "9780201006506",
    6915361,
    "Programação",
  ],
  [
    "Structure and Interpretation of Computer Programs",
    "Harold Abelson",
    1985,
    "9787111135104",
    149338,
    "Programação",
  ],
];
const categoryEditors: Record<string, string> = {
  Xadrez: "Editora Gambito",
  Terror: "Noite Editorial",
  Romance: "Páginas do Coração",
  Alquimia: "Hermes Press",
  Química: "Ciência Viva",
  Física: "Horizonte Científico",
  Matemática: "Soma Editorial",
  Programação: "Código Aberto",
};
const generatedProductSeeds: Omit<
  StoreProduct,
  "barcode" | "precificationGroup" | "coverImage"
>[] = additionalBookDefinitions.map(
  ([title, author, year, isbn, coverId, category], index) => {
    const id = index + 13;
    return {
      id,
      code: `LIB-${String(id).padStart(4, "0")}`,
      title,
      authors: [author],
      categories: [subcategory(title, category), category],
      editors: [categoryEditors[category]],
      year,
      edition: "1ª edição",
      isbn,
      synopsis: `${title}, de ${author}, é uma obra de referência na categoria ${category.toLocaleLowerCase("pt-BR")}.`,
      numberOfPages: 180 + (id % 9) * 32,
      dimensions: {
        height: 23,
        width: 16,
        weight: 0.35 + (id % 6) * 0.06,
        depth: 1.4 + (id % 5) * 0.25,
      },
      price: Math.round((29.9 + (id % 8) * 5.4) * 100) / 100,
      availableQuantity: 5 + (id % 21),
      available: true,
      originalCoverId: coverId,
    } as Omit<StoreProduct, "barcode" | "precificationGroup" | "coverImage"> & {
      originalCoverId: number;
    };
  },
);
const productSeeds = [...coreProductSeeds, ...generatedProductSeeds];
export const mockStoreProducts: StoreProduct[] = productSeeds.map((product) => ({
  ...product,
  coverImage:
    "originalCoverId" in product
      ? `https://covers.openlibrary.org/b/id/${product.originalCoverId}-L.jpg`
      : `https://covers.openlibrary.org/b/isbn/${product.isbn}-L.jpg`,
  barcode: `789${String(product.id).padStart(10, "0")}`,
  precificationGroup: {
    id: product.price >= 55 ? 2 : 1,
    name: product.price >= 55 ? "Especializada" : "Padrão",
    profitMarginPercentage: product.price >= 55 ? 40 : 35,
  },
}));
const products = mockStoreProducts;
let cart: CustomerCart = { id: 1, items: [], subtotal: 0, estimatedFreight: 10 };
let profile: SelfProfile = {
  complete: true,
  customer: {
    id: 1,
    code: "CLI-000001",
    name: "Henry Townshend",
    gender: "MAN",
    birthDate: "1990-05-15",
    document: "52998224725",
    phone: { type: "MOBILE", ddd: "11", number: "987654321" },
    email: "henry.townshend@libra.com.br",
  },
  addresses: [
    {
      id: 1,
      name: "Residencial principal",
      street: "dos Compiladores",
      number: "302",
      city: "São Paulo",
      state: "SP",
      primary: true,
      billing: false,
      delivery: false,
    },
    {
      id: 2,
      name: "Cobrança",
      street: "dos Algoritmos",
      number: "10",
      city: "São Paulo",
      state: "SP",
      primary: false,
      billing: true,
      delivery: false,
    },
    {
      id: 3,
      name: "Entrega",
      street: "da Arquitetura",
      number: "42",
      city: "São Paulo",
      state: "SP",
      primary: false,
      billing: false,
      delivery: true,
    },
  ],
  cards: [
    {
      id: 1,
      lastFourDigits: "4242",
      printedName: "HENRY TOWNSHEND",
      brand: "VISA",
      preferred: true,
    },
    {
      id: 2,
      lastFourDigits: "8899",
      printedName: "HENRY TOWNSHEND",
      brand: "MASTERCARD",
      preferred: false,
    },
  ],
};
let active = true;
const passwordHistoryLimit = 3;
let passwordHistory = ["Libra@123!", "Anterior@123!", "Leitura@123!"];
let orders: CustomerOrder[] = [
  {
    id: 1,
    code: "VEN-000001",
    status: "EM_TRANSITO",
    saleDate: "2026-08-18T14:30:00.000Z",
    freight: 12,
    subtotal: 83.2,
    discount: 0,
    total: 95.2,
    deliveryAddress: {
      name: "Entrega",
      street: "da Arquitetura",
      number: "42",
      city: "São Paulo",
      state: "SP",
    },
    coupons: [],
    payments: [{ cardId: 1, brand: "VISA", lastFourDigits: "4242", amount: 95.2 }],
    items: [
      { bookId: 1, title: "Clean Code", quantity: 2, unitPrice: 41.6, total: 83.2 },
    ],
  },
  {
    id: 2,
    code: "VEN-000002",
    status: "ENTREGUE",
    saleDate: "2026-07-10T10:00:00.000Z",
    freight: 10,
    subtotal: 49.4,
    discount: 0,
    total: 59.4,
    deliveryAddress: {
      name: "Entrega",
      street: "da Arquitetura",
      number: "42",
      city: "São Paulo",
      state: "SP",
    },
    coupons: [],
    payments: [{ cardId: 1, brand: "VISA", lastFourDigits: "4242", amount: 59.4 }],
    items: [
      {
        bookId: 2,
        title: "Domain-Driven Design",
        quantity: 1,
        unitPrice: 49.4,
        total: 49.4,
      },
    ],
  },
];
const customerCoupons: CustomerCoupon[] = [
  {
    code: "LIBRA10",
    type: "PROMOTIONAL",
    discountType: "PERCENTAGE",
    value: 10,
    description: "Desconto promocional em qualquer pedido",
    active: true,
    used: false,
  },
  {
    code: "TROCA-000001",
    type: "EXCHANGE",
    discountType: "FIXED",
    value: 41.6,
    description: "Crédito gerado por troca de item",
    active: true,
    used: false,
  },
];

export class MockStorefrontGateway implements StorefrontGateway {
  public async products(query?: string, category?: string): Promise<StoreProduct[]> {
    const normalizedQuery = query?.trim().toLocaleLowerCase("pt-BR");
    return products.filter(
      (item) =>
        (!normalizedQuery ||
          [
            item.title,
            item.code,
            item.isbn,
            item.barcode,
            item.synopsis,
            ...item.authors,
            ...item.categories,
          ].some((value) =>
            value.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
          )) &&
        (!category || item.categories.includes(category)),
    );
  }
  public async product(id: number): Promise<StoreProduct | null> {
    return products.find((item) => item.id === id) ?? null;
  }
  public async categories(): Promise<string[]> {
    return [...new Set(products.flatMap((item) => item.categories))];
  }
  public async publicRecommendations(): Promise<StoreProduct[]> {
    return products;
  }
  public async recommendations(): Promise<StoreProduct[]> {
    return products.map((item) => ({
      ...item,
      recommendationReason: "Selecionado para o seu perfil",
    }));
  }
  public async profile(): Promise<SelfProfile> {
    return {
      ...profile,
      complete: active && profile.complete,
      addresses: [...(profile.addresses ?? [])],
      cards: [...(profile.cards ?? [])],
    };
  }
  public async completeProfile(payload: Record<string, unknown>): Promise<void> {
    const addresses = (
      Array.isArray(payload.addresses) ? payload.addresses : []
    ) as Record<string, unknown>[];
    const cards = (Array.isArray(payload.cards) ? payload.cards : []) as Record<
      string,
      unknown
    >[];
    profile = {
      complete: true,
      customer: {
        id: 1,
        code: "CLI-000001",
        name: String(payload.name ?? "Cliente Libra"),
        gender: String(payload.gender ?? "NOT_INFORMED"),
        birthDate: String(payload.birthDate ?? "1990-01-01"),
        document: String(payload.document ?? ""),
        phone: {
          type: String(payload.phoneType ?? "MOBILE"),
          ddd: String(payload.phoneDdd ?? "11"),
          number: String(payload.phoneNumber ?? ""),
        },
        email: profile.customer?.email ?? "cliente@libra.com.br",
      },
      addresses: addresses.map((address, index) => ({
        id: index + 1,
        name: String(address.name ?? `Endereço ${index + 1}`),
        street: String(address.street ?? ""),
        number: String(address.number ?? ""),
        city: String(address.city ?? ""),
        state: String(address.state ?? ""),
        primary: index === 0,
        billing: index === 0 ? false : Boolean(address.billing),
        delivery: index === 0 ? false : Boolean(address.delivery),
      })),
      cards: cards.map((card, index) => {
        const number = String(card.number ?? "0000");
        return {
          id: index + 1,
          lastFourDigits: number.slice(-4),
          printedName: String(card.printedName ?? "CLIENTE LIBRA"),
          brand: String(card.brand ?? "VISA"),
          preferred: Boolean(card.preferred),
        };
      }),
    };
    active = true;
  }
  public async updateProfile(payload: Record<string, unknown>): Promise<void> {
    if (!profile.customer) return;
    profile = {
      ...profile,
      customer: {
        ...profile.customer,
        name: String(payload.name ?? profile.customer.name),
        email: String(payload.email ?? profile.customer.email),
        birthDate: String(payload.birthDate ?? profile.customer.birthDate),
        phone: {
          ...profile.customer.phone,
          ddd: String(payload.ddd ?? profile.customer.phone.ddd),
          number: String(payload.phone ?? profile.customer.phone.number),
        },
      },
    };
  }
  public async inactivateProfile(): Promise<void> {
    active = false;
  }
  public async addAddress(payload: Record<string, unknown>): Promise<void> {
    const addresses = profile.addresses ?? [];
    profile = {
      ...profile,
      addresses: [
        ...addresses,
        {
          id: Math.max(0, ...addresses.map((item) => item.id)) + 1,
          name: String(payload.name ?? "Novo endereço"),
          street: String(payload.street ?? ""),
          number: String(payload.number ?? ""),
          city: String(payload.city ?? ""),
          state: String(payload.state ?? ""),
          primary: false,
          billing: Boolean(payload.billing),
          delivery: Boolean(payload.delivery),
        },
      ],
    };
  }
  public async updateAddress(
    id: number,
    payload: Record<string, unknown>,
  ): Promise<void> {
    profile = {
      ...profile,
      addresses: (profile.addresses ?? []).map((address) =>
        address.id === id
          ? {
              ...address,
              name: String(payload.name ?? address.name),
              street: String(payload.street ?? address.street),
              number: String(payload.number ?? address.number),
              city: String(payload.city ?? address.city),
              state: String(payload.state ?? address.state),
              billing: address.primary ? false : Boolean(payload.billing),
              delivery: address.primary ? false : Boolean(payload.delivery),
            }
          : address,
      ),
    };
  }
  public async deleteAddress(id: number): Promise<void> {
    const address = (profile.addresses ?? []).find((item) => item.id === id);
    if (address?.primary) throw new Error("O endereço principal não pode ser excluído.");
    profile = {
      ...profile,
      addresses: (profile.addresses ?? []).filter((item) => item.id !== id),
    };
  }
  public async addCard(payload: Record<string, unknown>): Promise<void> {
    const cards = profile.cards ?? [];
    const number = String(payload.number ?? "0000");
    const preferred = cards.length === 0 || Boolean(payload.preferred);
    profile = {
      ...profile,
      cards: [
        ...cards.map((card) => (preferred ? { ...card, preferred: false } : card)),
        {
          id: Math.max(0, ...cards.map((item) => item.id)) + 1,
          lastFourDigits: number.slice(-4),
          printedName: String(payload.printedName ?? "CLIENTE LIBRA"),
          brand: String(payload.brand ?? "VISA"),
          preferred,
          description: String(payload.description ?? ""),
        },
      ],
    };
  }
  public async updateCard(id: number, payload: Record<string, unknown>): Promise<void> {
    const makePreferred = Boolean(payload.preferred);
    profile = {
      ...profile,
      cards: (profile.cards ?? []).map((card) => ({
        ...card,
        preferred: makePreferred ? card.id === id : card.preferred,
        description:
          card.id === id
            ? String(payload.description ?? card.description ?? "")
            : card.description,
      })),
    };
  }
  public async deleteCard(id: number): Promise<void> {
    const cards = profile.cards ?? [];
    const removedWasPreferred = cards.some((card) => card.id === id && card.preferred);
    const remaining = cards.filter((item) => item.id !== id);
    profile = {
      ...profile,
      cards: remaining.map((card, index) => ({
        ...card,
        preferred: removedWasPreferred ? index === 0 : card.preferred,
      })),
    };
  }
  public async changePassword(
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    if (password !== passwordConfirmation)
      throw new Error("A confirmação deve ser igual à nova senha.");
    if (currentPassword && currentPassword !== passwordHistory[0])
      throw new Error("A senha atual está incorreta.");
    if (passwordHistory.slice(0, passwordHistoryLimit).includes(password))
      throw new Error(
        `Esta senha já foi utilizada entre as últimas ${passwordHistoryLimit}. Escolha uma senha diferente.`,
      );
    passwordHistory = [password, ...passwordHistory].slice(0, passwordHistoryLimit);
  }
  public async cart(): Promise<CustomerCart> {
    return cart;
  }
  public async addToCart(bookId: number, quantity: number): Promise<CustomerCart> {
    const product = products.find((item) => item.id === bookId)!;
    const existing = cart.items.find((item) => item.bookId === bookId);
    if (existing) existing.quantity += quantity;
    else
      cart.items.push({
        bookId,
        code: product.code,
        title: product.title,
        authors: product.authors,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity,
      });
    return this.recalculate();
  }
  public async updateCart(bookId: number, quantity: number): Promise<CustomerCart> {
    const item = cart.items.find((entry) => entry.bookId === bookId)!;
    item.quantity = quantity;
    return this.recalculate();
  }
  public async removeFromCart(bookId: number): Promise<CustomerCart> {
    cart.items = cart.items.filter((item) => item.bookId !== bookId);
    return this.recalculate();
  }
  public async checkout(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const code = `VEN-${String(orders.length + 1).padStart(6, "0")}`;
    const couponCodes = Array.isArray(payload.couponCodes)
      ? payload.couponCodes.map(String)
      : [];
    const grossTotal = cart.subtotal + cart.estimatedFreight;
    const discount = couponDiscount(
      grossTotal,
      customerCoupons.filter((coupon) => couponCodes.includes(coupon.code)),
    );
    const total = Math.max(0, Math.round((grossTotal - discount) * 100) / 100);
    const address = (profile.addresses ?? []).find(
      (item) => item.id === Number(payload.addressId),
    );
    const rawPayments = (
      Array.isArray(payload.cardPayments) ? payload.cardPayments : []
    ) as { cardId: number; amount: number }[];
    const payments = rawPayments.map((payment) => {
      const card = (profile.cards ?? []).find((item) => item.id === payment.cardId);
      return {
        cardId: payment.cardId,
        brand: card?.brand ?? "Cartão",
        lastFourDigits: card?.lastFourDigits ?? "••••",
        amount: payment.amount,
      };
    });
    orders = [
      {
        id: orders.length + 1,
        code,
        status: "EM_ABERTO",
        saleDate: new Date().toISOString(),
        freight: cart.estimatedFreight,
        subtotal: cart.subtotal,
        discount,
        total,
        deliveryAddress: address
          ? {
              name: address.name,
              street: address.street,
              number: address.number,
              city: address.city,
              state: address.state,
            }
          : undefined,
        coupons: couponCodes,
        payments,
        items: cart.items.map((item) => ({
          bookId: item.bookId,
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
      ...orders,
    ];
    cart = { id: 1, items: [], subtotal: 0, estimatedFreight: 10 };
    return { code, status: "EM_ABERTO" };
  }
  public async orders(): Promise<CustomerOrder[]> {
    return orders.map((order) => ({ ...order, items: [...order.items] }));
  }
  public async confirmReceipt(saleId: number): Promise<void> {
    orders = orders.map((order) =>
      order.id === saleId ? { ...order, status: "ENTREGUE" } : order,
    );
  }
  public async cancelOrder(saleId: number): Promise<void> {
    orders = orders.map((order) =>
      order.id === saleId ? { ...order, status: "CANCELADO" } : order,
    );
  }
  public async requestExchange(
    saleId: number,
    items: { bookId: number; quantity: number }[],
    reason: string,
  ): Promise<{ id: number; code: string }> {
    const code = `TRO-${String(orders.flatMap((order) => order.exchanges ?? []).length + 1).padStart(6, "0")}`;
    orders = orders.map((order) =>
      order.id === saleId
        ? {
            ...order,
            status: "TROCA_SOLICITADA",
            exchanges: [
              ...(order.exchanges ?? []),
              {
                code,
                reason,
                status: "TROCA_SOLICITADA",
                items: items.map((requested) => ({
                  ...requested,
                  title:
                    order.items.find((item) => item.bookId === requested.bookId)?.title ??
                    "Item",
                })),
              },
            ],
          }
        : order,
    );
    return { id: 1, code };
  }
  public async dispatchExchange(saleId: number): Promise<void> {
    orders = orders.map((order) =>
      order.id === saleId ? { ...order, status: "ITEM_ENVIADO" } : order,
    );
  }
  public async coupons(): Promise<CustomerCoupon[]> {
    return [...customerCoupons];
  }
  public async askAssistant(
    message: string,
    history: AssistantChatMessage[],
  ): Promise<AssistantResponse> {
    const normalized = message.toLocaleLowerCase("pt-BR");
    const matches = products.filter((product) =>
      [product.title, product.synopsis, ...product.authors, ...product.categories].some(
        (value) =>
          normalized
            .split(/\s+/)
            .some(
              (term) =>
                term.length > 3 && value.toLocaleLowerCase("pt-BR").includes(term),
            ),
      ),
    );
    return {
      answer:
        matches.length > 0
          ? `${supportAnswer(normalized)} Separei ${matches.length} livro(s) relacionado(s) ao que você procura. Use os cartões abaixo para abrir os detalhes.`
          : supportAnswer(normalized),
      products: matches
        .slice(0, 4)
        .map(({ id, title, price, available }) => ({ id, title, price, available })),
      provider: history.length >= 0 ? "mock-local" : "mock-local",
    };
  }
  private recalculate(): CustomerCart {
    cart.items.forEach((item) => {
      item.total = item.quantity * item.unitPrice;
    });
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    return { ...cart, items: [...cart.items] };
  }
}

function supportAnswer(question: string) {
  if (/troca|devolu/.test(question))
    return "Para solicitar uma troca, abra Pedidos, consulte o detalhamento de um pedido entregue, selecione os itens e descreva o motivo. Depois acompanhe a análise e o eventual cupom na mesma área.";
  if (/cancel/.test(question))
    return "Pedidos ainda em aberto ou processamento podem ter o cancelamento solicitado na tela Pedidos, dentro do detalhamento da venda.";
  if (/cartao|pagamento/.test(question))
    return "No checkout você pode selecionar um ou mais cartões. Novos cartões são cadastrados em uma microinterface própria e o pagamento pode ser distribuído entre eles.";
  if (/endereco/.test(question))
    return "Você pode cadastrar e manter endereços em Minha conta. Durante o checkout, a opção Novo endereço abre um cadastro separado e retorna à finalização.";
  if (/cupom|desconto/.test(question))
    return "Cupons promocionais e créditos de troca ficam em Meus cupons e podem ser selecionados no checkout quando estiverem ativos.";
  if (/pedido|entrega/.test(question))
    return "A tela Pedidos mostra status, itens, endereço, pagamentos, totais e ações disponíveis, como cancelamento, confirmação de recebimento e troca.";
  if (/conta|perfil|senha/.test(question))
    return "Em Minha conta você encontra microinterfaces para dados pessoais, endereços, cartões, senha e pedidos.";
  if (/livro|catalog|recomend|indic|autor|categoria/.test(question))
    return "Posso ajudar a escolher livros por assunto, autor ou categoria. Conte o tema, objetivo ou estilo de leitura que você procura.";
  if (/carrinho|comprar|compra|checkout|finalizar/.test(question))
    return "Escolha um livro no catálogo, adicione ao carrinho e siga para o checkout, onde você seleciona endereço, cartões e cupons antes de confirmar.";
  return "Posso orientar sobre livros, catálogo, carrinho, checkout, pagamentos, pedidos, cancelamentos, trocas, cupons e manutenção da conta. Diga o que deseja fazer.";
}

function couponDiscount(total: number, selected: CustomerCoupon[]) {
  return Math.min(
    total,
    selected.reduce(
      (sum, coupon) =>
        sum +
        (coupon.discountType === "PERCENTAGE"
          ? (total * coupon.value) / 100
          : coupon.value),
      0,
    ),
  );
}
function subcategory(title: string, category: string) {
  if (category === "Xadrez") {
    if (/system|reassess|amateur|positional/i.test(title)) return "Xadrez Posicional";
    if (/opening|gambit/i.test(title)) return "Aberturas de Xadrez";
    if (/endgame|fundamental/i.test(title)) return "Finais de Xadrez";
    return "Estratégia de Xadrez";
  }
  if (category === "Física") {
    if (/modern|atom|magnetism|electricity/i.test(title)) return "Física Nuclear";
    if (/relativity|brief lessons/i.test(title)) return "Física Quântica";
    return "Física Aplicada";
  }
  if (category === "Química")
    return /organic|molecular/i.test(title)
      ? "Química Orgânica"
      : /analytical/i.test(title)
        ? "Química Analítica"
        : "Química Geral";
  if (category === "Matemática")
    return /calculus|analysis|applied|machine learning|algorithms/i.test(title)
      ? "Matemática Aplicada"
      : "Matemática Pura";
  return category;
}
