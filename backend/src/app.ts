import express from 'express'
import authRoutes from "./routes/auth.route.js"
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
export default app;