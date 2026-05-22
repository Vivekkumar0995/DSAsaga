"use client"

// Extend Window type for Google Identity Services
declare global {
  interface Window {
    google?: any;
  }
}


import Link from 'next/link'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const params = new URLSearchParams({ next: next });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setcPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;



  const handleGoogleCredential = async ({ credential }: { credential: string }) => {
    const loadingToast = toast.loading("Signing up...");
    try {
      const response = await axios.post('/api/auth/google', { credential });
      toast.success(response.data.message || "Successfully signed in!", { id: loadingToast });
      router.push(next);
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Signup failed";
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
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      context: "signup",
      callback: handleGoogleCredential, // JS callback instead of login_uri
      ux_mode: "popup",
      use_fedcm_for_prompt: false,
      auto_prompt: false,
    });

    const btnEl = document.getElementById("g_id_signin");
    if (btnEl) {
      window.google.accounts.id.renderButton(btnEl, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        text: 'signup_with',
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
    if(password !== cpassword){
      toast.error("Password and confirm password are different");
      document.getElementById("confirmPassword")?.focus();
      return;
    }
    const loadingToast = toast.loading("Creating your account...");

    try {
      const response = await axios.post('/api/auth/signup', {name, email, password});
      toast.success(response.data.message || "Accound created successfully!!", { id: loadingToast });
      const otp = await axios.post('/api/auth/send-otp', {email: email, forWhat: "verify-and-signup"});
      localStorage.setItem('email', email);
      toast.success(otp.data.message || "Check your email for OTP");
      router.push(`/auth/otp?${params.toString()}`);
      router.refresh();
    } catch(error: any){
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
        <form action="" className='bg-white flex flex-col justify-center gap-5 items-center p-5 rounded-2xl shadow-lg w-3/5 mt-25 hover:shadow-xl hover:scale-101 transition-transform duration-500 ease-in-out' onSubmit={handleSubmit}>

        <h1 className='text-2xl font-bold text-black'>Create Account</h1>

          {/* <div id="g_id_onload"
              data-client_id={googleClientId}
              data-context="signup"
              data-ux_mode="redirect"
              data-login_uri={googleLoginUri}
              data-nonce=""
              data-auto_prompt="false">
          </div> */}

          <div id="g_id_signin"></div>

          <p className='text-gray-500' >OR</p>

          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Enter username"
            className='h-10 w-5/6 rounded-xl border border-gray-300 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <div className='relative w-5/6'>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Confirm password"
              className='h-10 w-full rounded-xl border border-gray-300 bg-white px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
              onChange={(e) => setcPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              onClick={() => setShowConfirmPassword((current) => !current)}
              className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer hover:text-black'
            >
              {showConfirmPassword ? <FiEyeOff className='text-sm' /> : <FiEye className='text-sm' />}
            </button>
          </div>
          <button type="submit" className='w-5/6 bg-black hover:bg-black text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer'>
            Continue
          </button>
          <p className='text-black text-sm'>
            Already have an account? <Link href={`/auth/login?${params.toString()}`} className='text-blue-500 hover:underline'>Log in</Link>
          </p>
        </form>
    </div>
  )
}

export default SignupForm
