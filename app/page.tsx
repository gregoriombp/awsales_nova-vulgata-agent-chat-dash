import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col lg:flex-row w-full h-full items-center justify-between">
          {/* Left Side - Login Form */}
          <div className="flex items-center justify-center w-full lg:min-w-[793px] lg:w-[793px] h-full relative px-8 py-12 lg:px-0">
            <Logo />
            <div className="w-full max-w-[431px]">
              <LoginForm />
            </div>
          </div>

          {/* Right Side - Background Art */}
          <div className="hidden lg:flex flex-1 h-full items-center justify-end overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatedBackground />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
