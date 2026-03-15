import React from 'react'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function Loader() {

  const container = useRef();

  // Animation setting
  useGSAP(()=>{
    gsap.to('.outter',{
      rotate : 360,
      duration : 1,
      repeat : -1
    })
  },[container])

  // Website UI
  return (
    <div ref={container} className='flex justify-center items-center h-1/2 w-full' >

      {/* The rotating div */}
      <div className='outter h-20 w-20 relative bg-gray-700 rounded-full flex items-center justify-center'>
        <div className='inner-top absolute h-5 w-10 top-0 left-5 bg-black'></div>
        <div className='h-15 w-15 rounded-full bg-black'></div>
      </div>
    </div>
  )
}
