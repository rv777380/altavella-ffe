/**
 * Lourini Catalog 2024/2025
 * Product catalog for the FFE ordering system
 */

const catalog = {
  "tecidos": {
    "name": "Tecidos",
    "items": {
      "a": {
        "name": "Classe A",
        "items": [
          { "id": "atlantis", "name": "Atlantis", "price": 35, "highlight": false },
          { "id": "kenya", "name": "Kenya", "price": 38, "highlight": false },
          { "id": "milano", "name": "Milano", "price": 40, "highlight": false },
          { "id": "primo", "name": "Primo", "price": 35, "highlight": false },
          { "id": "curio", "name": "Curio", "price": 42, "highlight": true },
          { "id": "barrel", "name": "Barrel", "price": 42, "highlight": true }
        ]
      },
      "b": {
        "name": "Classe B",
        "items": [
          { "id": "fior", "name": "Fior", "price": 48, "highlight": true },
          { "id": "real", "name": "Real", "price": 45, "highlight": true },
          { "id": "plaza", "name": "Plaza", "price": 46, "highlight": false },
          { "id": "soft", "name": "Soft", "price": 44, "highlight": false },
          { "id": "smart", "name": "Smart", "price": 44, "highlight": false }
        ]
      },
      "c": {
        "name": "Classe C",
        "items": [
          { "id": "tiber", "name": "Tiber", "price": 55, "highlight": true },
          { "id": "satin", "name": "Satin", "price": 52, "highlight": false },
          { "id": "lagos", "name": "Lagos", "price": 53, "highlight": false },
          { "id": "paris", "name": "Paris", "price": 54, "highlight": false }
        ]
      },
      "d": {
        "name": "Classe D",
        "items": [
          { "id": "velvet", "name": "Velvet", "price": 65, "highlight": false },
          { "id": "royal", "name": "Royal", "price": 68, "highlight": false },
          { "id": "luxe", "name": "Luxe", "price": 72, "highlight": false }
        ]
      },
      "e": {
        "name": "Classe E",
        "items": [
          { "id": "premium", "name": "Premium", "price": 85, "highlight": false },
          { "id": "elite", "name": "Elite", "price": 88, "highlight": false },
          { "id": "supreme", "name": "Supreme", "price": 95, "highlight": false }
        ]
      }
    }
  },
  "sofas": {
    "name": "Sofás",
    "items": [
      { "id": "s-modelo1", "name": "Modelo Lisboa", "price": 850, "sizes": ["2 Lugares", "3 Lugares", "4 Lugares"] },
      { "id": "s-modelo2", "name": "Modelo Porto", "price": 780, "sizes": ["2 Lugares", "3 Lugares"] },
      { "id": "s-modelo3", "name": "Modelo Algarve", "price": 920, "sizes": ["3 Lugares", "4 Lugares"] },
      { "id": "s-modelo4", "name": "Modelo Coimbra", "price": 690, "sizes": ["2 Lugares", "3 Lugares"] }
    ]
  },
  "cadeiras": {
    "name": "Cadeiras",
    "items": [
      { "id": "c-modelo1", "name": "Cadeira Dining", "price": 180 },
      { "id": "c-modelo2", "name": "Cadeira Lounge", "price": 220 },
      { "id": "c-modelo3", "name": "Poltrona Relax", "price": 420 },
      { "id": "c-modelo4", "name": "Cadeira Escritório", "price": 290 }
    ]
  },
  "colchoes": {
    "name": "Colchões",
    "items": [
      { "id": "col-modelo1", "name": "Colchão Essential", "price": 450, "sizes": ["Solteiro", "Casal", "King"] },
      { "id": "col-modelo2", "name": "Colchão Comfort", "price": 650, "sizes": ["Solteiro", "Casal", "King"] },
      { "id": "col-modelo3", "name": "Colchão Premium", "price": 950, "sizes": ["Casal", "King"] }
    ]
  }
};

export default catalog;
