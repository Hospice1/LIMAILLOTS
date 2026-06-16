export type SiteLanguage = "fr" | "en" | "pt";

export interface SiteCopy {
  navbar: {
    menuAria: string;
    homeAria: string;
    accountAria: string;
    cartAria: string;
    languageLabel: string;
    languageName: Record<SiteLanguage, string>;
  };
  search: {
    placeholder: string;
    labels: {
      category: string;
      price: string;
      size: string;
      sort: string;
      clubCountry: string;
    };
    sortOptions: {
      popular: string;
      newest: string;
      priceAsc: string;
      priceDesc: string;
    };
    all: string;
    allSizes: string;
    results: string;
    favorites: string;
    themeAria: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    delivery: string;
    quick: {
      worldCup: string;
      clubs: string;
    };
  };
  categories: {
    kicker: string;
    title: string;
    activeFilter: string;
    active: string;
    view: string;
  };
  arrivals: {
    title: string;
    cta: string;
  };
  products: {
    kicker: string;
    title: string;
    emptyTitle: string;
    emptySubtitle: string;
    more: string;
    less: string;
  };
  footer: {
    description: string;
    linksTitle: string;
    links: {
      home: string;
      shop: string;
      contact: string;
    };
    contactTitle: string;
    copyright: string;
  };
  mobileMenu: {
    label: string;
    closeAria: string;
    home: string;
    shop: string;
    account: string;
    contact: string;
    categories: string;
  };
  cart: {
    label: string;
    article: string;
    closeAria: string;
    empty: string;
    promo: string;
    apply: string;
    subtotal: string;
    discount: string;
    total: string;
    checkout: string;
  };
}

