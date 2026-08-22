@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul

set /p "Prefix=Enter page image prefix: "

if not defined Prefix (
    echo No prefix entered. Nothing was renamed.
    pause
    exit /b 1
)

set "EMO_PREFIX=%Prefix%"
set "EMO_BAT=%~f0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$Lines = Get-Content -LiteralPath $env:EMO_BAT; ^
$Marker = [Array]::IndexOf($Lines, '#__POWERSHELL__'); ^
if ($Marker -lt 0) { exit 99 }; ^
$Code = ($Lines[($Marker + 1)..($Lines.Length - 1)] -join [Environment]::NewLine); ^
& ([ScriptBlock]::Create($Code))"

set "ExitCode=%ERRORLEVEL%"

echo.
pause
exit /b %ExitCode%


#__POWERSHELL__

$ErrorActionPreference = 'Stop'


# ============================================================
# Prefix
# ============================================================

$Prefix = $env:EMO_PREFIX.Trim()

$Prefix = $Prefix -replace '\s+', '-'
$Prefix = $Prefix -replace '[<>:"/\\|?*]', '-'
$Prefix = $Prefix -replace '-+', '-'
$Prefix = $Prefix.Trim('-')

if ([string]::IsNullOrWhiteSpace($Prefix)) {
    Write-Host 'ERROR: Prefix became empty.'
    exit 1
}

Write-Host ''
Write-Host "Prefix: $Prefix"
Write-Host ''


# ============================================================
# Official page images
# ============================================================

$Specs = @(

    [PSCustomObject]@{
        Name       = 'HeroL'
        Canonical  = 'HeroL.webp'
        Aliases    = @(
            'HeroL.webp'
        )
        Width      = 1920
        Height     = 911
        Extensions = @(
            '.webp'
        )
    },

    [PSCustomObject]@{
        Name       = 'HeroP'
        Canonical  = 'HeroP.webp'
        Aliases    = @(
            'HeroP.webp'
        )
        Width      = 360
        Height     = 680
        Extensions = @(
            '.webp'
        )
    },

    [PSCustomObject]@{
        Name       = 'Schema 1x1'
        Canonical  = 'Schema-1x1-1200x1200.webp'
        Aliases    = @(
            'Schema-1x1-1200x1200.webp',
            'Schema-1x1-1200.webp'
        )
        Width      = 1200
        Height     = 1200
        Extensions = @(
            '.webp'
        )
    },

    [PSCustomObject]@{
        Name       = 'Schema 4x3'
        Canonical  = 'Schema-4x3-1200x900.webp'
        Aliases    = @(
            'Schema-4x3-1200x900.webp',
            'Schema-4x3-1200.webp'
        )
        Width      = 1200
        Height     = 900
        Extensions = @(
            '.webp'
        )
    },

    [PSCustomObject]@{
        Name       = 'Schema 16x9'
        Canonical  = 'Schema-16x9-1200x675.webp'
        Aliases    = @(
            'Schema-16x9-1200x675.webp',
            'Schema-16x9-1200.webp'
        )
        Width      = 1200
        Height     = 675
        Extensions = @(
            '.webp'
        )
    },

    [PSCustomObject]@{
        Name       = 'Share'
        Canonical  = 'Share.jpg'
        Aliases    = @(
            'Share.jpg',
            'Share.jpeg'
        )
        Width      = 1200
        Height     = 630
        Extensions = @(
            '.jpg',
            '.jpeg'
        )
    }
)


# ============================================================
# Binary helpers
# ============================================================

function Get-UInt16BE {

    param(
        [byte[]]$Bytes,
        [int]$Offset
    )

    return (
        ([int]$Bytes[$Offset] -shl 8) -bor
        [int]$Bytes[$Offset + 1]
    )
}


function Get-UInt32LE {

    param(
        [byte[]]$Bytes,
        [int]$Offset
    )

    return (
        [int64]$Bytes[$Offset] -bor
        ([int64]$Bytes[$Offset + 1] -shl 8) -bor
        ([int64]$Bytes[$Offset + 2] -shl 16) -bor
        ([int64]$Bytes[$Offset + 3] -shl 24)
    )
}


# ============================================================
# PNG dimensions
# ============================================================

