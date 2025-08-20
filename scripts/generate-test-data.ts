import * as XLSX from "xlsx"

function generateTestExcelFile() {
  // Sample task data
  const testTasks = [
    {
      "Task ID": "TSK001",
      "Task Title": "Customer Support - Handle Email Inquiries",
      Description: "Respond to customer emails within 24 hours and resolve basic inquiries",
      Priority: "High",
      Category: "Customer Service",
      "Estimated Hours": 2,
      "Due Date": "2024-01-15",
      Status: "Pending",
    },
    {
      "Task ID": "TSK002",
      "Task Title": "Data Entry - Update Customer Records",
      Description: "Update customer information in the database with latest contact details",
      Priority: "Medium",
      Category: "Data Management",
      "Estimated Hours": 1.5,
      "Due Date": "2024-01-16",
      Status: "Pending",
    },
    {
      "Task ID": "TSK003",
      "Task Title": "Quality Assurance - Test New Features",
      Description: "Test the new dashboard features and report any bugs or issues found",
      Priority: "High",
      Category: "QA Testing",
      "Estimated Hours": 3,
      "Due Date": "2024-01-17",
      Status: "Pending",
    },
    {
      "Task ID": "TSK004",
      "Task Title": "Content Creation - Write Blog Post",
      Description: "Create a 1000-word blog post about industry best practices",
      Priority: "Medium",
      Category: "Content",
      "Estimated Hours": 4,
      "Due Date": "2024-01-18",
      Status: "Pending",
    },
    {
      "Task ID": "TSK005",
      "Task Title": "Research - Market Analysis",
      Description: "Conduct research on competitor pricing and features",
      Priority: "Low",
      Category: "Research",
      "Estimated Hours": 2.5,
      "Due Date": "2024-01-19",
      Status: "Pending",
    },
    {
      "Task ID": "TSK006",
      "Task Title": "Social Media - Create Posts",
      Description: "Design and schedule social media posts for the week",
      Priority: "Medium",
      Category: "Marketing",
      "Estimated Hours": 2,
      "Due Date": "2024-01-20",
      Status: "Pending",
    },
    {
      "Task ID": "TSK007",
      "Task Title": "Documentation - Update User Manual",
      Description: "Update the user manual with new feature descriptions",
      Priority: "Low",
      Category: "Documentation",
      "Estimated Hours": 3,
      "Due Date": "2024-01-21",
      Status: "Pending",
    },
    {
      "Task ID": "TSK008",
      "Task Title": "Sales Follow-up - Contact Leads",
      Description: "Follow up with potential customers who showed interest",
      Priority: "High",
      Category: "Sales",
      "Estimated Hours": 2,
      "Due Date": "2024-01-22",
      Status: "Pending",
    },
    {
      "Task ID": "TSK009",
      "Task Title": "Inventory Management - Stock Check",
      Description: "Perform monthly inventory check and update stock levels",
      Priority: "Medium",
      Category: "Operations",
      "Estimated Hours": 1.5,
      "Due Date": "2024-01-23",
      Status: "Pending",
    },
    {
      "Task ID": "TSK010",
      "Task Title": "Training - Prepare Materials",
      Description: "Prepare training materials for new employee onboarding",
      Priority: "Medium",
      Category: "HR",
      "Estimated Hours": 4,
      "Due Date": "2024-01-24",
      Status: "Pending",
    },
    {
      "Task ID": "TSK011",
      "Task Title": "Financial Review - Monthly Reports",
      Description: "Review and analyze monthly financial reports",
      Priority: "High",
      Category: "Finance",
      "Estimated Hours": 3,
      "Due Date": "2024-01-25",
      Status: "Pending",
    },
    {
      "Task ID": "TSK012",
      "Task Title": "System Maintenance - Server Updates",
      Description: "Perform routine server maintenance and security updates",
      Priority: "High",
      Category: "IT",
      "Estimated Hours": 2,
      "Due Date": "2024-01-26",
      Status: "Pending",
    },
    {
      "Task ID": "TSK013",
      "Task Title": "Customer Feedback - Survey Analysis",
      Description: "Analyze customer feedback surveys and prepare summary report",
      Priority: "Medium",
      Category: "Analytics",
      "Estimated Hours": 2.5,
      "Due Date": "2024-01-27",
      Status: "Pending",
    },
    {
      "Task ID": "TSK014",
      "Task Title": "Product Development - Feature Planning",
      Description: "Plan and document requirements for upcoming product features",
      Priority: "High",
      Category: "Product",
      "Estimated Hours": 4,
      "Due Date": "2024-01-28",
      Status: "Pending",
    },
    {
      "Task ID": "TSK015",
      "Task Title": "Compliance Check - Policy Review",
      Description: "Review company policies for compliance with new regulations",
      Priority: "Medium",
      Category: "Legal",
      "Estimated Hours": 3,
      "Due Date": "2024-01-29",
      Status: "Pending",
    },
  ]

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(testTasks)

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks")

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

  console.log("✅ Test Excel file generated successfully!")
  console.log(`📊 Generated ${testTasks.length} sample tasks`)
  console.log("📁 File ready for download")

  return excelBuffer
}

// Generate the file
try {
  const buffer = generateTestExcelFile()

  // In a browser environment, this would trigger a download
  if (typeof window !== "undefined") {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sample-tasks.xlsx"
    link.click()
    window.URL.revokeObjectURL(url)
  }
} catch (error) {
  console.error("❌ Error generating test file:", error)
}
