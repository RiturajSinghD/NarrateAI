import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Check browser memory matrix for active profile authorization token hashes
  const token = localStorage.getItem("token");

  if (!token) {
    // Re-route unauthorized traffic straight back to the login access gate page
    return <Navigate to="/login" replace />;
  }

  return children;
}
