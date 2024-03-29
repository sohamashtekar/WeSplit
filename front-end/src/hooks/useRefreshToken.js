import axios from '../api/axios';
import useAuth from './useAuth';
import { tokenRefreshAPI } from '../api/api';

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        try {
            const response = await axios.get(tokenRefreshAPI, {
                withCredentials: true,
            });
            setAuth((prev) => {
                return {
                    ...prev,
                    roles: response.data.roles,
                    accessToken: response.data.access,
                    email: response.data.email,
                    name: response.data.name,
                };
            });
            return response.data.access;
        } catch (err) {
            return false;
        }
    };
    return refresh;
};

export default useRefreshToken;
