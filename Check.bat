@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul

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
# Find Astro project root
# ============================================================

function Find-AstroProjectRoot {

    $Current = Split-Path -Parent $env:EMO_BAT

    if ([string]::IsNullOrWhiteSpace($Current)) {
        $Current = (Get-Location).Path
    }

    $Current = [System.IO.Path]::GetFullPath($Current)


    while ($true) {

        $MediaPath = Join-Path $Current 'public\Media'

        if (
            Test-Path `
                -LiteralPath $MediaPath `
                -PathType Container
        ) {
            return $Current
        }


        $Parent = [System.IO.Directory]::GetParent($Current)

        if ($null -eq $Parent) {
            break
        }

        if ($Parent.FullName -eq $Current) {
            break
        }

        $Current = $Parent.FullName
    }


    # Also try current console directory

    $Current = (Get-Location).Path

    while ($true) {

        $MediaPath = Join-Path $Current 'public\Media'

        if (
            Test-Path `
                -LiteralPath $MediaPath `
                -PathType Container
        ) {
            return $Current
        }


        $Parent = [System.IO.Directory]::GetParent($Current)

        if ($null -eq $Parent) {
            break
        }

        if ($Parent.FullName -eq $Current) {
            break
        }

        $Current = $Parent.FullName
    }


    return $null
}


$ProjectRoot = Find-AstroProjectRoot


if ($null -eq $ProjectRoot) {

    Write-Host ''
    Write-Host 'ERROR: Could not find Astro project root.'
    Write-Host 'Expected folder: public\Media'
    Write-Host ''

    exit 1
}


$MediaRoot = Join-Path $ProjectRoot 'public\Media'
$PagesRoot = Join-Path $ProjectRoot 'src\pages'
$ReportPath = Join-Path $ProjectRoot 'Media-Audit.txt'


Write-Host ''
Write-Host '========================================'
Write-Host 'Media audit'
Write-Host '========================================'
Write-Host ''
Write-Host "Project: $ProjectRoot"
Write-Host "Media:   $MediaRoot"
Write-Host ''


# ============================================================
# Official required page assets
# ============================================================

