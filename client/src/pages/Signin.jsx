import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function Signin() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill in all fields'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        return dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        dispatch(signInSuccess(data)); // Ensure `data` includes `isAdmin`
        if (data.isAdmin) {
          navigate('/admin'); // Redirect to admin dashboard
        } else {
          navigate('/dashboard?tab=dhome'); // Redirect to user dashboard
        }
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 
                      text-white items-center justify-center p-10"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome</h1>
          <h1 className="text-6xl font-bold">Back!</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="max-w-md w-full">

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Email" />
              <TextInput
                type="email"
                placeholder="name@email.com"
                id="email"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label value="Password" />
              <TextInput
                type="password"
                placeholder="**********"
                id="password"
                onChange={handleChange}
              />
            </div>

            <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <OAuth />
          </form>

          <div className="flex gap-2 text-sm mt-5">
            <span>Don't have an account ?</span>
            <Link to="/signup" className="text-blue-500">
              Sign Up.
            </Link>
          </div>

          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}