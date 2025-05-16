import React, { useState, useEffect } from 'react';
import { getOrderDetails } from '../services/api';

const OrderDetails = ({ order, onBack, onStatusUpdate }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadOrderDetails();
  }, [order]);
  
  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const details = await getOrderDetails(order.id);
      setOrderDetails(details);
    } catch (err) {
      setError('Erro ao carregar detalhes do pedido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) return <div className="loading">Carregando detalhes do pedido...</div>;
  if (error) return <div className="error">{error}</div>;
  
  // Use order from props if details haven't loaded yet
  const orderData = orderDetails || order;
  
  return (
    <div className="order-details">
      <div className="order-details-header">
        <button className="back-button" onClick={onBack}>
          ← Voltar
        </button>
        <h2>Detalhes do Pedido #{orderData.order_number}</h2>
      </div>
      
      <div className="order-details-content">
        <div className="order-details-row">
          <div className="order-info-card">
            <h3>Informações do Pedido</h3>
            <div className="order-info">
              <div className="info-row">
                <span className="info-label">Nº do Pedido:</span>
                <span className="info-value">{orderData.order_number}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Data:</span>
                <span className="info-value">{formatDate(orderData.created_at)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  <span className={`status-badge status-${orderData.status}`}>
                    {orderData.status}
                  </span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Total:</span>
                <span className="info-value">€{orderData.total_amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="status-update">
              <h4>Atualizar Status</h4>
              <div className="status-selector">
                <select 
                  value={orderData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select-large"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Em Processamento</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="customer-info-card">
            <h3>Informações do Cliente</h3>
            <div className="customer-info">
              <div className="info-row">
                <span className="info-label">Nome:</span>
                <span className="info-value">
                  {`${orderData.customer_first_name} ${orderData.customer_last_name}`}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{orderData.customer_email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Telefone:</span>
                <span className="info-value">{orderData.customer_phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Endereço:</span>
                <span className="info-value">
                  {orderData.customer_address}
                  <br />
                  {`${orderData.customer_city}, ${orderData.customer_postcode}`}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-items-card">
          <h3>Itens do Pedido</h3>
          {orderDetails && orderDetails.items && orderDetails.items.length > 0 ? (
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Tecido</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.product_category}</td>
                    <td>
                      {item.fabric_name ? (
                        <>
                          {item.fabric_name}
                          {item.fabric_class && <span className="fabric-class"> ({item.fabric_class})</span>}
                        </>
                      ) : '-'}
                    </td>
                    <td>{item.quantity}</td>
                    <td>€{item.unit_price.toFixed(2)}</td>
                    <td>€{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="total-label">Total</td>
                  <td className="total-value">€{orderData.total_amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="no-items">Nenhum item encontrado ou carregando...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
