/* ==========================================================
   Windows Hardware Logs
===========================================================*/
export function hardwareScript() {
    return `
try {
    $os   = Get-CimInstance Win32_OperatingSystem
    $cpu  = Get-CimInstance Win32_Processor
    $ram  = Get-CimInstance Win32_ComputerSystem
    $disk = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
    $nic  = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=TRUE"

    $primaryNic = $nic | Where-Object { $_.IPAddress -ne $null } | Select-Object -First 1
    $diskFree = ($disk | Where-Object { $_.FreeSpace -ne $null } | Measure-Object FreeSpace -Sum).Sum

    $payload = @{
        type          = "hardware"
        hostname      = $env:COMPUTERNAME
        timestamp     = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        os            = $os.Caption
        cpu           = $cpu.Name
        ram_gb        = [math]::Round($ram.TotalPhysicalMemory / 1GB)
        disk_free_gb  = [math]::Round($diskFree / 1GB)
        ip            = $primaryNic.IPAddress[0]
        mac           = $primaryNic.MACAddress
        serial        = (Get-CimInstance Win32_BIOS).SerialNumber
    }
}
catch {
    $payload = @{
        type      = "hardware"
        hostname  = $env:COMPUTERNAME
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        error     = $_.Exception.Message
    }
}

Invoke-RestMethod -Uri "__API_URL__/api/report" -Method POST -Body ($payload | ConvertTo-Json -Depth 6) -ContentType "application/json"
`;
}

/* ==========================================================
   Windows Security Logs
===========================================================*/
export function securityScript() {
    return `
$events = Get-WinEvent -LogName Security -MaxEvents 50

foreach ($e in $events) {

    $eventId   = $e.Id
    $username  = $null
    $logonType = $null
    $sourceIP  = $null
    $status    = "other"

    # Defensive extraction
    if ($e.Properties.Count -ge 19) {
        $username  = $e.Properties[5].Value
        $logonType = $e.Properties[8].Value
        $sourceIP  = $e.Properties[18].Value
    }

    # Full rendered message text
    $message = $e | Format-List * | Out-String

    $payload = @{
        type       = "security"
        hostname   = $env:COMPUTERNAME
        timestamp  = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss")
        event_id   = $eventId
        username   = $username
        logon_type = $logonType
        source_ip  = $sourceIP
        status     = $status
        message    = $message
    }

    Invoke-RestMethod -Uri "__API_URL__/api/report" -Method POST -Body ($payload | ConvertTo-Json -Depth 6) -ContentType "application/json"
}
`;
}

/* ==========================================================
    Windows System Logs
===========================================================*/
export function systemScript() {
    return `
$events = Get-WinEvent -LogName System -MaxEvents 50

foreach ($e in $events) {

    $message = $e | Format-List * | Out-String

    $payload = @{
        type       = "system"
        hostname   = $env:COMPUTERNAME
        timestamp  = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss")
        event_id   = $e.Id
        level      = $e.LevelDisplayName
        provider   = $e.ProviderName
        message    = $message
    }

    Invoke-RestMethod -Uri "__API_URL__/api/report" -Method POST -Body ($payload | ConvertTo-Json -Depth 6) -ContentType "application/json"
}
`;
}

/* =======================================================
    Windows Defender
========================================================*/
export function defenderScript() {
    return `
$events = Get-WinEvent -LogName "Microsoft-Windows-Windows Defender/Operational" -MaxEvents 50
if ($events.Count -eq 0) {
    $payload = @{
        type        = "defender"
        hostname    = $env:COMPUTERNAME
        timestamp   = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        event_id    = 0
        threat_name = $null
        message     = "No Defender events found"
    }

    Invoke-RestMethod -Uri "__API_URL__/api/report" -Method POST -Body ($payload | ConvertTo-Json -Depth 6) -ContentType "application/json"
    return
}
    
foreach ($e in $events) {

    $message = $e | Format-List * | Out-String

    $threat = $null
    if ($e.Properties.Count -gt 0) {
        $threat = $e.Properties[0].Value
    }

    $payload = @{
        type        = "defender"
        hostname    = $env:COMPUTERNAME
        timestamp   = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss")
        event_id    = $e.Id
        threat_name = $threat
        message     = $message
    }

    Invoke-RestMethod -Uri "__API_URL__/api/report" -Method POST -Body ($payload | ConvertTo-Json -Depth 6) -ContentType "application/json"
}
`;
}

/* -------------------------
   Script Generator
------------------------- */
export function buildScriptForLogType(type) {
    switch (type) {
        case "hardware": return hardwareScript();
        case "security": return securityScript();
        case "system": return systemScript();
        case "defender": return defenderScript();
        default: return null;
    }
}
