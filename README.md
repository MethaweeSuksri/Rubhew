# RubHew

A campus pickup-and-delivery marketplace. A student heading to one of the canteens posts that
they will carry things back — how many orders they can take, where they are going from and to,
and what they charge. Other students browse those posts, order items off one, and the carrier
prices the items at the shop and delivers them. Delivery and payment are tracked separately
until both are complete.

Built for CS369 Web Application Development at Thammasat University.

## How it works

There are two sides to every order and one user account can be either.

The **carrier** publishes availability from `/rubhew` — pickup point, drop-off zone, capacity,
a base fee and a per-item fee. That does not create a separate post document; it sets fields on
the user, and the feed is simply a query for users with `availablefororder > 0`.

The **buyer** sees those carriers on `/home`, picks one, and submits a list of items with
quantities and an optional note. Prices are unknown at this point — the buyer does not yet know
what anything costs. Submitting an order decrements the carrier's remaining capacity.

The **carrier** then fills in the real unit prices from `/ordered`. The order total is
recalculated as `base fee + Σ (unit price + per-item fee) × count`.

From there the two state machines run independently:

| | states | advanced by |
|---|---|---|
| `delivery_status` | `buying` → `delivering` → `delivered`, or `cancelled` | carrier |
| `paid_status` | `unpaid` → `pending` → `paid` | buyer marks `pending`, carrier confirms `paid` |

## Stack

Backend is Express 5 on Node with Mongoose over MongoDB, sessions via `express-session`, and
`bcrypt` for password hashing. Frontend is Create React App with React 19 and React Router 7.
They are two independent npm packages and are run as two processes.

## Running it

You need Node 18+ and a MongoDB server listening on `localhost:27017`.

```bash
# terminal 1 — API on :5000
cd Backend
npm install
npm start

# terminal 2 — UI on :3000
cd Frontend
npm install
npm start
```

Open http://localhost:3000. The frontend proxies API calls to port 5000 via the `proxy` field in
`Frontend/package.json`, so both must be running.

> **The backend reseeds on every start.** `models.js` calls `insertDefaultData()` at import time,
> which drops the `User`, `Order` and `Menu` collections before inserting fixtures. Any data you
> entered is lost on restart. Point the connection string at a scratch database, or comment out
> the `insertDefaultData()` call at the bottom of `Backend/models/models.js` if you want data to
> persist.

Two accounts are seeded. Log in with `ginger` / `123456` or `gingee` / `123458` — they are set up
as each other's carrier and buyer, with four orders already spread across the delivery and
payment states.

Note that `mongoose.connect` is given a host with no database name, so everything lands in
MongoDB's default `test` database.

## API

All routes are unprefixed and identity comes from the session cookie, so you must log in before
anything else will return your data.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/register` | Create an account. Rejects duplicate email or student ID. |
| `POST` | `/login` | Verify credentials, store username and student ID on the session. |
| `GET` | `/home` | Carriers currently accepting orders, excluding yourself. |
| `POST` | `/rubhew` | Publish or update your own carrier availability, route and rates. |
| `POST` | `/ordering` | Place an order against a carrier. Decrements their capacity. |
| `GET` | `/order` | Orders you placed that are fully paid. |
| `GET` | `/order/by?id=` | One placed order with its items. |
| `GET` | `/ordered` | Orders you are carrying that are still `buying` or `delivering`. |
| `GET` | `/ordered/by?id=` | One carried order with its items. |
| `POST` | `/addprice` | Set unit prices on an order's items and recompute the total. |
| `GET` | `/unpaid-order` | Your own outstanding and settled payments, split. |
| `GET` | `/unpaid-order/by?id=` | One of your outstanding payments, with items. |
| `GET` | `/customer-unpaid-order/` | Payments your buyers owe you, split by settled state. |
| `GET` | `/customer-unpaid-order/by?id=` | One buyer payment, with items. |
| `POST` | `/pending` | Buyer marks an order as paid, pending carrier confirmation. |
| `POST` | `/paid` | Carrier confirms payment received. |
| `POST` | `/updateOrderNext` | Advance delivery state. Carrier only. |
| `POST` | `/updateOrderCancel` | Cancel the delivery. Carrier only. |
| `GET` | `/profile` | Your own account record. |

## Data model

Three collections, related by `studentId` string rather than by ObjectId reference, so there is
no `populate` anywhere — every join is a second explicit query.

**User** — `username`, `password` (bcrypt), `studentId`, `email`, `phone`, `department`,
`paymentMethod`, plus the carrier fields `availablefororder`, `from`, `to`, `rateInit`,
`ratePer`.

**Order** — `studentId_rider` (carrier), `studentId_taker` (buyer), `description`,
`delivery_status`, `paid_status`, `totalprice`, `paymenttimestamp`, `paymentMethod`.

**Menu** — one row per item on an order: `orderId`, `name`, `count`, `price`.

## Layout

```
Backend/
  app.js                     route table and session setup
  controllers/controllers.js  all request handlers
  models/models.js            schemas, connection, seed data
Frontend/
  src/App.js                 routes
  src/Home.js                carrier feed and order form
  src/Rubhew.js              publish availability
  src/Order.js               orders you placed
  src/Ordered.js             orders you are carrying, pricing UI
  src/UnpaidOrders.js        what you owe
  src/CustomerUnpaidOrders.js what you are owed
  src/UserProfile.js         account
```
