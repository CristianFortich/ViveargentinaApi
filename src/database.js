require("dotenv").config();

const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const sequelize = new Sequelize(
  "postgres://pviklctxsqabqd:813ccc3a419cce274755ddb7aad1493c2451e58e8bacbae0ac15f655ac9b525e@ec2-54-152-28-9.compute-1.amazonaws.com:5432/da69nppbtoo0qk"
);

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    // console.log(require(path.join(__dirname, '/models', file)))
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const {
  Administrator,
  Category,
  Experience,
  Package,
  Provider,
  City,
  Query,
  Region,
  Reservation,
  Review,
  User,
} = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);

Category.hasMany(Experience, {
  foreignKey: "categoryId",
});
Experience.belongsTo(Category);
Region.hasMany(City, {
  foreignKey: "regionId",
});
City.belongsTo(Region);
City.hasMany(Package, {
  foreignKey: "cityId",
});
Package.belongsTo(City);
Package.hasMany(Experience, {
  foreignKey: "packageId",
});
Experience.belongsTo(Package);
// Experience.hasMany(Reservation);
// Reservation.hasMany(Experience);
User.hasMany(Query, {
  foreignKey: "userId",
});
Query.belongsTo(User);
User.hasMany(Review, {
  foreignKey: "userId",
});
Review.belongsTo(User);
User.belongsToMany(Package, { through: "reservation" });
Package.belongsToMany(User, { through: "reservation" });
Provider.belongsToMany(Experience, { through: "provider_experience" });
Experience.belongsToMany(Provider, { through: "provider_experience" });
Reservation.belongsToMany(Experience, { through: "reservation_experience" });
Experience.belongsToMany(Reservation, { through: "reservation_experience" });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
