declare global{
    namespace Express{
        interface Request{
           user ? :{
             userId : string
           };
           organization ? : {
               id : string ,
               role : "OWNER" | "STAFF" | "CUSTOMER"
           }
        }
    }
}

export {};