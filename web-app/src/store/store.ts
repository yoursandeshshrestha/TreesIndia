import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
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
import searchReducer from "./slices/searchSlice";
import searchModalReducer from "./slices/searchModalSlice";
import serviceDetailModalReducer from "./slices/serviceDetailModalSlice";
import marketplaceModalReducer from "./slices/marketplaceModalSlice";
import chatModalReducer from "./slices/chatModalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
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
    search: searchReducer,
    searchModal: searchModalReducer,
    serviceDetailModal: serviceDetailModalReducer,
    marketplaceModal: marketplaceModalReducer,
    chatModal: chatModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
