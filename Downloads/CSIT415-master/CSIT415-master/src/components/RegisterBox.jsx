import "/Static/index.css";
import React, { useState } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";

function RegisterBox() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password needs to be at least 8 characters long");
            return;
        }

        try {
            await register(formData);
            navigate("/login");
        } catch (err) {
            console.error("Registration error:", err);
            setError("Registration failed. Try a different email.");
        }
    };

    return (
        <div className="loginWrapper">
            <h1 className="header">Schedule Manager</h1>
            <form onSubmit={handleRegister}>
                <div className="login-box">
                    <h1 className="login-title">Register</h1>
                    <p className="login-subtitle">Save Your Schedule!</p>

                    <label className="title-field">First Name</label>
                    <input
                        required
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        className="input-field"
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                    />

                    <label className="title-field">Last Name</label>
                    <input
                        required
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        className="input-field"
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                    />

                    <label className="title-field">Email</label>
                    <input
                        required
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="input-field"
                        onChange={(e) => handleInputChange("email", e.target.value)}
                    />

                    <label className="title-field">Password</label>
                    <input
                        required
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="input-field"
                        onChange={(e) => handleInputChange("password", e.target.value)}
                    />

                    <label className="title-field">Confirm Password</label>
                    <input
                        required
                        type="password"
                        placeholder="Confirm Password"
                        className="input-field"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button type="submit" className="submit-button">
                        Register
                    </button>

                    <p className="form-switch">
                        Already have an account? <a href="/login">Login here.</a>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default RegisterBox;
