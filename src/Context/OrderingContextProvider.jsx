import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

const addedProductsKey = 'cart-items';

export const OrderingStateContext = createContext({
  orderedItems: [],
  totalCost: 0,
});

export const OrderingActionContext = createContext({
  AddOrderItem: (product) => {},
  AddQty: (id) => {},
  DeductQty: (id) => {},
  ConfirmOrder: (orderDetails) => {},
});

export function useOrderAction() {
  return useContext(OrderingActionContext);
}

export function useOrderState() {
  return useContext(OrderingStateContext);
}

const initializer = () => {
  const storedItems = JSON.parse(localStorage.getItem(addedProductsKey)) || [];
  return {
    orderedItems: storedItems,
    totalCost: storedItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    ),
  };
};

function cartReducers(state, action) {
  switch (action.identifier) {
    case 'add-to-cart': {
      const { product } = action.payload;
      const { id, name, price } = product;
      const currentIndex = state.orderedItems.findIndex((ord) => ord.id === id);
      if (currentIndex < 0) {
        const returnValue = {
          ...state,
          orderedItems: [...state.orderedItems, { id, name, price, qty: 1 }],
        };
        return returnValue;
      }
      return {
        ...state,
        orderedItems: state.orderedItems.map((item, index) =>
          index === currentIndex ? { ...item, qty: item.qty + 1 } : item
        ),
      };
      break;
    }
    case 'add-qty': {
      const { productId } = action.payload;

      return {
        ...state,
        orderedItems: state.orderedItems.map((item, index) =>
          item.id === productId ? { ...item, qty: item.qty + 1 } : item
        ),
      };
      break;
    }

    case 'deduct-qty': {
      const { productId } = action.payload;
      const updatedOrder = state.orderedItems.map((item, index) =>
        item.id === productId ? { ...item, qty: item.qty - 1 } : item
      );
      return {
        ...state,
        orderedItems: updatedOrder.filter((z) => z.qty > 0),
      };
      break;
    }
    case 'clear-order': {
      return {
        orderedItems: [],
      };
      break;
    }
    default: {
      return state;
    }
  }
}

export default function OrderingContextProvider({ children }) {
  const [cart, dispatchCartItem] = useReducer(
    cartReducers,
    {
      orderedItems: [],
      totalCost: 0,
    },
    initializer
  );
  useEffect(() => {
    localStorage.setItem(addedProductsKey, JSON.stringify(cart.orderedItems));
  }, [cart.orderedItems]);

  const actions = useMemo(() => {
    return {
      AddOrderItem: (product) => {
        dispatchCartItem({
          identifier: 'add-to-cart',
          payload: { product },
        });
      },
      AddQty: (productId) => {
        dispatchCartItem({
          identifier: 'add-qty',
          payload: { productId },
        });
      },
      DeductQty: (productId) => {
        dispatchCartItem({
          identifier: 'deduct-qty',
          payload: { productId },
        });
      },
    };
  }, [cart.orderedItems]);

  const ConfirmOrder = async (orderDetails) => {
    console.log('accesing server');

    try {
      const orderCreateRequest = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          order: {
            customer: {
              name: 'Neil Bryan Abarabar',
              city: 'Manila',
              email: 'neilbryan.abarabar@gmail.com',
              street: '44 sikatuna urduja village brgy 172 caloocan city',
              'postal-code': '1400',
            },
            items: [
              { id: 'm2', name: 'Margherita Pizza', price: '12.99', qty: 10 },
              { id: 'm1', name: 'Mac & Cheese', price: '8.99', qty: 10 },
              { id: 'm3', name: 'Caesar Salad', price: '7.99', qty: 11 },
              { id: 'm5', name: 'Veggie Burger', price: '9.99', qty: 10 },
              { id: 'm11', name: 'Seafood Paella', price: '19.99', qty: 10 },
            ],
          },
        }),
      });

      if (!orderCreateRequest.ok) {
      }

      const orderRequestData = await orderCreateRequest.json();

      return orderRequestData;
    } catch (error) {
      alert('error fetch');
    }
  };

  const providerStateValue = useMemo(
    () => ({
      orderedItems: cart.orderedItems, // Fixed: Use actual cart items
      totalCost:
        cart.orderedItems.length > 0
          ? cart.orderedItems.reduce((acc, item) => {
              return (acc += item.qty * item.price);
            }, 0)
          : 0,
    }),
    [cart.orderedItems, cart.totalCost]
  );

  // const actions = useMemo(
  //   () => ({
  //     AddOrderItem,
  //     AddQty,
  //     DeductQty,
  //     ConfirmOrder,
  //   }),
  //   [AddOrderItem, AddQty, DeductQty, ConfirmOrder]
  // );
  return (
    <OrderingActionContext.Provider value={{ ...actions, ConfirmOrder }}>
      <OrderingStateContext.Provider value={providerStateValue}>
        {children}
      </OrderingStateContext.Provider>
    </OrderingActionContext.Provider>
  );
}
