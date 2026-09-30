import express from 'express'
import authRoutes from "./routes/auth.route.js"
import organizationRoutes from "./routes/organization.route.js"
import serviceRoutes from "./routes/service.route.js"
const app = express();

app.use(express.json());
app.get("/health" , (req,res)=>{
   try{
     return res.status(200).json("route is healthy");
   }catch(err){
     return res.status(500).json("not working");
   }
});

app.use("/api/auth" , authRoutes);
app.use("/api/organizations" , organizationRoutes);
app.use("/api/organizations", serviceRoutes);
export default app;