# Docker 手动安装步骤（Windows 11）

> 你的机器已满足前提：Windows 11 专业版 64 位，CPU 虚拟化已在 BIOS 开启。
> 安装需要**管理员权限**并**重启系统**，所以需要你手动操作，以下是精确步骤。

---

## 一、启用 WSL2 后端（约 5 分钟，需重启）

Docker Desktop 在 Windows 上依赖 WSL2。按顺序执行：

### 1. 以管理员身份打开 PowerShell
- 按 `Win` 键 → 输入 `PowerShell` → 右键「Windows PowerShell」→ **以管理员身份运行**。

### 2. 依次执行以下命令（复制粘贴，逐个回车）

```powershell
# 启用 WSL 功能
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 启用虚拟机平台（WSL2 依赖）
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### 3. 重启电脑

### 4. 重启后，再次以管理员身份打开 PowerShell，设置 WSL2 为默认版本并更新内核：

```powershell
wsl --set-default-version 2
wsl --update
```

> 如果 `wsl --update` 提示需从 Microsoft Store 获取，也可以直接安装：
> `winget install --id Microsoft.WSL -e`

---

## 二、安装 Docker Desktop（约 10 分钟）

### 方式 A：命令行安装（推荐）

```powershell
winget install --id Docker.DockerDesktop -e --accept-package-agreements --accept-source-agreements
```

### 方式 B：手动下载安装

1. 浏览器打开：https://www.docker.com/products/docker-desktop/
2. 点击「Download for Windows」下载 `Docker Desktop Installer.exe`（约 500MB）
3. 双击安装，一路下一步（保持默认勾选「Use WSL 2 instead of Hyper-V」）

### 安装后
- 启动 Docker Desktop，接受服务协议。
- 首次启动可能需要登录 Docker Hub（可选，点 Skip / 跳过即可）。

---

## 三、验证安装成功

打开任意终端（PowerShell 即可），执行：

```powershell
docker --version
docker compose version
docker run --rm hello-world
```

看到版本号和 `Hello from Docker!` 即成功。

---

## 四、启动本项目数据库（Docker 装好后）

在项目根目录 `D:\小升初系统` 执行：

```powershell
docker compose up -d db
```

这会用 `docker-compose.yml` 里定义好的 PostgreSQL 配置启动数据库。

验证：

```powershell
docker compose ps
# 应看到 postgres 服务为 running 状态
```

---

## 常见问题

| 问题 | 处理 |
|---|---|
| `wsl --update` 报错 | 改用 `winget install --id Microsoft.WSL -e` |
| Docker Desktop 启动报 WSL 错误 | 在 Docker Desktop 设置 → Resources → WSL Integration 确认已启用，再 `wsl --shutdown` 后重启 Docker |
| 端口 5432 被占用 | 改 `docker-compose.yml` 的端口映射，如 `5433:5432` |
| 拉取镜像慢 | 在 Docker Desktop 设置 → Docker Engine 添加国内镜像加速器 |

---

**装好后告诉我一声**，我会接着跑 `docker compose up -d db` 验证数据库连通，并做后端运行时冒烟测试。
