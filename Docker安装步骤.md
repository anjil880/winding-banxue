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

## 四、配置国内镜像加速器（重要）

Docker Hub 官方源在国内访问不稳定，必须配镜像加速器。

编辑 `%USERPROFILE%\.docker\daemon.json`（没有就新建）：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.xuanyuan.me",
    "https://hub.rat.dev"
  ]
}
```

改完后**重启 Docker Desktop** 使配置生效。用 `docker info | findstr Mirrors` 确认已加载。

> 已验证 `docker.m.daocloud.io`（DaoCloud）稳定可用。部分免费镜像会出现
> `免费节点当前繁忙` 或 `size validation` 错误，属限流/数据损坏，换源即可。

---

## 五、启动本项目数据库

在项目根目录 `D:\小升初系统` 执行：

```powershell
copy .env.example .env      # 首次需生成 .env，并修改 DB_PASSWORD
docker compose -p banxue up -d db
```

> **为什么必须加 `-p banxue`**：项目目录名含中文，`docker compose` 无法自动推导项目名，
> 会报 `project name must not be empty`。显式指定英文项目名即可。

验证：

```powershell
docker compose -p banxue ps
docker compose -p banxue exec db psql -U postgres -d qihang_banxue -c "\dt"
```

应看到 15 张业务表。

---

## 六、常见问题（本次实际踩过的坑）

| 问题 | 原因 | 处理 |
|---|---|---|
| `Docker Desktop is unable to start` | WSL 未安装 | 装完 WSL 后重启 Docker Desktop |
| 装了 WSL 仍报 WSL 错误 | 尚无 Linux 发行版 | Docker Desktop 会自动创建 `docker-desktop` 发行版，耐心等待或重启 |
| `project name must not be empty` | 目录名含中文 | `docker compose -p banxue` 显式指定项目名 |
| 容器反复 Restarting | 缺 `POSTGRES_PASSWORD` | 已在本项目 docker-compose.yml 中映射好 `POSTGRES_*` |
| `免费节点当前繁忙` | 镜像源限流 | 换 `docker.m.daocloud.io` |
| `failed size validation` | 镜像源返回损坏数据 | 换源重试 |
| 本机 npm install 损坏 | arborist bug + yarn 中断 | 改用 Docker 容器装依赖，见下方命令 |

**用 Docker 容器装依赖（本机 npm 损坏时的救急方案）**：

```powershell
docker run --rm -v "${PWD}\backend:/app" -w /app `
  docker.m.daocloud.io/library/node:22-alpine `
  sh -c "rm -rf node_modules package-lock.json && npm install --registry=https://registry.npmmirror.com --no-audit --no-fund"
```

同理，编译也可用容器执行（避免本机 tsc 环境问题）：

```powershell
docker run --rm -v "${PWD}\backend:/app" -w /app `
  docker.m.daocloud.io/library/node:22-alpine sh -c "npm run build"
```
