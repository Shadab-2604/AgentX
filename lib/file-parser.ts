import * as XLSX from "xlsx"

export interface ParsedTask {
  title: string
  description?: string
}

export interface FileParseResult {
  tasks: ParsedTask[]
  totalTasks: number
}

export function validateFileType(filename: string): boolean {
  const allowedExtensions = [".csv", ".xls", ".xlsx"]
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."))
  return allowedExtensions.includes(extension)
}

export function parseCSV(buffer: Buffer): FileParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

    if (data.length === 0) {
      throw new Error("File is empty")
    }

    // Skip header row if it exists
    const startRow = data[0] && typeof data[0][0] === "string" && data[0][0].toLowerCase().includes("title") ? 1 : 0

    const tasks: ParsedTask[] = []

    for (let i = startRow; i < data.length; i++) {
      const row = data[i]
      if (row && row[0] && typeof row[0] === "string" && row[0].trim()) {
        tasks.push({
          title: row[0].trim(),
          description: row[1] && typeof row[1] === "string" ? row[1].trim() : undefined,
        })
      }
    }

    if (tasks.length === 0) {
      throw new Error("No valid tasks found in file")
    }

    return {
      tasks,
      totalTasks: tasks.length,
    }
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function parseExcel(buffer: Buffer): FileParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

    if (data.length === 0) {
      throw new Error("File is empty")
    }

    // Skip header row if it exists
    const startRow = data[0] && typeof data[0][0] === "string" && data[0][0].toLowerCase().includes("title") ? 1 : 0

    const tasks: ParsedTask[] = []

    for (let i = startRow; i < data.length; i++) {
      const row = data[i]
      if (row && row[0] && typeof row[0] === "string" && row[0].trim()) {
        tasks.push({
          title: row[0].trim(),
          description: row[1] && typeof row[1] === "string" ? row[1].trim() : undefined,
        })
      }
    }

    if (tasks.length === 0) {
      throw new Error("No valid tasks found in file")
    }

    return {
      tasks,
      totalTasks: tasks.length,
    }
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function parseFile(buffer: Buffer, filename: string): FileParseResult {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."))

  switch (extension) {
    case ".csv":
      return parseCSV(buffer)
    case ".xls":
    case ".xlsx":
      return parseExcel(buffer)
    default:
      throw new Error("Unsupported file format. Please upload CSV, XLS, or XLSX files.")
  }
}
