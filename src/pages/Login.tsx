import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

type AuthFormInputs = {
  user: string;
  password: string;
};

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm<AuthFormInputs>();

  const onSubmit: SubmitHandler<AuthFormInputs> = async (data) => {
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.user,
          data.password,
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });

        //  Navigate after Signup
        navigate("/home");
      } else {
        await signInWithEmailAndPassword(auth, data.user, data.password);

        // Navigate after Login
        navigate("/home");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error: " + error.message);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <main className="bg-white min-h-screen w-screen flex justify-center items-center flex-col gap-3">
      <header className="gap-3 md:gap-6 lg:gap-9 flex flex-col">
        <h1 className="text-4xl md:text-6xl lg:text-8xl 2xl:text-9xl text-black font-bold">
          Presidency University
        </h1>
        <h3 className="text-sm md:text-lg lg:text-3xl 2xl:text-4xl text-end text-gray-700">
          College Media Portal
        </h3>
      </header>

      <article className="mt-8 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold text-black">
          {isSignUp ? "Create Student Account" : "Student Login"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-72"
        >
          <input
            className="border-2 border-gray-300 p-2 text-black rounded focus:border-blue-500 outline-none"
            {...register("user")}
            placeholder="University Email"
          />
          <input
            type="password"
            className="border-2 border-gray-300 p-2 text-black rounded focus:border-blue-500 outline-none"
            {...register("password")}
            placeholder="Password"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            reset();
          }}
          className="text-blue-600 text-sm hover:underline"
        >
          {isSignUp
            ? "Already have an account? Login"
            : "New student? Create an account"}
        </button>
      </article>
    </main>
  );
};

export default Login;
