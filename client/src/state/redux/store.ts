import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@/state/redux/slices/authSlice";
import gameReducer from "@/state/redux/slices/gameSlice";
import { authApi } from "../api/authApi";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { line98Api } from "../api/line98Api";

const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  [authApi.reducerPath]: authApi.reducer,
  [line98Api.reducerPath]: line98Api.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // cần thiết khi dùng redux-persist
    }).concat(authApi.middleware, line98Api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
