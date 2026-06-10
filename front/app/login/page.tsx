"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const response = await fetch(
      "http://localhost:30000/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(
        "token",
        data.token
      );

      window.location.href = "/";
    } else {
      alert("Credenciales incorrectas");
    }
  }

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-quality-light px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl border border-gray-100">

      <div className="mb-8 text-center">
        <img
          src="/logo-quality.png"
          alt="Quality"
          className="mx-auto h-16 mb-4"
        />

        <h1 className="text-3xl font-bold text-quality-dark">
          Portal del Empleado
        </h1>

        <p className="mt-2 text-gray-500">
          Accede a la plataforma de gestión interna
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Usuario
          </label>

          <input
            placeholder="Introduce tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Contraseña
          </label>

          <input
            type="password"
            placeholder="Introduce tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  </div>
);
}