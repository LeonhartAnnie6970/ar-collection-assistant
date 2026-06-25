"use client"

import { useState } from "react"
import { UploadPanel, type ParsedFileData } from "./upload-panel"
import { PreviewPanel } from "./preview-panel"
import { GeneratePanel } from "./generate-panel"

export function ReportCenterPanel() {
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null)

  return (
    <div className="space-y-6">
      {!parsedData ? (
        <UploadPanel onFileParsed={setParsedData} />
      ) : (
        <>
          <PreviewPanel data={parsedData} onReset={() => setParsedData(null)} />
          <GeneratePanel parsedData={parsedData} />
        </>
      )}
    </div>
  )
}
