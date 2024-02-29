import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from "../redux/user/userSlice";

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [fileUploadPercentage, setFileUploadPercentage] = useState(0);
  const [fileUPloadError, setFileUPloadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadPercentage(progress);
      },

      (error) => {
        setFileUPloadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({
            ...formData,
            avatar: downloadURL,
          })
        );
      }
    );
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false)
        return dispatch(updateUserFailure(data.message));

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleDeletUser = async (e) => {
    e.preventDefault();
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success === false)
        return dispatch(deleteUserFailure(data.message));

      dispatch(deleteUserSuccess());
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handlUserSignout = async (e) => {
    e.preventDefault();
    try {
      dispatch(signOutStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) return dispatch(signOutFailure(data.message));

      dispatch(signOutSuccess());
    } catch (err) {
      dispatch(signOutFailure(err.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleUserUpdate} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          accept="image/*"
          ref={fileRef}
          hidden
        />
        <img
          onClick={() => fileRef.current.click()}
          className="rounded-full cursor-pointer w-24 h-24 object-cover self-center mt-2"
          src={formData.avatar || currentUser.avatar}
          alt="profile image"
        />
        <p className="text-center">
          {fileUPloadError ? (
            <span className="text-center text-red-700">
              Failed to upload image (image must be less than 2mb)
            </span>
          ) : fileUploadPercentage > 0 && fileUploadPercentage < 100 ? (
            <span className="text-slate-700">
              {`Uploading ${Math.round(fileUploadPercentage)}%`}
            </span>
          ) : fileUploadPercentage === 100 ? (
            <span className="text-green-700">Image uploaded successfully!</span>
          ) : (
            ""
          )}
        </p>
        <input
          id="username"
          type="text"
          placeholder="username"
          className="p-3 rounded-lg border"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          id="email"
          type="email"
          placeholder="email"
          className="p-3 rounded-lg border"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          id="password"
          type="password"
          placeholder="password"
          className="p-3 rounded-lg border"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="uppercase bg-slate-700 p-3 rounded-lg text-white hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "loading.." : "update"}
        </button>
        <Link
          to={"/create-listing"}
          className="uppercase bg-green-700 p-3 rounded-lg text-white text-center hover:opacity-95"
        >
          create listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeletUser} className="text-red-700 cursor-pointer">
          Delete account
        </span>
        <span
          onClick={handlUserSignout}
          className="cursor-pointer text-red-700"
        >
          Signout
        </span>
      </div>

      <p className="text-red-500 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
    </div>
  );
};

export default Profile;
