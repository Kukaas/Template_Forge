import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          TemplateForge
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <a
                href={`${import.meta.env.VITE_API_URL}/api/auth/logout`}
                className="hover:text-gray-300"
              >
                Logout
              </a>
              <span>{user?.email}</span>
            </>
          ) : (
            <Link to="/login" className="hover:text-gray-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;