import React from 'react'
import FileCabinet from '@/components/FileCabinet'
import FileDetails from '@/components/FileDetails'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Container() {
  const [selectedFile, setSelectedFile] = React.useState<null | number>()

  if (selectedFile != null) {
    return (
      <ScrollArea>
        <div>
          <FileDetails onClickBack={() => setSelectedFile(null)} contentId={selectedFile} />
        </div>
      </ScrollArea>
    )
  } else {
  return (
      <div style={{ containerType: 'size'}}>
        <FileCabinet onClickFile={(id: number) => setSelectedFile(id)}>
        </FileCabinet>
      </div>
    )
  }
}
