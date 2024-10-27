# Set the paths for the frontend and backend directories
$frontendPath = "frontend"
$backendPath = "backend"

# Start frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontendPath`"; npm run dev"

# Start backend in another new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backendPath`"; npm run start"
