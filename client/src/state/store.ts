import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authApi } from "./api/authApi";
import { line98Api } from "./api/line98Api";
import authReducer from "./slices/authSlice";
import line98Reducer from "./slices/line98Slice";
import ticTacToeReducer from "./slices/ticTacToeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  ticTacToeGame: ticTacToeReducer,
  line98Game: line98Reducer,
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
      serializableCheck: false,
    }).concat(authApi.middleware, line98Api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
