import React from 'react'
import VehicleListPage from '@/pages/vehicles/VehicleListPage'

function App() {
  return <VehicleListPage />
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;