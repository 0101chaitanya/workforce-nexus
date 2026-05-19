const express = require('express');
const app = express();

const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const companyRoutes = require("./routes/companyRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');
dotenv.config();

// Connect to database
connectDB();

// Middleware
app.use(morgan('dev', {
    stream: { write: (message) => logger.http(message.trim()) }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