function Get-PngSize {

    param(
        [byte[]]$Bytes
    )

    if ($Bytes.Length -lt 24) {
        return $null
    }

    if (
        $Bytes[0] -ne 0x89 -or
        $Bytes[1] -ne 0x50 -or
        $Bytes[2] -ne 0x4E -or
        $Bytes[3] -ne 0x47
    ) {
        return $null
    }

    $Width = (
        ([int64]$Bytes[16] -shl 24) -bor
        ([int64]$Bytes[17] -shl 16) -bor
        ([int64]$Bytes[18] -shl 8) -bor
        [int64]$Bytes[19]
    )

    $Height = (
        ([int64]$Bytes[20] -shl 24) -bor
        ([int64]$Bytes[21] -shl 16) -bor
        ([int64]$Bytes[22] -shl 8) -bor
        [int64]$Bytes[23]
    )

    return [PSCustomObject]@{
        Width  = [int]$Width
        Height = [int]$Height
        Format = 'PNG'
    }
}


# ============================================================
# JPEG dimensions
# ============================================================

function Get-JpegSize {

    param(
        [byte[]]$Bytes
    )

    if (
        $Bytes.Length -lt 4 -or
        $Bytes[0] -ne 0xFF -or
        $Bytes[1] -ne 0xD8
    ) {
        return $null
    }

    $Offset = 2

    $SofMarkers = @(
        0xC0, 0xC1, 0xC2, 0xC3,
        0xC5, 0xC6, 0xC7,
        0xC9, 0xCA, 0xCB,
        0xCD, 0xCE, 0xCF
    )

    while ($Offset -lt ($Bytes.Length - 9)) {

        while (
            $Offset -lt $Bytes.Length -and
            $Bytes[$Offset] -ne 0xFF
        ) {
            $Offset++
        }

        while (
            $Offset -lt $Bytes.Length -and
            $Bytes[$Offset] -eq 0xFF
        ) {
            $Offset++
        }

        if ($Offset -ge $Bytes.Length) {
            break
        }

        $Marker = [int]$Bytes[$Offset]
        $Offset++

        if (
            $Marker -eq 0xD9 -or
            $Marker -eq 0xDA
        ) {
            break
        }

        if (
            $Marker -eq 0xD8 -or
            ($Marker -ge 0xD0 -and $Marker -le 0xD7)
        ) {
            continue
        }

        if ($Offset + 1 -ge $Bytes.Length) {
            break
        }

        $SegmentLength = Get-UInt16BE $Bytes $Offset

        if ($SegmentLength -lt 2) {
            break
        }

        if ($SofMarkers -contains $Marker) {

            if ($Offset + 6 -ge $Bytes.Length) {
                break
            }

            $Height = Get-UInt16BE $Bytes ($Offset + 3)
            $Width = Get-UInt16BE $Bytes ($Offset + 5)

            return [PSCustomObject]@{
                Width  = $Width
                Height = $Height
                Format = 'JPEG'
            }
        }

        $Offset += $SegmentLength
    }

    return $null
}


# ============================================================
# WebP dimensions
# Supports VP8X / VP8 / VP8L
# ============================================================

