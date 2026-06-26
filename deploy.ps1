# GitHub 单文件部署脚本（双击运行）
# 本脚本会把 index.html + README.md + .gitignore 推到 GitHub 仓库
# 首次使用需要：
#   1. 在 https://github.com/settings/tokens 生成一个 Personal Access Token（勾选 repo 权限）
#   2. 在下面 TOKEN 变量填入你的 PAT
# 之后每次更新只需运行本脚本即可

$TOKEN = ""  # ← 粘贴你的 GitHub PAT 在这里，例如 "ghp_xxx"
$REPO = "code0407/Error_Note"

function Push-File([string]$Path, [string]$RepoPath) {
  if (-not (Test-Path $Path)) { Write-Host "SKIP $Path"; return }
  $content = [System.IO.File]::ReadAllBytes((Resolve-Path $Path))
  $b64 = [Convert]::ToBase64String($content)
  $name = Split-Path $Path -Leaf
  $remote = "https://api.github.com/repos/$REPO/contents/$RepoPath"
  $headers = @{
    "Accept"        = "application/vnd.github+json"
    "Authorization" = "Bearer $TOKEN"
    "User-Agent"    = "ErrorBook"
  }
  try {
    $existing = Invoke-WebRequest -Uri $remote -Headers $headers -UseBasicParsing -TimeoutSec 10
    $sha = ($existing.Content | ConvertFrom-Json).sha
    $body = @{ message = "Update $name"; content = $b64; sha = $sha } | ConvertTo-Json -Compress
  } catch {
    $body = @{ message = "Add $name"; content = $b64 } | ConvertTo-Json -Compress
  }
  $resp = Invoke-WebRequest -Uri $remote -Method Put -Headers $headers -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
  Write-Host "OK  $RepoPath  ($([System.IO.FileInfo]::new($Path).Length) bytes)"
}

if ($TOKEN -eq "") {
  Write-Host "请打开本文件，在第 13 行 TOKEN = 后面填入你的 GitHub PAT"
  Write-Host "生成地址: https://github.com/settings/tokens"
  Read-Host "按回车退出"
  exit 1
}

Write-Host "==> 推送 $REPO ..."
Push-File "E:\界面\index.html"   "index.html"
Push-File "E:\界面\README.md"    "README.md"
Push-File "E:\界面\.gitignore"   ".gitignore"
Write-Host ""
Write-Host "✅ 推送完成！约 1 分钟后访问 https://code0407.github.io/Error_Note/ 即可看到新版"
Write-Host "   如页面未更新，请在 GitHub Pages 设置里点 "重新部署" 或等缓存自动失效"
Read-Host "按回车退出"
