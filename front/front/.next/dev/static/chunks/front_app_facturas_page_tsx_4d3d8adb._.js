(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/front/app/facturas/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FacturacionPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/front/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/front/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function FacturacionPage() {
    _s();
    const API_URL = __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    // ======================
    // Estados generales
    // ======================
    const [facturas, setFacturas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errores, setErrores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // ======================
    // Estados del formulario
    // ======================
    const [mes, setMes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [anio, setAnio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cliente, setCliente] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    //Constante para la lista de clientes
    const [clientes, setClientes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [previewData, setPreviewData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [generadaData, setGeneradaData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ======================
    // 1) Cargar facturas existentes
    // ======================
    const cargarFacturas = async ()=>{
        try {
            setIsLoading(true);
            setErrores({});
            const res = await fetch(`${API_URL}/api/facturas`);
            if (!res.ok) {
                setErrores({
                    general: "Error cargando facturas"
                });
                return;
            }
            const data = await res.json();
            setFacturas(data);
        } catch (e) {
            setErrores({
                general: "No se pudo conectar con el servidor."
            });
        } finally{
            setIsLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FacturacionPage.useEffect": ()=>{
            cargarFacturas();
        }
    }["FacturacionPage.useEffect"], []);
    //Fetch a la API -> Clientes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FacturacionPage.useEffect": ()=>{
            fetch("http://127.0.0.1:8000/api/clientes").then({
                "FacturacionPage.useEffect": (res)=>res.json()
            }["FacturacionPage.useEffect"]).then({
                "FacturacionPage.useEffect": (data)=>setClientes(data)
            }["FacturacionPage.useEffect"]);
        }
    }["FacturacionPage.useEffect"], []);
    // ======================
    // 2) Preview de factura
    // ======================
    const previewFactura = async ()=>{
        if (!mes || !anio || !cliente) return;
        try {
            setIsSaving(true);
            const res = await fetch(`${API_URL}/api/factura/preview`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mes,
                    anio,
                    id_cliente: cliente
                })
            });
            if (!res.ok) {
                const data = await res.json();
                setErrores({
                    general: data.detail || "Error en la previsualización"
                });
                return;
            }
            const data = await res.json();
            setPreviewData(data);
            setGeneradaData(null);
            setErrores({});
        } catch (e) {
            setErrores({
                general: "No se pudo conectar con el servidor."
            });
        } finally{
            setIsSaving(false);
        }
    };
    // ======================
    // 3) Generar factura definitiva
    // ======================
    const generarFactura = async ()=>{
        if (!mes || !anio || !cliente || !previewData) return;
        try {
            setIsSaving(true);
            const res = await fetch(`${API_URL}/api/factura/generar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_sociedad: "01",
                    mes,
                    anio,
                    id_cliente: cliente,
                    concepto: `Factura ${cliente} ${mes}/${anio}`
                })
            });
            if (!res.ok) {
                const data = await res.json();
                setErrores({
                    general: data.detail || "Error generando factura"
                });
                return;
            }
            const data = await res.json();
            setGeneradaData(data);
            // Actualizamos el histórico de facturas
            cargarFacturas();
        } catch (e) {
            setErrores({
                general: "No se pudo conectar con el servidor."
            });
        } finally{
            setIsSaving(false);
        }
    };
    // ======================
    // 4) Filtrar facturas por búsqueda (opcional)
    // ======================
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const facturasFiltradas = facturas.filter((f)=>`${f.id_cliente} ${f.num_factura} ${f.concepto}`.toLowerCase().includes(searchTerm.toLowerCase()));
    /*
  VISUAL DE LA PÁGINA
  */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold",
                                children: "Facturación"
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500",
                                children: "Genera facturas automáticamente a partir de las horas validadas."
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/front/app/facturas/page.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    previewData && !generadaData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: generarFactura,
                        className: "bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700",
                        children: "+ Generar Factura"
                    }, void 0, false, {
                        fileName: "[project]/front/app/facturas/page.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/front/app/facturas/page.tsx",
                lineNumber: 181,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl shadow p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold mb-4",
                        children: "Selección de periodo"
                    }, void 0, false, {
                        fileName: "[project]/front/app/facturas/page.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: mes,
                                onChange: (e)=>setMes(Number(e.target.value)),
                                className: "border p-2 rounded w-48",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Seleccionar Mes"
                                    }, void 0, false, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 13
                                    }, this),
                                    [
                                        "Enero",
                                        "Febrero",
                                        "Marzo",
                                        "Abril",
                                        "Mayo",
                                        "Junio",
                                        "Julio",
                                        "Agosto",
                                        "Septiembre",
                                        "Octubre",
                                        "Noviembre",
                                        "Diciembre"
                                    ].map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: i + 1,
                                            children: m
                                        }, i, false, {
                                            fileName: "[project]/front/app/facturas/page.tsx",
                                            lineNumber: 221,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 210,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: anio,
                                onChange: (e)=>setAnio(Number(e.target.value)),
                                className: "border p-2 rounded w-40",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Seleccionar Año"
                                    }, void 0, false, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 233,
                                        columnNumber: 13
                                    }, this),
                                    Array.from({
                                        length: 21
                                    }, (_, i)=>2010 + i).map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: y,
                                            children: y
                                        }, y, false, {
                                            fileName: "[project]/front/app/facturas/page.tsx",
                                            lineNumber: 235,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: cliente,
                                onChange: (e)=>setCliente(e.target.value),
                                className: "border p-2 rounded w-56",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Seleccionar Cliente"
                                    }, void 0, false, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this),
                                    clientes.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c.id_cliente,
                                            children: c.n_cliente
                                        }, c.id_cliente, false, {
                                            fileName: "[project]/front/app/facturas/page.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: previewFactura,
                                className: "bg-gray-800 text-white px-4 rounded hover:bg-gray-900",
                                children: "Calcular"
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/front/app/facturas/page.tsx",
                        lineNumber: 207,
                        columnNumber: 9
                    }, this),
                    previewData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t pt-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold mb-4",
                                children: "Previsualización"
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 267,
                                columnNumber: 13
                            }, this),
                            previewData.alertas.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 text-red-600",
                                children: previewData.alertas.map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "⚠️ ",
                                            a
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 272,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 270,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-4 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Cliente:"
                                            }, void 0, false, {
                                                fileName: "[project]/front/app/facturas/page.tsx",
                                                lineNumber: 278,
                                                columnNumber: 18
                                            }, this),
                                            " ",
                                            previewData.id_cliente
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 278,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Periodo:"
                                            }, void 0, false, {
                                                fileName: "[project]/front/app/facturas/page.tsx",
                                                lineNumber: 279,
                                                columnNumber: 18
                                            }, this),
                                            " ",
                                            previewData.mes,
                                            "/",
                                            previewData.anio
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Total Horas:"
                                            }, void 0, false, {
                                                fileName: "[project]/front/app/facturas/page.tsx",
                                                lineNumber: 280,
                                                columnNumber: 18
                                            }, this),
                                            " ",
                                            previewData.total_horas,
                                            " h"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 280,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Total Importe:"
                                            }, void 0, false, {
                                                fileName: "[project]/front/app/facturas/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 18
                                            }, this),
                                            " ",
                                            previewData.total_importe.toFixed(2),
                                            " €"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/front/app/facturas/page.tsx",
                                        lineNumber: 281,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 overflow-x-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full text-sm border-collapse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "bg-gray-100",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "border px-2 py-1",
                                                        children: "Empleado"
                                                    }, void 0, false, {
                                                        fileName: "[project]/front/app/facturas/page.tsx",
                                                        lineNumber: 289,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "border px-2 py-1",
                                                        children: "Proyecto"
                                                    }, void 0, false, {
                                                        fileName: "[project]/front/app/facturas/page.tsx",
                                                        lineNumber: 290,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "border px-2 py-1",
                                                        children: "Horas"
                                                    }, void 0, false, {
                                                        fileName: "[project]/front/app/facturas/page.tsx",
                                                        lineNumber: 291,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "border px-2 py-1",
                                                        children: "Tarifa €/h"
                                                    }, void 0, false, {
                                                        fileName: "[project]/front/app/facturas/page.tsx",
                                                        lineNumber: 292,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "border px-2 py-1",
                                                        children: "Subtotal €"
                                                    }, void 0, false, {
                                                        fileName: "[project]/front/app/facturas/page.tsx",
                                                        lineNumber: 293,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/front/app/facturas/page.tsx",
                                                lineNumber: 288,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/front/app/facturas/page.tsx",
                                            lineNumber: 287,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: previewData.lineas.map((l, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "border px-2 py-1",
                                                            children: l.empleado
                                                        }, void 0, false, {
                                                            fileName: "[project]/front/app/facturas/page.tsx",
                                                            lineNumber: 299,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "border px-2 py-1",
                                                            children: l.proyecto
                                                        }, void 0, false, {
                                                            fileName: "[project]/front/app/facturas/page.tsx",
                                                            lineNumber: 300,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "border px-2 py-1",
                                                            children: l.horas
                                                        }, void 0, false, {
                                                            fileName: "[project]/front/app/facturas/page.tsx",
                                                            lineNumber: 301,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "border px-2 py-1",
                                                            children: l.tarifa_hora.toFixed(2)
                                                        }, void 0, false, {
                                                            fileName: "[project]/front/app/facturas/page.tsx",
                                                            lineNumber: 302,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "border px-2 py-1",
                                                            children: l.subtotal.toFixed(2)
                                                        }, void 0, false, {
                                                            fileName: "[project]/front/app/facturas/page.tsx",
                                                            lineNumber: 303,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/front/app/facturas/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/front/app/facturas/page.tsx",
                                            lineNumber: 296,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/front/app/facturas/page.tsx",
                                    lineNumber: 286,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 285,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 text-xl font-bold",
                                children: [
                                    "Total Factura: ",
                                    previewData.total_importe.toFixed(2),
                                    " €"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 311,
                                columnNumber: 13
                            }, this),
                            generadaData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$front$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 text-green-600 font-semibold",
                                children: "✅ Factura generada correctamente"
                            }, void 0, false, {
                                fileName: "[project]/front/app/facturas/page.tsx",
                                lineNumber: 317,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/front/app/facturas/page.tsx",
                        lineNumber: 266,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/front/app/facturas/page.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/front/app/facturas/page.tsx",
        lineNumber: 179,
        columnNumber: 5
    }, this);
}
_s(FacturacionPage, "tnPveamrYbHbZHlW5AigN97u50w=");
_c = FacturacionPage;
var _c;
__turbopack_context__.k.register(_c, "FacturacionPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=front_app_facturas_page_tsx_4d3d8adb._.js.map