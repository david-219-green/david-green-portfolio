# Extracts a scroll-scrub WebP frame sequence from a clip in /generation.
# Usage: .\scripts\extract-frames.ps1 -Clip 1 [-Frames 192] [-Width 2560] [-BudgetMB 20] [-Source path\to\master.mp4]
# Defaults target the 4K-upscaled masters (clip-N-4k.mp4, falling back to clip-N.mp4).
# Tunes WebP quality downward until the clip folder fits the byte budget.
param(
    [Parameter(Mandatory)][int]$Clip,
    [int]$Frames = 192,
    [int]$Width = 2560,
    [double]$BudgetMB = 20,
    [string]$Source
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$ff = "C:\Users\david\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
$ffprobe = $ff -replace 'ffmpeg\.exe$', 'ffprobe.exe'

if (-not $Source) {
    $Source = Join-Path $root "generation\clip-$Clip-4k.mp4"
    if (-not (Test-Path $Source)) { $Source = Join-Path $root "generation\clip-$Clip.mp4" }
}
if (-not (Test-Path $Source)) { throw "Missing $Source" }
$outDir = Join-Path $root "public\frames\clip-$Clip"

# fps filter that yields exactly $Frames frames across the full duration
$duration = [double](& $ffprobe -v error -show_entries format=duration -of csv=p=0 $Source)
$fps = [Math]::Round($Frames / $duration, 4)

foreach ($q in 80, 72, 62, 52, 42, 34) {
    if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force -Confirm:$false }
    New-Item -ItemType Directory -Force $outDir | Out-Null
    & $ff -y -loglevel error -i $Source -vf "fps=$fps,scale=${Width}:-2" -frames:v $Frames -c:v libwebp -q:v $q (Join-Path $outDir 'frame-%03d.webp')
    $files = Get-ChildItem $outDir -Filter *.webp
    $mb = [Math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 2)
    if ($mb -le $BudgetMB) {
        "clip-{0}: {1} frames @ q={2} -> {3} MB (source: {4})" -f $Clip, $files.Count, $q, $mb, (Split-Path $Source -Leaf)
        return
    }
}
"clip-{0}: WARNING still {1} MB at q=34 ({2} frames)" -f $Clip, $mb, $files.Count
