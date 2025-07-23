import "/Static/index.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/auth";
import logo from "../assets/logo.svg";

function LoginBox() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await login(email, password);
            localStorage.setItem("token", res.token);
            setIsAuthenticated(true);
            navigate("/home");
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid email or password");
        }
    };

    return (
        <>
            <div className="loginWrapper">
                <h1 className="header">Schedule Manager</h1>
                <div className="logo">
                    <img src={logo} alt="" />
                </div>
                <form className="login-box" onSubmit={handleLogin}>
                    {/* Login */}
                    {error && <p style={{ color: "red", position: "absolute" }}>{error}</p>}
                    <h1 className="login-title">Login</h1>
                    <p className="login-subtitle">Save Your Schedule!</p>
                    {/* Email Field */}
                    <label className="title-field">Email</label>
                    <input
                        required
                        type="email"
                        placeholder="Email"
                        className="input-field"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password Field */}
                    <label className="title-field">Password</label>
                    <input
                        required
                        type="password"
                        placeholder="Password"
                        className="input-field"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Sign in button */}
                    <button type="submit" className="submit-button">
                        Sign In
                    </button>
                    {/* Register Link */}
                    <p className="form-switch">
                        Don't have an account? <a href="/register">Register here.</a>
                    </p>
                </form>
            </div>
        </>
    );
}

export default LoginBox;
