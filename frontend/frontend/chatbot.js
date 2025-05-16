/**
 * Lourini FFE Chatbot
 * Interactive chatbot for furniture and fabric ordering
 */

import catalog from './catalog.js';

class LouriniChatbot {
  constructor(messageContainerId, userInputId, sendButtonId, apiClient) {
    this.messageContainer = document.getElementById(messageContainerId);
    this.userInput = document.getElementById(userInputId);
    this.sendButton = document.getElementById(sendButtonId);
    this.apiClient = apiClient;
    
    this.cart = [];
    this.currentCategory = null;
    this.currentProduct = null;
    this.currentFabric = null;
    this.currentSize = null;
    this.checkoutState = null;
    
    this.init();
  }
  
  init() {
    // Set up event listeners
    this.sendButton.addEventListener('click', () => this.handleUserInput());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUserInput();
      }
    });
    
    // Display welcome message
    this.addBotMessage("Olá! Bem-vindo ao Lourini FFE. Como posso ajudar com a sua seleção de móveis e tecidos?");
    this.addBotMessage("Você pode explorar nosso catálogo, solicitar informações sobre produtos específicos ou iniciar um pedido.");
    
    // Display category options
    this.displayCategories();
  }
  
  handleUserInput() {
    const message = this.userInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    this.addUserMessage(message);
    this.userInput.value = '';
    
    // Process user input
    this.processUserInput(message);
  }
  
  processUserInput(message) {
    const lowerMsg = message.toLowerCase();
    
    // Handle checkout flow
    if (this.checkoutState) {
      return this.processCheckoutInput(message);
    }
    
    // Handle cart commands
    if (lowerMsg.includes('carrinho') || lowerMsg.includes('cart')) {
      return this.showCart();
    }
    
    if (lowerMsg.includes('finalizar') || lowerMsg.includes('checkout')) {
      return this.initiateCheckout();
    }
    
    // Handle help request
    if (lowerMsg.includes('ajuda') || lowerMsg === 'help') {
      return this.showHelp();
    }
    
    // Handle category selection
    for (const [categoryId, categoryData] of Object.entries(catalog)) {
      if (lowerMsg.includes(categoryData.name.toLowerCase()) || lowerMsg.includes(categoryId)) {
        this.showCategory(categoryId);
        return;
      }
    }
    
    // Handle product selection in current category
    if (this.currentCategory) {
      const categoryData = catalog[this.currentCategory];
      
      if (this.currentCategory === 'tecidos') {
        // Handle fabric class selection
        for (const [classId, classData] of Object.entries(categoryData.items)) {
          if (lowerMsg.includes(classData.name.toLowerCase()) || lowerMsg.includes(`classe ${classId}`)) {
            this.showFabricClass(classId);
            return;
          }
        }
        
        // Handle fabric selection if class is selected
        if (this.currentFabricClass) {
          const fabricClass = categoryData.items[this.currentFabricClass];
          for (const fabric of fabricClass.items) {
            if (lowerMsg.includes(fabric.name.toLowerCase())) {
              this.selectFabric(fabric);
              return;
            }
          }
        }
      } else {
        // Handle product selection for non-fabric categories
        for (const product of categoryData.items) {
          if (lowerMsg.includes(product.name.toLowerCase())) {
            this.selectProduct(product);
            return;
          }
        }
      }
    }
    
    // Handle size selection
    if (this.currentProduct && this.currentProduct.sizes) {
      for (const size of this.currentProduct.sizes) {
        if (lowerMsg.includes(size.toLowerCase())) {
          this.selectSize(size);
          return;
        }
      }
    }
    
    // Handle quantity
    const quantityMatch = lowerMsg.match(/\b(\d+)\s*(unidades|peças|items|quantidade)\b/);
    if (quantityMatch && this.currentProduct) {
      const quantity = parseInt(quantityMatch[1]);
      this.setQuantity(quantity);
      return;
    }
    
    // Handle add to cart
    if ((lowerMsg.includes('add') || lowerMsg.includes('adicionar') || lowerMsg.includes('comprar')) && 
        (this.currentProduct || this.currentFabric)) {
      this.addToCart();
      return;
    }
    
    // Default response
    this.addBotMessage("Desculpe, não entendi completamente. Como posso ajudar?");
    this.showHelp();
  }
  
  processCheckoutInput(message) {
    // Simple checkout flow - in real implementation this would be more robust
    if (!this.checkoutState.customerInfo) {
      // Collect name
      this.checkoutState.customerInfo = { name: message };
      this.addBotMessage(`Obrigado, ${message}. Por favor, digite seu email para contato:`);
    } else if (!this.checkoutState.customerInfo.email) {
      // Collect email
      if (this.isValidEmail(message)) {
        this.checkoutState.customerInfo.email = message;
        this.addBotMessage("Agora, por favor, digite seu telefone:");
      } else {
        this.addBotMessage("Por favor, digite um email válido:");
      }
    } else if (!this.checkoutState.customerInfo.phone) {
      // Collect phone
      this.checkoutState.customerInfo.phone = message;
      this.addBotMessage("Por favor, digite seu endereço completo para entrega:");
    } else if (!this.checkoutState.customerInfo.address) {
      // Collect address
      this.checkoutState.customerInfo.address = message;
      
      // Complete checkout
      this.completeCheckout();
    }
  }
  
  displayCategories() {
    let message = "Estas são as categorias disponíveis:";
    
    for (const [categoryId, categoryData] of Object.entries(catalog)) {
      message += `\n• ${categoryData.name}`;
    }
    
    this.addBotMessage(message);
  }
  
  showCategory(categoryId) {
    this.currentCategory = categoryId;
    this.currentFabricClass = null;
    this.currentProduct = null;
    this.currentFabric = null;
    
    const categoryData = catalog[categoryId];
    
    if (categoryId === 'tecidos') {
      // Show fabric classes
      let message = `**${categoryData.name}**: Selecione uma classe de tecido:`;
      
      for (const [classId, classData] of Object.entries(categoryData.items)) {
        message += `\n• ${classData.name}`;
      }
      
      this.addBotMessage(message);
    } else {
      // Show products in category
      let message = `**${categoryData.name}**: Produtos disponíveis:`;
      
      for (const product of categoryData.items) {
        message += `\n• ${product.name} - €${product.price}`;
      }
      
      this.addBotMessage(message);
    }
  }
  
  showFabricClass(classId) {
    this.currentFabricClass = classId;
    this.currentFabric = null;
    
    const fabricClass = catalog.tecidos.items[classId];
    let message = `**${fabricClass.name}**: Tecidos disponíveis:`;
    
    for (const fabric of fabricClass.items) {
      const highlight = fabric.highlight ? " ✓" : "";
      message += `\n• ${fabric.name} - €${fabric.price}${highlight}`;
    }
    
    message += "\n\nOs tecidos marcados com ✓ estão em destaque e possuem pronta entrega.";
    
    this.addBotMessage(message);
  }
  
  selectFabric(fabric) {
    this.currentFabric = fabric;
    this.currentProduct = null;
    
    let message = `**${fabric.name}** selecionado!`;
    message += `\nPreço: €${fabric.price} por metro`;
    
    if (fabric.highlight) {
      message += "\nEste tecido está em destaque e possui pronta entrega!";
    }
    
    message += "\n\nPara adicionar ao carrinho, digite 'adicionar ao carrinho' ou especifique uma quantidade (exemplo: '5 metros').";
    
    this.addBotMessage(message);
  }
  
  selectProduct(product) {
    this.currentProduct = product;
    this.currentFabric = null;
    
    let message = `**${product.name}** selecionado!`;
    message += `\nPreço: €${product.price}`;
    
    if (product.sizes) {
      message += "\n\nTamanhos disponíveis:";
      for (const size of product.sizes) {
        message += `\n• ${size}`;
      }
      message += "\n\nPor favor, selecione um tamanho.";
    } else {
      message += "\n\nPara adicionar ao carrinho, digite 'adicionar ao carrinho' ou especifique uma quantidade.";
    }
    
    this.addBotMessage(message);
  }
  
  selectSize(size) {
    this.currentSize = size;
    
    this.addBotMessage(`Tamanho **${size}** selecionado para ${this.currentProduct.name}.`);
    this.addBotMessage("Para adicionar ao carrinho, digite 'adicionar ao carrinho' ou especifique uma quantidade.");
  }
  
  setQuantity(quantity) {
    if (quantity <= 0) {
      this.addBotMessage("A quantidade deve ser maior que zero.");
      return;
    }
    
    this.currentQuantity = quantity;
    
    if (this.currentFabric) {
      this.addBotMessage(`${quantity} metros de **${this.currentFabric.name}** selecionados.`);
    } else if (this.currentProduct) {
      this.addBotMessage(`${quantity} unidades de **${this.currentProduct.name}** selecionadas.`);
    }
    
    this.addBotMessage("Digite 'adicionar ao carrinho' para adicionar este item.");
  }
  
  addToCart() {
    if (!this.currentFabric && !this.currentProduct) {
      this.addBotMessage("Por favor, selecione um produto ou tecido primeiro.");
      return;
    }
    
    const quantity = this.currentQuantity || 1;
    
    if (this.currentFabric) {
      // Add fabric to cart
      this.cart.push({
        type: 'fabric',
        name: this.currentFabric.name,
        price: this.currentFabric.price,
        class: catalog.tecidos.items[this.currentFabricClass].name,
        quantity: quantity,
        unit: 'metros',
        subtotal: this.currentFabric.price * quantity
      });
      
      this.addBotMessage(`${quantity} metros de **${this.currentFabric.name}** adicionados ao carrinho.`);
    } else if (this.currentProduct) {
      // Check if size is required but not selected
      if (this.currentProduct.sizes && !this.currentSize) {
        this.addBotMessage("Por favor, selecione um tamanho primeiro.");
        return;
      }
      
      // Add product to cart
      this.cart.push({
        type: 'product',
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        size: this.currentSize,
        quantity: quantity,
        unit: 'unidades',
        subtotal: this.currentProduct.price * quantity
      });
      
      const sizeText = this.currentSize ? ` (${this.currentSize})` : '';
      this.addBotMessage(`${quantity} unidades de **${this.currentProduct.name}${sizeText}** adicionadas ao carrinho.`);
    }
    
    // Reset current selections
    this.currentQuantity = null;
    
    // Ask if user wants to continue shopping
    setTimeout(() => {
      this.addBotMessage("Deseja continuar comprando ou finalizar o pedido?");
      this.addBotMessage("Para ver o carrinho, digite 'carrinho'. Para finalizar o pedido, digite 'finalizar'.");
    }, 500);
  }
  
  showCart() {
    if (this.cart.length === 0) {
      this.addBotMessage("Seu carrinho está vazio.");
      return;
    }
    
    let message = "**Seu Carrinho:**\n";
    let total = 0;
    
    for (let i = 0; i < this.cart.length; i++) {
      const item = this.cart[i];
      const sizeText = item.size ? ` (${item.size})` : '';
      const classText = item.class ? ` - ${item.class}` : '';
      
      message += `\n${i+1}. ${item.name}${sizeText}${classText}`;
      message += `\n   Quantidade: ${item.quantity} ${item.unit}`;
      message += `\n   Preço unitário: €${item.price}`;
      message += `\n   Subtotal: €${item.subtotal}`;
      
      total += item.subtotal;
    }
    
    message += `\n\n**Total: €${total.toFixed(2)}**`;
    message += "\n\nPara continuar comprando, explore as categorias. Para finalizar o pedido, digite 'finalizar'.";
    
    this.addBotMessage(message);
  }
  
  initiateCheckout() {
    if (this.cart.length === 0) {
      this.addBotMessage("Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.");
      return;
    }
    
    this.checkoutState = { step: 'contact' };
    
    this.addBotMessage("Ótimo! Vamos finalizar seu pedido.");
    this.showCart();
    this.addBotMessage("Por favor, digite seu nome completo:");
  }
  
  async completeCheckout() {
    try {
      this.addBotMessage("Processando seu pedido...");
      
      // Prepare order data
      const orderData = {
        customer: {
          firstName: this.checkoutState.customerInfo.name.split(' ')[0],
          lastName: this.checkoutState.customerInfo.name.split(' ').slice(1).join(' '),
          email: this.checkoutState.customerInfo.email,
          phone: this.checkoutState.customerInfo.phone,
          address: this.checkoutState.customerInfo.address,
          city: 'Lisboa', // Default for now
          postcode: '1000', // Default for now
        },
        items: this.cart.map(item => ({
          name: item.name,
          category: item.type === 'fabric' ? 'Tecidos' : 'Móveis',
          fabricClass: item.class || null,
          fabricName: item.type === 'fabric' ? item.name : null,
          size: item.size || null,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Submit order to API
      const response = await this.apiClient.submitOrder(orderData);
      
      // Show success message
      this.addBotMessage(`**Pedido Finalizado com Sucesso!**`);
      this.addBotMessage(`Seu número de pedido é: **${response.order.orderNumber}**`);
      this.addBotMessage(`Enviamos um email de confirmação para ${this.checkoutState.customerInfo.email}.`);
      this.addBotMessage(`Obrigado por escolher a Lourini! Se tiver alguma dúvida, entre em contato conosco.`);
      
      // Reset cart and checkout state
      this.cart = [];
      this.checkoutState = null;
      
      // Return to main menu
      setTimeout(() => {
        this.addBotMessage("Você pode iniciar uma nova compra ou explorar mais produtos.");
        this.displayCategories();
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      this.addBotMessage("Desculpe, ocorreu um erro ao processar seu pedido. Por favor, tente novamente mais tarde.");
      this.checkoutState = null;
    }
  }
  
  showHelp() {
    let message = "**Como posso ajudar:**\n";
    message += "• Digite o nome de uma categoria para explorar produtos\n";
    message += "• 'carrinho' - Ver seus itens selecionados\n";
    message += "• 'finalizar' - Concluir sua compra\n";
    message += "• 'add' ou 'adicionar' - Adicionar item ao carrinho\n";
    message += "• 'ajuda' - Ver este menu novamente\n\n";
    
    message += "**Categorias disponíveis:**\n";
    for (const [categoryId, categoryData] of Object.entries(catalog)) {
      message += `• ${categoryData.name}\n`;
    }
    
    this.addBotMessage(message);
  }
  
  addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.textContent = text;
    this.messageContainer.appendChild(messageElement);
    this.scrollToBottom();
  }
  
  addBotMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    
    // Process markdown-like formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\n/g, '<br>');
    
    messageElement.innerHTML = text;
    this.messageContainer.appendChild(messageElement);
    this.scrollToBottom();
  }
  
  scrollToBottom() {
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default LouriniChatbot;
