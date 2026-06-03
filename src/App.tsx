import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

const Workspace = lazy(() => import("./pages/Workspace"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AppLoadingFallback() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ backgroundColor: "#0a0a0a", color: "#777" }}
    >
      <span className="text-sm">Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
