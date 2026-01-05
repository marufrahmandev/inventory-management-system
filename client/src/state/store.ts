import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createLogger } from "redux-logger";
import { authApiSlice } from "./auth/authSlice";
import { categoriesApiSlice } from "./categories/categorySlice";
import { productsApiSlice } from "./products/productSlice";
import { customersApiSlice } from "./customers/customerSlice";
import { suppliersApiSlice } from "./suppliers/supplierSlice";
import { salesOrdersApiSlice } from "./salesOrders/salesOrderSlice";
import { purchaseOrdersApiSlice } from "./purchaseOrders/purchaseOrderSlice";
import { invoicesApiSlice } from "./invoices/invoiceSlice";
import { stocksApiSlice } from "./stocks/stockSlice";
import { reportsApiSlice } from "./reports/reportSlice";

const persistConfig = {
  key: "root",  
  storage,
  whitelist: ["counter", "auth"]
};

const rootReducer = combineReducers({
  [authApiSlice.reducerPath]: authApiSlice.reducer,
  [categoriesApiSlice.reducerPath]: categoriesApiSlice.reducer, 
  [productsApiSlice.reducerPath]: productsApiSlice.reducer,
  [customersApiSlice.reducerPath]: customersApiSlice.reducer,
  [suppliersApiSlice.reducerPath]: suppliersApiSlice.reducer,
  [salesOrdersApiSlice.reducerPath]: salesOrdersApiSlice.reducer,
  [purchaseOrdersApiSlice.reducerPath]: purchaseOrdersApiSlice.reducer,
  [invoicesApiSlice.reducerPath]: invoicesApiSlice.reducer,
  [stocksApiSlice.reducerPath]: stocksApiSlice.reducer,
  [reportsApiSlice.reducerPath]: reportsApiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
          "persist/PURGE",
          "persist/FLUSH"
        ]
      }
    })
      .concat(createLogger())
      .concat(authApiSlice.middleware)
      .concat(categoriesApiSlice.middleware)
      .concat(productsApiSlice.middleware)
      .concat(customersApiSlice.middleware)
      .concat(suppliersApiSlice.middleware)
      .concat(salesOrdersApiSlice.middleware)
      .concat(purchaseOrdersApiSlice.middleware)
      .concat(invoicesApiSlice.middleware)
      .concat(stocksApiSlice.middleware)
      .concat(reportsApiSlice.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