function Get-WebPSize {

    param(
        [byte[]]$Bytes
    )

    if ($Bytes.Length -lt 16) {
        return $null
    }

    $Riff = [Text.Encoding]::ASCII.GetString(
        $Bytes,
        0,
        4
    )

    $WebP = [Text.Encoding]::ASCII.GetString(
        $Bytes,
        8,
        4
    )

    if (
        $Riff -ne 'RIFF' -or
        $WebP -ne 'WEBP'
    ) {
        return $null
    }

    $Offset = 12

    while ($Offset + 8 -le $Bytes.Length) {

        $Chunk = [Text.Encoding]::ASCII.GetString(
            $Bytes,
            $Offset,
            4
        )

        $ChunkSize = Get-UInt32LE $Bytes ($Offset + 4)
        $Payload = $Offset + 8

        if ($Payload + $ChunkSize -gt $Bytes.Length) {
            break
        }

        # VP8X
        if (
            $Chunk -eq 'VP8X' -and
            $ChunkSize -ge 10
        ) {

            $WidthMinusOne = (
                [int]$Bytes[$Payload + 4] -bor
                ([int]$Bytes[$Payload + 5] -shl 8) -bor
                ([int]$Bytes[$Payload + 6] -shl 16)
            )

            $HeightMinusOne = (
                [int]$Bytes[$Payload + 7] -bor
                ([int]$Bytes[$Payload + 8] -shl 8) -bor
                ([int]$Bytes[$Payload + 9] -shl 16)
            )

            return [PSCustomObject]@{
                Width  = $WidthMinusOne + 1
                Height = $HeightMinusOne + 1
                Format = 'WEBP'
            }
        }

        # VP8
        if (
            $Chunk -eq 'VP8 ' -and
            $ChunkSize -ge 10
        ) {

            if (
                $Bytes[$Payload + 3] -eq 0x9D -and
                $Bytes[$Payload + 4] -eq 0x01 -and
                $Bytes[$Payload + 5] -eq 0x2A
            ) {

                $Width = (
                    [int]$Bytes[$Payload + 6] -bor
                    ([int]$Bytes[$Payload + 7] -shl 8)
                ) -band 0x3FFF

                $Height = (
                    [int]$Bytes[$Payload + 8] -bor
                    ([int]$Bytes[$Payload + 9] -shl 8)
                ) -band 0x3FFF

                return [PSCustomObject]@{
                    Width  = $Width
                    Height = $Height
                    Format = 'WEBP'
                }
            }
        }

        # VP8L
        if (
            $Chunk -eq 'VP8L' -and
            $ChunkSize -ge 5
        ) {

            if ($Bytes[$Payload] -eq 0x2F) {

                $B1 = [int]$Bytes[$Payload + 1]
                $B2 = [int]$Bytes[$Payload + 2]
                $B3 = [int]$Bytes[$Payload + 3]
                $B4 = [int]$Bytes[$Payload + 4]

                $Width = 1 + (
                    ($B1 -bor ($B2 -shl 8)) -band 0x3FFF
                )

                $Height = 1 + (
                    (
                        ($B2 -shr 6) -bor
                        ($B3 -shl 2) -bor
                        ($B4 -shl 10)
                    ) -band 0x3FFF
                )

                return [PSCustomObject]@{
                    Width  = $Width
                    Height = $Height
                    Format = 'WEBP'
                }
            }
        }

        $Offset = $Payload + $ChunkSize

        if (($ChunkSize % 2) -ne 0) {
            $Offset++
        }
    }

    return $null
}


# ============================================================
# Read actual image dimensions
# ============================================================

function Get-ImageSize {

    param(
        [System.IO.FileInfo]$File
    )

    try {

        $Bytes = [System.IO.File]::ReadAllBytes(
            $File.FullName
        )

        $Size = Get-WebPSize $Bytes

        if ($null -ne $Size) {
            return $Size
        }

        $Size = Get-JpegSize $Bytes

        if ($null -ne $Size) {
            return $Size
        }

        $Size = Get-PngSize $Bytes

        if ($null -ne $Size) {
            return $Size
        }

        return $null
    }
    catch {

        return $null
    }
}


# ============================================================
# Detect by known filename
#
# Error-* is ignored HERE only.
#
# That prevents a previously rejected file from being accepted
# again merely because its name still ends with HeroL.webp etc.
#
# It can still be recovered later by DIMENSION fallback.
# ============================================================

function Find-NamedCandidate {

    param(
        $Spec
    )

    foreach ($Alias in $Spec.Aliases) {

        $ExactPath = Join-Path $PWD $Alias

        if (
            Test-Path `
                -LiteralPath $ExactPath `
                -PathType Leaf
        ) {

            return [PSCustomObject]@{
                File      = Get-Item -LiteralPath $ExactPath
                Ambiguous = $false
            }
        }
    }

    $Matches = @(

        Get-ChildItem `
            -LiteralPath $PWD `
            -File |

        Where-Object {

            if (
                $_.Name.StartsWith(
                    'Error-',
                    [StringComparison]::OrdinalIgnoreCase
                )
            ) {
                return $false
            }

            $CurrentName = $_.Name
            $Found = $false

            foreach ($Alias in $Spec.Aliases) {

                if (
                    $CurrentName.EndsWith(
                        $Alias,
                        [StringComparison]::OrdinalIgnoreCase
                    )
                ) {

                    $Found = $true
                    break
                }
            }

            $Found
        }
    )

    if ($Matches.Count -eq 1) {

        return [PSCustomObject]@{
            File      = $Matches[0]
            Ambiguous = $false
        }
    }

    if ($Matches.Count -gt 1) {

        Write-Host "AMBIGUOUS NAME [$($Spec.Name)]"

        foreach ($File in $Matches) {
            Write-Host "    $($File.Name)"
        }

        return [PSCustomObject]@{
            File      = $null
            Ambiguous = $true
        }
    }

    return [PSCustomObject]@{
        File      = $null
        Ambiguous = $false
    }
}


