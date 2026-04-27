export const knowledgeBase = [
  {
    intent: "create_invoice",
    keywords: ["invoice", "bill", "create bill", "make invoice"],
    response: {
      text: "To create an invoice:\n1. Go to Billing Page\n2. Select customer\n3. Add products\n4. Click Save",
      actions: [
        { label: "Go to Billing", route: "/billing" }
      ]
    }
  },
  {
    intent: "add_customer",
    keywords: ["add customer", "new customer", "create customer"],
    response: {
      text: "To add a customer:\n1. Go to Customers\n2. Click Add Customer\n3. Fill details\n4. Save",
      actions: [
        { label: "Add Customer", route: "/customers" }
      ]
    }
  },
  {
    intent: "view_sales",
    keywords: ["sales", "view sales", "reports"],
    response: {
      text: "To view sales:\n1. Go to Reports\n2. Select date range\n3. View summary"
    }
  },
  {
    intent: "gst_info",
    keywords: ["gst", "tax", "gst report"],
    response: {
      text: "GST is calculated automatically in invoices. You can view GST reports in Reports section."
    }
  }
];