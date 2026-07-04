# AfriCraft Rwanda — Database Design (MongoDB)

## Collections

### users
| Field | Type | Notes |
|-------|------|-------|
| fullName | String | Required |
| email | String | Unique, required |
| passwordHash | String | bcrypt hashed |
| role | String | Default: customer |

### products
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| description | String | Required |
| price | Number | RWF amount |
| imageUrl | String | Optional |
| category | String | e.g. basketry, pottery |
| stock | Number | Inventory count |
| isActive | Boolean | Default true |

### orders
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Reference to users |
| customer | Object | fullName, phone, email, address, city |
| items | Array | productId, name, unitPrice, quantity, lineTotal |
| subtotal | Number | Sum of line totals |
| deliveryFee | Number | Optional |
| total | Number | subtotal + deliveryFee |
| status | String | confirmed, shipped, delivered |

## Seed data
Run from project root after MongoDB is available:

```bash
npm run seed:products --prefix server
```
