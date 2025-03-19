import React from 'react';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase'; // Ensure this points to your Firebase configuration
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc"; 

    const OAuth = () => {
    const auth = getAuth(app); // Initialize Firebase auth
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
    
        try {
        const resultsFromGoogle = await signInWithPopup(auth, provider);
        const { displayName, email, photoURL } = resultsFromGoogle.user;
    
        // Prepare the name and ensure proper splitting
        const name = displayName || 'Unknown User';
    
        // Send the data to the backend
        const res = await fetch('http://localhost:8000/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            name,
            email,
            googlePhotoUrl: photoURL,
            phoneNumber:null,
            address:null

            }),
        });
    
        const data = await res.json();
    
        if (res.ok) {
            dispatch(signInSuccess(data));
            navigate('/');
        } else {
            console.error('Error from backend:', data);
        }
        } catch (error) {
        console.error('Google Sign-In Error:', error);
        }
    };
    

    return (
        <>
                    <button
                    onClick={handleGoogleClick}
                    className="btn btn-outline w-full mb-4 flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900">
                    <FcGoogle className="text-xl" />
                    <span>Continue with Google</span>
                    </button>

        </>

    );
    };

export default OAuth;
