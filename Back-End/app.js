const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
const path = require("path");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const PDFRoutes = require("./Routes/PDFRoutes");
const usersroutes = require("./Routes/UserRoutes");

const DoctorDentalRoute = require("./Routes/DoctorsDentalRoute");

const PatientDentalRoute = require("./Routes/PatientDentalRoute");

const Appointment = require("./Routes/AppointmentRoute");

const DentalHistory = require("./Routes/Dental_History_route");

const result = require("./Routes/treatmentResultRoutes")

const Insurance = require("./Routes/InsuranceRoute");

const Bill = require("./Routes/BillRoute");

const Prescription = require("./Routes/PrescriptionRoute");

const Treatment = require("./Routes/TreatmentSchema");
const TrackingProcess = require("./Routes/TrackingProcessRoute")

const Schedule = require("./Routes/ScheduleRoute");
const Notification = require("./Routes/NotificationRoute");
const Task = require ("./Routes/TaskRoute")

const Logs=require("./Routes/LogsRoute")

const Staff=require("./Routes/StaffRoute")

const Category = require("./Routes/categoryRoute")

const inventory = require("./Routes/InventoryRoute")

const release = require("./Routes/ReleaseRoute")

const authentic = require("./Routes/authRouter");
let app = express();

const logger = function (req, res, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.json());
app.set("trust proxy", true);

app.use(
  session({
    secret: process.env.SECRET_STR,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CONN_STR,
      ttl: 12 * 60 * 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 12 * 60 * 60 * 1000,
    },
     rolling: true,
  })
);
 
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/users", usersroutes);
app.use("/api/v1/GeneratePDF", PDFRoutes);
app.use("/api/v1/authentication", authentic);
app.use("/api/v1/Patient", PatientDentalRoute);
app.use("/api/v1/Appointment", Appointment);
app.use("/api/v1/Doctors", DoctorDentalRoute);
app.use("/api/v1/DentalHistory", DentalHistory);
app.use("/api/v1/Insurance", Insurance);
app.use("/api/v1/Bill", Bill);
app.use("/api/v1/Prescription", Prescription);
app.use("/api/v1/Treatment", Treatment);
app.use("/api/v1/Schedule", Schedule);
app.use("/api/v1/Notification", Notification);
app.use("/api/v1/LogsAudit", Logs);
app.use("/api/v1/Task", Task);
app.use("/api/v1/Staff", Staff);
app.use("/api/v1/InventoryCategory", Category);
app.use("/api/v1/Inventory", inventory);
app.use("/api/v1/Release", release);
app.use("/api/v1/Result", result);
app.use("/api/v1/TrackProcess", TrackingProcess);







app.use(ErrorController);

module.exports = app;
