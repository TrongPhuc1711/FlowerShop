import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductsPage } from './features/products/ProductsPage';
import { SalesPage } from './features/sales/SalesPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { PurchasesPage } from './features/purchases/PurchasesPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { SuppliersPage } from './features/suppliers/SuppliersPage';
import { CustomerShopPage } from './features/shop/CustomerShopPage';

const ProtectedStaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged-in user is a customer, redirect to customer shop
  if (user?.role === 'CUSTOMER') {
    return <Navigate to="/shop" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Customer Flower Storefront */}
          <Route path="/" element={<CustomerShopPage />} />
          <Route path="/shop" element={<CustomerShopPage />} />

          {/* Authentication (Login & Register) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Staff & Admin Management Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
          </Route>

          {/* Direct legacy staff paths */}
          <Route
            path="/sales"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<SalesPage />} />
          </Route>
          <Route
            path="/products"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<ProductsPage />} />
          </Route>
          <Route
            path="/inventory"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<InventoryPage />} />
          </Route>
          <Route
            path="/purchases"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<PurchasesPage />} />
          </Route>
          <Route
            path="/customers"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<CustomersPage />} />
          </Route>
          <Route
            path="/suppliers"
            element={
              <ProtectedStaffRoute>
                <AppLayout />
              </ProtectedStaffRoute>
            }
          >
            <Route index element={<SuppliersPage />} />
          </Route>

          {/* Catch-all redirect to shop */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