# ============================================================
# Fallback detection by REAL image dimensions
#
# IMPORTANT:
# Error-* files ARE INCLUDED here.
#
# If you corrected an Error image in Photoshop, the next run
# detects its new valid dimensions and gives it the proper name.
# ============================================================

function Find-DimensionCandidate {

    param(
        $Spec
    )

    $Matches = @()
    $WrongFormatMatches = @()

    $Images = @(

        Get-ChildItem `
            -LiteralPath $PWD `
            -File |

        Where-Object {

            $Extension = $_.Extension.ToLowerInvariant()

            $Extension -in @(
                '.webp',
                '.jpg',
                '.jpeg',
                '.png'
            )
        }
    )

    foreach ($File in $Images) {

        $Size = Get-ImageSize $File

        if ($null -eq $Size) {
            continue
        }

        if (
            $Size.Width -eq $Spec.Width -and
            $Size.Height -eq $Spec.Height
        ) {

            $Extension = $File.Extension.ToLowerInvariant()

            if ($Spec.Extensions -contains $Extension) {

                $Matches += $File
            }
            else {

                $WrongFormatMatches += [PSCustomObject]@{
                    File = $File
                    Size = $Size
                }
            }
        }
    }

    if ($Matches.Count -eq 1) {

        return [PSCustomObject]@{
            File      = $Matches[0]
            Ambiguous = $false
        }
    }

    if ($Matches.Count -gt 1) {

        Write-Host (
            "AMBIGUOUS SIZE [{0}] {1}x{2}" -f
            $Spec.Name,
            $Spec.Width,
            $Spec.Height
        )

        foreach ($File in $Matches) {
            Write-Host "    $($File.Name)"
        }

        return [PSCustomObject]@{
            File      = $null
            Ambiguous = $true
        }
    }

    if ($WrongFormatMatches.Count -gt 0) {

        Write-Host (
            "SIZE FOUND BUT WRONG FORMAT [{0}] {1}x{2}" -f
            $Spec.Name,
            $Spec.Width,
            $Spec.Height
        )

        foreach ($Match in $WrongFormatMatches) {

            Write-Host (
                "    {0} [{1}]" -f
                $Match.File.Name,
                $Match.Size.Format
            )
        }
    }

    return [PSCustomObject]@{
        File      = $null
        Ambiguous = $false
    }
}


# ============================================================
# Rename valid image
# ============================================================

function Rename-PageImage {

    param(
        [System.IO.FileInfo]$Source,
        [string]$TargetName,
        [string]$Reason
    )

    $TargetPath = Join-Path $PWD $TargetName

    if (
        Test-Path `
            -LiteralPath $TargetPath `
            -PathType Leaf
    ) {

        Write-Host "SKIP    target already exists: $TargetName"
        return
    }

    try {

        Rename-Item `
            -LiteralPath $Source.FullName `
            -NewName $TargetName

        Write-Host (
            "RENAMED [{0}] {1}  ->  {2}" -f
            $Reason,
            $Source.Name,
            $TargetName
        )
    }
    catch {

        Write-Host (
            "ERROR   {0}  ->  {1}" -f
            $Source.Name,
            $TargetName
        )

        Write-Host "        $($_.Exception.Message)"
    }
}


# ============================================================
# Mark wrong-sized known image temporarily
# ============================================================

