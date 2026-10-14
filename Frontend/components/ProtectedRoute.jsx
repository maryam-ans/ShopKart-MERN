import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({children}) {
     const { customer, loading } = useAuth();

   if (loading) {
     return <p>Loading...</p>;
   }

   if (!customer) {
     return <Navigate to="/login" replace />;
   }

  return children;
  
}

export default ProtectedRoute