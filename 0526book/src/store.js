import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slice/useSlice';

export default configureStore({
    reducer : {
        user : userSlice
    },
})