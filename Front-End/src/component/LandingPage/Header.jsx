import { Monitor, Menu, X } from "lucide-react";
import { useState } from "react";
import AuthFormModal from "../Login/Login"; // siguraduhin tama ang path

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // state para sa login modal

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground text-white">DentalClinic</h1>
                <p className="text-xs text-muted-foreground text-white">Monitoring System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AuthFormModal as Fullscreen Modal */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowLogin(false)} // click outside to close
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // stop propagation para di magsara pag click sa loob
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowLogin(false)}
            >
              X
            </button>
            <AuthFormModal
              isOpen={showLogin}
              onClose={() => setShowLogin(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