function Mark-InvalidImage {

    param(
        [System.IO.FileInfo]$Source,
        $Spec,
        $ActualSize
    )

    $CanonicalErrorName = (
        "Error-{0}-{1}" -f
        $Prefix,
        $Spec.Canonical
    )

    $ErrorName = $CanonicalErrorName
    $ErrorPath = Join-Path $PWD $ErrorName

    if (
        Test-Path `
            -LiteralPath $ErrorPath `
            -PathType Leaf
    ) {

        $Counter = 2

        $BaseName = [System.IO.Path]::GetFileNameWithoutExtension(
            $CanonicalErrorName
        )

        $Extension = [System.IO.Path]::GetExtension(
            $CanonicalErrorName
        )

        do {

            $ErrorName = (
                "{0}-{1}{2}" -f
                $BaseName,
                $Counter,
                $Extension
            )

            $ErrorPath = Join-Path $PWD $ErrorName

            $Counter++

        } while (
            Test-Path `
                -LiteralPath $ErrorPath `
                -PathType Leaf
        )
    }

    try {

        Rename-Item `
            -LiteralPath $Source.FullName `
            -NewName $ErrorName

        Write-Host (
            "INVALID SIZE [{0}]" -f
            $Spec.Name
        )

        Write-Host (
            "    File:     {0}" -f
            $ErrorName
        )

        Write-Host (
            "    Expected: {0}x{1}" -f
            $Spec.Width,
            $Spec.Height
        )

        if ($null -eq $ActualSize) {

            Write-Host '    Actual:   unreadable'
        }
        else {

            Write-Host (
                "    Actual:   {0}x{1}" -f
                $ActualSize.Width,
                $ActualSize.Height
            )
        }
    }
    catch {

        Write-Host (
            "ERROR   Could not mark invalid image: {0}" -f
            $Source.Name
        )

        Write-Host "        $($_.Exception.Message)"
    }
}


# ============================================================
# Process all six images
# ============================================================

foreach ($Spec in $Specs) {

    $TargetName = (
        "{0}-{1}" -f
        $Prefix,
        $Spec.Canonical
    )

    $TargetPath = Join-Path $PWD $TargetName

    Write-Host '----------------------------------------'

    Write-Host (
        "{0}  [{1}x{2}]" -f
        $Spec.Name,
        $Spec.Width,
        $Spec.Height
    )


    # ========================================================
    # File already has the final target name.
    # Still verify its actual dimensions.
    # ========================================================

    if (
        Test-Path `
            -LiteralPath $TargetPath `
            -PathType Leaf
    ) {

        $ExistingFile = Get-Item -LiteralPath $TargetPath
        $ExistingSize = Get-ImageSize $ExistingFile

        if (
            $null -ne $ExistingSize -and
            $ExistingSize.Width -eq $Spec.Width -and
            $ExistingSize.Height -eq $Spec.Height
        ) {

            Write-Host "OK      $TargetName"
            continue
        }

        Mark-InvalidImage `
            -Source $ExistingFile `
            -Spec $Spec `
            -ActualSize $ExistingSize

        # Continue after moving it to Error-*.
        # Another corrected or random-name valid image may exist.
    }


    # ========================================================
    # Priority 1: known filename
    # ========================================================

    $Named = Find-NamedCandidate $Spec

    if ($Named.Ambiguous) {
        continue
    }

    if ($null -ne $Named.File) {

        $ActualSize = Get-ImageSize $Named.File

        if (
            $null -eq $ActualSize -or
            $ActualSize.Width -ne $Spec.Width -or
            $ActualSize.Height -ne $Spec.Height
        ) {

            Mark-InvalidImage `
                -Source $Named.File `
                -Spec $Spec `
                -ActualSize $ActualSize

            # Don't stop.
            # Try dimension fallback after marking the bad file.
        }
        else {

            Rename-PageImage `
                -Source $Named.File `
                -TargetName $TargetName `
                -Reason 'NAME + SIZE'

            continue
        }
    }


    # ========================================================
    # Priority 2: real dimensions
    #
    # This includes Error-* files.
    #
    # Therefore:
    # Error-Page-HeroL.webp
    # corrected in Photoshop to 1920x911
    #
    # will automatically become:
    # Page-HeroL.webp
    # ========================================================

    $Dimension = Find-DimensionCandidate $Spec

    if ($Dimension.Ambiguous) {
        continue
    }

    if ($null -ne $Dimension.File) {

        Rename-PageImage `
            -Source $Dimension.File `
            -TargetName $TargetName `
            -Reason 'SIZE'

        continue
    }


    # ========================================================
    # Nothing valid found
    # ========================================================

    Write-Host (
        "MISSING no valid file found for {0}x{1}" -f
        $Spec.Width,
        $Spec.Height
    )
}


Write-Host ''
Write-Host '========================================'
Write-Host 'Done.'
Write-Host '========================================'