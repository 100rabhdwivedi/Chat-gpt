import React from "react";
import { useForm } from "react-hook-form";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import {useNavigate} from 'react-router-dom'
const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate()
    const onSubmit = async(data) => {
        try {
            const res = await axios.post("http://localhost:8000/api/auth/login", data, {withCredentials: true})
            if(res.status == 200){
                toast.success("Login success")
                navigate("/")
            }
        } catch (err) {
            console.log(err);
            
            const message = err?.response?.data?.message || "something went wrong"
            toast.error(message)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] px-4">

            <div className="relative w-full max-w-sm rounded-2xl bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]">

                <div className="bg-black/40 p-8 rounded-2xl border border-white/10">

                    <h2 className="text-3xl font-semibold text-white text-center mb-6 tracking-tight">
                        Welcome Back 👋
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block mb-1 text-gray-300 font-medium text-sm">Email</label>
                            <input
                                type="email"
                                className={`w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none border
                ${errors.email ? "border-red-500" : "border-white/20"} 
                focus:border-blue-500 transition-all duration-300`}
                                placeholder="Enter your email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email",
                                    },
                                })}
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block mb-1 text-gray-300 font-medium text-sm">Password</label>
                            <input
                                type="password"
                                className={`w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none border
                ${errors.password ? "border-red-500" : "border-white/20"}
                focus:border-blue-500 transition-all duration-300`}
                                placeholder="Enter your password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Minimum 6 characters required" },
                                })}
                            />
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
              transition-all p-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-blue-500/30"
                        >
                            Login
                        </button>

                    </form>

                    <p className="text-gray-400 text-center text-sm mt-5" onClick={() => navigate("/register")}>
                        New here? <span className="text-blue-400 cursor-pointer hover:underline">Create Account</span>
                    </p>

                </div>

            </div>
        </div>
    );
};

export default Login;
