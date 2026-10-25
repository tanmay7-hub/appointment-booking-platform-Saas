import express from 'express'
import authRoutes from "./routes/auth.route.js"
import organizationRoutes from "./routes/organization.route.js"
import serviceRoutes from "./routes/service.route.js"
import availabilityRoutes from "./routes/availability.route.js";
import availabilityExceptionRoutes from "./routes/availability-exception.route.js";
import appointmentRoutes from "./routes/appointment.route.js";
import businessClosureRoutes from "./routes/businessClosure.route.js";
const app = express();

app.use(express.json());
app.get("/health" , (req,res)=>{
   try{
     return res.status(200).json("route is healthy");
   }catch(err){
     return res.status(500).json("not working");
   }
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/organizations", serviceRoutes);
app.use("/api/organizations", availabilityRoutes);
app.use("/api/organizations", availabilityExceptionRoutes);
app.use("/api/organizations", appointmentRoutes);
app.use("/api/organizations", businessClosureRoutes);
export default app;