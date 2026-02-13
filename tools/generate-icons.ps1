Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param([int]$size, [string]$outputPath)
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    $brush1 = [System.Drawing.Color]::FromArgb(102, 126, 234)
    $brush2 = [System.Drawing.Color]::FromArgb(118, 75, 162)
    
    $linearBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($size, $size)),
        $brush1,
        $brush2
    )
    
    $radius = [int]($size * 0.15)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($size - $radius * 2, $size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc(0, $size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()
    
    $graphics.FillPath($linearBrush, $path)
    
    $fontSize = [int]($size * 0.55)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = [System.Drawing.Brushes]::White
    
    $text = "P"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    
    $graphics.DrawString($text, $font, $textBrush, $x, $y)
    
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $font.Dispose()
    $linearBrush.Dispose()
    $path.Dispose()
}

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$iconsDir = Join-Path $scriptPath "..\icons"

if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

Create-Icon -size 16 -outputPath (Join-Path $iconsDir "icon16.png")
Create-Icon -size 48 -outputPath (Join-Path $iconsDir "icon48.png")
Create-Icon -size 128 -outputPath (Join-Path $iconsDir "icon128.png")

Write-Host "Icons created successfully!"
