import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./slices/bookingSlice";
import addressModalReducer from "./slices/addressModalSlice";
import locationModalReducer from "./slices/locationModalSlice";
import locationReducer from "./slices/locationSlice";
import subcategoriesModalReducer from "./slices/subcategoriesModalSlice";
import authModalReducer from "./slices/authModalSlice";
import slotModalReducer from "./slices/slotModalSlice";
import contactInfoModalReducer from "./slices/contactInfoModalSlice";
import quoteAcceptanceReducer from "./slices/quoteAcceptanceSlice";
import workerApplicationReducer from "./slices/workerApplicationSlice";
import brokerApplicationReducer from "./slices/brokerApplicationSlice";
import workerAssignmentReducer from "./slices/workerAssignmentSlice";
import locationTrackingReducer from "./slices/locationTrackingSlice";

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    addressModal: addressModalReducer,
    locationModal: locationModalReducer,
    location: locationReducer,
    subcategoriesModal: subcategoriesModalReducer,
    authModal: authModalReducer,
    slotModal: slotModalReducer,
    contactInfoModal: contactInfoModalReducer,
    quoteAcceptance: quoteAcceptanceReducer,
    workerApplication: workerApplicationReducer,
    brokerApplication: brokerApplicationReducer,
    workerAssignment: workerAssignmentReducer,
    locationTracking: locationTrackingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
