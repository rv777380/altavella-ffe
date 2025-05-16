# altavella-ffe
Lourini FFE Ordering System
Overview
This repository contains the Furniture and Fabrics Ordering System for the Lourini catalog, deployed at altavella.com/ffe. The system consists of a chatbot interface for customers to browse and order products, a backend API for order processing, and an admin dashboard for order management.
System Components
Customer-Facing Components

Interactive Chatbot: Allows customers to browse the Lourini catalog, select fabrics and furniture items, and place orders
Order Tracking: Customers can check the status of their orders using their order number

Administrative Components

Admin Dashboard: Complete order management system (accessible at altavella.com/ffe/admin)
Order Management: View, filter, and update orders
Sales Analytics: Visual reports of sales data and trends
Inventory Management: Track product availability and popularity

Repository Structure
altavella-ffe/
├── frontend/                   # Customer-facing chatbot interface
│   ├── api/                    # API client for backend communication
│   ├── components/             # UI components
│   ├── catalog.js              # Product catalog data
│   ├── chatbot.js              # Chatbot implementation
│   ├── index.html              # Main entry point
│   └── styles.css              # Chatbot styling
│
├── admin/                      # Admin dashboard
│   ├── src/                    # React application source
│   │   ├── components/         # Dashboard UI components
│   │   ├── services/           # API services
│   │   └── styles/             # Dashboard styling
│   └── package.json            # Admin dependencies
└── README.md                   # This file
Updating the System
Updating the Product Catalog

Log in to GitHub and navigate to this repository
Open frontend/catalog.js
Click the pencil icon to edit the file
Update product data as needed
Commit your changes with a descriptive message
Cloudflare will automatically deploy the changes

Modifying the Chatbot

Navigate to frontend/chatbot.js in GitHub
Edit the conversation flow, prompts, or functionality
Commit your changes
Test the updates on the live site

Customizing the Admin Dashboard

Navigate to the admin/ directory in GitHub
Modify component files as needed
Commit your changes
Cloudflare will automatically rebuild and deploy the dashboard

Backend Management
The backend is implemented as a Cloudflare Worker with a D1 database:

Log in to the Cloudflare dashboard
Navigate to Workers & Pages > lourini-ffe-api
Use the web editor to modify the API code
Use the D1 dashboard to view and query the database

Administrator Guide

Access the admin dashboard at: altavella.com/ffe/admin
Log in with your administrator credentials
The dashboard home shows key metrics and recent orders
Use the sidebar navigation to access different sections:

Orders: View and manage all orders
Products: Update product inventory
Customers: View customer information
Analytics: Access sales reports



Managing Orders

View all orders in the Orders section
Click on an order to see details
Update order status using the dropdown menu
Add internal notes visible only to staff
View customer contact information for follow-up

Troubleshooting
Common Issues

Chatbot not loading: Check Cloudflare Pages deployment status
Admin login issues: Reset admin password through Cloudflare Worker
Order submission errors: Check Worker logs in Cloudflare dashboard

Getting Support
For technical assistance, contact the development team at support@altavella.com
Security Notes

Admin credentials should be kept secure
API keys and sensitive data are stored as Cloudflare environment variables
Regular security audits are recommended


Last updated: May 16, 2025
