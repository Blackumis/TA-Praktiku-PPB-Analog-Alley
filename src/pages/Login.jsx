import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, ArrowRight, Mail } from 'lucide-react';
import { authService } from '../services';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/profile';

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendingEmail(true);
    setResendSuccess(false);
    
    try {
      await authService.resendConfirmationEmail(email);
      setResendSuccess(true);
      setError('');
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResendLink(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const { user, session } = await authService.signIn(email, password);
      
      if (session && user) {
        const emailConfirmed = user.email_confirmed_at || user.confirmed_at;
        
        if (!emailConfirmed) {
          setError('Please verify your email before logging in. Check your inbox for the confirmation link.');
          setShowResendLink(true);
          await authService.signOut();
          setLoading(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate(from, { replace: true });
      } else {
        throw new Error('Login successful but no session created');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-2xl rounded-3xl px-10 py-12 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Log In
          </h2>
          <p className="text-sm text-gray-500 uppercase tracking-wide backdrop-blur-sm font-bold" >
            Welcome back to <span className="text-gray-500">Analog</span> <span className="text-gray-500">Alley</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
            {showResendLink && (
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-900 hover:text-red-700 disabled:opacity-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
            <p className="text-sm font-medium">Verification email sent! Please check your inbox.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              placeholder="Password"
            />
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Forgot your password? <span className="underline">Click here</span>
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Login</span>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gray-900 hover:text-gray-700 font-semibold inline-flex items-center gap-1 group">
              Sign up
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
