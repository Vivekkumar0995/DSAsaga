"use client"

// Extend Window type for Google Identity Services
declare global {
  interface Window {
    google?: any;
  }
}


import Link from 'next/link'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

let isGoogleInitialized = false;

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const params = new URLSearchParams({ next: next });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleCredential = async ({ credential }: { credential: string }) => {
    const loadingToast = toast.loading("Logging in...");
    try {
      const response = await axios.post('/api/auth/google', { credential });
      toast.success(response.data.message || "Successfully logged in!", { id: loadingToast });
      router.push(next);
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage, { id: loadingToast });
      if (error.response?.data?.next) {
        router.push(error.response.data.next + "?" + params.toString());
        router.refresh();
      }
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const initGoogle = () => {
      if (!isGoogleInitialized) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential, // JS callback instead of login_uri
          ux_mode: "popup",
          context: "signin",
          use_fedcm_for_prompt: false,
          auto_prompt: false,
        });
        isGoogleInitialized = true;
      }

      const btnEl = document.getElementById("g_id_signin");
      if (btnEl && !btnEl.hasChildNodes()) {
        window.google.accounts.id.renderButton(btnEl, {
          type: 'standard',
          shape: 'pill',
          theme: 'outline',
          text: 'continue_with',
          size: 'large',
          logo_alignment: 'left',
        });
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      // Script not loaded yet, poll for it
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    localStorage.setItem('email', email);
    try {
      const response = await axios.post('/api/auth/login', {email, password});
      toast.success(response.data.message || "Successfully logged in!", { id: loadingToast });
      router.push(next);
      router.refresh();
    } catch(error: any){
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage, { id: loadingToast });
      if (error.response?.data?.next) {
        router.push(error.response.data.next + "?" + params.toString());
        router.refresh();
      }
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
        <form onSubmit={handleSubmit} className='bg-white flex flex-col justify-center gap-5 items-center p-5 rounded-2xl shadow-lg w-3/5 mt-25 hover:shadow-xl hover:scale-101 transition-transform duration-500 ease-in-out'>

        <h1 className='text-2xl font-bold text-black'>Welcome Back</h1>

          {/* <div id="g_id_onload"
              data-client_id={googleClientId}
              data-context="signin"
              data-ux_mode="redirect"
              data-login_uri={googleLoginUri}
              data-nonce=""
              data-auto_prompt="true">
          </div> */}

            {/* container for programmatically rendered Google Sign-In button */}
            <div id="g_id_signin"></div>

          <p className='text-gray-500' >OR</p>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            className='h-10 w-5/6 rounded-xl border border-gray-300 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className='relative w-5/6'>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter password"
              className='h-10 w-full rounded-xl border border-gray-300 bg-white px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
              className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer hover:text-black'
            >
              {showPassword ? <FiEyeOff className='text-sm' /> : <FiEye className='text-sm' />}
            </button>
          </div>

          <Link href={`/forgot-password?${params.toString()}`} className='text-blue-500 hover:underline flex self-end mr-10 text-xs'>
            Forgot Password?
          </Link>

          <button type="submit" className='w-5/6 bg-black hover:bg-black text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer'>
            Continue
          </button>
          <p className='text-black text-sm'>
            Don't have an account? <Link href={`/signup?${params.toString()}`} className='text-blue-500 hover:underline'>Sign up</Link>
          </p>
        </form>
    </div>
  )
}

export default LoginForm
