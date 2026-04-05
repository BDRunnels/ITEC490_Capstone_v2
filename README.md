# Capstone SIEM Dashboard

## Project Summary

This project is a lightweight **Security Information and Event Management (SIEM)** system built as a capstone project. It provides a centralized web dashboard for monitoring and managing security events across multiple Windows machines on a network.

### What It Does

The SIEM system works by deploying small **agents** (PowerShell scripts) to Windows computers on a network. These agents automatically collect important security data from each machine — including hardware details, login activity, system warnings, and antivirus (Windows Defender) alerts — and send it all back to a central server. An administrator can then view everything from a single web-based dashboard, making it much easier to spot potential security issues across the entire network without having to check each computer individually.

### Key Features

- **Computer Inventory** — View all enrolled machines at a glance, including their operating system, CPU, RAM, disk space, IP address, and more.
- **Security Log Monitoring** — Track login attempts (successful and failed), including which user account was used, the logon type, and the source IP address.
- **System & Defender Logs** — Review system-level warnings and Windows Defender threat detections across all machines in one place.
- **CVE Lookup** — Search the National Vulnerability Database (NVD) for known security vulnerabilities (CVEs), with support for date filtering and API key integration to avoid rate limits.
- **Remote Command Execution** — Send commands to enrolled agents directly from the dashboard and view the results when they report back.
- **Agent Deployment** — Download a ready-to-run agent bundle (PowerShell script + launcher) from the dashboard, pre-configured with the correct server address.
- **Admin Controls** — Password-protected admin panel for seeding test data, wiping the database, and managing the environment.
- **Dark/Light Mode** — Toggle between dark and light themes for comfortable viewing.

### How It's Built

The application is split into two main parts, both containerized with **Docker**:

1. **Backend API** — A Python **Flask** server that handles data ingestion from agents, serves log data to the dashboard, and manages admin operations. Data is stored in a **SQLite** database.
2. **Frontend Dashboard** — A **React** single-page application styled with **Material UI** and **Bootstrap**, served through **Nginx**. It communicates with the backend API to display logs, manage computers, and provide admin functionality.

The two services are connected via a Docker bridge network and orchestrated using **Docker Compose**, making it straightforward to spin up the entire system with a single command (`docker-compose up`).
