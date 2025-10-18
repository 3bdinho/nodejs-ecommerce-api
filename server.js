const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });

const morgan = require("morgan");
const qs = require("qs");

const DBConnection = require("./config/database");
const ApiError = require("./utils/ApiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");

// Routes
const mountRoutes = require("./routes");

//connection with db
DBConnection();

//express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options(/.*/, cors());

//compress all response
app.use(compression());

//override express query parser with qs
app.set("query parser", (str) => qs.parse(str));

//Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

//Mount routes
mountRoutes(app);

app.all(/.*/, (req, res, next) => {
  // const err = new Error(`Can't find this route: ${req.originalUrl}`);
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// //Global error handling Middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting down...`);
    process.exit(1);
  });
});
