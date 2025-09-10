import React from "react";

interface TreesCardProps {
  title: string;
  description: string;
  backgroundImage: string;  
}

const TreesCard: React.FC<TreesCardProps> = ({ title, description, backgroundImage }) => {
  return (
    <div className="relative flex w-full h-[300px] md:h-[300px]   overflow-hidden border-[4px] transition-all duration-300 ease-in-out border-[#7B2D26] rounded-2xl hover:[&>.overlay]:-translate-x-1/2 hover:[&>.image-content]:w-1/3 hover:[&>.overlay-content]:translate-x-1/2 hover:[&>.overlay-content]:border-none hover:[&>.dots]:translate-x-4 hover:[&>.dots>.dot]:bg-white">
      {/* Overlay */}
      <div className="overlay relative z-10 flex h-full w-full bg-[#7B2D26] p-2 transition-all duration-500 ease-in-out">
        <div className="overlay-content z-10 flex h-full w-1/4 flex-col justify-center border-gradient-to-b from-[#aea724] via-green-700 to-[#aea724] p-2 transition-all duration-300 delay-200 animate-slide-left">
          <h1 className="text-center text-white text-lg md:text-xl animate-pop delay-[1.2s]">
            {title}
          </h1>
        </div>

        {/* Image background */}
        <div
          className="image-content absolute border rounded-l-full right-0 top-0 h-full w-2/3 bg-cover transition-all duration-300"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />

      </div>

      {/* Text Content */}
<div className="text absolute right-0 top-0 grid h-full w-2/3 overflow-y-auto 
  bg-[url('/public/lovable-uploads/brown.png')] bg-cover bg-center 
  shadow-[inset_0_0_40px_rgba(0,0,0,0.25)] p-6 md:p-8 
  text-[hsl(35,30%,20%)] leading-relaxed tracking-wide">

  <div className="flex flex-col items-center justify-center pl-16 text-center max-w-prose mx-auto space-y-4">
    <p className="text-sm text-white md:text-base font-old-newspaper">
      {description}
    </p>
  </div>
</div>
    </div>
  );
};

export default TreesCard;
