import { contentArray } from '@/lib/data'
import React from 'react'

interface FileFolderProps {
  children: React.ReactNode,
  tabPos: string,
  onClick: () => void
  variant: 'work' | 'education' | 'life' | 'other'
  title: string
}

const variantColors = {
  // change these to pastel type colours.
  work: '#dbeafe',
  education: '#FEE2E2',
  life: '#E7FCDC',
  other: 'white'
}

const FileFolder: React.FC<FileFolderProps> = (props: FileFolderProps) => {
  const { children, tabPos, onClick, variant, title } = props
  
  // max height of 16 on the content
  const color = variantColors[variant] // fill colour for the tab isnt working.
  console.log(color)

  return (
    <div className="w-full -mt-5 pr-1 pl-1" style={{transform: "rotateX(-15deg)"}} onClick={() => onClick()}>
      <div className="transition ease-in-out hover:-translate-y-1">
        <div className='w-full grid grid-cols-4'>
          <div className={`${tabPos} pl-2`}>
            <div className="absolute pl-2 pt-2">
              <p className="text-xxxs">{title}</p>
            </div>
            <svg className="relative -z-10" viewBox="0 0 119 27" xmlns="http://www.w3.org/2000/svg" strokeWidth="1">
              <path fillRule="evenodd" clipRule="evenodd" fill={color} stroke="black" d="M9.86384 6.1093L1 26H118L109.136 6.1093C108.48 4.6374 107.425 3.37893 106.089 2.4768C104.665 1.51431 102.985 1 101.266 1H17.7343C16.0151 1 14.3351 1.51431 12.9105 2.4768C11.5753 3.37893 10.5198 4.6374 9.86384 6.1093Z"/>
            </svg>
          </div>
        </div>
        <div className="max-h-16 border-t border-r border-l border-black rounded-t -mt-0.5 bg-white">
          <div className="pl-4 h-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileFolder