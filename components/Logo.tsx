import Image from "next/image";

export default function Logo() {
  return (
    <div className="absolute left-4 md:left-8 top-4 md:top-6 w-[62px] h-[33px]">
      <div className="relative w-full h-full">
        {/* A letter */}
        <div className="absolute left-0 right-[49.84%] top-0 bottom-[0.09%]">
          <Image
            src="/assets/logo-a.svg"
            alt="A"
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* w letter */}
        <div className="absolute left-[44.49%] right-0 top-[28.81%] bottom-0">
          <Image
            src="/assets/logo-w.svg"
            alt="w"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
