import { useState } from "react";
import InfoPointTable from "./components/InfoPointTable";
import Login from "./components/Login";
import Header from "./components/Header";
import "./css/app.css";
export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(
    () => sessionStorage.getItem("cmsToken") !== null,
  );

  function handleLogout() {
    sessionStorage.removeItem("cmsToken");
    setIsSignedIn(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] font-sans">
      <Header isSignedIn={isSignedIn} onLogout={handleLogout} />
      {!isSignedIn && (
        <div className="flex h-screen items-center justify-center -translate-y-[100px]">
          <Login onLoginSuccess={() => setIsSignedIn(true)} />
        </div>
      )}
      {isSignedIn && (
        <div className="px-4 pb-12 pt-20 sm:px-8">
          <InfoPointTable token={sessionStorage.getItem("cmsToken") ?? ""} />
        </div>
      )}
    </main>
  );
}
