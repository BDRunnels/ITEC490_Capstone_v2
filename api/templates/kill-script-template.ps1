# ============================================
# SIEM Agent Kill Script (SYSTEM Task Version)
# ============================================

param(
    [string]$ApiUrl = "__API_URL__"
)

$hostname = $env:COMPUTERNAME
$taskName = "SIEMAgent"
$scriptName = "siem-agent.ps1"

# ---------------------------------------------------------
# Remove SYSTEM Scheduled Task
# ---------------------------------------------------------
try {
    schtasks.exe /Delete /TN $taskName /F | Out-Null
}
catch {}

# ---------------------------------------------------------
# Kill running agent processes
# ---------------------------------------------------------
try {
    Get-Process powershell -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
            if ($cmdLine -match $scriptName) {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
        }
        catch {}
    }
}
catch {}

# ---------------------------------------------------------
# Report kill event to backend
# ---------------------------------------------------------
try {
    $payload = @{
        type      = "agent"
        hostname  = $hostname
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        message   = "agent_killed"
    }

    Invoke-RestMethod -Uri "$ApiUrl/report" -Method POST -Body ($payload | ConvertTo-Json) -ContentType "application/json"
}
catch {}

# ---------------------------------------------------------
# Optional: delete the agent file itself
# ---------------------------------------------------------
# Remove-Item -Path $PSCommandPath -Force
