# eclipse-edc.github.io website

This repository contains project-wide documentation.

## Running the website locally

Building and running the site locally requires a recent `extended` version of [Hugo](https://gohugo.io).
You can find out more about how to install Hugo for your environment in our
[Getting started](https://www.docsy.dev/docs/getting-started/#prerequisites-and-installation) guide.

```bash
hugo server
```

## Running a container locally

You can run the website inside a [Docker](https://docs.docker.com/)
container, the container runs with a volume bound to the root folder.

1. Build the docker image

   ```bash
   docker compose up --build
   ```

2. Verify that the service is working.

   Open your web browser and type `http://localhost:1313` in your navigation bar,
   This opens a local instance of the homepage. You can now make
   changes to the docs and those changes will immediately show up in your browser after you save.

### Cleanup

To stop Docker Compose, on your terminal window, press **Ctrl + C**.

To remove the produced images run:

```bash
docker compose rm
```
For more information see the [Docker Compose documentation][].

## 断链检测

本项目使用GitHub Actions自动检测文档中的断链。

### 自动检测

有两种自动检测机制：

1. **PR检测**：当创建或更新Pull Request时，会自动运行断链检测。
   - 配置文件：`.github/workflows/check-broken-links.yaml`
   - 如果检测到断链，PR检查将失败

2. **定期检测**：每周自动运行一次断链检测，并在发现问题时创建Issue。
   - 配置文件：`.github/workflows/check-broken-links-schedule.yaml`
   - 检测结果会自动创建带有详细报告的Issue

### 排除特定链接

如果某些链接需要排除检测（例如内部开发环境、需要认证的链接），可以在`.lycheeignore`文件中添加正则表达式模式。

### 手动运行检测

您可以通过GitHub Actions页面手动触发定期检测工作流。

1. 打开本项目的Actions页面
2. 选择"Scheduled Broken Links Check"工作流
3. 点击"Run workflow"
4. 检测完成后，如果发现断链，会自动创建Issue