$Specs = @(

    [PSCustomObject]@{
        Key          = 'HeroL'
        Label        = 'Hero Landscape'
        Width        = 1920
        Height       = 911
        FinalSuffix  = 'HeroL.webp'
        OldSuffixes  = @(
            'HeroL.webp',
            'Hero.webp'
        )
        Format       = 'WEBP'
    },

    [PSCustomObject]@{
        Key          = 'HeroP'
        Label        = 'Hero Portrait'
        Width        = 360
        Height       = 680
        FinalSuffix  = 'HeroP.webp'
        OldSuffixes  = @(
            'HeroP.webp'
        )
        Format       = 'WEBP'
    },

    [PSCustomObject]@{
        Key          = 'Schema1x1'
        Label        = 'Schema 1x1'
        Width        = 1200
        Height       = 1200
        FinalSuffix  = 'Schema-1x1-1200x1200.webp'
        OldSuffixes  = @(
            'Schema-1x1-1200.webp'
        )
        Format       = 'WEBP'
    },

    [PSCustomObject]@{
        Key          = 'Schema4x3'
        Label        = 'Schema 4x3'
        Width        = 1200
        Height       = 900
        FinalSuffix  = 'Schema-4x3-1200x900.webp'
        OldSuffixes  = @(
            'Schema-4x3-1200.webp'
        )
        Format       = 'WEBP'
    },

    [PSCustomObject]@{
        Key          = 'Schema16x9'
        Label        = 'Schema 16x9'
        Width        = 1200
        Height       = 675
        FinalSuffix  = 'Schema-16x9-1200x675.webp'
        OldSuffixes  = @(
            'Schema-16x9-1200.webp'
        )
        Format       = 'WEBP'
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


        # ----------------------------------------------------
        # VP8X
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # VP8
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # VP8L
        # ----------------------------------------------------

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
# Read image dimensions from actual file contents
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
# Convert an Astro route part to Media folder naming style
#
# finishing -> Finishing
# con-supervision -> Con-Supervision
# ============================================================

function Convert-ToMediaPart {

    param(
        [string]$Value
    )


    $Pieces = @(
        $Value.Split('-') |
        Where-Object {
            $_.Length -gt 0
        }
    )


    $Result = @()


    foreach ($Piece in $Pieces) {

        if ($Piece.Length -eq 1) {

            $Result += $Piece.ToUpperInvariant()
        }
        else {

            $Result += (
                $Piece.Substring(0, 1).ToUpperInvariant() +
                $Piece.Substring(1)
            )
        }
    }


    return ($Result -join '-')
}


# ============================================================
# Discover page-media folders
#
# Important:
# We do NOT blindly audit every nested media folder.
#
# This avoids reporting things such as:
# Samples
# Raw
# Projects
# Offers
# gallery folders
#
# A folder is audited when:
#
# 1. It corresponds to an actual Astro page route
# OR
# 2. It directly contains Hero / Schema-like files
#
# ============================================================

$FolderSet = @{}


# ------------------------------------------------------------
# Home
# ------------------------------------------------------------

$HomeFolder = Join-Path $MediaRoot 'Home'

if (
    Test-Path `
        -LiteralPath $HomeFolder `
        -PathType Container
) {

    $FolderSet[
        [System.IO.Path]::GetFullPath($HomeFolder).ToLowerInvariant()
    ] = [System.IO.Path]::GetFullPath($HomeFolder)
}


# ------------------------------------------------------------
# Existing folders corresponding to src/pages/*.astro
# ------------------------------------------------------------

if (
    Test-Path `
        -LiteralPath $PagesRoot `
        -PathType Container
) {


    $AstroPages = @(

        Get-ChildItem `
            -LiteralPath $PagesRoot `
            -Recurse `
            -File `
            -Filter '*.astro'
    )


    foreach ($PageFile in $AstroPages) {


        $Relative = $PageFile.FullName.Substring(
            $PagesRoot.Length
        ).TrimStart('\', '/')


        # Skip 404
        if (
            $Relative -ieq '404.astro'
        ) {
            continue
        }


        $RelativeNoExtension = [System.IO.Path]::ChangeExtension(
            $Relative,
            $null
        )


        $RouteParts = @(
            $RelativeNoExtension -split '[\\/]'
        )


        # index.astro means the containing route
        if (
            $RouteParts.Count -gt 0 -and
            $RouteParts[$RouteParts.Count - 1] -ieq 'index'
        ) {

            if ($RouteParts.Count -eq 1) {

                $RouteParts = @()
            }
            else {

                $RouteParts = @(
                    $RouteParts[0..($RouteParts.Count - 2)]
                )
            }
        }


        if ($RouteParts.Count -eq 0) {

            $ExpectedFolder = Join-Path $MediaRoot 'Home'
        }
        else {


            $MediaParts = @()


            foreach ($Part in $RouteParts) {

                # Skip dynamic Astro route segments in this audit
                if (
                    $Part.StartsWith('[') -and
                    $Part.EndsWith(']')
                ) {
                    continue
                }


                $MediaParts += Convert-ToMediaPart $Part
            }


            if ($MediaParts.Count -eq 0) {
                continue
            }


            $ExpectedFolder = $MediaRoot


            foreach ($MediaPart in $MediaParts) {

                $ExpectedFolder = Join-Path `
                    $ExpectedFolder `
                    $MediaPart
            }
        }


        if (
            Test-Path `
                -LiteralPath $ExpectedFolder `
                -PathType Container
        ) {


            $FullFolder = [System.IO.Path]::GetFullPath(
                $ExpectedFolder
            )


            $FolderSet[
                $FullFolder.ToLowerInvariant()
            ] = $FullFolder
        }
    }
}


# ------------------------------------------------------------
# Also catch manually configured page-media folders that contain
# Hero / Schema / Share / Error filenames.
# ------------------------------------------------------------

$AllMediaFolders = @(

    Get-ChildItem `
        -LiteralPath $MediaRoot `
        -Directory `
        -Recurse
)


foreach ($Folder in $AllMediaFolders) {


    $SignalFiles = @(

        Get-ChildItem `
            -LiteralPath $Folder.FullName `
            -File |

        Where-Object {

            $_.Name -match '(?i)(HeroL|HeroP|Hero\.|Schema-|Share\.|^Error-)'
        }
    )


    if ($SignalFiles.Count -gt 0) {


        $FullFolder = [System.IO.Path]::GetFullPath(
            $Folder.FullName
        )


        $FolderSet[
            $FullFolder.ToLowerInvariant()
        ] = $FullFolder
    }
}


$Folders = @(
    $FolderSet.Values |
    Sort-Object
)


# ============================================================
# Helper: relative Media folder path
# ============================================================

function Get-MediaRelativePath {

    param(
        [string]$Folder
    )


    if ($Folder -ieq $MediaRoot) {
        return 'Media'
    }


    $Relative = $Folder.Substring(
        $MediaRoot.Length
    ).TrimStart('\', '/')


    return (
        'Media\' +
        $Relative
    )
}


# ============================================================
# Check whether a filename has the NEW official structure
#
# Required:
#
# Description-HeroL.webp
# Description-HeroP.webp
# Description-Schema-1x1-1200x1200.webp
# Description-Schema-4x3-1200x900.webp
# Description-Schema-16x9-1200x675.webp
#
# Bare HeroL.webp / HeroP.webp are NOT valid.
# Error-* is NOT a final valid filename.
# ============================================================

function Test-NewOfficialName {

    param(
        [string]$FileName,
        $Spec
    )


    if (
        $FileName.StartsWith(
            'Error-',
            [StringComparison]::OrdinalIgnoreCase
        )
    ) {
        return $false
    }


    $Suffix = '-' + $Spec.FinalSuffix


    if (
        -not $FileName.EndsWith(
            $Suffix,
            [StringComparison]::OrdinalIgnoreCase
        )
    ) {
        return $false
    }


    $PrefixLength = (
        $FileName.Length -
        $Suffix.Length
    )


    if ($PrefixLength -lt 1) {
        return $false
    }


    $Prefix = $FileName.Substring(
        0,
        $PrefixLength
    ).Trim()


    if ([string]::IsNullOrWhiteSpace($Prefix)) {
        return $false
    }


    return $true
}


# ============================================================
# Find files whose dimensions match a specification
# ============================================================

function Find-FilesByActualSize {

    param(
        [System.IO.FileInfo[]]$Files,
        $Spec
    )


    $Matches = @()


    foreach ($File in $Files) {


        $Size = Get-ImageSize $File


        if ($null -eq $Size) {
            continue
        }


        if (
            $Size.Width -eq $Spec.Width -and
            $Size.Height -eq $Spec.Height
        ) {


            $Matches += [PSCustomObject]@{
                File = $File
                Size = $Size
            }
        }
    }


    return @($Matches)
}


# ============================================================
# Audit one specification inside one folder
# ============================================================

function Test-MediaSpec {

    param(
        [string]$Folder,
        [System.IO.FileInfo[]]$ImageFiles,
        $Spec
    )


    $Problems = @()


    # --------------------------------------------------------
    # Files with completely correct NEW filename
    # --------------------------------------------------------

    $CorrectNameFiles = @(

        $ImageFiles |

        Where-Object {

            Test-NewOfficialName `
                -FileName $_.Name `
                -Spec $Spec
        }
    )


    # --------------------------------------------------------
    # A correct filename only passes when the actual image
    # dimensions and actual image format are also correct.
    # --------------------------------------------------------

    $ValidFiles = @()


    foreach ($File in $CorrectNameFiles) {


        $Size = Get-ImageSize $File


        if ($null -eq $Size) {


            $Problems += (
                "{0}: UNREADABLE IMAGE - {1}" -f
                $Spec.Label,
                $File.Name
            )


            continue
        }


        if (
            $Size.Width -ne $Spec.Width -or
            $Size.Height -ne $Spec.Height
        ) {


            $Problems += (
                "{0}: BAD SIZE - {1} | expected {2}x{3}, actual {4}x{5}" -f
                $Spec.Label,
                $File.Name,
                $Spec.Width,
                $Spec.Height,
                $Size.Width,
                $Size.Height
            )


            continue
        }


        if ($Size.Format -ne $Spec.Format) {


            $Problems += (
                "{0}: BAD FORMAT - {1} | filename expects {2}, actual content is {3}" -f
                $Spec.Label,
                $File.Name,
                $Spec.Format,
                $Size.Format
            )


            continue
        }


        $ValidFiles += $File
    }


    # At least one fully valid file = this specification passes.
    if ($ValidFiles.Count -gt 0) {

        return @()
    }


    # If we already had a formally correct filename but it failed
    # size / format validation, report that exact failure.
    if ($Problems.Count -gt 0) {

        return @($Problems)
    }


    # --------------------------------------------------------
    # Look for legacy / malformed known names
    # --------------------------------------------------------

    $LegacyFiles = @()


    foreach ($File in $ImageFiles) {


        $Name = $File.Name


        # Bare new suffix without a descriptive prefix
        if (
            $Name.Equals(
                $Spec.FinalSuffix,
                [StringComparison]::OrdinalIgnoreCase
            )
        ) {


            $LegacyFiles += $File

            continue
        }


        # Error-prefixed version of this asset
        if (
            $Name.StartsWith(
                'Error-',
                [StringComparison]::OrdinalIgnoreCase
            ) -and
            $Name.EndsWith(
                $Spec.FinalSuffix,
                [StringComparison]::OrdinalIgnoreCase
            )
        ) {


            $LegacyFiles += $File

            continue
        }


        # Old Schema / Hero naming patterns
        foreach ($OldSuffix in $Spec.OldSuffixes) {


            if (
                $Name.Equals(
                    $OldSuffix,
                    [StringComparison]::OrdinalIgnoreCase
                ) -or
                $Name.EndsWith(
                    '-' + $OldSuffix,
                    [StringComparison]::OrdinalIgnoreCase
                )
            ) {


                $LegacyFiles += $File

                break
            }
        }
    }


    if ($LegacyFiles.Count -gt 0) {


        foreach ($File in $LegacyFiles) {


            $Size = Get-ImageSize $File


            if ($null -eq $Size) {


                $Problems += (
                    "{0}: BAD NAME + UNREADABLE - {1} | required *-{2}" -f
                    $Spec.Label,
                    $File.Name,
                    $Spec.FinalSuffix
                )
            }
            elseif (
                $Size.Width -eq $Spec.Width -and
                $Size.Height -eq $Spec.Height
            ) {


                $Problems += (
                    "{0}: BAD NAME - {1} | size is correct {2}x{3}, required descriptive-name-{4}" -f
                    $Spec.Label,
                    $File.Name,
                    $Size.Width,
                    $Size.Height,
                    $Spec.FinalSuffix
                )
            }
            else {


                $Problems += (
                    "{0}: BAD NAME + BAD SIZE - {1} | expected {2}x{3}, actual {4}x{5}, required descriptive-name-{6}" -f
                    $Spec.Label,
                    $File.Name,
                    $Spec.Width,
                    $Spec.Height,
                    $Size.Width,
                    $Size.Height,
                    $Spec.FinalSuffix
                )
            }
        }


        return @($Problems)
    }


    # --------------------------------------------------------
    # No recognizable filename.
    #
    # Look at actual image dimensions as fallback.
    # If one exists at the right size, then the image exists but
    # simply has a random / Photoshop export filename.
    # --------------------------------------------------------

    $SizeMatches = Find-FilesByActualSize `
        -Files $ImageFiles `
        -Spec $Spec


    if ($SizeMatches.Count -gt 0) {


        foreach ($Match in $SizeMatches) {


            $Problems += (
                "{0}: BAD NAME - {1} | detected from actual size {2}x{3}, required descriptive-name-{4}" -f
                $Spec.Label,
                $Match.File.Name,
                $Match.Size.Width,
                $Match.Size.Height,
                $Spec.FinalSuffix
            )
        }


        return @($Problems)
    }


    # --------------------------------------------------------
    # Nothing found
    # --------------------------------------------------------

    $Problems += (
        "{0}: MISSING - no valid image found | required descriptive-name-{1} at {2}x{3}" -f
        $Spec.Label,
        $Spec.FinalSuffix,
        $Spec.Width,
        $Spec.Height
    )


    return @($Problems)
}


# ============================================================
# Audit all discovered page-media folders
# ============================================================

$BadFolders = @()
$DetailBlocks = @()


foreach ($Folder in $Folders) {


    $RelativeFolder = Get-MediaRelativePath $Folder


    Write-Host "Checking: $RelativeFolder"


    $ImageFiles = @(

        Get-ChildItem `
            -LiteralPath $Folder `
            -File |

        Where-Object {

            $_.Extension.ToLowerInvariant() -in @(
                '.webp',
                '.jpg',
                '.jpeg',
                '.png'
            )
        }
    )


    $FolderProblems = @()


    foreach ($Spec in $Specs) {


        $SpecProblems = Test-MediaSpec `
            -Folder $Folder `
            -ImageFiles $ImageFiles `
            -Spec $Spec


        if ($SpecProblems.Count -gt 0) {

            $FolderProblems += $SpecProblems
        }
    }


    if ($FolderProblems.Count -gt 0) {


        $BadFolders += $RelativeFolder


        $Block = @()

        $Block += "[$RelativeFolder]"


        foreach ($Problem in $FolderProblems) {

            $Block += "  - $Problem"
        }


        $Block += ''


        $DetailBlocks += (
            $Block -join [Environment]::NewLine
        )
    }
}


# ============================================================
# Build report
# ============================================================

$Report = @()


$Report += 'EMOSTEIN MEDIA AUDIT'
$Report += '===================='
$Report += ''

$Report += (
    'Generated: ' +
    (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
)

$Report += (
    'Project:   ' +
    $ProjectRoot
)

$Report += (
    'Media:     ' +
    $MediaRoot
)

$Report += ''

$Report += (
    'Folders checked: ' +
    $Folders.Count
)

$Report += (
    'Folders to fix:  ' +
    $BadFolders.Count
)

$Report += ''
$Report += ''
$Report += 'FOLDERS TO FIX'
$Report += '=============='
$Report += ''


if ($BadFolders.Count -eq 0) {


    $Report += 'NONE - all audited page media folders are valid.'
}
else {


    foreach ($BadFolder in $BadFolders) {

        $Report += $BadFolder
    }
}


$Report += ''
$Report += ''
$Report += 'DETAILS'
$Report += '======='
$Report += ''


if ($DetailBlocks.Count -eq 0) {


    $Report += 'No problems found.'
}
else {


    foreach ($Block in $DetailBlocks) {

        $Report += $Block
    }
}


$Report += ''
$Report += ''
$Report += 'VALID FILE RULES'
$Report += '================'
$Report += ''

$Report += 'Hero Landscape:'
$Report += '  descriptive-name-HeroL.webp'
$Report += '  actual size: 1920x911'
$Report += ''

$Report += 'Hero Portrait:'
$Report += '  descriptive-name-HeroP.webp'
$Report += '  actual size: 360x680'
$Report += ''

$Report += 'Schema 1x1:'
$Report += '  descriptive-name-Schema-1x1-1200x1200.webp'
$Report += '  actual size: 1200x1200'
$Report += ''

$Report += 'Schema 4x3:'
$Report += '  descriptive-name-Schema-4x3-1200x900.webp'
$Report += '  actual size: 1200x900'
$Report += ''

$Report += 'Schema 16x9:'
$Report += '  descriptive-name-Schema-16x9-1200x675.webp'
$Report += '  actual size: 1200x675'
$Report += ''


$Report |
    Set-Content `
        -LiteralPath $ReportPath `
        -Encoding UTF8


# ============================================================
# Result
# ============================================================

Write-Host ''
Write-Host '========================================'
Write-Host 'Audit complete'
Write-Host '========================================'
Write-Host ''

Write-Host (
    "Folders checked: {0}" -f
    $Folders.Count
)

Write-Host (
    "Folders to fix:  {0}" -f
    $BadFolders.Count
)

Write-Host ''
Write-Host "Report: $ReportPath"
Write-Host ''


# Open the result automatically
Start-Process `
    -FilePath 'notepad.exe' `
    -ArgumentList "`"$ReportPath`""


exit 0