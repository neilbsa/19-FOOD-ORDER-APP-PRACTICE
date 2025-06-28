import { StrictMode } from 'react';
import CartContainer from './components/CartItem/CartContainer.jsx';
import Headers from './components/Header/Header.jsx';
import ModalProvider from './Context/ModalProvider.jsx';
import OrderingContextProvider from './Context/OrderingContextProvider.jsx';
import ProductsContextProvider from './Context/ProductsContextProvider.jsx';
import OrderConfirmationInfo from './components/Header/OrderConfirmationInfo.jsx';
function App() {
  return (
    <OrderingContextProvider>
      <ProductsContextProvider>
        <ModalProvider>
          <OrderConfirmationInfo />
          <Headers />
          <CartContainer />
        </ModalProvider>
      </ProductsContextProvider>
    </OrderingContextProvider>
  );
}

export default App;
