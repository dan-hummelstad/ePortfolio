import { Button } from '@/components/ui/button'
import { contentArray } from '@/lib/data'
import React from 'react'

interface FileDetailsProps {
  onClickBack: () => void
  contentId: number
}

export default function FileDetails(props: FileDetailsProps) {
  const { onClickBack, contentId } = props

  const onClickReturn = () => {
    onClickBack()
  }

  const content = contentArray[contentId - 1]

  return (
    <>
      <div className='mt-2 ml-2'>
        <Button onClick={() => onClickReturn()}>Back</Button>
      </div>
      <div className="grid grid-cols-6 gap-5 w-full items-center min-h-screen">
        <div className="flex justify-start pl-5">
          {/* Back button */}
          {/* <Button>{'<--'}</Button> */}
        </div>
        <div className="min-h-full col-start-2 col-end-4 space-y-5">
          <h1 className="text-2xl">{content.title}</h1>
          {content.content} 
        </div>
        <div className="justify-center col-start-4 col-end-6 space-y-5">
          {content.images}
          {/* images */}
        </div>
        <div className="flex justify-end pr-5">
          {/* <Button>{'-->'}</Button> */}
          {/* forward button */}
        </div>
      </div>
    </>
  )
}
