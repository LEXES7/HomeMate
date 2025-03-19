import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import {useSelector} from 'react-redux';

import { updateStart, updateSuccess, updateFailure,deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { set } from 'mongoose';

export default function DashProfile() {
    const {currentUser, error} = useSelector((state) => state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormDate] = useState({});
    const filePickerRef = useRef();
    const dispatch = useDispatch();
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if(file){
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
        };
        useEffect(() => {
         if (imageFile){
            uploadImage();
         }   
}, [imageFile] );

const uploadImage = async () => {
    console.log('uploading image...');
};
    
    const handleChange = (e) => {
        setFormDate({...formData, [e.target.id]: e.target.value});
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateUserError(null);
        setUpdateUserSuccess(null);
    
        if(Object.keys(formData).length === 0){
            setUpdateUserError("No Changes made");
            return;
    }
    try{
        dispatch(updateStart());
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
    const data = await res.json();
    if(!res.ok){
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
        return;
    }else{
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("user profile updated successfully");

    }
    }catch(error){
        dispatch(updateFailure(error.message));
        setUpdateUserError(error.message);
    }
    };
    const handleDeleteUser = async () => {
        setShowModal(false);
        try{
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if(!res.ok){
                dispatch(deleteUserFailure(data.message));
            }else{
            dispatch(deleteUserSuccess(data));
            }

        }catch(error){
            dispatch(deleteUserFailure(error.message));
        }
    };

    const handleSignout = async () => {
        try {
          const res = await fetch('/api/user/signout', {
            method: 'POST',
          });
          const data = await res.json();
          if (!res.ok) {
            console.log(data.message);
          } else {
            dispatch(signoutSuccess());
          }
        } catch (error) {
          console.log(error.message);
        }
      };

    return ( 
    <div className='max-w-lg mx-auto p-3 w-full'>
        <h1 className='my-7 text-center font-semibold text-3xl'> Profile </h1>  
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        <input type='file' accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
        <div className='w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full' onClick={() => filePickerRef.current.click()}>

        <img src={imageFileUrl || currentUser.profilePicture} alt='user' className='rounded-full w-full h-full object-cover border-4 border-[lightblue]'/>
        </div>
        <TextInput type='text' id='username' placeholder='username' defaultValue={currentUser.username} onChange={handleChange}/>

        <TextInput type='email' id='email' placeholder='email' defaultValue={currentUser.email} onChange={handleChange}/>

        <TextInput type='password' id='password' placeholder='password' onChange={handleChange} />

        <Button type = 'submit' gradientDuoTone='cyanToBlue' outline>Update</Button>

        </form>

        <div className='text-red-500 flex justify-between mt-5'>
            <span onClick={()=>setShowModal(true)} className='cursor-pointer'>Delete Account</span>
            <span onClick={handleSignout} className='cursor-pointer'>Sign out</span>

        </div>
        {updateUserSuccess && (
            <Alert color = 'success' className='mt-5'>
                {updateUserSuccess}
            </Alert>
        )} 
        {updateUserError && (
            <Alert color = 'failure' className='mt-5'>
                {updateUserError}
            </Alert>
        )}
        
        {error && (
            <Alert color = 'failure' className='mt-5'>
                {error}
            </Alert>
        )}

        <Modal show={showModal} onClose={()=>setShowModal(false)} popup size ='md'>
            
            <Modal.Header />
            <Modal.Body >
                <div className='text-center'>
                    <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto'/>
                    <h3 className='mb-5 text-lg text-black dark:text-gray-400'>Are you sure you want to delete your account</h3>
                <div className='flex justify-center gap-4'>
                    <Button color='failure' onClick={handleDeleteUser}>Yes, I'm Sure </Button>
                    <Button color ='gray' onClick={()=>setShowModal(false)}>No, Cancel</Button>
                </div>
                
                </div>
            </Modal.Body>
            
        </Modal>
     </div>
  );
}
