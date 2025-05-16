import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardMetrics, getOrders, updateOrderStatus } from '../services/api';
import { logout } from '../services/auth';
import OrderList from './OrderList';
import OrderDetails from './OrderDetails';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const metricsData = await getDashboardMetrics();
      setMetrics(metricsData);
      
      const ordersData = await getOrders();
      setOrders(ordersData.orders);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    onLogout();
  };
  
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update orders list
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      // Reload dashboard data if we're on the dashboard tab
      if (activeTab === 'dashboard') {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };
  
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setActiveTab('orderDetails');
  };
  
  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setActiveTab('orders');
  };
  
  const renderDashboard = () => {
    if (loading) return <div className="loading">Carregando dados...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!metrics) return <div className="no-data">Nenhum dado disponível</div>;
    
    // Format data for charts
    const statusData = metrics.ordersByStatus.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count
    }));
    
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <button className="refresh-button" onClick={loadDashboardData}>
            Atualizar
          </button>
        </div>
        
        <div className="metrics-cards">
          <div className="metric-card">
            <h3>Total de Pedidos</h3>
            <p className="metric-value">{metrics.totalOrders}</p>
          </div>
          
          <div className="metric-card">
            <h3>Total em Vendas</h3>
            <p className="metric-value">€{metrics.totalSales.toFixed(2)}</p>
          </div>
          
          <div className="metric-card">
            <h3>Pedidos Pendentes</h3>
            <p className="metric-value">
              {metrics.ordersByStatus.find(s => s.status === 'pending')?.count || 0}
            </p>
          </div>
        </div>
        
        <div className="dashboard-row">
          <div className="dashboard-col">
            <div className="dashboard-card">
              <h3>Status dos Pedidos</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="dashboard-col">
            <div className="dashboard-card">
              <h3>Pedidos Recentes</h3>
              <div className="recent-orders">
                <table>
                  <thead>
                    <tr>
                      <th>Nº do Pedido</th>
                      <th>Cliente</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentOrders.map(order => (
                      <tr key={order.id} onClick={() => handleOrderClick(order)}>
                        <td>{order.order_number}</td>
                        <td>{`${order.customer_first_name} ${order.customer_last_name}`}</td>
                        <td>€{order.total_amount.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Lourini" className="sidebar-logo" />
          <h2>FFE Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </li>
            <li 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => { setSelectedOrder(null); setActiveTab('orders'); }}
            >
              Pedidos
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'orders' && (
          <OrderList 
            orders={orders} 
            onOrderClick={handleOrderClick}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
        
        {activeTab === 'orderDetails' && selectedOrder && (
          <OrderDetails 
            order={selectedOrder}
            onBack={handleBackToOrders}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
