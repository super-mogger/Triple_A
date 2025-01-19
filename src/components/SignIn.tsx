import { signInWithGoogle } from '../config/supabase';

export function SignIn() {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in with Google');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Sign in to Triple A Fitness</h1>
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.101,3.467-4.26,3.467c-2.624,0-4.747-2.124-4.747-4.747s2.124-4.747,4.747-4.747c1.152,0,2.205,0.401,3.037,1.074l2.139-2.139C17.476,5.276,15.143,4.5,12.545,4.5C7.27,4.5,3,8.77,3,14.045s4.27,9.545,9.545,9.545c7.418,0,9.545-6.919,9.545-9.545v-1.909H14.454C13.4,12.151,12.545,12.151,12.545,12.151z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
} 