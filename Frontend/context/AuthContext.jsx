import { useEffect, useState } from "react";
import { axiosInstance } from "../axios/axiosCalls";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({children}) =>{
     const [customer, setCustomer] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(()=>{
           axiosInstance.get("/customers/me")
             .then((response) => {
               setCustomer(response.data.customerData);
             })
             .catch(() => {
               setCustomer(null);
             })
             .finally(() => {
               setLoading(false);
             });
     }, []);

      return(
        <AuthContext.Provider value={{ customer, setCustomer, loading }}>

            {children}
        </AuthContext.Provider>
     )
}