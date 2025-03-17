import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Signin() {

  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim()});
  };

  const handleSubmit = async (e) => {
   e.preventDefault();
   if (!formData.email || !formData.password){
   return setErrorMessage('Please fill all the fields');
   }
   try{
    setLoading(true);
    setErrorMessage(null);
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if(data.success === false ) {
      return setErrorMessage(data.message);
    }
    setLoading(false);
    if(res.ok){
      navigate('/dashboard');}
   }catch(error){
      setErrorMessage(error.message);
      setLoading(false);
   }
  };

  return (
    <div className='min-h-screen flex'> 
      
     
      <div className='hidden md:flex flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 
                      text-white items-center justify-center p-10'> 
        
        <div className="text-center">
         <h1 className="text-4xl font-bold mb-2">Welcome</h1> 
         <h1 className="text-6xl font-bold">Back!</h1> 
         </div>
      </div>

      
      <div className='flex-1 flex items-center justify-center p-10'>
        <div className='max-w-md w-full'>
          
          {/* Signup Form */}
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}> 
              
            <div>
              <Label value="Email" />
              <TextInput type='email' placeholder='name@email.com' id='email' onChange={handleChange}/>
            </div>

            <div>
              <Label value="Password" />
              <TextInput type='password' placeholder='**********' id='password' onChange={handleChange}/>
            </div>

            <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Spinner size='sm'/>
                  <span className='pl-3'>Loading...</span>
                </>
              ) : 'Sign Up'}
            </Button>
          </form>

          <div className='flex gap-2 text-sm mt-5'>
            <span>Don't have an account ?</span>
            <Link to='/signup' className='text-blue-500'>
              Sign Up.
            </Link>
          </div>

          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage} 
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
