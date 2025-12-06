import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets.js'
import '../assets/styles/login.css' // Import the custom CSS
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext.jsx'
import { toast } from 'react-toastify';
import axios from 'axios';

// ensure axios sends cookies for cross-site requests
axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const {backendUrl,setIsLoggedin,getUserData} = useContext(AppContent)
  const [state,setState]= useState('Sign Up')
  const [role, setRole] = useState('buyer')
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onSubmitHandler = async (e)=>{
    try{
      e.preventDefault();
      if(state === 'Sign Up'){
        const {data} = await axios.post(
          backendUrl + '/api/auth/register',
          { name, email, password, role },
          { withCredentials: true }
        )
        if(data.success){
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }
      }else{
        const {data} = await axios.post(
          backendUrl + '/api/auth/login',
          { email, password },
          { withCredentials: true }
        )
        if(data.success){
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        }else{
          toast.error(data.message)
        }
      }
    }catch(error){
      toast.error(error.response?.data?.message || error.message)
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <div className='bg-slate-900 custom-padding rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? 'Create acccount' : 'Login'}</h2>
        <p className='text-center text-sm mb-6'>{state === 'Sign Up' ? 'Create Your account' : 'Login to your account!'}</p>
        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
          <div className='mb-4 flex items-center gap-3 w-full px-5 custom-padding2 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt=""/>
              <input onChange={e=> setName(e.target.value)} value={name} className='bg-transparent outline-none' type='text' placeholder="Full Name" required/>
          </div>)}
          
          <div className='mb-4 flex items-center gap-3 w-full px-5 custom-padding2 rounded-full bg-[#333A5C]'>
              <img src={assets.mail_icon} alt=""/>
              <input onChange={e=> setEmail(e.target.value)} value={email} className='bg-transparent outline-none' type='text' placeholder="Email Id" required/>
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-5 custom-padding2 rounded-full bg-[#333A5C]'>
              <img src={assets.lock_icon} alt=""/>
              <input onChange={e=> setPassword(e.target.value)} value={password} className='bg-transparent outline-none' type='text' placeholder="Password" required/>
          </div>
          {state === 'Sign Up' && (
          <div className='mb-4 flex items-center gap-3 w-full px-5 custom-padding2 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} alt=""/>
              <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className='bg-transparent outline-none w-full '
            >
              <option value="buyer" >Buyer</option>
              <option value="seller" >Seller</option>
            </select>
          </div>)}
          {state === 'Login' && (<p onClick={()=>navigate('/ResetPassword')} className='mb-4 text-indigo-500 cursor-pointer'>Forgot Password?</p>)}
          <button className='w-full py-2.5 cursor-pointer mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>{state}</button>
        </form>
        {state === 'Sign Up' ? (
          <p className='texxt-gray-400 text-center text-xs mt-4'>Already have an account?{''}
          <span onClick={()=>setState('Login')} className='text-blue-400 cursor-pointer underline'>Login here</span>
          </p>
          ):(
          <p className='texxt-gray-400 text-center text-xs mt-4'>Don't have an account?{''}
              <span onClick={()=>setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign Up</span>
          </p>)}
      </div>
    </div>
  )
}

export default Login