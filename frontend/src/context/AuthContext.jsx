import React, {
    createContext,
    useContext,
    useState
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

const authAPI = axios.create({
    baseURL: "http://localhost:5000/api/auth",
    headers: {
        "Content-Type": "application/json"
    }
});

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    async function login(email, password) {

        const response = await authAPI.post("/login", {
            email,
            password
        });

        const receivedToken = response.data.data.token;
        const receivedUser = response.data.data.user;

        localStorage.setItem("token", receivedToken);
        localStorage.setItem(
            "user",
            JSON.stringify(receivedUser)
        );

        setToken(receivedToken);
        setUser(receivedUser);

        return receivedUser;
    }

    async function register(formData) {

        const response = await authAPI.post(
            "/register",
            formData
        );

        return response.data;
    }

    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                register,
                logout,
                isAuthenticated: Boolean(token)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}