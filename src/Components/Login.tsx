import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit: SubmitHandler<AuthFormInputs> = async (data) => {
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, data.user, data.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
          name: user.email?.split("@")[0],
          createdAt: serverTimestamp()
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
        setErrorMsg(error.message);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <main
      className="bg-white h-screen w-screen flex justify-center items-center flex-col gap-3 lg:flex-row p-3 font-inter "
      style={{
        backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`
      }}>
      <section
        className="rounded-2xl w-full h-1/2 lg:h-full p-3 text-white"
        style={{
          background:
            "radial-gradient(at 78% 29%, #a7b9ec 0px, transparent 50%), radial-gradient(at 12% 11%, #8594e4 0px, transparent 50%), radial-gradient(at 93.3728448275862% 54.166666666666664%, #48219e 0px, transparent 50%), radial-gradient(at 94% 26%, #430f58 0px, transparent 50%), #09203f"
        }}>
        <header className="flex h-full flex-col gap-3 justify-between items-start md:p-15">
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-wrap">Presidency University</h1>
          <div className="flex flex-col gap-3">
            <h4 className="text-sm md:text-xl">Your digital campus space</h4>
            <h3 className="text-lg md:text-3xl">Empowering students to connect, communicate, and build their campus community</h3>
          </div>
        </header>
      </section>
      <section className="w-full h-1/2 lg:h-full justify-center items-center flex flex-col gap-6">
        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        <h2 className="text-2xl font-semibold text-black">{isSignUp ? "Create Account" : "Login"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input required className="border-2 lg:w-80 border-gray-300 p-2 text-black rounded focus:border-blue-500 outline-none" {...register("user")} placeholder="Email" />
          <input required type="password" className="border-2 border-gray-300 p-2 text-black rounded focus:border-blue-500 outline-none" {...register("password")} placeholder="Password" />
          <button type="submit" className="bg-blue-600 cursor-pointer text-white font-bold py-2 rounded hover:bg-blue-700 transition">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            reset();
          }}
          className="text-blue-600 text-sm hover:underline cursor-pointer">
          {isSignUp ? "Already have an account? Login" : "New student? Create an account"}
        </button>
      </section>
    </main>
  );
};

export default Login;