const COPY: Record<SiteLanguage, SiteCopy> = {
  fr: {
    navbar: {
      menuAria: "Ouvrir le menu",
      homeAria: "Accueil LIMAILLOTS",
      accountAria: "Mon compte client",
      cartAria: "Ouvrir le panier",
      languageLabel: "Langue",
      languageName: { fr: "Francais", en: "Anglais", pt: "Portugais" },
    },
    search: {
      placeholder: "Rechercher France, Maroc, Real Madrid, Arsenal...",
      labels: {
        category: "Categorie",
        price: "Prix",
        size: "Taille",
        sort: "Popularite",
        clubCountry: "Club / Pays",
      },
      sortOptions: {
        popular: "Popularite",
        newest: "Nouveautes",
        priceAsc: "Prix croissant",
        priceDesc: "Prix decroissant",
      },
      all: "Tous",
      allSizes: "Toutes",
      results: "produits affiches",
      favorites: "favoris",
      themeAria: "Basculer entre mode clair et mode sombre",
    },
    hero: {
      badge: "Coupe du Monde maintenant",
      title: "Les maillots qui comptent: nations et clubs.",
      subtitle: "Une selection plus courte, plus premium: maillots Coupe du Monde et clubs forts, prets a commander sur WhatsApp.",
      cta: "Voir les maillots",
      delivery: "Livraison Campus Express",
      quick: {
        worldCup: "Coupe du Monde",
        clubs: "Clubs",
      },
    },
    categories: {
      kicker: "Selection claire",
      title: "Coupe du Monde & Clubs",
      activeFilter: "Filtre actif",
      active: "Actif",
      view: "Voir",
    },
    arrivals: {
      title: "Maillots Coupe du Monde en avant",
      cta: "Voir les maillots",
    },
    products: {
      kicker: "Boutique allegee",
      title: "Maillots Coupe du Monde & Clubs",
      emptyTitle: "Aucun produit ne correspond a ces filtres.",
      emptySubtitle: "Modifie les filtres pour afficher davantage d'articles.",
      more: "Voir plus",
      less: "Voir moins",
    },
    footer: {
      description: "Boutique football moderne pour etudiants, supporters et joueurs.",
      linksTitle: "Liens rapides",
      links: {
        home: "Accueil",
        shop: "Boutique",
        contact: "Contact",
      },
      contactTitle: "Contact & Reseaux",
      copyright: "Designed by iamyotto | All rights reserved.",
    },
    mobileMenu: {
      label: "Menu mobile",
      closeAria: "Fermer le menu",
      home: "Accueil",
      shop: "Boutique",
      account: "Mon espace client",
      contact: "Contact",
      categories: "Categories",
    },
    cart: {
      label: "Panier",
      article: "article",
      closeAria: "Fermer le panier",
      empty: "Ton panier est vide.",
      promo: "Code promo",
      apply: "Appliquer",
      subtotal: "Sous-total",
      discount: "Reduction",
      total: "Total",
      checkout: "Valider la commande",
    },
  },
  en: {
    navbar: {
      menuAria: "Open menu",
      homeAria: "LIMAILLOTS home",
      accountAria: "Customer account",
      cartAria: "Open cart",
      languageLabel: "Language",
      languageName: { fr: "French", en: "English", pt: "Portuguese" },
    },
    search: {
      placeholder: "Search France, Morocco, Real Madrid, Arsenal...",
      labels: {
        category: "Category",
        price: "Price",
        size: "Size",
        sort: "Sorting",
        clubCountry: "Club / Country",
      },
      sortOptions: {
        popular: "Popularity",
        newest: "Newest",
        priceAsc: "Price low-high",
        priceDesc: "Price high-low",
      },
      all: "All",
      allSizes: "All",
      results: "products shown",
      favorites: "favorites",
      themeAria: "Toggle light and dark mode",
    },
    hero: {
      badge: "World Cup season",
      title: "The jerseys that matter: nations and clubs.",
      subtitle: "A shorter, more premium selection: World Cup jerseys and strong clubs, ready to order on WhatsApp.",
      cta: "View jerseys",
      delivery: "Campus Express Delivery",
      quick: {
        worldCup: "World Cup",
        clubs: "Clubs",
      },
    },
    categories: {
      kicker: "Clear selection",
      title: "World Cup & Clubs",
      activeFilter: "Active filter",
      active: "Active",
      view: "View",
    },
    arrivals: {
      title: "World Cup jerseys upfront",
      cta: "View jerseys",
    },
    products: {
      kicker: "Simplified shop",
      title: "World Cup & Club jerseys",
      emptyTitle: "No product matches these filters.",
      emptySubtitle: "Adjust filters to show more items.",
      more: "Show more",
      less: "Show less",
    },
    footer: {
      description: "Modern football shop for students, supporters and players.",
      linksTitle: "Quick links",
      links: {
        home: "Home",
        shop: "Shop",
        contact: "Contact",
      },
      contactTitle: "Contact & Social",
      copyright: "Designed by iamyotto | All rights reserved.",
    },
    mobileMenu: {
      label: "Mobile menu",
      closeAria: "Close menu",
      home: "Home",
      shop: "Shop",
      account: "My account",
      contact: "Contact",
      categories: "Categories",
    },
    cart: {
      label: "Cart",
      article: "item",
      closeAria: "Close cart",
      empty: "Your cart is empty.",
      promo: "Promo code",
      apply: "Apply",
      subtotal: "Subtotal",
      discount: "Discount",
      total: "Total",
      checkout: "Checkout",
    },
  },
  pt: {
    navbar: {
      menuAria: "Abrir menu",
      homeAria: "Inicio LIMAILLOTS",
      accountAria: "Conta do cliente",
      cartAria: "Abrir carrinho",
      languageLabel: "Idioma",
      languageName: { fr: "Frances", en: "Ingles", pt: "Portugues" },
    },
    search: {
      placeholder: "Pesquisar Franca, Marrocos, Real Madrid, Arsenal...",
      labels: {
        category: "Categoria",
        price: "Preco",
        size: "Tamanho",
        sort: "Ordenacao",
        clubCountry: "Clube / Pais",
      },
      sortOptions: {
        popular: "Popularidade",
        newest: "Novidades",
        priceAsc: "Preco crescente",
        priceDesc: "Preco decrescente",
      },
      all: "Todos",
      allSizes: "Todas",
      results: "produtos exibidos",
      favorites: "favoritos",
      themeAria: "Alternar modo claro e escuro",
    },
    hero: {
      badge: "Epoca de Copa do Mundo",
      title: "As camisolas que importam: selecoes e clubes.",
      subtitle: "Uma selecao mais curta e premium: camisolas de Copa do Mundo e clubes fortes, prontas para pedir no WhatsApp.",
      cta: "Ver camisolas",
      delivery: "Entrega Campus Express",
      quick: {
        worldCup: "Copa do Mundo",
        clubs: "Clubes",
      },
    },
    categories: {
      kicker: "Selecao clara",
      title: "Copa do Mundo & Clubes",
      activeFilter: "Filtro ativo",
      active: "Ativo",
      view: "Ver",
    },
    arrivals: {
      title: "Camisolas da Copa em destaque",
      cta: "Ver camisolas",
    },
    products: {
      kicker: "Loja simplificada",
      title: "Camisolas Copa do Mundo & Clubes",
      emptyTitle: "Nenhum produto corresponde a estes filtros.",
      emptySubtitle: "Ajuste os filtros para mostrar mais artigos.",
      more: "Ver mais",
      less: "Ver menos",
    },
    footer: {
      description: "Loja moderna de futebol para estudantes, adeptos e jogadores.",
      linksTitle: "Links rapidos",
      links: {
        home: "Inicio",
        shop: "Loja",
        contact: "Contacto",
      },
      contactTitle: "Contacto & Redes",
      copyright: "Designed by iamyotto | All rights reserved.",
    },
    mobileMenu: {
      label: "Menu movel",
      closeAria: "Fechar menu",
      home: "Inicio",
      shop: "Loja",
      account: "Minha conta",
      contact: "Contacto",
      categories: "Categorias",
    },
    cart: {
      label: "Carrinho",
      article: "artigo",
      closeAria: "Fechar carrinho",
      empty: "O teu carrinho esta vazio.",
      promo: "Codigo promo",
      apply: "Aplicar",
      subtotal: "Subtotal",
      discount: "Desconto",
      total: "Total",
      checkout: "Finalizar encomenda",
    },
  },
};

export function getSiteCopy(language: SiteLanguage): SiteCopy {
  return COPY[language] ?? COPY.fr;
}

export function detectPreferredLanguage(value: string | null | undefined): SiteLanguage {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.startsWith("pt")) return "pt";
  if (normalized.startsWith("en")) return "en";
  return "fr";
}
