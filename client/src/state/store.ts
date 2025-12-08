import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createLogger } from "redux-logger";
import authReducer from "./auth/authSlice";
import { categoriesApiSlice } from "./categories/categorySlice";
import { productsApiSlice } from "./products/productSlice";
const persistConfig = {
  key: "root",  
  storage,
  whitelist: ["counter", "auth"]
};

const rootReducer = combineReducers({
  auth: authReducer,
  [categoriesApiSlice.reducerPath]: categoriesApiSlice.reducer, 
  [productsApiSlice.reducerPath]: productsApiSlice.reducer,
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
    }).concat(createLogger()).concat(categoriesApiSlice.middleware).concat(productsApiSlice.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
