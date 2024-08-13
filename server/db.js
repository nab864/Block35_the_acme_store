const pg = require("pg")
const client = new pg.Client(process.env.DATABASE_URL || "postgres://postgres:sigzz1029@localhost/acme_store")
const uuid = require("uuid")
const bcrypt = require("bcrypt")

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    CREATE TABLE users(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    );
    CREATE TABLE products(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL
    );
    CREATE TABLE favorites(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      product_id UUID REFERENCES products(id),
      CONSTRAINT favorite_id UNIQUE (user_id, product_id)
    );
  `
  client.query(SQL)
}

const createUser = async (username, password) => {
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;
  `
  const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)])
  return response.rows
}

const createProduct = async (name) => {
  const SQL = `
    INSERT INTO products(id, name) VALUES($1, $2) RETURNING *;
  `
  const response = await client.query(SQL, [uuid.v4(), name])
  return response.rows
}

const createFavorite = async (user_id, product_id) => {
  const SQL = `
    INSERT INTO favorites(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *;
  `
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id])
  return response.rows
}

const fetchUsers = async () => {
  const SQL = `
    SELECT * FROM users;
  `
  const response = await client.query(SQL)
  return response.rows
}

const fetchProducts = async () => {
  const SQL = `
    SELECT * FROM products;
  `
  const response = await client.query(SQL)
  return response.rows
}

const fetchFavorites = async (id) => {
  const SQL = `
    SELECT * FROM favorites WHERE user_id = $1;
  `
  const response = await client.query(SQL, [id])
  return response.rows
}

const destroyFavorite = async (id, user_id) => {
  const SQL = `
    DELETE FROM favorites WHERE id = $1 AND user_id = $2;
  `
  await client.query(SQL, [id, user_id])
}



module.exports = { client, createTables, createUser, createProduct, createFavorite,
  fetchUsers, fetchProducts, fetchFavorites, destroyFavorite }