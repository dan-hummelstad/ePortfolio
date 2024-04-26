import FileFolder from '@/components/FileFolder'
import React, { useState, useEffect } from 'react'

interface CabinetProps {
  onClickFile: (id: number) => void
}

const FileCabinet: React.FC<CabinetProps> = (props: CabinetProps) => {
  const { onClickFile } = props
  const [scale, setScale] = useState(1) // Initial scale

  useEffect(() => {
    function updateScale() {
      const viewportWidth = window.innerWidth;
      const originalWidth = 450; // The original width of the element in pixels
      const buffer = 100; // Optional buffer in pixels to ensure no overflow

      if (viewportWidth < originalWidth + buffer) {
        setScale(viewportWidth / (originalWidth + buffer));
      } else {
        setScale(1);
      }
    }

    updateScale(); // Call when component mounts
    window.addEventListener('resize', updateScale); // Update on window resize

    return () => window.removeEventListener('resize', updateScale); // Cleanup listener
  }, []);

  return (
    <div className="grid-cols-1 w-full h-full flex flex-row min-h-screen justify-center items-center">
      <div style={{transform: `scale(${scale})`}}>
        <div style={{ perspective: '450px'}}>
          <div className="w-96 border border-black" style={{transformOrigin: "0 0", transform: "rotateX(15deg)", transformStyle: "preserve-3d"}}>
            <FileFolder tabPos={"col-start-1"} onClick={() => onClickFile(1)} variant="education" title="education">
              <></>
            </ FileFolder>
            <FileFolder tabPos={"col-start-2"} onClick={() => onClickFile(2)} variant="education" title="griffith">
              <></>
            </ FileFolder>
            <FileFolder tabPos={"col-start-3"} onClick={() => onClickFile(3)} variant="education" title="certificates">
              <></>
            </ FileFolder>
            <FileFolder tabPos={"col-start-2"} onClick={() => onClickFile(4)} variant='work' title="experience">
              <></>
            </FileFolder>
            <FileFolder tabPos={"col-start-3"} onClick={() => onClickFile(5)} variant='work' title="locatrix - jr se">
              <></>
            </FileFolder>
            <FileFolder tabPos={"col-start-3"}  onClick={() => onClickFile(6)} variant='life' title="my skills">
              <></>
            </FileFolder>
            <FileFolder tabPos={"col-start-4"}  onClick={() => onClickFile(7)} variant='other' title="about me">
              <></>
            </FileFolder>
          </div>
        </div>
        <div className="w-full" style={{ transform: 'scale(1.3)'}}>
          <svg className="relative z-10" viewBox="0 0 666 65" fill="white" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M665 11.9397L646.692 64H20.0117L1 12.6432M665 11.9397L662.888 1.38696H1.70414L1 12.6432M665 11.9397L1 12.6432" stroke="black"/>
          </svg>
          <div className="flex flex-row justify-center items-center scale-50">
            <p className="text-xs relative z-20 bg-yellow-300 pl-2 pr-2">Dan's files</p>
          </div>
        </div>
      </div>
      {/* {React.Children.map(children, child => {
        // Here you can modify each child, for instance, cloning the child and adding extra props
        if (React.isValidElement(child)) {
          return React.cloneElement(child);
        }
        return child
      })} */}
    </div>
  )
}

export default FileCabinet
